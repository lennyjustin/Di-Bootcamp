# TokenLab JWT Authentication Exercise

A small Express learning app that demonstrates account creation, password hashing, JWT cookies, an authenticated profile, refresh-token rotation, and sign-out revocation. The interface uses blue for the primary authentication flow and red for warnings and destructive actions.

## Run locally

Requirements: Node.js 18 or later.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and replace both token secrets with different random values of at least 32 characters.
3. Start the server:

   ```sh
   npm start
   ```

4. Open <http://localhost:3000>.

For development, `npm run dev` restarts the server when files change.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Validate a username and password, hash the password, and create an account |
| `POST` | `/api/auth/login` | Verify credentials and issue access and refresh cookies |
| `GET` | `/api/auth/me` | Return the current user when the access token is valid |
| `PATCH` | `/api/profile` | Update the authenticated user's username |
| `POST` | `/api/auth/refresh` | Rotate a valid refresh token and issue a new access token |
| `POST` | `/api/auth/logout` | Revoke the refresh session and clear authentication cookies |

Access tokens last 15 minutes. Refresh tokens last 7 days, are stored in `httpOnly`, `sameSite` cookies, and are rotated on refresh. Login, registration, and refresh requests are rate-limited. Passwords must be at least 10 characters and no more than 72 UTF-8 bytes (the bcrypt input limit). In production, cookies are also marked `secure`.

## Learning-demo limitations

User accounts and refresh-session revocations live in memory, so they are removed when the process restarts. This is not production storage. A production application should use a persistent database, HTTPS, operational secret management, and a carefully reviewed CSRF/session strategy. Do not reuse the example secrets.
