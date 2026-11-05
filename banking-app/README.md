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

The frontend uses role-specific authenticated APIs. A super administrator outranks the standard administrator and can manage staff, role assignments, and individual API permissions. Bootstrap the super-admin account separately with private `SUPER_ADMIN_*` environment values. Run `npm run db:super-admin` from the workspace root or `backend/`; ordinary administrators cannot grant super-admin access. Other staff roles include cashier/teller, credit officer, accountant, board/committee, internal auditor, and IT support; permissions are enforced server-side. Board accounts see aggregate-only portfolio summaries, and auditors get read-only operational and audit history. Staff receive one-time passwords that must be changed at first sign-in. Sensitive operations are recorded in an audit trail without request bodies. Loan approval/disbursement, dividend payouts, accounting statements, arrears rules, and other unsupported financial policies remain restricted or unavailable until approved rules and supporting data are configured.

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
