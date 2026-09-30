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

function validateChanges(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }
  const changes = {};
  for (const field of ['name', 'lastName', 'username']) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      const error = new Error(`${field} must be a non-empty string.`);
      error.status = 400;
      throw error;
    }
    changes[field] = body[field].trim();
  }
  if (changes.username && !/^[a-zA-Z0-9_.-]{3,30}$/.test(changes.username)) {
    const error = new Error('Username must be 3–30 characters using letters, numbers, dots, _ or -.');
    error.status = 400;
    throw error;
  }
  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      const error = new Error('Enter a valid email address.');
      error.status = 400;
      throw error;
    }
    changes.email = body.email.trim().toLowerCase();
  }
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 72) {
      const error = new Error('Password must be between 8 and 72 characters.');
      error.status = 400;
      throw error;
    }
    changes.password = body.password;
  }
  if (Object.keys(changes).length === 0) {
    const error = new Error('Provide at least one field to update.');
    error.status = 400;
    throw error;
  }
  return changes;
}

const getAll = asyncHandler(async (req, res) => res.json(await users.findAll()));

const getOne = asyncHandler(async (req, res) => {
  const user = await users.findById(parseId(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

const update = asyncHandler(async (req, res) => {
  const user = await users.updateUser(parseId(req.params.id), validateChanges(req.body));
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ message: 'User updated successfully.', user });
});

module.exports = { getAll, getOne, update };
