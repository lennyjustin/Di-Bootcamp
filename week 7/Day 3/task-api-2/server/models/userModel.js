const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');

const usersFile = path.resolve(process.env.USERS_FILE || path.join(__dirname, '../../users.json'));
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 10);
const publicFields = ['id', 'name', 'lastName', 'email', 'username'];
let writeQueue = Promise.resolve();

async function readUsers() {
  try {
    const content = await fs.readFile(usersFile, 'utf8');
    const users = JSON.parse(content);
    if (!Array.isArray(users)) throw new Error('User data must be a JSON array.');
    return users;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(path.dirname(usersFile), { recursive: true });
    await fs.writeFile(usersFile, '[]\n', 'utf8');
    return [];
  }
}

async function writeUsers(users) {
  const temporaryFile = `${usersFile}.${randomUUID()}.tmp`;
  await fs.mkdir(path.dirname(usersFile), { recursive: true });
  try {
    await fs.writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryFile, usersFile);
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

function toPublicUser(user) {
  return Object.fromEntries(publicFields.map((field) => [field, user[field]]));
}

async function hasDuplicatePassword(users, password, exceptId) {
  for (const user of users) {
    if (user.id !== exceptId && await bcrypt.compare(password, user.passwordHash)) return true;
  }
  return false;
}

function findByUsername(username) {
  return readUsers().then((users) => users.find((user) => user.username.toLowerCase() === username.toLowerCase()));
}

function createUser(details, password) {
  return mutate(async () => {
    const users = await readUsers();
    if (users.some((user) => user.username.toLowerCase() === details.username.toLowerCase())) {
      const error = new Error('Username or password already exists.');
      error.status = 409;
      throw error;
    }
    if (await hasDuplicatePassword(users, password)) {
      const error = new Error('Username or password already exists.');
      error.status = 409;
      throw error;
    }

    const user = {
      id: users.reduce((max, current) => Math.max(max, current.id), 0) + 1,
      ...details,
      passwordHash: await bcrypt.hash(password, bcryptRounds),
    };
    users.push(user);
    await writeUsers(users);
    return toPublicUser(user);
  });
}

function findAll() {
  return readUsers().then((users) => users.map(toPublicUser));
}

function findById(id) {
  return readUsers().then((users) => {
    const user = users.find((entry) => entry.id === id);
    return user ? toPublicUser(user) : undefined;
  });
}

function updateUser(id, changes) {
  return mutate(async () => {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index < 0) return undefined;

    if (changes.username && users.some((user) => user.id !== id && user.username.toLowerCase() === changes.username.toLowerCase())) {
      const error = new Error('Username or password already exists.');
      error.status = 409;
      throw error;
    }
    if (changes.password && await hasDuplicatePassword(users, changes.password, id)) {
      const error = new Error('Username or password already exists.');
      error.status = 409;
      throw error;
    }

    const updated = { ...users[index], ...changes };
    if (changes.password) {
      updated.passwordHash = await bcrypt.hash(changes.password, bcryptRounds);
      delete updated.password;
    }
    users[index] = updated;
    await writeUsers(users);
    return toPublicUser(updated);
  });
}

module.exports = { readUsers, findByUsername, createUser, findAll, findById, updateUser, toPublicUser };
