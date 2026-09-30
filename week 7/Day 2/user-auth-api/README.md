# User Management API

Express API with Knex/PostgreSQL persistence and bcrypt password hashing. Password hashes are stored only in `hashpwd`; user endpoints return only safe profile fields. Registration and profile/password updates use Knex transactions.

## Setup

1. Create a PostgreSQL database named `user_auth_api`, or change `DATABASE_URL` in `.env`.
2. From this directory run `npm install`, then `npm run migrate:latest`, then `npm start`.
3. The API listens on `http://localhost:3000` by default.

## Routes

- `POST /register` — JSON `{ "username": "sam", "password": "long-password", "email": "sam@example.com", "first_name": "Sam", "last_name": "Lee" }`. Username and password are required; email is optional; first/last name default to empty strings.
- `POST /login` — JSON `{ "username": "sam", "password": "long-password" }`. Returns 401 for invalid credentials.
- `GET /users` — list public user profiles
- `GET /users/:id` — get one profile
- `PUT /users/:id` — update any of `email`, `username`, `first_name`, `last_name`, or `password`. Password changes are re-hashed.

The schema migration creates `users` and `hashpwd`. The latter references the unique username in `users`; username changes cascade to the hash table. Never commit `.env` or share database credentials.
