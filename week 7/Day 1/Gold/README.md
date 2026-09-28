# Blog Posts API

An Express API using `express.Router()` and an in-memory array for blog posts.

## Run

From this `Gold` folder:

```text
npm install
npm start
```

The API listens at `http://localhost:3001` by default. You can also run `node "Exercise Gold.js"`. Set `PORT` to use a different port.

## Endpoints

- `GET /posts` — list all posts
- `GET /posts/:id` — get one post
- `POST /posts` — create a post with JSON `{ "title": "Hello", "content": "My first post" }`
- `PUT /posts/:id` — replace a post's title and content with the same JSON fields (the creation timestamp is preserved)
- `DELETE /posts/:id` — delete a post

Posts have an integer `id`, `title`, `content`, and ISO-8601 `timestamp`. Titles are required and limited to 120 characters; content is required. Invalid input returns `400`, missing posts return `404`, and successful deletion returns `204`. Posts reset when the server restarts.
