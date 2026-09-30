const bcrypt = require('bcrypt');
const users = require('../models/userModel');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function validateLogin(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = body.password;
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    const error = new Error('Username must be 3–30 characters and use letters, numbers, dots, _ or -.');
    error.status = 400;
    throw error;
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    const error = new Error('Password must be between 8 and 72 characters.');
    error.status = 400;
    throw error;
  }
  return { username, password };
}

const register = asyncHandler(async (req, res) => {
  const { username, password } = validateLogin(req.body);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const lastName = typeof req.body.lastName === 'string' ? req.body.lastName.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!name || !lastName) {
    const error = new Error('First and last name are required.');
    error.status = 400;
    throw error;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Enter a valid email address.');
    error.status = 400;
    throw error;
  }
  const user = await users.create({ name, lastName, email, username }, password);
  res.status(201).json({ message: `Hello ${name}! Your account is now created!`, user });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = validateLogin(req.body);
  const user = await users.findByUsername(username);
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) return res.status(401).json({ error: 'Username is not registered or password is incorrect.' });
  res.json({ message: `Hi ${user.username} welcome back again!`, user: users.publicUser(user) });
});

module.exports = { register, login };
