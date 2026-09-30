const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const tempDirectory = path.join(os.tmpdir(), `daily-user-api-${process.pid}`);
process.env.USERS_FILE = path.join(tempDirectory, 'users.json');
process.env.BCRYPT_ROUNDS = '4';
const app = require('../server');
let server;
let baseUrl;

test.before(async () => {
  await fs.rm(tempDirectory, { recursive: true, force: true });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await fs.rm(tempDirectory, { recursive: true, force: true });
});

async function request(url, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
}

const taylor = { name: 'Taylor', lastName: 'Morgan', email: 'taylor@example.com', username: 'taylor_m', password: 'secure-pass-123' };

test('registration stores a bcrypt hash and rejects duplicate username/password without writing', async () => {
  const result = await request('/register', 'POST', taylor);
  assert.equal(result.status, 201);
  assert.match(result.data.message, /account is now created/);
  let stored = JSON.parse(await fs.readFile(process.env.USERS_FILE, 'utf8'));
  assert.equal(stored.length, 1);
  assert.notEqual(stored[0].passwordHash, taylor.password);
  assert.equal(Object.hasOwn(result.data.user, 'passwordHash'), false);

  assert.equal((await request('/register', 'POST', { ...taylor, email: 'other@example.com' })).status, 409);
  assert.equal((await request('/register', 'POST', { ...taylor, username: 'another', email: 'another@example.com' })).status, 409);
  stored = JSON.parse(await fs.readFile(process.env.USERS_FILE, 'utf8'));
  assert.equal(stored.length, 1);
});

test('login accepts valid password and shows the unauthenticated error for an invalid login', async () => {
  const valid = await request('/login', 'POST', { username: taylor.username, password: taylor.password });
  assert.equal(valid.status, 200);
  assert.match(valid.data.message, /Hi taylor_m welcome back again/);
  const invalid = await request('/login', 'POST', { username: 'not_registered', password: taylor.password });
  assert.equal(invalid.status, 401);
  assert.match(invalid.data.error, /not registered/);
});

test('users routes list, retrieve, and update profiles without exposing password hashes', async () => {
  const list = await request('/users');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 1);
  assert.equal(Object.hasOwn(list.data[0], 'passwordHash'), false);
  const id = list.data[0].id;
  assert.equal((await request(`/users/${id}`)).data.email, taylor.email);
  const changed = await request(`/users/${id}`, 'PUT', { name: 'Tay' });
  assert.equal(changed.data.user.name, 'Tay');
  assert.equal((await request('/users/99')).status, 404);
});

test('registration validates fields and unknown routes return 404', async () => {
  assert.equal((await request('/register', 'POST', { username: 'abc', password: 'short' })).status, 400);
  assert.equal((await fetch(`${baseUrl}/unknown`)).status, 404);
});
