const notes = require('../store/notesStore');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function parseId(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 40) {
    const error = new Error('Note id is invalid.');
    error.status = 400;
    throw error;
  }
  return value;
}

function validateNote(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }
  const result = {};
  for (const field of ['title', 'content']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        const error = new Error(`${field} must be a non-empty string.`);
        error.status = 400;
        throw error;
      }
      if (body[field].length > (field === 'title' ? 120 : 20000)) {
        const error = new Error(`${field} is too long.`);
        error.status = 400;
        throw error;
      }
      result[field] = body[field].trim();
    } else if (!partial && field === 'title') {
      const error = new Error('title is required.');
      error.status = 400;
      throw error;
    } else if (!partial && field === 'content') {
      result.content = '';
    }
  }
  if (body.color !== undefined) {
    if (!['sage', 'peach', 'lavender', 'sky', 'butter'].includes(body.color)) {
      const error = new Error('color is invalid.');
      error.status = 400;
      throw error;
    }
    result.color = body.color;
  }
  if (body.pinned !== undefined) {
    if (typeof body.pinned !== 'boolean') {
      const error = new Error('pinned must be a boolean.');
      error.status = 400;
      throw error;
    }
    result.pinned = body.pinned;
  }
  if (partial && Object.keys(result).length === 0) {
    const error = new Error('Provide at least one field to update.');
    error.status = 400;
    throw error;
  }
  return result;
}

const getAll = asyncHandler(async (req, res) => res.json(await notes.findAll(req.query.q || '')));
const getOne = asyncHandler(async (req, res) => {
  const note = await notes.findById(parseId(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.json(note);
});
const create = asyncHandler(async (req, res) => {
  const note = await notes.create(validateNote(req.body));
  res.status(201).json(note);
});
const update = asyncHandler(async (req, res) => {
  const note = await notes.update(parseId(req.params.id), validateNote(req.body, { partial: true }));
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.json(note);
});
const remove = asyncHandler(async (req, res) => {
  const note = await notes.remove(parseId(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.status(204).send();
});

module.exports = { getAll, getOne, create, update, remove };
