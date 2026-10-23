const homeView = document.querySelector("#home-view");
const authView = document.querySelector("#auth-view");
const passwordView = document.querySelector("#password-view");
const portalView = document.querySelector("#portal-view");
const portalNav = document.querySelector("#portal-nav");
const portalContent = document.querySelector("#portal-content");
const accountBar = document.querySelector("#account-bar");
const homeNavigation = document.querySelector("#home-navigation");
const homeHeaderActions = document.querySelector(".home-header-actions");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("[data-theme-toggle]");

const THEME_KEY = "daymark-theme";

let currentUser = null;
let currentView = null;
let currentCourseId = null;
let categories = [];
let toastTimer;
let viewGeneration = 0;

const courseCategoryIcons = {
  "technology-it": '<rect x="8" y="10" width="32" height="23" rx="3"/><path d="M4 39h40M19 39l2-6h6l2 6M18 18l-4 4 4 4m12-8 4 4-4 4m-4-6-3 5"/>',
  "business-finance": '<rect x="7" y="16" width="34" height="24" rx="3"/><path d="M17 16v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M7 25h34M21 25v4h6v-4"/>',
  "engineering-construction": '<path d="M5 29h38l-4-12H9L5 29Zm5 0v6h28v-6M14 17l3-8h14l3 8M24 9v8m-9 12v4m9-4v4m9-4v4"/>',
  "health-life-sciences": '<path d="M24 40S7 30 7 19a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 11-17 21-17 21Z"/><path d="M12 24h7l3-6 5 12 3-6h6"/>',
  "education-sciences": '<path d="m4 18 20-10 20 10-20 10L4 18Z"/><path d="M12 22v10c7 6 17 6 24 0V22M44 18v12"/>',
  "creative-professional-skills": '<path d="M24 6a18 18 0 1 0 0 36h3a5 5 0 0 0 3-9 3 3 0 0 1 2-5h3a7 7 0 0 0 7-7C42 13 34 6 24 6Z"/><circle cx="15" cy="20" r="2"/><circle cx="23" cy="14" r="2"/><circle cx="32" cy="18" r="2"/>',
};

function courseCategoryIcon(categorySlug) {
  const paths = courseCategoryIcons[categorySlug] ?? '<path d="M24 5v38M5 24h38M10 10l28 28m0-28L10 38"/>';
  return `<svg class="course-category-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">${paths}</svg>`;
}

const navigationByRole = {
  student: [
    ["dashboard", "Dashboard", "⌂"],
    ["courses", "My courses", "▤"],
    ["assignments", "Assignments", "▣"],
    ["grades", "Grades", "✓"],
  ],
  teacher: [
    ["teaching", "Dashboard", "⌂"],
    ["courses", "My courses", "▤"],
    ["reviews", "Submissions", "✓"],
  ],
  admin: [
    ["admin", "Dashboard", "⌂"],
    ["courses", "All courses", "▤"],
  ],
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    credentials: "same-origin",
    headers: options.body === undefined ? {} : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    const error = new Error("The server returned an unexpected response.");
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(payload.error ?? "The request could not be completed.");
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }
  return payload;
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  const label = themeToggle?.querySelector(".theme-toggle-label");
  const icon = themeToggle?.querySelector(".theme-toggle-icon");
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (label) label.textContent = isDark ? "Light mode" : "Dark mode";
  if (icon) icon.textContent = isDark ? "☀" : "☾";
  window.localStorage.setItem(THEME_KEY, theme);
}

function initializeTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme ?? (systemPrefersDark ? "dark" : "light");
  applyTheme(theme);
  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("toast-error", isError);
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 5500);
}

function setAccountBar(user) {
  document.querySelector("#account-name").textContent = user.displayName;
  document.querySelector("#account-role").textContent = user.role;
  accountBar.hidden = false;
  setLandingHeader(false);
}

function clearAccountBar() {
  accountBar.hidden = true;
}

function setLandingHeader(visible) {
  document.body.classList.toggle("landing-page", visible);
  homeNavigation.hidden = !visible;
  homeHeaderActions.hidden = !visible;
}

function showAuth(audience = "student") {
  currentUser = null;
  currentView = null;
  currentCourseId = null;
  setAuthMode("login", audience);
  homeView.hidden = true;
  authView.hidden = false;
  passwordView.hidden = true;
  portalView.hidden = true;
  setLandingHeader(false);
  clearAccountBar();
}

function showHome() {
  currentUser = null;
  currentView = null;
  currentCourseId = null;
  homeView.hidden = false;
  authView.hidden = true;
  passwordView.hidden = true;
  portalView.hidden = true;
  setLandingHeader(true);
  clearAccountBar();
}

function setAuthMode(mode, audience = "student") {
  const registering = mode === "register";
  document.querySelector("#login-form").hidden = registering;
  document.querySelector("#register-form").hidden = !registering;
  const roleName = audience === "teacher" ? "teacher" : audience === "admin" ? "administrator" : "";
  const roleSignIn = !registering && roleName.length > 0;
  document.querySelector("#auth-kicker").textContent = registering ? "A FRESH START" : roleSignIn ? `${roleName.toUpperCase()} SITE` : "WELCOME BACK";
  document.querySelector("#auth-heading").textContent = registering
    ? "Create your account"
    : audience === "teacher" ? "Sign in to your teaching space"
      : audience === "admin" ? "Sign in to portal administration" : "Sign in to Daymark";
  document.querySelector("#auth-description").textContent = registering
    ? "Your student account is the first step on a new learning journey."
    : roleSignIn
      ? `Sign in with the ${roleName} account provided by your portal administrator.`
      : "Pick up right where your learning left off.";
  document.querySelector("#auth-switch-copy").textContent = registering ? "Already have an account?" : "New to Daymark?";
  document.querySelector("#auth-switch-button").textContent = registering ? "Sign in instead" : "Create a student account";
}

function showPasswordChange() {
  homeView.hidden = true;
  authView.hidden = true;
  portalView.hidden = true;
  passwordView.hidden = false;
  setAccountBar(currentUser);
}

function defaultView(role) {
  return role === "student" ? "dashboard" : role === "teacher" ? "teaching" : "admin";
}

function renderNavigation() {
  portalNav.innerHTML = navigationByRole[currentUser.role]
    .map(([view, label, icon]) => `
      <button class="nav-button${currentView === view ? " active" : ""}" type="button" data-action="navigate" data-view="${view}">
        <span class="nav-icon" aria-hidden="true">${icon}</span>
        <span>${label}</span>
      </button>
    `)
    .join("");
}

function showPortal(view = defaultView(currentUser.role)) {
  homeView.hidden = true;
  authView.hidden = true;
  passwordView.hidden = true;
  portalView.hidden = false;
  setAccountBar(currentUser);
  currentView = view;
  renderNavigation();
  loadView();
}

function formatDate(value, includeTime = false) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Date to be confirmed";
  return new Intl.DateTimeFormat(undefined, includeTime
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" },
  ).format(date);
}

function roleLabel(role) {
  return role === "admin" ? "Administrator" : role === "teacher" ? "Teacher" : "Student";
}

function categoryOptions(selectedId = "", optionCategories = categories) {
  return optionCategories.map((category) =>
    `<option value="${escapeHtml(category.id)}"${String(category.id) === String(selectedId) ? " selected" : ""}>${escapeHtml(category.name)}</option>`,
  ).join("");
}

function courseCard(course) {
  const action = currentUser.role === "student" && !course.isEnrolled ? "View course" : "Open course";
  const categorySlug = course.category.slug;
  return `
    <article class="course-card" data-category="${escapeHtml(categorySlug)}">
      <div class="course-card-art course-art-${escapeHtml(categorySlug)}"><span>${courseCategoryIcon(categorySlug)}</span></div>
      <div class="course-card-top">
        <span class="category-chip">${escapeHtml(course.category.name)}</span>
        ${course.isPublished ? "" : '<span class="draft-chip">Draft</span>'}
      </div>
      <h3>${escapeHtml(course.title)}</h3>
      <p>${escapeHtml(course.description)}</p>
      <div class="course-card-meta">
        <span>${escapeHtml(course.level)}</span>
        <span>with ${escapeHtml(course.teacher.name)}</span>
      </div>
      ${course.teacher.qualifications ? `<p class="teacher-qualification">${escapeHtml(course.teacher.qualifications)}</p>` : ""}
      <button class="secondary-button" type="button" data-action="open-course" data-id="${escapeHtml(course.id)}">${action} <span aria-hidden="true">→</span></button>
    </article>
  `;
}

function assignmentStatus(assignment) {
  if (!assignment.attempts?.length) return { label: "Not started", tone: "neutral" };
  const latest = assignment.attempts.at(-1);
  if (latest.status === "pending") return { label: "Awaiting review", tone: "pending" };
  if (latest.status === "passed") return { label: "Passed", tone: "passed" };
  if (assignment.canSubmit) return { label: "Retake available", tone: "failed" };
  return { label: "Failed", tone: "failed" };
}

async function loadView() {
  const generation = ++viewGeneration;
  portalContent.innerHTML = '<div class="loading-card"><span class="spinner" aria-hidden="true"></span>Opening your learning space…</div>';
  try {
    if (currentView === "dashboard") await renderStudentDashboard(generation);
    else if (currentView === "courses") await renderCourses();
    else if (currentView === "assignments") await renderStudentAssignments();
    else if (currentView === "grades") await renderStudentGrades();
    else if (currentView === "teaching") await renderTeachingDashboard();
    else if (currentView === "reviews") await renderTeacherReviewPage();
    else if (currentView === "admin") await renderAdminDashboard();
    else if (currentView === "course-detail" && currentCourseId) await renderCourseDetail(currentCourseId);
  } catch (error) {
    if (generation !== viewGeneration) return;
    if (error.status === 401) {
      showAuth();
      showToast("Your session ended. Sign in again to continue.", true);
      return;
    }
    portalContent.innerHTML = `
      <section class="panel error-panel">
        <p class="section-kicker">A SMALL DETOUR</p>
        <h2>We couldn’t load this page.</h2>
        <p>${escapeHtml(error.message)}</p>
        <button class="secondary-button" type="button" data-action="reload-view">Try again</button>
      </section>`;
  }
}

async function fetchCategories() {
  const result = await request("/api/categories");
  categories = result.categories;
  return result;
}

async function fetchCourses() {
  const result = await request("/api/courses");
  return result.courses;
}

async function renderStudentDashboard(generation) {
  const courses = await fetchCourses();
  const enrolled = courses.filter((course) => course.isEnrolled);
  const details = await Promise.all(enrolled.map((course) => request(`/api/courses/${course.id}`)));
  if (generation !== viewGeneration) return;

  const assignments = details.flatMap((detail) =>
    detail.assignments.map((assignment) => ({ ...assignment, courseTitle: detail.course.title, courseId: detail.course.id })),
  );
  const pending = assignments.filter((assignment) => assignmentStatus(assignment).tone === "pending").length;
  const retakes = assignments.filter((assignment) => assignment.canSubmit && assignment.submissionState === "retake_available").length;
  const passed = assignments.filter((assignment) => assignmentStatus(assignment).tone === "passed").length;
  const completed = assignments.filter((assignment) => assignment.attempts?.some((attempt) => attempt.status !== "pending")).length;
  const progress = assignments.length ? Math.round((passed / assignments.length) * 100) : 0;
  const recommendations = courses.filter((course) => !course.isEnrolled).slice(0, 3);

  portalContent.innerHTML = `
    <section class="welcome-banner">
      <div>
        <p class="eyebrow"><span class="eyebrow-line"></span> YOUR LEARNING JOURNEY</p>
        <h1>Good to see you,<br /><span>${escapeHtml(currentUser.displayName.split(" ")[0])}.</span></h1>
        <p>Your learning progress is ready. Pick up where you left off.</p>
      </div>
      <span class="welcome-sparkle" aria-hidden="true">✿</span>
    </section>
    <section class="metric-grid" aria-label="Learning summary">
      <article class="metric-card"><span class="metric-icon">▤</span><strong>${enrolled.length}</strong><span>Enrolled courses</span></article>
      <article class="metric-card"><span class="metric-icon">✓</span><strong>${completed}</strong><span>Completed assignments</span></article>
      <article class="metric-card"><span class="metric-icon">◷</span><strong>${pending}</strong><span>Pending assignments</span></article>
      <article class="metric-card"><span class="metric-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V5m0 14h16M8 15l4-4 3 2 5-7m-4 0h4v4"/></svg></span><strong>${progress}%</strong><span>Overall progress</span></article>
    </section>
    <div class="section-heading">
      <div><p class="section-kicker">PICK UP WHERE YOU LEFT OFF</p><h2>My courses</h2></div>
      <button class="text-button" type="button" data-action="navigate" data-view="courses">Explore courses →</button>
    </div>
    ${enrolled.length
      ? `<div class="course-grid">${enrolled.map(courseCard).join("")}</div>`
      : `<div class="empty-panel"><span class="empty-symbol">✿</span><h3>Your learning story starts here.</h3><p>Explore the catalog and enroll in a course that interests you.</p><button class="secondary-button" type="button" data-action="navigate" data-view="courses">Browse the course catalog →</button></div>`}
    ${assignments.length ? `
      <div class="section-heading compact-heading"><div><p class="section-kicker">ONE STEP AT A TIME</p><h2>Assignment progress</h2></div></div>
      <div class="progress-list">
        ${assignments.map((assignment) => {
          const status = assignmentStatus(assignment);
          const effective = assignment.effectiveAttempt;
          return `<button class="progress-row" type="button" data-action="open-course" data-id="${escapeHtml(assignment.courseId)}">
            <span class="progress-mark">${status.tone === "passed" ? "✓" : "✧"}</span>
            <span class="progress-main"><strong>${escapeHtml(assignment.title)}</strong><small>${escapeHtml(assignment.courseTitle)} · Due ${formatDate(assignment.due_at)}</small></span>
            <span class="progress-result">${effective ? `${escapeHtml(effective.score)} / ${escapeHtml(assignment.max_score)}` : ""}</span>
            <span class="status-pill status-${status.tone}">${status.label}</span>
          </button>`;
        }).join("")}
      </div>` : ""}
    ${retakes ? `<p class="dashboard-retake-note">${retakes} assignment${retakes === 1 ? "" : "s"} ready for another attempt. <button class="text-button" type="button" data-action="navigate" data-view="assignments">Review assignments →</button></p>` : ""}
    ${recommendations.length ? `
      <div class="section-heading compact-heading"><div><p class="section-kicker">A LITTLE INSPIRATION</p><h2>Courses you might like</h2></div></div>
      <div class="course-grid">${recommendations.map(courseCard).join("")}</div>` : ""}
  `;
}

async function renderCourses() {
  const [courses, categoryResult] = await Promise.all([fetchCourses(), fetchCategories()]);
  const teachers = currentUser.role === "admin"
    ? (await request("/api/admin/users")).users.filter((user) => user.role === "teacher")
    : [];
  const available = currentUser.role === "student" ? courses.filter((course) => !course.isEnrolled) : courses;
  const enrolled = currentUser.role === "student" ? courses.filter((course) => course.isEnrolled) : [];
  const categoryFilters = currentUser.role === "student" && categoryResult.categories.length
    ? `<div class="category-filter-list" aria-label="Filter courses by subject">
        <button class="filter-chip active" type="button" data-action="filter-category" data-category="all" aria-pressed="true">All</button>
        ${categoryResult.categories.map((category) => `<button class="filter-chip" type="button" data-action="filter-category" data-category="${escapeHtml(category.slug)}" aria-pressed="false">${escapeHtml(category.name)}</button>`).join("")}
      </div>`
    : "";
  portalContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow"><span class="eyebrow-line"></span> FIND YOUR NEXT INTEREST</p><h1>${currentUser.role === "admin" ? "Courses across every field." : "Curiosity looks good on you."}</h1><p>Learn something new, one thoughtful lesson at a time.</p></div>
    </div>
    ${currentUser.role === "student" ? '<label class="course-search-label" for="course-search">Find a course<input id="course-search" type="search" placeholder="Search title, subject or teacher…" /></label>' : ""}
    ${categoryFilters}
    ${currentUser.role === "teacher" || currentUser.role === "admin" ? createCourseForm(categoryResult.categories, teachers) : ""}
    ${enrolled.length ? `<div class="section-heading"><div><p class="section-kicker">ALREADY ON YOUR PATH</p><h2>Your enrolled courses</h2></div></div><div class="course-grid">${enrolled.map(courseCard).join("")}</div>` : ""}
    <div class="section-heading ${enrolled.length ? "compact-heading" : ""}"><div><p class="section-kicker">A WORLD OF IDEAS</p><h2>${currentUser.role === "student" ? "Explore the catalog" : "Available courses"}</h2></div></div>
    ${available.length
      ? `<div class="course-grid">${available.map(courseCard).join("")}</div>`
      : `<div class="empty-panel"><span class="empty-symbol">✿</span><h3>${courses.length ? "You're all caught up." : "The catalog is taking shape."}</h3><p>${courses.length ? "You've enrolled in every available course." : "Published courses will appear here when they are ready."}</p></div>`}
  `;
}

async function getStudentCoursework() {
  const courses = await fetchCourses();
  const enrolled = courses.filter((course) => course.isEnrolled);
  const details = await Promise.all(enrolled.map((course) => request(`/api/courses/${course.id}`)));
  return {
    assignments: details.flatMap((detail) =>
      detail.assignments.map((assignment) => ({
        ...assignment,
        courseTitle: detail.course.title,
        courseId: detail.course.id,
      })),
    ),
  };
}

async function renderStudentAssignments() {
  const { assignments } = await getStudentCoursework();
  const sortedAssignments = [...assignments].sort((left, right) =>
    new Date(left.due_at).getTime() - new Date(right.due_at).getTime(),
  );
  portalContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow"><span class="eyebrow-line"></span> YOUR COURSEWORK</p><h1>My assignments</h1><p>Check deadlines, review feedback, and pick up any available retakes.</p></div>
    </div>
    ${sortedAssignments.length ? `<div class="assignment-list">${sortedAssignments.map((assignment) => {
      const status = assignmentStatus(assignment);
      const effective = assignment.effectiveAttempt;
      return `<article class="panel assignment-panel assignment-overview">
        <div class="assignment-panel-heading">
          <div><span class="section-kicker">${escapeHtml(assignment.courseTitle)} · DUE ${escapeHtml(formatDate(assignment.due_at))}</span><h3>${escapeHtml(assignment.title)}</h3></div>
          <span class="status-pill status-${status.tone}">${status.label}</span>
        </div>
        <p class="assignment-instructions">${escapeHtml(assignment.instructions)}</p>
        <div class="assignment-meta"><span>Pass mark ${escapeHtml(assignment.pass_mark)} / ${escapeHtml(assignment.max_score)}</span><span>${assignment.attempts?.length ?? 0} of ${escapeHtml(assignment.max_attempts)} attempts</span>${effective ? `<span>Score ${escapeHtml(effective.score)} / ${escapeHtml(assignment.max_score)}</span>` : ""}</div>
        <button class="secondary-button" type="button" data-action="open-course" data-id="${escapeHtml(assignment.courseId)}">Open assignment <span aria-hidden="true">→</span></button>
      </article>`;
    }).join("")}</div>` : `<div class="empty-panel"><span class="empty-symbol">▣</span><h3>No assignments yet.</h3><p>Enroll in a course to see its assignments and due dates here.</p><button class="secondary-button" type="button" data-action="navigate" data-view="courses">Explore courses →</button></div>`}
  `;
}

async function renderStudentGrades() {
  const { assignments } = await getStudentCoursework();
  const graded = assignments.filter((assignment) => assignment.effectiveAttempt);
  portalContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow"><span class="eyebrow-line"></span> RESULTS AND FEEDBACK</p><h1>My grades</h1><p>Review your recorded scores and teacher feedback.</p></div>
    </div>
    ${graded.length ? `<div class="grade-table-wrap"><table class="grade-table">
      <thead><tr><th>Course</th><th>Assignment</th><th>Score</th><th>Result</th><th>Feedback</th></tr></thead>
      <tbody>${graded.map((assignment) => {
        const attempt = assignment.effectiveAttempt;
        const passed = Number(attempt.score) >= Number(assignment.pass_mark);
        return `<tr>
          <td>${escapeHtml(assignment.courseTitle)}</td>
          <td>${escapeHtml(assignment.title)}</td>
          <td>${escapeHtml(attempt.score)} / ${escapeHtml(assignment.max_score)}</td>
          <td><span class="status-pill status-${passed ? "passed" : "failed"}">${passed ? "Passed" : "Failed"}</span></td>
          <td>${escapeHtml(attempt.feedback || "No feedback yet")}</td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>` : `<div class="empty-panel"><span class="empty-symbol">✓</span><h3>Your grades will appear here.</h3><p>Once a teacher reviews an assignment, you can see the score and feedback.</p></div>`}
  `;
}

async function renderTeacherReviewPage() {
  const result = await request("/api/teacher/submissions");
  portalContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow"><span class="eyebrow-line"></span> REVIEW STUDENT WORK</p><h1>Submissions</h1><p>Grade student attempts and leave feedback to guide their next steps.</p></div>
    </div>
    ${renderTeacherSubmissions(result.submissions)}
  `;
}

function createCourseForm(categoryList, teachers = []) {
  const teacherPicker = currentUser.role === "admin"
    ? `<label for="course-teacher">Course teacher</label><select id="course-teacher" name="teacherId" required><option value="">Choose an approved teacher</option>${teachers.map((teacher) => `<option value="${escapeHtml(teacher.id)}">${escapeHtml(teacher.displayName)} · ${escapeHtml(teacher.email)}</option>`).join("")}</select><p class="field-help">${teachers.length ? "Only approved teacher accounts can own courses." : "Create a teacher account in Portal overview before assigning a course."}</p>`
    : "";
  return `
    <details class="panel create-panel">
      <summary><span class="summary-plus">＋</span><span><small>SHARE YOUR KNOWLEDGE</small><strong>Create a course</strong></span></summary>
      <form class="portal-form inline-form" data-form="create-course">
        <label for="course-title">Course title</label>
        <input id="course-title" name="title" maxlength="140" required />
        <label for="course-category">Subject area</label>
        <select id="course-category" name="categoryId" required><option value="">Choose a category</option>${categoryOptions("", categoryList)}</select>
        <label for="course-level">Level</label>
        <input id="course-level" name="level" maxlength="80" placeholder="e.g. Beginner, Intermediate" required />
        ${teacherPicker}
        <label for="course-description">Course description</label>
        <textarea id="course-description" name="description" rows="3" maxlength="4000" required></textarea>
        <button class="submit-button" type="submit">Create draft course <span aria-hidden="true">→</span></button>
      </form>
    </details>
  `;
}

async function renderTeachingDashboard() {
  const [courses, categoryResult] = await Promise.all([fetchCourses(), fetchCategories()]);
  const mine = courses.filter((course) => String(course.teacher.id) === String(currentUser.id));
  const submissionsResult = await request("/api/teacher/submissions");
  const pending = submissionsResult.submissions.filter((submission) => submission.status === "pending");
  portalContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow"><span class="eyebrow-line"></span> YOUR TEACHING SPACE</p><h1>Knowledge grows<br /><span>when we share it.</span></h1><p>Create a course, add assignments, and guide each student's next step.</p></div>
    </div>
    <section class="teacher-summary">
      <div><span class="metric-icon">✧</span><strong>${mine.length}</strong><span>Your courses</span></div>
      <div><span class="metric-icon">◷</span><strong>${pending.length}</strong><span>Submissions to review</span></div>
      <button class="secondary-button" type="button" data-action="navigate" data-view="courses">Browse catalog →</button>
    </section>
    ${createCourseForm(categoryResult.categories)}
    <div class="section-heading"><div><p class="section-kicker">YOUR CLASSROOMS</p><h2>Courses you teach</h2></div></div>
    ${mine.length ? `<div class="course-grid">${mine.map(courseCard).join("")}</div>` : `<div class="empty-panel"><span class="empty-symbol">✧</span><h3>Your first class is ready to be created.</h3><p>Use the form above to set up a course.</p></div>`}
    <div class="section-heading compact-heading"><div><p class="section-kicker">STUDENT WORK</p><h2>Waiting for your feedback</h2></div><span class="count-chip">${pending.length}</span></div>
    ${pending.length ? `<div class="submission-list">${pending.slice(0, 4).map((submission) => `
      <button class="submission-preview" type="button" data-action="open-course" data-id="${escapeHtml(submission.course_id)}">
        <span class="progress-mark">◷</span><span class="progress-main"><strong>${escapeHtml(submission.assignment_title)}</strong><small>${escapeHtml(submission.student_name)} · ${escapeHtml(submission.course_title)}</small></span><span class="review-arrow">Review →</span>
      </button>`).join("")}</div>` : `<p class="subtle-copy">No submissions are waiting for review right now.</p>`}
  `;
}

async function renderAdminDashboard() {
  const [usersResult, courses] = await Promise.all([request("/api/admin/users"), fetchCourses()]);
  const teachers = usersResult.users.filter((user) => user.role === "teacher");
  const students = usersResult.users.filter((user) => user.role === "student");
  portalContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow"><span class="eyebrow-line"></span> PORTAL ADMINISTRATION</p><h1>A welcoming place<br /><span>to learn together.</span></h1><p>Look after your people, courses, and the learning community.</p></div>
    </div>
    <section class="metric-grid admin-metrics">
      <article class="metric-card"><span class="metric-icon">♙</span><strong>${students.length}</strong><span>Student accounts</span></article>
      <article class="metric-card"><span class="metric-icon">✧</span><strong>${teachers.length}</strong><span>Approved teachers</span></article>
      <article class="metric-card"><span class="metric-icon">▤</span><strong>${courses.length}</strong><span>Courses in the portal</span></article>
      <article class="metric-card"><span class="metric-icon">◷</span><strong>${courses.filter((course) => course.isPublished).length}</strong><span>Published courses</span></article>
    </section>
    <details class="panel create-panel" open>
      <summary><span class="summary-plus">＋</span><span><small>GROW YOUR TEACHING TEAM</small><strong>Issue a teacher account</strong></span></summary>
      <form class="portal-form inline-form" data-form="create-user">
        <label for="teacher-name">Teacher name</label><input id="teacher-name" name="displayName" maxlength="100" required />
        <label for="teacher-email">Teacher email</label><input id="teacher-email" name="email" type="email" required />
        <label for="teacher-qualifications">Qualifications <span class="field-note">Optional</span></label><input id="teacher-qualifications" name="qualifications" maxlength="2000" />
        <label for="teacher-bio">Short profile <span class="field-note">Optional</span></label><textarea id="teacher-bio" name="bio" rows="2" maxlength="4000"></textarea>
        <button class="submit-button" type="submit">Create teacher account <span aria-hidden="true">→</span></button>
      </form>
    </details>
    <div class="section-heading"><div><p class="section-kicker">YOUR COMMUNITY</p><h2>People in Daymark</h2></div></div>
    <div class="people-list">${usersResult.users.map((user) => `
      <article class="person-row">
        <span class="person-avatar">${escapeHtml(user.displayName.trim().charAt(0).toUpperCase())}</span>
        <span class="progress-main"><strong>${escapeHtml(user.displayName)}</strong><small>${escapeHtml(user.email)}${user.profile?.institution ? ` · ${escapeHtml(user.profile.institution)}` : ""}</small></span>
        <span class="role-pill">${escapeHtml(roleLabel(user.role))}</span>
      </article>`).join("")}
    </div>
  `;
}

async function renderCourseDetail(courseId) {
  const detail = await request(`/api/courses/${courseId}`);
  const { course, assignments, lessons = [], isEnrolled } = detail;
  const canManage = currentUser.role === "admin" ||
    (currentUser.role === "teacher" && String(course.teacher.id) === String(currentUser.id));
  let submissions = [];
  if (canManage) {
    const response = await request(`/api/teacher/submissions?courseId=${encodeURIComponent(course.id)}`);
    submissions = response.submissions;
  }

  portalContent.innerHTML = `
    <button class="back-link" type="button" data-action="navigate" data-view="${currentUser.role === "teacher" ? "teaching" : currentUser.role === "admin" ? "admin" : "courses"}">← Back to ${currentUser.role === "student" ? "courses" : "your space"}</button>
    <section class="course-hero">
      <div class="course-hero-art" aria-hidden="true">✿</div>
      <span class="category-chip">${escapeHtml(course.category.name)}</span>
      ${canManage ? `<span class="published-pill${course.isPublished ? " is-published" : ""}">${course.isPublished ? "Published" : "Draft"}</span>` : ""}
      <h1>${escapeHtml(course.title)}</h1>
      <p class="course-hero-description">${escapeHtml(course.description)}</p>
      <div class="course-hero-meta"><span>✧ ${escapeHtml(course.level)}</span><span>Teacher: ${escapeHtml(course.teacher.name)}</span>${course.teacher.qualifications ? `<span>${escapeHtml(course.teacher.qualifications)}</span>` : ""}</div>
      ${course.teacher.bio ? `<p class="teacher-bio">${escapeHtml(course.teacher.bio)}</p>` : ""}
      ${canManage ? `<button class="secondary-button publish-toggle" type="button" data-action="toggle-publish" data-id="${escapeHtml(course.id)}" data-published="${String(course.isPublished)}">${course.isPublished ? "Unpublish course" : "Publish course"}</button>` : ""}
      ${currentUser.role === "student" && !isEnrolled ? `<button class="submit-button enroll-button" type="button" data-action="enroll" data-id="${escapeHtml(course.id)}">Enroll in this course <span aria-hidden="true">→</span></button>` : ""}
    </section>
    ${canManage || isEnrolled ? `
      <section class="section-heading course-assignment-heading"><div><p class="section-kicker">LEARN AT YOUR PACE</p><h2>Lessons and resources</h2></div><span class="count-chip">${lessons.length}</span></section>
      ${lessons.length ? `<div class="lesson-list">${lessons.map((lesson, index) => `
        <article class="panel lesson-card"><div class="lesson-number">${index + 1}</div><div class="lesson-copy"><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.content)}</p>${lesson.resource_url ? `<a class="lesson-resource" href="${escapeHtml(lesson.resource_url)}" target="_blank" rel="noopener noreferrer">Open learning resource <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 4h6v6m-1-5-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg></a>` : ""}</div></article>`).join("")}</div>` : `<div class="empty-panel lesson-empty"><span class="empty-symbol">✧</span><h3>Your learning materials will appear here.</h3><p>${canManage ? "Add the first lesson below to give students a clear place to begin." : "The teacher has not added lessons yet."}</p></div>`}
    ` : ""}
    ${canManage ? `
      <details class="panel create-panel">
        <summary><span class="summary-plus">＋</span><span><small>GIVE STUDENTS A NEW CHALLENGE</small><strong>Add an assignment</strong></span></summary>
        <form class="portal-form inline-form assignment-form" data-form="create-assignment" data-course-id="${escapeHtml(course.id)}">
          <label for="assignment-title">Assignment title</label><input id="assignment-title" name="title" maxlength="160" required />
          <label for="assignment-instructions">Instructions</label><textarea id="assignment-instructions" name="instructions" rows="4" maxlength="10000" required></textarea>
          <div class="form-row">
            <div><label for="assignment-due">Due date and time</label><input id="assignment-due" name="dueAt" type="datetime-local" required /></div>
            <div><label for="assignment-max-score">Maximum score</label><input id="assignment-max-score" name="maxScore" type="number" min="1" max="100000" value="100" required /></div>
          </div>
          <div class="form-row">
            <div><label for="assignment-pass-mark">Pass mark</label><input id="assignment-pass-mark" name="passMark" type="number" min="0" max="100000" value="50" required /></div>
            <div><label for="assignment-attempts">Maximum attempts</label><input id="assignment-attempts" name="maxAttempts" type="number" min="1" max="10" value="3" required /></div>
          </div>
          <label for="assignment-policy">Result shown to student</label>
          <select id="assignment-policy" name="scorePolicy"><option value="highest">Highest attempt score</option><option value="latest">Latest attempt score</option></select>
          <button class="submit-button" type="submit">Publish assignment <span aria-hidden="true">→</span></button>
        </form>
      </details>
      <details class="panel create-panel">
        <summary><span class="summary-plus">＋</span><span><small>BUILD THE LEARNING PATH</small><strong>Add a lesson or resource</strong></span></summary>
        <form class="portal-form inline-form" data-form="create-lesson" data-course-id="${escapeHtml(course.id)}">
          <label for="lesson-title">Lesson title</label><input id="lesson-title" name="title" maxlength="160" required />
          <label for="lesson-content">Lesson notes or learning material</label><textarea id="lesson-content" name="content" rows="5" maxlength="12000" placeholder="Explain the topic, add examples, or provide study notes…" required></textarea>
          <label for="lesson-resource-url">Optional resource link <span class="field-note">HTTPS only</span></label><input id="lesson-resource-url" name="resourceUrl" type="url" maxlength="1000" placeholder="https://example.com/learning-resource" />
          <p class="field-help">Add a link to a video, PDF, or other material hosted elsewhere. The lesson text is saved in Daymark.</p>
          <button class="submit-button" type="submit">Save lesson <span aria-hidden="true">→</span></button>
        </form>
      </details>
      ${renderTeacherSubmissions(submissions)}
    ` : isEnrolled ? `<section class="section-heading course-assignment-heading"><div><p class="section-kicker">YOUR COURSEWORK</p><h2>Assignments and results</h2></div></section>` : ""}
    ${canManage || isEnrolled
      ? assignments.length ? `<div class="assignment-list">${assignments.map((assignment) => canManage
        ? renderTeacherAssignment(assignment)
        : renderStudentAssignment(assignment, course.id)).join("")}</div>`
        : `<div class="empty-panel"><span class="empty-symbol">✧</span><h3>No assignments yet.</h3><p>New course work will appear here when it is published.</p></div>`
      : ""}
  `;
}

function renderStudentAssignment(assignment, courseId) {
  const status = assignmentStatus(assignment);
  const attempts = assignment.attempts ?? [];
  const score = assignment.effectiveAttempt?.score;
  return `
    <article class="panel assignment-panel">
      <div class="assignment-panel-heading">
        <div><span class="section-kicker">DUE ${escapeHtml(formatDate(assignment.due_at))}</span><h3>${escapeHtml(assignment.title)}</h3></div>
        <span class="status-pill status-${status.tone}">${status.label}</span>
      </div>
      <p class="assignment-instructions">${escapeHtml(assignment.instructions)}</p>
      <div class="assignment-meta"><span>Pass mark ${escapeHtml(assignment.pass_mark)} / ${escapeHtml(assignment.max_score)}</span><span>${attempts.length} of ${escapeHtml(assignment.max_attempts)} attempts</span>${score === undefined ? "" : `<span>Counted score: ${escapeHtml(score)} / ${escapeHtml(assignment.max_score)}</span>`}</div>
      ${attempts.length ? `<div class="attempt-history"><h4>Your submissions</h4>${attempts.map((attempt) => `
        <article class="attempt-row">
          <span class="attempt-number">#${escapeHtml(attempt.number)}</span>
          <span class="progress-main"><strong>Submitted ${formatDate(attempt.submittedAt, true)}${attempt.isLate ? " · Late" : ""}</strong>${attempt.feedback ? `<small>Teacher feedback: ${escapeHtml(attempt.feedback)}</small>` : ""}</span>
          <span class="attempt-score">${attempt.score === null ? "Pending" : `${escapeHtml(attempt.score)} / ${escapeHtml(assignment.max_score)}`}</span>
          <span class="status-pill status-${attempt.status === "passed" ? "passed" : attempt.status === "failed" ? "failed" : "pending"}">${escapeHtml(attempt.status)}</span>
        </article>`).join("")}</div>` : ""}
      ${assignment.canSubmit ? `<form class="portal-form response-form" data-form="submit-assignment" data-assignment-id="${escapeHtml(assignment.id)}" data-course-id="${escapeHtml(courseId)}">
        <label for="answer-${escapeHtml(assignment.id)}">${assignment.submissionState === "retake_available" ? "Improve your work and submit another attempt" : "Your response"}</label>
        <textarea id="answer-${escapeHtml(assignment.id)}" name="answerText" rows="5" maxlength="20000" placeholder="Write your work here…" required></textarea>
        <p class="field-help">Your previous attempts are kept. This submission becomes attempt ${attempts.length + 1} of ${escapeHtml(assignment.max_attempts)}.</p>
        <button class="submit-button" type="submit">${assignment.submissionState === "retake_available" ? "Submit a retake" : "Submit for review"} <span aria-hidden="true">→</span></button>
      </form>` : assignment.submissionState === "awaiting_grade"
        ? '<p class="notice-copy">Your work is with the teacher now. You can submit again if a retake is needed.</p>'
        : assignment.submissionState === "attempts_exhausted"
          ? '<p class="notice-copy">You have used the attempts allowed for this assignment. Ask your teacher if you need another chance.</p>'
          : ""}
    </article>
  `;
}

function renderTeacherAssignment(assignment) {
  return `
    <article class="panel assignment-panel teacher-assignment">
      <div class="assignment-panel-heading">
        <div><span class="section-kicker">DUE ${escapeHtml(formatDate(assignment.due_at))}</span><h3>${escapeHtml(assignment.title)}</h3></div>
        <span class="count-chip">${escapeHtml(assignment.pendingCount)} to review</span>
      </div>
      <p class="assignment-instructions">${escapeHtml(assignment.instructions)}</p>
      <div class="assignment-meta"><span>Pass mark ${escapeHtml(assignment.pass_mark)} / ${escapeHtml(assignment.max_score)}</span><span>Up to ${escapeHtml(assignment.max_attempts)} attempts</span><span>Counts ${escapeHtml(assignment.score_policy)} score</span></div>
    </article>
  `;
}

function renderTeacherSubmissions(submissions) {
  return `
    <section class="section-heading course-assignment-heading"><div><p class="section-kicker">STUDENT LEARNING</p><h2>Submissions to review</h2></div><span class="count-chip">${submissions.filter((submission) => submission.status === "pending").length} waiting</span></section>
    ${submissions.length ? `<div class="submission-list">${submissions.map((submission) => `
      <article class="panel review-card">
        <div class="assignment-panel-heading">
          <div><span class="section-kicker">${escapeHtml(submission.course_title)} · ${escapeHtml(submission.assignment_title)}</span><h3>${escapeHtml(submission.student_name)} <span class="student-email">(${escapeHtml(submission.student_email)})</span></h3></div>
          <span class="status-pill status-${submission.status === "passed" ? "passed" : submission.status === "failed" ? "failed" : "pending"}">${escapeHtml(submission.status)}</span>
        </div>
        <p class="review-meta">Attempt ${escapeHtml(submission.attempt_number)} · Submitted ${formatDate(submission.submitted_at, true)}${submission.is_late ? " · Late" : ""}</p>
        <div class="student-answer">${escapeHtml(submission.answer_text)}</div>
        ${submission.status === "pending" ? `<form class="portal-form grade-form" data-form="grade" data-submission-id="${escapeHtml(submission.id)}">
          <div class="form-row">
            <div><label for="score-${escapeHtml(submission.id)}">Score (out of ${escapeHtml(submission.max_score)})</label><input id="score-${escapeHtml(submission.id)}" name="score" type="number" min="0" max="${escapeHtml(submission.max_score)}" step="0.01" required /></div>
            <div><label for="feedback-${escapeHtml(submission.id)}">Feedback</label><textarea id="feedback-${escapeHtml(submission.id)}" name="feedback" rows="2" maxlength="10000" placeholder="Give the student a helpful next step"></textarea></div>
          </div>
          <p class="field-help">A score of ${escapeHtml(submission.pass_mark)} or more counts as a pass.</p>
          <button class="submit-button" type="submit">Save grade and feedback <span aria-hidden="true">→</span></button>
        </form>` : `<p class="notice-copy">Score: <strong>${escapeHtml(submission.score)} / ${escapeHtml(submission.max_score)}</strong>${submission.feedback ? ` · ${escapeHtml(submission.feedback)}` : ""}</p>`}
      </article>`).join("")}</div>` : `<div class="empty-panel"><span class="empty-symbol">✧</span><h3>Nothing to review just yet.</h3><p>Student submissions will appear here.</p></div>`}
  `;
}

function navigate(view) {
  currentCourseId = null;
  currentView = view;
  renderNavigation();
  loadView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function refreshCurrentView() {
  if (currentView === "course-detail" && currentCourseId) {
    await renderCourseDetail(currentCourseId);
  } else {
    await loadView();
  }
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleAuthSubmit(event) {
  const form = event.target;
  const values = formValues(form);
  if (form.id === "login-form") {
    const result = await request("/api/auth/login", { method: "POST", body: values });
    currentUser = result.user;
  } else {
    const result = await request("/api/auth/register", { method: "POST", body: values });
    currentUser = result.user;
  }
  form.reset();
  showToast(`Welcome to Daymark, ${currentUser.displayName.split(" ")[0]}!`);
  if (currentUser.mustChangePassword) showPasswordChange();
  else showPortal();
}

async function handlePortalForm(event) {
  event.preventDefault();
  const form = event.target;
  const values = formValues(form);
  const kind = form.dataset.form;

  if (kind === "submit-assignment") {
    await request(`/api/assignments/${form.dataset.assignmentId}/submissions`, {
      method: "POST",
      body: values,
    });
    showToast("Your work is submitted. Your teacher will review it soon.");
    currentCourseId = form.dataset.courseId;
    currentView = "course-detail";
    renderNavigation();
    await renderCourseDetail(currentCourseId);
  } else if (kind === "create-assignment") {
    values.maxScore = Number(values.maxScore);
    values.passMark = Number(values.passMark);
    values.maxAttempts = Number(values.maxAttempts);
    await request(`/api/courses/${form.dataset.courseId}/assignments`, { method: "POST", body: values });
    showToast("Your assignment is published.");
    await refreshCurrentView();
  } else if (kind === "create-lesson") {
    await request(`/api/courses/${form.dataset.courseId}/lessons`, { method: "POST", body: values });
    showToast("Lesson saved and added to the course.");
    currentCourseId = form.dataset.courseId;
    currentView = "course-detail";
    await renderCourseDetail(currentCourseId);
  } else if (kind === "grade") {
    values.score = Number(values.score);
    await request(`/api/submissions/${form.dataset.submissionId}/grade`, { method: "POST", body: values });
    showToast("Grade and feedback saved.");
    await refreshCurrentView();
  } else if (kind === "create-course") {
    const course = {
      title: values.title,
      description: values.description,
      level: values.level,
      categoryId: Number(values.categoryId),
    };
    if (values.teacherId) course.teacherId = Number(values.teacherId);
    await request("/api/courses", { method: "POST", body: course });
    showToast("Course created as a draft. Publish it when it is ready for students.");
    await refreshCurrentView();
  } else if (kind === "create-user") {
    const result = await request("/api/admin/users", {
      method: "POST",
      body: { ...values, role: "teacher" },
    });
    showToast(`Teacher account created for ${result.user.displayName}.`);
    const secret = document.createElement("section");
    secret.className = "temporary-password";
    const heading = document.createElement("h3");
    heading.textContent = "Share this temporary password securely";
    const address = document.createElement("p");
    address.textContent = result.user.email;
    const password = document.createElement("code");
    password.textContent = result.temporaryPassword;
    const note = document.createElement("p");
    note.textContent = "It is shown only once. The teacher must change it when they sign in.";
    secret.append(heading, address, password, note);
    form.reset();
    await renderAdminDashboard();
    portalContent.prepend(secret);
  }
}

document.querySelectorAll("[data-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode, button.dataset.authRole);
    homeView.hidden = true;
    authView.hidden = false;
    passwordView.hidden = true;
    portalView.hidden = true;
    setLandingHeader(false);
    clearAccountBar();
  });
});

document.querySelectorAll("[data-show-home]").forEach((button) => {
  button.addEventListener("click", showHome);
});

document.querySelector("#auth-switch-button").addEventListener("click", () => {
  const registering = document.querySelector("#login-form").hidden;
  setAuthMode(registering ? "login" : "register");
});

document.querySelector("#auth-view").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await handleAuthSubmit(event);
  } catch (error) {
    showToast(error.message, true);
  }
});

document.querySelector("#password-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await request("/api/auth/password", { method: "POST", body: formValues(event.target) });
    event.target.reset();
    showHome();
    showToast("Password updated. Sign in with your new password.");
  } catch (error) {
    showToast(error.message, true);
  }
});

portalNav.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="navigate"]');
  if (button) navigate(button.dataset.view);
});

portalContent.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  try {
    if (button.dataset.action === "navigate") {
      navigate(button.dataset.view);
    } else if (button.dataset.action === "open-course") {
      currentCourseId = button.dataset.id;
      currentView = "course-detail";
      renderNavigation();
      await loadView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (button.dataset.action === "reload-view") {
      await loadView();
    } else if (button.dataset.action === "enroll") {
      await request(`/api/courses/${button.dataset.id}/enroll`, { method: "POST", body: {} });
      currentCourseId = button.dataset.id;
      currentView = "course-detail";
      showToast("You're enrolled. Welcome to the course!");
      renderNavigation();
      await loadView();
    } else if (button.dataset.action === "toggle-publish") {
      const isPublished = button.dataset.published === "true";
      await request(`/api/courses/${button.dataset.id}`, {
        method: "PATCH",
        body: { isPublished: !isPublished },
      });
      showToast(isPublished ? "Course unpublished." : "Course published. Students can now enroll.");
      await loadView();
    } else if (button.dataset.action === "filter-category") {
      const category = button.dataset.category;
      for (const filter of portalContent.querySelectorAll('[data-action="filter-category"]')) {
        const active = filter === button;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-pressed", String(active));
      }
      for (const card of portalContent.querySelectorAll(".course-card")) {
        const matchesCategory = category === "all" || card.dataset.category === category;
        const matchesSearch = card.textContent.toLocaleLowerCase()
          .includes((portalContent.querySelector("#course-search")?.value ?? "").trim().toLocaleLowerCase());
        card.hidden = !matchesCategory || !matchesSearch;
      }
    }
  } catch (error) {
    showToast(error.message, true);
  }
});

portalContent.addEventListener("submit", async (event) => {
  if (!event.target.matches("[data-form]")) return;
  try {
    await handlePortalForm(event);
  } catch (error) {
    showToast(error.message, true);
  }
});

portalContent.addEventListener("input", (event) => {
  if (event.target.id !== "course-search") return;
  const query = event.target.value.trim().toLocaleLowerCase();
  const activeFilter = portalContent.querySelector('[data-action="filter-category"].active');
  const category = activeFilter?.dataset.category ?? "all";
  for (const card of portalContent.querySelectorAll(".course-card")) {
    const matchesSearch = query.length === 0 || card.textContent.toLocaleLowerCase().includes(query);
    const matchesCategory = category === "all" || card.dataset.category === category;
    card.hidden = !matchesSearch || !matchesCategory;
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await request("/api/auth/logout", { method: "POST", body: {} });
    showHome();
    showToast("You’re signed out. See you next time!");
  } catch (error) {
    showToast(error.message, true);
  }
});

(async function initialize() {
  initializeTheme();
  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  try {
    const result = await request("/api/me");
    currentUser = result.user;
    if (currentUser.mustChangePassword) showPasswordChange();
    else showPortal();
  } catch (error) {
    if (error.status === 401) {
      showHome();
      return;
    }
    showHome();
    if (error.status === 404) {
      showToast("Design preview only. Start the Daymark server with PostgreSQL to use accounts.", true);
      return;
    }
    showToast(error.message, true);
  }
})();
