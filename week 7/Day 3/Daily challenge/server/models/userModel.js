const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');

const usersFile = path.resolve(process.env.USERS_FILE || path.join(__dirname, '../../users.json'));
const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
const publicFields = ['id', 'name', 'lastName', 'email', 'username'];
let writeQueue = Promise.resolve();

async function readUsers() {
  try {
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    if (!Array.isArray(users)) throw new Error('Users file must contain a JSON array.');
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

function publicUser(user) {
  return Object.fromEntries(publicFields.map((field) => [field, user[field]]));
}

async function passwordAlreadyUsed(users, password, exceptId) {
  for (const user of users) {
    if (user.id !== exceptId && await bcrypt.compare(password, user.passwordHash)) return true;
  }
  return false;
}

async function findByUsername(username) {
  const users = await readUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
}

function create(details, password) {
  return mutate(async () => {
    const users = await readUsers();
    const duplicateUsername = users.some((user) => user.username.toLowerCase() === details.username.toLowerCase());
    if (duplicateUsername || await passwordAlreadyUsed(users, password)) {
      const error = new Error(duplicateUsername ? 'Username already exists' : 'Password already exists');
      error.status = 409;
      throw error;
    }
    const user = {
      id: users.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      ...details,
      passwordHash: await bcrypt.hash(password, rounds),
    };
    users.push(user);
    await writeUsers(users);
    return publicUser(user);
  });
}

async function list() {
  return (await readUsers()).map(publicUser);
}

async function getById(id) {
  const user = (await readUsers()).find((item) => item.id === id);
  return user ? publicUser(user) : undefined;
}

function update(id, changes) {
  return mutate(async () => {
    const users = await readUsers();
    const index = users.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    if (changes.username && users.some((item) => item.id !== id && item.username.toLowerCase() === changes.username.toLowerCase())) {
      const error = new Error('Username already exists');
      error.status = 409;
      throw error;
    }
    if (changes.password && await passwordAlreadyUsed(users, changes.password, id)) {
      const error = new Error('Password already exists');
      error.status = 409;
      throw error;
    }
    const updated = { ...users[index], ...changes };
    if (changes.password) {
      updated.passwordHash = await bcrypt.hash(changes.password, rounds);
      delete updated.password;
    }
    users[index] = updated;
    await writeUsers(users);
    return publicUser(updated);
  });
}

module.exports = { readUsers, findByUsername, create, list, getById, update, publicUser };
