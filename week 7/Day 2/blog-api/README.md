# Blog API

PostgreSQL-backed REST API built with Express and Knex. CRUD routes are mounted at `/posts`.

## Setup

1. Create a PostgreSQL database named `blog_api` (or update `DATABASE_URL`).
2. Copy `.env.example` to `.env` and set your local PostgreSQL credentials.
3. From this directory run `npm install`, then `npm run migrate:latest`, then `npm start`.

The API listens on `http://localhost:3000` by default. Send JSON requests with `Content-Type: application/json`.

## Routes

- `GET /posts` — list all posts
- `GET /posts/:id` — get one post
- `POST /posts` — create with `{ "title": "...", "content": "..." }`
- `PUT /posts/:id` — update either or both fields
- `DELETE /posts/:id` — delete a post

Invalid input returns 400, missing posts/routes return 404, and unexpected server/database errors return 500.
