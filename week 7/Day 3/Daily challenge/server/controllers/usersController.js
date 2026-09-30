const users = require('../models/userModel');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    const error = new Error('User id must be a positive integer.');
    error.status = 400;
    throw error;
  }
  return id;
}

function validateUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }
  const result = {};
  for (const field of ['name', 'lastName', 'username']) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      const error = new Error(`${field} must be a non-empty string.`);
      error.status = 400;
      throw error;
    }
    result[field] = body[field].trim();
  }
  if (result.username && !/^[a-zA-Z0-9_.-]{3,30}$/.test(result.username)) {
    const error = new Error('Username must be 3–30 characters.');
    error.status = 400;
    throw error;
  }
  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      const error = new Error('Enter a valid email address.');
      error.status = 400;
      throw error;
    }
    result.email = body.email.trim().toLowerCase();
  }
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 72) {
      const error = new Error('Password must be between 8 and 72 characters.');
      error.status = 400;
      throw error;
    }
    result.password = body.password;
  }
  if (!Object.keys(result).length) {
    const error = new Error('Provide at least one user field to update.');
    error.status = 400;
    throw error;
  }
  return result;
}

const getAll = asyncHandler(async (req, res) => res.json(await users.list()));
const getOne = asyncHandler(async (req, res) => {
  const user = await users.getById(parseId(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});
const update = asyncHandler(async (req, res) => {
  const user = await users.update(parseId(req.params.id), validateUpdate(req.body));
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ message: 'User updated successfully.', user });
});

module.exports = { getAll, getOne, update };
