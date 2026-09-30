# Daily Challenge — User Registration API

Express API with bcrypt password hashing, JSON file storage, and separate login/register HTML pages.

## Run

From this folder, run `npm install` and `npm start`, then open `http://localhost:3003`. Set `PORT` to change the port. You can also launch the selected assignment file with `node "Daily Challenge.js"`. Run `npm test` for API integration tests.

## Routes

- `POST /register` — `{ "name": "John", "lastName": "Doe", "email": "john@example.com", "username": "johnny", "password": "secure-pass-123" }`
- `POST /login` — `{ "username": "johnny", "password": "secure-pass-123" }`
- `GET /users` — list public user records
- `GET /users/:id` — fetch a user
- `PUT /users/:id` — update a user’s profile fields and/or password

User hashes are stored only in `users.json` and never included in responses. Username and password duplicates are checked before writing. The users routes are unauthenticated for this classroom exercise only.
