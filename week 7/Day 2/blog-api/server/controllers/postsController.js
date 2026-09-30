const posts = require('../models/postModel');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('Post id must be a positive integer');
    error.status = 400;
    throw error;
  }
  return id;
}

function validatePost(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object');
    error.status = 400;
    throw error;
  }

  const post = {};
  for (const field of ['title', 'content']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        const error = new Error(`${field} must be a non-empty string`);
        error.status = 400;
        throw error;
      }
      post[field] = body[field].trim();
    } else if (!partial) {
      const error = new Error(`${field} is required`);
      error.status = 400;
      throw error;
    }
  }

  if (partial && Object.keys(post).length === 0) {
    const error = new Error('Provide a title or content to update');
    error.status = 400;
    throw error;
  }

  return post;
}

const getAll = asyncHandler(async (req, res) => {
  res.json(await posts.findAll());
});

const getOne = asyncHandler(async (req, res) => {
  const post = await posts.findById(parseId(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

const create = asyncHandler(async (req, res) => {
  const post = await posts.create(validatePost(req.body));
  res.status(201).json(post);
});

const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const post = await posts.update(id, validatePost(req.body, { partial: true }));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

const remove = asyncHandler(async (req, res) => {
  const post = await posts.remove(parseId(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.status(204).send();
});

module.exports = { getAll, getOne, create, update, remove };
