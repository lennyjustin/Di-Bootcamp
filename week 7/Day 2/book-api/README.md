# Book API

Basic Express CRUD API backed by an in-memory array (data resets whenever the server restarts).

Run `npm install` and `npm start` from this directory. The server listens on `http://localhost:5000` by default; set `PORT` to override it.

## Routes

- `GET /api/books` — list books
- `GET /api/books/:bookId` — get one book (404: `Book not found`)
- `POST /api/books` — create with `{ "title": "...", "author": "...", "publishedYear": 2024 }`
- `PUT /api/books/:bookId` — update one or more fields
- `DELETE /api/books/:bookId` — delete a book
