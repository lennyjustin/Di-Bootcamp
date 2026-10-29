require("dotenv").config();

const crypto = require("node:crypto");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,24}$/;

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

if (!accessSecret || accessSecret.length < 32) {
  throw new Error("ACCESS_TOKEN_SECRET must contain at least 32 characters.");
}
if (!refreshSecret || refreshSecret.length < 32) {
  throw new Error("REFRESH_TOKEN_SECRET must contain at least 32 characters.");
}
if (accessSecret === refreshSecret) {
  throw new Error("Access and refresh token secrets must be different.");
}

const app = express();
const usersById = new Map();
const userIdsByName = new Map();
const pendingUsernames = new Set();
const refreshSessions = new Map();
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait and try again." },
});

function issueTokens(user) {
  const refreshId = crypto.randomUUID();
  const accessToken = jwt.sign(
    { username: user.username },
    accessSecret,
    { subject: user.id, expiresIn: ACCESS_TTL_SECONDS },
  );
  const refreshToken = jwt.sign(
    {},
    refreshSecret,
    { subject: user.id, jwtid: refreshId, expiresIn: REFRESH_TTL_SECONDS },
  );

  refreshSessions.set(refreshId, {
    userId: user.id,
    expiresAt: Date.now() + REFRESH_TTL_SECONDS * 1000,
  });

  return { accessToken, refreshToken };
}

function setAuthCookies(response, tokens) {
  response.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TTL_SECONDS * 1000,
  });
  response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TTL_SECONDS * 1000,
    path: "/api/auth",
  });
}

function clearAuthCookies(response) {
  response.clearCookie(ACCESS_COOKIE, cookieOptions);
  response.clearCookie(REFRESH_COOKIE, {
    ...cookieOptions,
    path: "/api/auth",
  });
}

function publicUser(user) {
  return { id: user.id, username: user.username };
}

function authenticate(request, response, next) {
  const token = request.cookies[ACCESS_COOKIE];
  if (!token) {
    return response.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, accessSecret);
    const user = usersById.get(payload.sub);
    if (!user) {
      return response.status(401).json({ error: "Authentication required." });
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ error: "Your session has expired. Please sign in again." });
    }
    return next(error);
  }
}

app.post("/api/auth/register", authRateLimit, async (request, response, next) => {
  try {
    const username = typeof request.body.username === "string"
      ? request.body.username.trim()
      : "";
    const password = typeof request.body.password === "string"
      ? request.body.password
      : "";
    const normalizedUsername = username.toLowerCase();

    if (!USERNAME_PATTERN.test(username)) {
      return response.status(400).json({
        error: "Username must be 3–24 characters and use only letters, numbers, _ or -.",
      });
    }
    if (password.length < 10 || Buffer.byteLength(password, "utf8") > 72) {
      return response.status(400).json({ error: "Password must be at least 10 characters and no more than 72 UTF-8 bytes." });
    }
    if (userIdsByName.has(normalizedUsername) || pendingUsernames.has(normalizedUsername)) {
      return response.status(409).json({ error: "That username is already registered." });
    }

    pendingUsernames.add(normalizedUsername);
    try {
      const user = {
        id: crypto.randomUUID(),
        username,
        passwordHash: await bcrypt.hash(password, 12),
      };
      usersById.set(user.id, user);
      userIdsByName.set(normalizedUsername, user.id);
      setAuthCookies(response, issueTokens(user));
      return response.status(201).json({ user: publicUser(user) });
    } finally {
      pendingUsernames.delete(normalizedUsername);
    }
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", authRateLimit, async (request, response, next) => {
  try {
    const username = typeof request.body.username === "string"
      ? request.body.username.trim().toLowerCase()
      : "";
    const password = typeof request.body.password === "string"
      ? request.body.password
      : "";
    const userId = userIdsByName.get(username);
    const user = userId ? usersById.get(userId) : undefined;
    const passwordMatches = user && Buffer.byteLength(password, "utf8") <= 72
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return response.status(401).json({ error: "Invalid username or password." });
    }

    setAuthCookies(response, issueTokens(user));
    return response.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/refresh", authRateLimit, (request, response) => {
  const token = request.cookies[REFRESH_COOKIE];
  if (!token) {
    clearAuthCookies(response);
    return response.status(401).json({ error: "A valid refresh token is required." });
  }

  try {
    const payload = jwt.verify(token, refreshSecret);
    const session = refreshSessions.get(payload.jti);
    const user = session ? usersById.get(session.userId) : undefined;
    if (!session || session.expiresAt <= Date.now() || !user || payload.sub !== user.id) {
      refreshSessions.delete(payload.jti);
      clearAuthCookies(response);
      return response.status(401).json({ error: "Refresh token is invalid or has been revoked." });
    }

    refreshSessions.delete(payload.jti);
    setAuthCookies(response, issueTokens(user));
    return response.json({ user: publicUser(user) });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      clearAuthCookies(response);
      return response.status(401).json({ error: "Refresh token is invalid or has expired." });
    }
    throw error;
  }
});

app.post("/api/auth/logout", (request, response) => {
  const token = request.cookies[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, refreshSecret);
      refreshSessions.delete(payload.jti);
    } catch (error) {
      if (!(error instanceof jwt.TokenExpiredError) && !(error instanceof jwt.JsonWebTokenError)) {
        throw error;
      }
    }
  }

  clearAuthCookies(response);
  return response.json({ message: "You have been signed out." });
});

app.get("/api/auth/me", authenticate, (request, response) => {
  return response.json({ user: publicUser(request.user) });
});

app.patch("/api/profile", authenticate, (request, response) => {
  const username = typeof request.body.username === "string"
    ? request.body.username.trim()
    : "";
  const currentName = request.user.username.toLowerCase();
  const nextName = username.toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return response.status(400).json({
      error: "Username must be 3–24 characters and use only letters, numbers, _ or -.",
    });
  }
  if (nextName !== currentName && userIdsByName.has(nextName)) {
    return response.status(409).json({ error: "That username is already in use." });
  }

  userIdsByName.delete(currentName);
  request.user.username = username;
  userIdsByName.set(nextName, request.user.id);
  return response.json({ user: publicUser(request.user) });
});

app.use("/api", (request, response) => {
  response.status(404).json({ error: "API route not found." });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }
  console.error("Request failed:", error);
  return response.status(500).json({ error: "An unexpected server error occurred." });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`JWT learning demo is running at http://localhost:${port}`);
});
