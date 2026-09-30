const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

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

test('blog API validates ids and returns 404 for unknown routes', async () => {
  const invalidId = await fetch(`${baseUrl}/posts/not-an-id`);
  assert.equal(invalidId.status, 400);
  assert.equal((await invalidId.json()).error, 'Post id must be a positive integer');

  const missingRoute = await fetch(`${baseUrl}/not-a-route`);
  assert.equal(missingRoute.status, 404);
  assert.equal((await missingRoute.json()).error, 'Route not found');
});

test('blog API validates create payloads before database access', async () => {
  const response = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Missing content' }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'content is required');
});
