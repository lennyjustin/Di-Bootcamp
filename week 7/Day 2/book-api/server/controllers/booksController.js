const books = require('../models/bookModel');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('Book id must be a positive integer');
    error.status = 400;
    throw error;
  }
  return id;
}

function validateBook(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object');
    error.status = 400;
    throw error;
  }

  const book = {};
  for (const field of ['title', 'author']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        const error = new Error(`${field} must be a non-empty string`);
        error.status = 400;
        throw error;
      }
      book[field] = body[field].trim();
    } else if (!partial) {
      const error = new Error(`${field} is required`);
      error.status = 400;
      throw error;
    }
  }

  if (body.publishedYear !== undefined) {
    const year = Number(body.publishedYear);
    if (!Number.isInteger(year) || year < 0 || year > new Date().getFullYear()) {
      const error = new Error('publishedYear must be a valid year');
      error.status = 400;
      throw error;
    }
    book.publishedYear = year;
  } else if (!partial) {
    const error = new Error('publishedYear is required');
    error.status = 400;
    throw error;
  }

  if (partial && Object.keys(book).length === 0) {
    const error = new Error('Provide at least one book field to update');
    error.status = 400;
    throw error;
  }
  return book;
}

function getAll(req, res) {
  res.json(books.findAll());
}

function getOne(req, res) {
  const book = books.findById(parseId(req.params.bookId));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.status(200).json(book);
}

function create(req, res) {
  res.status(201).json(books.create(validateBook(req.body)));
}

function update(req, res) {
  const book = books.update(parseId(req.params.bookId), validateBook(req.body, { partial: true }));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
}

function remove(req, res) {
  const book = books.remove(parseId(req.params.bookId));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.status(204).send();
}

module.exports = { getAll, getOne, create, update, remove };
