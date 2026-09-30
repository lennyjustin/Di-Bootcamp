const db = require('../config/database');

const TABLE = 'posts';

function findAll() {
  return db(TABLE).select('*').orderBy('id', 'asc');
}

function findById(id) {
  return db(TABLE).where({ id }).first();
}

async function create(post) {
  const [createdPost] = await db(TABLE).insert(post).returning('*');
  return createdPost;
}

async function update(id, post) {
  const [updatedPost] = await db(TABLE)
    .where({ id })
    .update({ ...post, updated_at: db.fn.now() })
    .returning('*');
  return updatedPost;
}

async function remove(id) {
  const [deletedPost] = await db(TABLE).where({ id }).del().returning('*');
  return deletedPost;
}

module.exports = { findAll, findById, create, update, remove };
