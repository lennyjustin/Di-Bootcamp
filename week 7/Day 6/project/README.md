# Collaborative Storytelling App

This monorepo contains a small full-stack storytelling app built with Express and React.

## Prerequisites

- Node.js 18+
- npm

## Local development

```bash
npm install
npm run dev
```

- Backend runs on http://localhost:8010
- Frontend runs on the next available Vite port (commonly 5173/5174)

## Environment variables

Copy the example file for the backend and update the secrets:

```bash
cp backend/.env.example backend/.env
```

## Scripts

- `npm run dev` – starts backend and frontend together
- `npm run build` – builds frontend and backend syntax checks
- `npm run start` – starts the backend server

## Features implemented

- Register/login with JWT authentication
- Story CRUD routes
- Contributor management
- Redux-powered React frontend
- Responsive styling

## Notes

The backend uses in-memory storage by default so it can run without a PostgreSQL installation. If you provide `DATABASE_URL`, this project is structured for a PostgreSQL-backed deployment flow.
