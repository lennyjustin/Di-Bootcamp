const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const app = require('../app');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('registration rejects a missing password before database access', async () => {
  const response = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'sam' }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'password must be between 8 and 72 characters');
});

test('bcrypt hashes and verifies a password', async () => {
  const hash = await bcrypt.hash('long-password', 4);
  assert.notEqual(hash, 'long-password');
  assert.equal(await bcrypt.compare('long-password', hash), true);
  assert.equal(await bcrypt.compare('incorrect-password', hash), false);
});

test('login rejects malformed credentials before database access', async () => {
  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'sam', password: 'short' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /password must be between/);
});

test('user routes validate ids and unknown paths', async () => {
  const invalidId = await fetch(`${baseUrl}/users/nope`);
  assert.equal(invalidId.status, 400);
  assert.equal((await invalidId.json()).error, 'User id must be a positive integer');

  const missingRoute = await fetch(`${baseUrl}/missing`);
  assert.equal(missingRoute.status, 404);
});
