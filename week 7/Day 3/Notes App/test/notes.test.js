const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const testDirectory = path.join(os.tmpdir(), `fieldnotes-${process.pid}`);
process.env.NOTES_FILE = path.join(testDirectory, 'notes.json');
const app = require('../server');
let server;
let baseUrl;

test.before(async () => {
  await fs.rm(testDirectory, { recursive: true, force: true });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await fs.rm(testDirectory, { recursive: true, force: true });
});

async function request(url, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: response.status === 204 ? null : await response.json() };
}

test('notes API creates, reads, searches, updates, and deletes notes', async () => {
  assert.deepEqual(await request('/api/notes'), { status: 200, data: [] });
  const created = await request('/api/notes', 'POST', { title: 'Weekend plans', content: 'Visit the garden', color: 'sage' });
  assert.equal(created.status, 201);
  assert.equal(created.data.pinned, false);
  const id = created.data.id;

  assert.equal((await request(`/api/notes/${id}`)).data.title, 'Weekend plans');
  assert.equal((await request('/api/notes?q=garden')).data.length, 1);
  assert.equal((await request('/api/notes?q=missing')).data.length, 0);

  const updated = await request(`/api/notes/${id}`, 'PUT', { pinned: true, title: 'A better plan' });
  assert.equal(updated.data.title, 'A better plan');
  assert.equal(updated.data.pinned, true);
  assert.equal((await request('/api/notes')).data[0].id, id);

  assert.equal((await request(`/api/notes/${id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/api/notes/${id}`)).status, 404);
  assert.deepEqual(JSON.parse(await fs.readFile(process.env.NOTES_FILE, 'utf8')), []);
});

test('notes API validates new and updated note data', async () => {
  assert.equal((await request('/api/notes', 'POST', { content: 'No title' })).status, 400);
  assert.equal((await request('/api/notes', 'POST', { title: 'Bad color', color: 'unknown' })).status, 400);
  assert.equal((await request('/api/notes/nope', 'PUT', { title: 'Edit' })).status, 400);
});
