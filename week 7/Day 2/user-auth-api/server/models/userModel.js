const database = require('../config/database');

const publicColumns = ['id', 'email', 'username', 'first_name', 'last_name', 'created_at', 'updated_at'];

function findAll() {
  return database('users').select(publicColumns).orderBy('id', 'asc');
}

function findById(id) {
  return database('users').select(publicColumns).where({ id }).first();
}

function findCredentialsByUsername(username) {
  return database('users')
    .join('hashpwd', 'users.username', 'hashpwd.username')
    .select('users.id', 'users.username', 'hashpwd.password')
    .where('users.username', username)
    .first();
}

async function createWithPassword(user, passwordHash) {
  return database.transaction(async (transaction) => {
    const [createdUser] = await transaction('users').insert(user).returning(publicColumns);
    await transaction('hashpwd').insert({ username: createdUser.username, password: passwordHash });
    return createdUser;
  });
}

async function updateWithPassword(id, changes, passwordHash) {
  return database.transaction(async (transaction) => {
    const currentUser = await transaction('users').where({ id }).first();
    if (!currentUser) return undefined;

    const newUsername = changes.username || currentUser.username;
    const [updatedUser] = await transaction('users')
      .where({ id })
      .update({ ...changes, updated_at: transaction.fn.now() })
      .returning(publicColumns);

    if (passwordHash) {
      await transaction('hashpwd')
        .where({ username: newUsername })
        .update({ password: passwordHash, updated_at: transaction.fn.now() });
    }

    return updatedUser;
  });
}

module.exports = { findAll, findById, findCredentialsByUsername, createWithPassword, updateWithPassword };
