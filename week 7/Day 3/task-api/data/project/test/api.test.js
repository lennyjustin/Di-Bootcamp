const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const testDirectory = path.join(os.tmpdir(), `task-api-test-${process.pid}`);
process.env.TASKS_FILE = path.join(testDirectory, 'tasks.json');
const app = require('../app');

let server;
let baseUrl;

test.before(async () => {
  await fs.rm(testDirectory, { recursive: true, force: true });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/tasks`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await fs.rm(testDirectory, { recursive: true, force: true });
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

test('tasks API supports JSON-backed CRUD', async () => {
  assert.deepEqual(await fs.readFile(process.env.TASKS_FILE, 'utf8').catch(() => '[]\n'), '[]\n');

  const list = await request();
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, []);

  const created = await request('', 'POST', { title: 'Write tests', description: 'Cover CRUD' });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, {
    id: 1,
    title: 'Write tests',
    description: 'Cover CRUD',
    completed: false,
  });

  const fetched = await request('/1');
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.title, 'Write tests');

  const updated = await request('/1', 'PUT', { completed: true });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.completed, true);

  assert.equal((await request('/1', 'DELETE')).status, 204);
  const missing = await request('/1');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, 'Task not found');
});

test('tasks API validates request bodies and ids', async () => {
  assert.equal((await request('', 'POST', { description: 'No title' })).status, 400);
  assert.equal((await request('/invalid')).status, 400);
  assert.equal((await request('/999', 'PUT', { title: 'missing' })).status, 404);
});
