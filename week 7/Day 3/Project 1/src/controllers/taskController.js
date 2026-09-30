const tasks = require('../store/taskStore');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    const error = new Error('Task id must be a positive integer.');
    error.status = 400;
    throw error;
  }
  return id;
}

function validateTask(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }

  const result = {};
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      const error = new Error('title must be a non-empty string.');
      error.status = 400;
      throw error;
    }
    if (body.title.length > 200) {
      const error = new Error('title must be 200 characters or fewer.');
      error.status = 400;
      throw error;
    }
    result.title = body.title.trim();
  } else if (!partial) {
    const error = new Error('title is required.');
    error.status = 400;
    throw error;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length > 5000) {
      const error = new Error('description must be a string of 5000 characters or fewer.');
      error.status = 400;
      throw error;
    }
    result.description = body.description.trim();
  } else if (!partial) {
    result.description = '';
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      const error = new Error('completed must be a boolean.');
      error.status = 400;
      throw error;
    }
    result.completed = body.completed;
  } else if (!partial) {
    result.completed = false;
  }

  if (partial && Object.keys(result).length === 0) {
    const error = new Error('Provide at least one task field to update.');
    error.status = 400;
    throw error;
  }
  return result;
}

const getAll = asyncHandler(async (req, res) => {
  res.json(await tasks.getAll());
});

const getOne = asyncHandler(async (req, res) => {
  const task = await tasks.getById(parseId(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

const create = asyncHandler(async (req, res) => {
  const task = await tasks.create(validateTask(req.body));
  res.status(201).json(task);
});

const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const task = await tasks.update(id, validateTask(req.body, true));
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

const remove = asyncHandler(async (req, res) => {
  const task = await tasks.remove(parseId(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.status(204).send();
});

module.exports = { getAll, getOne, create, update, remove };
