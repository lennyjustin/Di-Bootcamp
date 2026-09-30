const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const projectDir = path.resolve(__dirname, '..');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-cli-'));
const dataFile = path.join(tempDir, 'notes.json');

function run(...args) {
  const result = spawnSync(process.execPath, [path.join(projectDir, 'app.js'), ...args], {
    cwd: projectDir,
    encoding: 'utf8',
    env: { ...process.env, NOTES_FILE: dataFile },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

test('CLI supports add, list, read, duplicate detection, and remove', () => {
  assert.equal(run('list'), 'No notes found');
  assert.equal(run('add', '--title=Weekend plans', '--body=Visit the garden'), 'New note created');
  assert.equal(run('add', '--title=weekend plans', '--body=Another body'), 'Note already exists');
  assert.match(run('list'), /- Weekend plans/);
  assert.equal(run('read', '--title=Weekend plans'), 'Title: Weekend plans\nBody: Visit the garden');
  assert.equal(run('read', '--title=Missing'), 'Note not found');
  assert.equal(run('remove', '--title=Weekend plans'), 'Note removed');
  assert.equal(run('remove', '--title=Weekend plans'), 'Note not found');
  assert.equal(run('list'), 'No notes found');
  assert.deepEqual(JSON.parse(fs.readFileSync(dataFile, 'utf8')), []);
});

test('unknown commands and missing arguments show helpful messages', () => {
  assert.equal(run('unknown'), 'command not recognized');
  assert.equal(run('add', '--body=Text'), 'Please provide a note title with --title.');
  assert.equal(run('add', '--title=Title'), 'Please provide a note body with --body.');
});
