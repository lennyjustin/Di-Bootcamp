const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const testDirectory = path.join(os.tmpdir(), `task-api-one-${process.pid}`);
process.env.TASKS_FILE = path.join(testDirectory, 'tasks.json');
const app = require('../src/app');
let server;
let baseUrl;

test.before(async () => {
  await fs.rm(testDirectory, { recursive: true, force: true });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/tasks`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await fs.rm(testDirectory, { recursive: true, force: true });
});

async function request(url = '', method = 'GET', body) {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: response.status === 204 ? null : await response.json() };
}

test('tasks API creates, lists, reads, updates, and deletes JSON tasks', async () => {
  assert.deepEqual((await request()).data, []);
  const created = await request('', 'POST', { title: 'Prepare demo', description: 'Check CRUD endpoints' });
  assert.equal(created.status, 201);
  assert.equal(created.data.id, 1);
  assert.equal(created.data.completed, false);

  assert.equal((await request()).data.length, 1);
  assert.equal((await request('/1')).data.title, 'Prepare demo');
  const updated = await request('/1', 'PUT', { completed: true });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.completed, true);
  assert.equal((await request('/1', 'DELETE')).status, 204);
  assert.equal((await request('/1')).status, 404);
  assert.deepEqual(JSON.parse(await fs.readFile(process.env.TASKS_FILE, 'utf8')), []);
});

test('tasks API validates bodies and IDs and handles unknown routes', async () => {
  assert.equal((await request('', 'POST', { description: 'Title missing' })).status, 400);
  assert.equal((await request('', 'POST', { title: '   ' })).status, 400);
  assert.equal((await request('/bad-id')).status, 400);
  assert.equal((await request('/999', 'DELETE')).status, 404);
  const unknown = await fetch(`${baseUrl.replace('/tasks', '')}/unknown`);
  assert.equal(unknown.status, 404);
});
