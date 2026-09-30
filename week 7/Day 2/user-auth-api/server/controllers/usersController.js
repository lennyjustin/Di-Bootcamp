const bcrypt = require('bcrypt');
const users = require('../models/userModel');
const { bcryptRounds } = require('../config/appConfig');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('User id must be a positive integer');
    error.status = 400;
    throw error;
  }
  return id;
}

function validateUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object');
    error.status = 400;
    throw error;
  }

  const changes = {};
  for (const field of ['email', 'username', 'first_name', 'last_name']) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      const error = new Error(`${field} must be a non-empty string`);
      error.status = 400;
      throw error;
    }
    changes[field] = body[field].trim();
  }

  if (changes.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) {
    const error = new Error('A valid email is required');
    error.status = 400;
    throw error;
  }
  if (changes.username && !/^[a-zA-Z0-9_.-]{3,50}$/.test(changes.username)) {
    const error = new Error('username must be 3-50 characters using letters, numbers, dots, underscores, or hyphens');
    error.status = 400;
    throw error;
  }

  let password;
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 72) {
      const error = new Error('password must be between 8 and 72 characters');
      error.status = 400;
      throw error;
    }
    password = body.password;
  }
  if (Object.keys(changes).length === 0 && password === undefined) {
    const error = new Error('Provide at least one user field to update');
    error.status = 400;
    throw error;
  }
  return { changes, password };
}

const getAll = asyncHandler(async (req, res) => {
  res.json(await users.findAll());
});

const getOne = asyncHandler(async (req, res) => {
  const user = await users.findById(parseId(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { changes, password } = validateUpdate(req.body);
  const passwordHash = password === undefined ? undefined : await bcrypt.hash(password, bcryptRounds);
  const user = await users.updateWithPassword(id, changes, passwordHash);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = { getAll, getOne, update };
