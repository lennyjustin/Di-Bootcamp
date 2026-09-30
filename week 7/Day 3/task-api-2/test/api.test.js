const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const tempDir = path.join(os.tmpdir(), `user-json-api-${process.pid}`);
process.env.USERS_FILE = path.join(tempDir, 'users.json');
process.env.BCRYPT_ROUNDS = '4';
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await fs.rm(tempDir, { recursive: true, force: true });
});

async function request(url, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
}

const firstUser = {
  name: 'Taylor',
  lastName: 'Morgan',
  email: 'taylor@example.com',
  username: 'taylor_m',
  password: 'secure-pass-123',
};

test('registers users with bcrypt hashes and rejects duplicate username/password', async () => {
  const registered = await request('/register', 'POST', firstUser);
  assert.equal(registered.status, 201);
  assert.match(registered.data.message, /Registration successful/);
  assert.equal(registered.data.user.username, firstUser.username);

  const stored = JSON.parse(await fs.readFile(process.env.USERS_FILE, 'utf8'));
  assert.equal(stored.length, 1);
  assert.notEqual(stored[0].passwordHash, firstUser.password);
  assert.equal(Object.hasOwn(registered.data.user, 'passwordHash'), false);

  const duplicateUsername = await request('/register', 'POST', { ...firstUser, email: 'other@example.com' });
  assert.equal(duplicateUsername.status, 409);
  const duplicatePassword = await request('/register', 'POST', {
    ...firstUser, username: 'another_user', email: 'another@example.com',
  });
  assert.equal(duplicatePassword.status, 409);
  assert.equal(JSON.parse(await fs.readFile(process.env.USERS_FILE, 'utf8')).length, 1);
});

test('login accepts correct credentials and rejects incorrect credentials', async () => {
  const invalid = await request('/login', 'POST', { username: firstUser.username, password: 'wrong-password' });
  assert.equal(invalid.status, 401);
  assert.equal(invalid.data.error, 'Invalid username or password.');

  const valid = await request('/login', 'POST', { username: firstUser.username, password: firstUser.password });
  assert.equal(valid.status, 200);
  assert.match(valid.data.message, /Welcome back, Taylor/);
});

test('lists, retrieves, and updates public user records', async () => {
  const list = await request('/users');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 1);
  assert.equal(Object.hasOwn(list.data[0], 'passwordHash'), false);

  const id = list.data[0].id;
  const byId = await request(`/users/${id}`);
  assert.equal(byId.status, 200);
  assert.equal(byId.data.email, firstUser.email);

  const updated = await request(`/users/${id}`, 'PUT', { name: 'Tay' });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.user.name, 'Tay');
  assert.equal((await request('/users/999')).status, 404);
});

test('validates registration and user update inputs', async () => {
  assert.equal((await request('/register', 'POST', { username: 'abc', password: 'short' })).status, 400);
  assert.equal((await request('/users/nope', 'PUT', { name: 'New name' })).status, 400);
  assert.equal((await request('/users/1', 'PUT', {})).status, 400);
});
