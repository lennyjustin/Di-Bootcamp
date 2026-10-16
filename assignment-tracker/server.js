import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pg from "pg";
import {
  getAttemptState,
  getEffectiveAttempt,
  getSubmissionResult,
  normalizeEmail,
  validatePassword,
} from "./domain.js";

const { Pool } = pg;
const scrypt = promisify(scryptCallback);
const directory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(directory, "public");
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;
const cookieName = "daymark_session";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireValue(condition, status, message) {
  if (!condition) throw new ApiError(status, message);
}

function validText(value, minimum, maximum) {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

function parsePositiveId(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseCookie(req, name) {
  const cookieHeader = req.headers.cookie ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : null;
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(res, token) {
  const attributes = [
    `${cookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${sessionLifetimeSeconds}`,
    "HttpOnly",
    "SameSite=Strict",
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearSessionCookie(res) {
  const attributes = [`${cookieName}=`, "Path=/", "Max-Age=0", "HttpOnly", "SameSite=Strict"];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    displayName: row.display_name,
    mustChangePassword: row.must_change_password,
    profile: row.role === "student"
      ? {
          studentNumber: row.student_number ?? null,
          institution: row.institution ?? null,
          studyLevel: row.study_level ?? null,
        }
      : row.role === "teacher"
        ? { qualifications: row.qualifications ?? "", bio: row.bio ?? "" }
        : {},
  };
}

async function passwordHash(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function passwordMatches(password, storedHash) {
  const [saltHex, derivedHex] = storedHash.split(":");
  if (!saltHex || !derivedHex || !/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(derivedHex)) {
    return false;
  }
  const expected = Buffer.from(derivedHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function createSession(pool, userId, res) {
  const token = randomBytes(32).toString("hex");
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 second'))`,
    [hashToken(token), userId, sessionLifetimeSeconds],
  );
  setSessionCookie(res, token);
}

function requireSameOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) {
    return res.status(403).json({ error: "Request origin is required." });
  }

  try {
    if (new URL(origin).host.toLowerCase() !== req.get("host")?.toLowerCase()) {
      return res.status(403).json({ error: "Cross-origin requests are not allowed." });
    }
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
  return next();
}

function createAuthMiddleware(pool) {
  return async function authenticate(req, res, next) {
    const token = parseCookie(req, cookieName);
    if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
      return res.status(401).json({ error: "Please sign in to continue." });
    }

    const result = await pool.query(
      `SELECT u.*, sp.student_number, sp.institution, sp.study_level,
              tp.qualifications, tp.bio
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [hashToken(token)],
    );
    if (!result.rowCount) {
      clearSessionCookie(res);
      return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }

    req.userRow = result.rows[0];
    req.user = publicUser(result.rows[0]);
    return next();
  };
}

function requireRoles(...roles) {
  return function authorize(req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    return next();
  };
}

function requirePasswordSetup(req, res, next) {
  if (req.user.mustChangePassword) {
    return res.status(403).json({ error: "Change your temporary password before continuing.", code: "PASSWORD_CHANGE_REQUIRED" });
  }
  return next();
}

async function bootstrapAdmin(pool) {
  const email = normalizeEmail(process.env.BOOTSTRAP_ADMIN_EMAIL);
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const displayName = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Daymark administrator";
  if (!emailPattern.test(email) || !validatePassword(password)) {
    throw new Error("BOOTSTRAP_ADMIN_EMAIL and a 12-200 character BOOTSTRAP_ADMIN_PASSWORD are required.");
  }

  const existing = await pool.query("SELECT id, role FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    if (existing.rows[0].role !== "admin") {
      throw new Error("The configured bootstrap administrator email belongs to a non-admin account.");
    }
    return;
  }

  const hash = await passwordHash(password);
  await pool.query(
    `INSERT INTO users (email, password_hash, role, display_name, must_change_password)
     VALUES ($1, $2, 'admin', $3, TRUE)`,
    [email, hash, displayName],
  );
}

async function getCourseById(pool, courseId) {
  const result = await pool.query(
    `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
            u.display_name AS teacher_name
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users u ON u.id = c.teacher_id
     WHERE c.id = $1`,
    [courseId],
  );
  return result.rows[0] ?? null;
}

async function canManageCourse(pool, user, courseId) {
  const result = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [courseId]);
  if (!result.rowCount) throw new ApiError(404, "Course not found.");
  if (user.role !== "admin" && String(result.rows[0].teacher_id) !== String(user.id)) {
    throw new ApiError(403, "You can only manage your own courses.");
  }
}

function courseSummary(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    level: row.level,
    isPublished: row.is_published,
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    teacher: { id: row.teacher_id, name: row.teacher_name },
    isEnrolled: Boolean(row.is_enrolled),
    enrolledAt: row.enrolled_at ?? null,
    createdAt: row.created_at,
  };
}

export async function createApp(pool) {
  const app = express();
  const authenticate = createAuthMiddleware(pool);
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(express.json({ limit: "100kb", strict: true }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Try again later." },
  });
  const requireAuth = authenticate;
  const requireReadyAccount = [requireAuth, requirePasswordSetup];

  app.get("/api/health", async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  });

  app.post("/api/auth/register", authLimiter, requireSameOrigin, async (req, res) => {
    const { displayName, institution, studentNumber, studyLevel } = req.body ?? {};
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    requireValue(emailPattern.test(email) && email.length <= 254, 400, "Enter a valid email address.");
    requireValue(validText(displayName, 2, 100), 400, "Name must be between 2 and 100 characters.");
    requireValue(validatePassword(password), 400, "Password must be between 12 and 200 characters.");
    requireValue(institution === undefined || institution === "" || validText(institution, 1, 160), 400, "Institution must be 160 characters or fewer.");
    requireValue(studentNumber === undefined || studentNumber === "" || validText(studentNumber, 1, 80), 400, "Student number must be 80 characters or fewer.");
    requireValue(studyLevel === undefined || studyLevel === "" || validText(studyLevel, 1, 100), 400, "Study level must be 100 characters or fewer.");

    const client = await pool.connect();
    let userId;
    try {
      await client.query("BEGIN");
      const hash = await passwordHash(password);
      const user = await client.query(
        `INSERT INTO users (email, password_hash, role, display_name)
         VALUES ($1, $2, 'student', $3)
         RETURNING id`,
        [email, hash, displayName.trim()],
      );
      userId = user.rows[0].id;
      await client.query(
        `INSERT INTO student_profiles (user_id, student_number, institution, study_level)
         VALUES ($1, NULLIF($2, ''), NULLIF($3, ''), NULLIF($4, ''))`,
        [userId, studentNumber?.trim() ?? "", institution?.trim() ?? "", studyLevel?.trim() ?? ""],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") throw new ApiError(409, "An account with that email already exists.");
      throw error;
    } finally {
      client.release();
    }

    const result = await pool.query(
      `SELECT u.*, sp.student_number, sp.institution, sp.study_level
       FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = $1`,
      [userId],
    );
    await createSession(pool, userId, res);
    res.status(201).json({ user: publicUser(result.rows[0]) });
  });

  app.post("/api/auth/login", authLimiter, requireSameOrigin, async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    requireValue(emailPattern.test(email) && typeof password === "string", 400, "Enter your email and password.");
    const result = await pool.query(
      `SELECT u.*, sp.student_number, sp.institution, sp.study_level,
              tp.qualifications, tp.bio
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
       WHERE u.email = $1`,
      [email],
    );
    if (!result.rowCount || !(await passwordMatches(password, result.rows[0].password_hash))) {
      throw new ApiError(401, "Email or password is incorrect.");
    }

    await pool.query("DELETE FROM sessions WHERE user_id = $1 AND expires_at <= NOW()", [result.rows[0].id]);
    await createSession(pool, result.rows[0].id, res);
    res.json({ user: publicUser(result.rows[0]) });
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", requireSameOrigin, async (req, res) => {
    const token = parseCookie(req, cookieName);
    if (token && /^[0-9a-f]{64}$/i.test(token)) {
      await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
    }
    clearSessionCookie(res);
    res.status(204).end();
  });

  app.post("/api/auth/password", requireSameOrigin, requireAuth, async (req, res) => {
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;
    requireValue(typeof currentPassword === "string" && validatePassword(newPassword), 400, "Enter your current password and a new password of at least 12 characters.");
    if (!(await passwordMatches(currentPassword, req.userRow.password_hash))) {
      throw new ApiError(400, "Current password is incorrect.");
    }
    const hash = await passwordHash(newPassword);
    await pool.query("UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2", [hash, req.user.id]);
    await pool.query("DELETE FROM sessions WHERE user_id = $1", [req.user.id]);
    clearSessionCookie(res);
    res.json({ message: "Password updated. Sign in with your new password." });
  });

  app.get("/api/categories", requireReadyAccount, async (_req, res) => {
    const result = await pool.query("SELECT id, name, slug FROM categories ORDER BY name");
    res.json({ categories: result.rows });
  });

  app.get("/api/courses", requireReadyAccount, async (req, res) => {
    const result = await pool.query(
      `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
              u.display_name AS teacher_name,
              (e.student_id IS NOT NULL) AS is_enrolled, e.enrolled_at
       FROM courses c
       JOIN categories cat ON cat.id = c.category_id
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.student_id = $1
       WHERE c.is_published = TRUE OR c.teacher_id = $1 OR $2 = 'admin'
       ORDER BY c.created_at DESC`,
      [req.user.id, req.user.role],
    );
    res.json({ courses: result.rows.map(courseSummary) });
  });

  app.post("/api/courses", requireSameOrigin, ...requireReadyAccount, requireRoles("teacher", "admin"), async (req, res) => {
    const { title, description, level } = req.body ?? {};
    const categoryId = parsePositiveId(req.body?.categoryId);
    requireValue(validText(title, 3, 140), 400, "Course title must be between 3 and 140 characters.");
    requireValue(validText(description, 10, 4000), 400, "Course description must be between 10 and 4,000 characters.");
    requireValue(validText(level, 2, 80), 400, "Enter a course level.");
    requireValue(categoryId, 400, "Choose a valid course category.");

    let teacherId = req.user.id;
    if (req.user.role === "admin" && req.body?.teacherId !== undefined) {
      teacherId = parsePositiveId(req.body.teacherId);
      requireValue(teacherId, 400, "Choose a valid teacher.");
      const teacher = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'teacher'", [teacherId]);
      requireValue(teacher.rowCount, 400, "The selected user is not a teacher.");
    }
    const category = await pool.query("SELECT id FROM categories WHERE id = $1", [categoryId]);
    requireValue(category.rowCount, 400, "Choose a valid course category.");

    const result = await pool.query(
      `INSERT INTO courses (category_id, teacher_id, title, description, level)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [categoryId, teacherId, title.trim(), description.trim(), level.trim()],
    );
    const course = await getCourseById(pool, result.rows[0].id);
    res.status(201).json({ course: courseSummary({ ...course, is_enrolled: false }) });
  });

  app.get("/api/courses/:courseId", ...requireReadyAccount, async (req, res) => {
    const courseId = parsePositiveId(req.params.courseId);
    requireValue(courseId, 400, "Invalid course id.");
    const course = await getCourseById(pool, courseId);
    requireValue(course, 404, "Course not found.");

    const enrollment = req.user.role === "student"
      ? await pool.query("SELECT enrolled_at FROM enrollments WHERE student_id = $1 AND course_id = $2", [req.user.id, courseId])
      : { rowCount: 0, rows: [] };
    const ownsCourse = req.user.role === "admin" || String(course.teacher_id) === String(req.user.id);
    const isEnrolled = Boolean(enrollment.rowCount);
    requireValue(course.is_published || ownsCourse || isEnrolled, 404, "Course not found.");

    const response = {
      course: courseSummary({ ...course, is_enrolled: isEnrolled, enrolled_at: enrollment.rows[0]?.enrolled_at }),
      isEnrolled,
      assignments: [],
    };
    if (ownsCourse || isEnrolled) {
      const assignmentResult = await pool.query(
        `SELECT a.* FROM assignments a
         WHERE a.course_id = $1 AND (a.is_published = TRUE OR $2 = TRUE)
         ORDER BY a.due_at ASC, a.id ASC`,
        [courseId, ownsCourse],
      );

      if (ownsCourse) {
        const pendingCounts = await pool.query(
          `SELECT assignment_id, COUNT(*)::INTEGER AS pending_count
           FROM submissions
           WHERE status = 'pending' AND assignment_id = ANY($1::bigint[])
           GROUP BY assignment_id`,
          [assignmentResult.rows.map((assignment) => assignment.id)],
        );
        const pendingByAssignment = new Map(pendingCounts.rows.map((row) => [String(row.assignment_id), row.pending_count]));
        response.assignments = assignmentResult.rows.map((assignment) => ({
          ...assignment,
          pendingCount: pendingByAssignment.get(String(assignment.id)) ?? 0,
        }));
      } else {
        const submissionResult = await pool.query(
          `SELECT s.* FROM submissions s
           JOIN assignments a ON a.id = s.assignment_id
           WHERE a.course_id = $1 AND s.student_id = $2
           ORDER BY s.assignment_id, s.attempt_number`,
          [courseId, req.user.id],
        );
        const attemptsByAssignment = new Map();
        for (const row of submissionResult.rows) {
          const group = attemptsByAssignment.get(String(row.assignment_id)) ?? [];
          group.push(row);
          attemptsByAssignment.set(String(row.assignment_id), group);
        }
        response.assignments = assignmentResult.rows.map((assignment) => {
          const attempts = attemptsByAssignment.get(String(assignment.id)) ?? [];
          const state = getAttemptState(attempts, assignment.max_attempts);
          return {
            ...assignment,
            attempts: attempts.map((attempt) => ({
              id: attempt.id,
              number: attempt.attempt_number,
              submittedAt: attempt.submitted_at,
              isLate: attempt.is_late,
              score: attempt.score,
              feedback: attempt.feedback,
              status: attempt.status,
            })),
            canSubmit: state.canSubmit,
            submissionState: state.reason,
            effectiveAttempt: getEffectiveAttempt(attempts, assignment.score_policy),
          };
        });
      }
    }
    res.json(response);
  });

  app.patch("/api/courses/:courseId", requireSameOrigin, ...requireReadyAccount, requireRoles("teacher", "admin"), async (req, res) => {
    const courseId = parsePositiveId(req.params.courseId);
    requireValue(courseId, 400, "Invalid course id.");
    await canManageCourse(pool, req.user, courseId);

    const updates = [];
    const values = [courseId];
    const fields = [
      ["title", "title", (value) => validText(value, 3, 140)],
      ["description", "description", (value) => validText(value, 10, 4000)],
      ["level", "level", (value) => validText(value, 2, 80)],
    ];
    for (const [input, column, validate] of fields) {
      if (req.body?.[input] !== undefined) {
        requireValue(validate(req.body[input]), 400, `Invalid ${input}.`);
        values.push(req.body[input].trim());
        updates.push(`${column} = $${values.length}`);
      }
    }
    if (req.body?.isPublished !== undefined) {
      requireValue(typeof req.body.isPublished === "boolean", 400, "isPublished must be true or false.");
      values.push(req.body.isPublished);
      updates.push(`is_published = $${values.length}`);
    }
    if (req.body?.categoryId !== undefined) {
      const categoryId = parsePositiveId(req.body.categoryId);
      const category = categoryId ? await pool.query("SELECT id FROM categories WHERE id = $1", [categoryId]) : { rowCount: 0 };
      requireValue(category.rowCount, 400, "Choose a valid course category.");
      values.push(categoryId);
      updates.push(`category_id = $${values.length}`);
    }
    requireValue(updates.length > 0, 400, "No course changes were provided.");
    await pool.query(`UPDATE courses SET ${updates.join(", ")} WHERE id = $1`, values);
    const course = await getCourseById(pool, courseId);
    res.json({ course: courseSummary({ ...course, is_enrolled: false }) });
  });

  app.post("/api/courses/:courseId/enroll", requireSameOrigin, ...requireReadyAccount, requireRoles("student"), async (req, res) => {
    const courseId = parsePositiveId(req.params.courseId);
    requireValue(courseId, 400, "Invalid course id.");
    const course = await pool.query("SELECT id FROM courses WHERE id = $1 AND is_published = TRUE", [courseId]);
    requireValue(course.rowCount, 404, "Course not found.");
    await pool.query(
      "INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.user.id, courseId],
    );
    res.status(201).json({ isEnrolled: true });
  });

  app.post("/api/courses/:courseId/assignments", requireSameOrigin, ...requireReadyAccount, requireRoles("teacher", "admin"), async (req, res) => {
    const courseId = parsePositiveId(req.params.courseId);
    requireValue(courseId, 400, "Invalid course id.");
    await canManageCourse(pool, req.user, courseId);

    const { title, instructions, dueAt } = req.body ?? {};
    const maxScore = Number(req.body?.maxScore);
    const passMark = Number(req.body?.passMark);
    const maxAttempts = Number(req.body?.maxAttempts);
    const scorePolicy = req.body?.scorePolicy ?? "highest";
    const dueDate = typeof dueAt === "string" ? new Date(dueAt) : null;
    requireValue(validText(title, 3, 160), 400, "Assignment title must be between 3 and 160 characters.");
    requireValue(validText(instructions, 5, 10000), 400, "Instructions must be between 5 and 10,000 characters.");
    requireValue(dueDate && !Number.isNaN(dueDate.valueOf()), 400, "Choose a valid due date.");
    requireValue(Number.isFinite(maxScore) && maxScore > 0 && maxScore <= 100000, 400, "Maximum score must be greater than 0.");
    requireValue(Number.isFinite(passMark) && passMark >= 0 && passMark <= maxScore, 400, "Pass mark must be between 0 and the maximum score.");
    requireValue(Number.isInteger(maxAttempts) && maxAttempts >= 1 && maxAttempts <= 10, 400, "Allow between 1 and 10 attempts.");
    requireValue(["highest", "latest"].includes(scorePolicy), 400, "Choose highest or latest score policy.");

    const result = await pool.query(
      `INSERT INTO assignments (course_id, title, instructions, due_at, max_score, pass_mark, max_attempts, score_policy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [courseId, title.trim(), instructions.trim(), dueDate.toISOString(), maxScore, passMark, maxAttempts, scorePolicy],
    );
    res.status(201).json({ assignment: result.rows[0] });
  });

  app.post("/api/assignments/:assignmentId/submissions", requireSameOrigin, ...requireReadyAccount, requireRoles("student"), async (req, res) => {
    const assignmentId = parsePositiveId(req.params.assignmentId);
    const answerText = req.body?.answerText;
    requireValue(assignmentId, 400, "Invalid assignment id.");
    requireValue(validText(answerText, 1, 20000), 400, "Your response must contain between 1 and 20,000 characters.");

    const client = await pool.connect();
    let submission;
    try {
      await client.query("BEGIN");
      const assignmentResult = await client.query(
        `SELECT a.* FROM assignments a
         JOIN courses c ON c.id = a.course_id
         JOIN enrollments e ON e.course_id = c.id AND e.student_id = $2
         WHERE a.id = $1 AND a.is_published = TRUE AND c.is_published = TRUE
         FOR UPDATE OF a`,
        [assignmentId, req.user.id],
      );
      requireValue(assignmentResult.rowCount, 404, "Assignment not found in an enrolled course.");
      const assignment = assignmentResult.rows[0];
      const previous = await client.query(
        "SELECT status FROM submissions WHERE assignment_id = $1 AND student_id = $2 ORDER BY attempt_number",
        [assignmentId, req.user.id],
      );
      const state = getAttemptState(previous.rows, assignment.max_attempts);
      requireValue(state.canSubmit, 409, state.reason === "awaiting_grade"
        ? "Your previous attempt is waiting for teacher feedback."
        : state.reason === "passed"
          ? "You have already passed this assignment."
          : "You have used all allowed attempts.");
      const attemptNumber = previous.rowCount + 1;
      const result = await client.query(
        `INSERT INTO submissions (assignment_id, student_id, attempt_number, answer_text, is_late)
         VALUES ($1, $2, $3, $4, NOW() > $5)
         RETURNING id, attempt_number, submitted_at, is_late, status`,
        [assignmentId, req.user.id, attemptNumber, answerText.trim(), assignment.due_at],
      );
      submission = result.rows[0];
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    res.status(201).json({ submission });
  });

  app.get("/api/teacher/submissions", ...requireReadyAccount, requireRoles("teacher", "admin"), async (req, res) => {
    const courseId = req.query.courseId === undefined ? null : parsePositiveId(req.query.courseId);
    requireValue(req.query.courseId === undefined || courseId, 400, "Invalid course id.");
    const result = await pool.query(
      `SELECT s.id, s.assignment_id, s.student_id, s.attempt_number, s.answer_text,
              s.submitted_at, s.is_late, s.score, s.feedback, s.status, s.graded_at,
              a.title AS assignment_title, a.max_score, a.pass_mark,
              c.id AS course_id, c.title AS course_title,
              u.display_name AS student_name, u.email AS student_email
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = s.student_id
       WHERE ($1::bigint IS NULL OR c.id = $1)
         AND ($2 = 'admin' OR c.teacher_id = $3)
       ORDER BY CASE WHEN s.status = 'pending' THEN 0 ELSE 1 END, s.submitted_at ASC`,
      [courseId, req.user.role, req.user.id],
    );
    res.json({ submissions: result.rows });
  });

  app.post("/api/submissions/:submissionId/grade", requireSameOrigin, ...requireReadyAccount, requireRoles("teacher", "admin"), async (req, res) => {
    const submissionId = parsePositiveId(req.params.submissionId);
    const score = Number(req.body?.score);
    const feedback = req.body?.feedback ?? "";
    requireValue(submissionId, 400, "Invalid submission id.");
    requireValue(Number.isFinite(score), 400, "Enter a valid score.");
    requireValue(typeof feedback === "string" && feedback.trim().length <= 10000, 400, "Feedback must be 10,000 characters or fewer.");

    const client = await pool.connect();
    let graded;
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT s.id, s.status, s.assignment_id, a.max_score, a.pass_mark, c.teacher_id
         FROM submissions s
         JOIN assignments a ON a.id = s.assignment_id
         JOIN courses c ON c.id = a.course_id
         WHERE s.id = $1
         FOR UPDATE OF s`,
        [submissionId],
      );
      requireValue(result.rowCount, 404, "Submission not found.");
      const submission = result.rows[0];
      requireValue(req.user.role === "admin" || String(submission.teacher_id) === String(req.user.id), 403, "You can only grade submissions for your own courses.");
      requireValue(submission.status === "pending", 409, "This submission has already been graded.");
      requireValue(score >= 0 && score <= Number(submission.max_score), 400, `Score must be between 0 and ${submission.max_score}.`);
      const status = getSubmissionResult(score, submission.pass_mark);
      const updated = await client.query(
        `UPDATE submissions
         SET score = $1, feedback = $2, status = $3, graded_by = $4, graded_at = NOW()
         WHERE id = $5
         RETURNING id, score, feedback, status, graded_at`,
        [score, feedback.trim(), status, req.user.id, submissionId],
      );
      graded = updated.rows[0];
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    res.json({ submission: graded });
  });

  app.get("/api/admin/users", ...requireReadyAccount, requireRoles("admin"), async (_req, res) => {
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.display_name, u.must_change_password, u.created_at,
              sp.student_number, sp.institution, sp.study_level,
              tp.qualifications, tp.bio
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
       ORDER BY u.created_at DESC`,
    );
    res.json({ users: result.rows.map(publicUser) });
  });

  app.post("/api/admin/users", requireSameOrigin, ...requireReadyAccount, requireRoles("admin"), async (req, res) => {
    const { displayName, email: rawEmail, role, qualifications, bio } = req.body ?? {};
    const email = normalizeEmail(rawEmail);
    requireValue(emailPattern.test(email) && email.length <= 254, 400, "Enter a valid email address.");
    requireValue(validText(displayName, 2, 100), 400, "Name must be between 2 and 100 characters.");
    requireValue(["teacher", "admin"].includes(role), 400, "Administrators can provision teacher or admin accounts.");
    requireValue(qualifications === undefined || (typeof qualifications === "string" && qualifications.length <= 2000), 400, "Qualifications must be 2,000 characters or fewer.");
    requireValue(bio === undefined || (typeof bio === "string" && bio.length <= 4000), 400, "Biography must be 4,000 characters or fewer.");
    const temporaryPassword = randomBytes(18).toString("base64url");
    const hash = await passwordHash(temporaryPassword);

    const client = await pool.connect();
    let userId;
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO users (email, password_hash, role, display_name, must_change_password)
         VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
        [email, hash, role, displayName.trim()],
      );
      userId = result.rows[0].id;
      if (role === "teacher") {
        await client.query(
          "INSERT INTO teacher_profiles (user_id, qualifications, bio) VALUES ($1, $2, $3)",
          [userId, qualifications?.trim() ?? "", bio?.trim() ?? ""],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") throw new ApiError(409, "An account with that email already exists.");
      throw error;
    } finally {
      client.release();
    }
    res.status(201).json({
      user: { id: userId, email, role, displayName: displayName.trim(), mustChangePassword: true },
      temporaryPassword,
    });
  });

  app.get("/", (_req, res) => res.sendFile(path.join(publicDirectory, "index.html")));
  for (const asset of ["script.js", "staly.css", "anime.css", "portal.css"]) {
    app.get(`/${asset}`, (_req, res) => res.sendFile(path.join(publicDirectory, asset)));
  }
  app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));
  app.use((_req, res) => res.status(404).send("Page not found."));
  app.use((error, _req, res, _next) => {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ error: error.message });
    }
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Request body must be valid JSON." });
    }
    console.error("Unhandled request error:", error);
    return res.status(500).json({ error: "The request could not be completed." });
  });
  return app;
}

async function start() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be configured.");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    const schema = await readFile(path.join(directory, "schema.sql"), "utf8");
    await pool.query(schema);
    await bootstrapAdmin(pool);
    await pool.query("DELETE FROM sessions WHERE expires_at <= NOW()");
  } catch (error) {
    await pool.end();
    throw error;
  }

  const cleanup = setInterval(() => {
    pool.query("DELETE FROM sessions WHERE expires_at <= NOW()")
      .catch((error) => console.error("Expired session cleanup failed:", error));
  }, 6 * 60 * 60 * 1000);
  cleanup.unref();

  const app = await createApp(pool);
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, "0.0.0.0", () => console.log(`Daymark portal listening on port ${port}`));
  const shutdown = async () => {
    clearInterval(cleanup);
    server.close(async (error) => {
      if (error) console.error("HTTP server shutdown failed:", error);
      await pool.end();
      process.exit(error ? 1 : 0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  start().catch((error) => {
    console.error("Daymark portal startup failed:", error);
    process.exitCode = 1;
  });
}
