# Mini Project — Task Management API #1

Express REST API with JSON-file storage. `tasks.json` starts as an empty array. Writes are queued and saved by atomic file replacement to avoid partial or overlapping writes.

## Run

From this folder, run `npm install`, then `npm start`. The server listens at `http://localhost:3000` by default; set `PORT` to choose a different port. Run `npm test` for the CRUD and validation tests.

## Endpoints

- `GET /tasks` — list tasks
- `GET /tasks/:id` — get one task
- `POST /tasks` — create a task with `{ "title": "Review API", "description": "Optional", "completed": false }`
- `PUT /tasks/:id` — update one or more of `title`, `description`, or `completed`
- `DELETE /tasks/:id` — delete a task

A non-empty title is required to create a task. Description and completion status default to an empty string and `false`. Invalid IDs/payloads return 400, missing tasks/routes return 404, and file/JSON storage errors return 500.
