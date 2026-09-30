# Daily Challenge — User Login API with JSON storage

Express REST API with bcrypt password hashing, atomic JSON writes, and separate register/login pages.

## Run

From this folder run `npm install` and `npm start`, then open `http://localhost:3000`. The server listens on port 3000 by default (`PORT` can override it). Run `npm test` for API tests.

## API

- `POST /register` — JSON `{ "name": "Taylor", "lastName": "Morgan", "email": "taylor@example.com", "username": "taylor_m", "password": "secure-pass-123" }`
- `POST /login` — JSON `{ "username": "taylor_m", "password": "secure-pass-123" }`
- `GET /users` — list public fields for all users
- `GET /users/:id` — retrieve one public user
- `PUT /users/:id` — update name, lastName, email, username, and/or password

`users.json` stores bcrypt hashes only; plaintext passwords are never written or returned. This follows the exercise requirement that passwords must be unique by checking a submitted password against existing hashes. The user-list/update routes are intentionally unauthenticated for this demonstration assignment; don't expose them in a production application.
