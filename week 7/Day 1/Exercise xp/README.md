# Week 7 Day 1 — Express Router Exercises

A small Express app combines the three exercises so the homepage, to-do API, and books API can all be tested on one server. Each feature is defined in its own `express.Router()` module.

## Run

From this folder, install dependencies and start the server:

```text
npm install
npm start
```

Open `http://localhost:3000` for the homepage. The app also starts with `node app.js` (or `node "EXecises xp .js"`).

## Routes

- `GET /` — homepage
- `GET /about` — about page
- `GET /todos` and `GET /todos/:id` — list or retrieve to-dos
- `POST /todos` — create a to-do with JSON such as `{ "title": "Review Express routers" }`
- `PUT /todos/:id` — update a to-do with `{ "title": "Updated title", "completed": true }` (either field can be sent)
- `DELETE /todos/:id` — remove a to-do
- `GET /books` and `GET /books/:id` — list or retrieve books
- `POST /books` — create a book with JSON such as `{ "title": "The Hobbit", "author": "J. R. R. Tolkien", "isbn": "978-..." }`
- `PUT /books/:id` — update one or more of `title`, `author`, and `isbn`
- `DELETE /books/:id` — remove a book

The to-do and book collections are in memory and reset when the server restarts. CRUD endpoints accept and return JSON. `POST` responds with `201`, successful deletes with `204`, invalid input with `400`, and missing records with `404`.
