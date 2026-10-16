# Daymark Learning Portal

Daymark is a role-based learning portal for students, teachers, and
administrators. It includes a course catalog, course enrollment, course
assignments, student submissions, teacher grading and feedback, configurable
pass marks, and retakes that preserve every attempt.

## Run locally

1. Install Node.js 20 or newer and PostgreSQL.
2. Create a database and set `DATABASE_URL` to its connection string.
3. Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`. The password must
   be at least 12 characters. Optionally set `BOOTSTRAP_ADMIN_NAME`.
4. From this directory, run `npm install`, then `npm start`.
5. Open `http://localhost:3000`. The server creates the database schema,
   subject categories, and the first administrator on startup.

The bootstrap administrator is created only if the configured email is not
already present. Changing the bootstrap environment variables later does not
reset an existing account's password.

## Deploy with Render

The repository-root `render.yaml` configures a Node web service and a persistent
Render PostgreSQL database. In Render, sync the existing Blueprint for
`lennyjustin/Di-Bootcamp` on `main`. Enter the bootstrap administrator email in
Render's secret prompt; Render generates the temporary password. Retrieve it
from the service environment in the dashboard, sign in once, and replace it
immediately. Do not commit credentials or send them in chat. The database uses
Render's paid `basic-256mb` plan. The web process uses the free plan and may
sleep when idle.

The portal service deploys at `https://daymark-learning-portal.onrender.com`.
The existing tracker URL redirects to the portal. Subsequent pushes to `main`
automatically sync and deploy the Blueprint.

## Roles and grading

- Anyone can register as a student. Public signup cannot select teacher or
  administrator roles.
- The bootstrap administrator issues teacher accounts. Their one-time
  temporary password is shown once and must be changed at first sign-in.
- Teachers create draft courses, publish them, add assignments, and grade
  enrolled students' text submissions with feedback.
- Assignments support a pass mark, up to ten attempts, and either the highest
  or latest score. Failed work can be resubmitted within the configured limit;
  each attempt remains in the database.

The first release accepts text submissions. Lessons, file uploads, automatic
quiz grading, email verification, and notifications are not part of this MVP.
