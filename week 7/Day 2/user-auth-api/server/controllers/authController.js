const bcrypt = require('bcrypt');
const users = require('../models/userModel');
const { bcryptRounds } = require('../config/appConfig');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function readCredentials(body, { registration = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw invalid('Request body must be a JSON object');
  }
  const { username, password } = body;
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.-]{3,50}$/.test(username.trim())) {
    throw invalid('username must be 3-50 characters using letters, numbers, dots, underscores, or hyphens');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw invalid('password must be between 8 and 72 characters');
  }
  if (registration) {
    const { email, first_name = '', last_name = '' } = body;
    if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      throw invalid('email must be a valid email address');
    }
    if (typeof first_name !== 'string' || typeof last_name !== 'string') {
      throw invalid('first_name and last_name must be strings');
    }
    return {
      user: {
        email: email ? email.trim().toLowerCase() : null,
        username: username.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      },
      password,
    };
  }
  return { username: username.trim(), password };
}

const register = asyncHandler(async (req, res) => {
  const { user, password } = readCredentials(req.body, { registration: true });
  const passwordHash = await bcrypt.hash(password, bcryptRounds);
  const createdUser = await users.createWithPassword(user, passwordHash);
  res.status(201).json(createdUser);
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = readCredentials(req.body);
  const user = await users.findCredentialsByUsername(username);
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;
  if (!passwordMatches) return res.status(401).json({ error: 'Invalid username or password' });
  res.json({ id: user.id, username: user.username, message: 'Login successful' });
});

module.exports = { register, login };
