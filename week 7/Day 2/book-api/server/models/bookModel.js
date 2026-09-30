let nextId = 4;
const books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', publishedYear: 1999 },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', publishedYear: 2008 },
  { id: 3, title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', publishedYear: 2018 },
];

function findAll() {
  return books;
}

function findById(id) {
  return books.find((book) => book.id === id);
}

function create(book) {
  const newBook = { id: nextId++, ...book };
  books.push(newBook);
  return newBook;
}

function update(id, changes) {
  const book = findById(id);
  if (!book) return undefined;
  Object.assign(book, changes);
  return book;
}

function remove(id) {
  const index = books.findIndex((book) => book.id === id);
  if (index === -1) return undefined;
  return books.splice(index, 1)[0];
}

module.exports = { findAll, findById, create, update, remove };
