# Micro-SACCO Banking System

A micro-SACCO banking application with an administrator dashboard and member portal. Local development uses SQLite; PostgreSQL can be configured for shared deployments.

## Structure

- `backend/` - Express + Prisma API (SQLite locally; PostgreSQL for shared deployments)
- `frontend/` - React + Vite + Tailwind admin dashboard and member portal

## Local setup

See [backend/README.md](./backend/README.md) for database initialization, administrator setup, member portal provisioning, API endpoints, and security details. In brief:

1. Copy `backend/.env.example` to `backend/.env`.
2. Configure a unique administrator password and a random JWT secret locally.
3. Configure `backend/.env` with the local SQLite database URL and private application secrets. From `backend/`, run `npm install`, `npm run db:generate`, `npm run db:push`, and `npm run db:seed`.
4. Start the backend with `npm run dev`.
5. From `frontend/`, run `npm install` and `npm run dev`.

The configured database is the application's data store. SQLite is the local default; PostgreSQL is supported for shared deployments. Keep connection credentials private and back up existing data before schema changes.

The frontend uses role-specific authenticated APIs. A super administrator outranks the standard administrator and can manage staff, role assignments, and individual API permissions. Bootstrap the super-admin account separately with private `SUPER_ADMIN_*` environment values. Run `npm run db:super-admin` from the workspace root or `backend/`; ordinary administrators cannot grant super-admin access. Other staff roles include cashier/teller, credit officer, accountant, board/committee, internal auditor, and IT support; permissions are enforced server-side. Board accounts see aggregate-only portfolio summaries; the private system activity report is available only to the super administrator, while auditors have read-only operational access. Staff receive one-time passwords that must be changed at first sign-in. API activity is recorded without request bodies or financial data. Loan approval/disbursement, dividend payouts, accounting statements, arrears rules, and other unsupported financial policies remain restricted or unavailable until approved rules and supporting data are configured.

Prospective members can submit an application with eligibility details and supporting documents; an administrator must review and approve it before membership, savings, or portal access is activated. Fee and contribution amounts are awaiting SACCO confirmation, and the application flow does not collect money. The ledger view is read-only, while authorized cashiers may post savings deposits and withdrawals. M-Pesa payment initiation is disabled until a verified Daraja callback flow is configured.

## Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- SQLite (local default) / PostgreSQL
- Prisma
- JWT-backed, HttpOnly role-scoped sessions
- Safaricom Daraja integration (not enabled for live payments)

## Render deployment

Deploy the `banking-app` directory from the GitHub repository as a single Node.js web service, setting the service's **Root Directory** to `banking-app`. This keeps the frontend and API on the same origin and supports the application's secure session cookies.

- **Build command:** `npm ci --prefix backend && npm run db:generate --prefix backend && npm ci --prefix frontend && npm run build --prefix frontend`
- **Start command:** `npm run db:push --prefix backend && npm run db:super-admin --prefix backend && npm start --prefix backend`
- **Health check path:** `/api/health`
- **Persistent disk:** mount at `/var/data` (at least 1 GB).
- **Environment:** `NODE_ENV=production`, `DATABASE_URL=file:/var/data/dev.db`, `SACCO_PRIVATE_STORAGE_DIR=/var/data/private`, `JWT_SECRET` (at least 32 random bytes), and `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` (16–72 UTF-8 bytes).

The start command initializes the empty database schema and creates the first super-administrator using the configured secrets. Subsequent starts leave an existing super-administrator and password unchanged. The SQLite database and private application documents are stored on the persistent disk; keep a separate backup because a persistent disk is not a backup. Do not copy the local development database or uploaded documents to production. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` if password-reset email is required.
