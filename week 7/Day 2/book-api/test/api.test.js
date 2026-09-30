const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/books`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path = '', method = 'GET', body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return {
    status: response.status,
    body: response.status === 204 ? null : await response.json(),
  };
}

test('books API supports CRUD and reports missing books', async () => {
  const list = await request();
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.body));

  const created = await request('', 'POST', {
    title: 'Smoke test book',
    author: 'Test author',
    publishedYear: 2025,
  });
  assert.equal(created.status, 201);
  const { id } = created.body;

  const fetched = await request(`/${id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.title, 'Smoke test book');

  const updated = await request(`/${id}`, 'PUT', { title: 'Updated book' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.title, 'Updated book');

  assert.equal((await request(`/${id}`, 'DELETE')).status, 204);
  const missing = await request(`/${id}`);
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, 'Book not found');
});

test('books API validates create requests', async () => {
  const response = await request('', 'POST', { title: 'Missing author' });
  assert.equal(response.status, 400);
});
