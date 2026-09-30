const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const dataFile = path.resolve(
  process.env.TASKS_FILE || path.join(__dirname, '../../data/tasks.json'),
);

let writeQueue = Promise.resolve();

async function readTasks() {
  try {
    const contents = await fs.readFile(dataFile, 'utf8');
    const tasks = JSON.parse(contents);
    if (!Array.isArray(tasks)) throw new Error('Task data must be a JSON array');
    return tasks;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, '[]\n', 'utf8');
    return [];
  }
}

async function writeTasks(tasks) {
  const temporaryFile = `${dataFile}.${randomUUID()}.tmp`;
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.writeFile(temporaryFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryFile, dataFile);
  } catch (error) {
    await fs.rm(temporaryFile, { force: true }).catch(() => {});
    throw error;
  }
}

function mutate(operation) {
  const result = writeQueue.then(operation);
  writeQueue = result.catch(() => {});
  return result;
}

function findAll() {
  return readTasks();
}

async function findById(id) {
  const tasks = await readTasks();
  return tasks.find((task) => task.id === id);
}

function create(fields) {
  return mutate(async () => {
    const tasks = await readTasks();
    const id = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
    const task = { id, ...fields };
    tasks.push(task);
    await writeTasks(tasks);
    return task;
  });
}

function update(id, changes) {
  return mutate(async () => {
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return undefined;
    tasks[index] = { ...tasks[index], ...changes, id };
    await writeTasks(tasks);
    return tasks[index];
  });
}

function remove(id) {
  return mutate(async () => {
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return undefined;
    const [deletedTask] = tasks.splice(index, 1);
    await writeTasks(tasks);
    return deletedTask;
  });
}

module.exports = { findAll, findById, create, update, remove };
