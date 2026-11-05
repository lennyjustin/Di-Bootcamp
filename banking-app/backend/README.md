# Backend and local database

The API uses Express and Prisma with a local SQLite database configured in `DATABASE_URL` by default for development. For production or shared deployments, you can point `DATABASE_URL` at PostgreSQL. The app stores members, member portal accounts, savings, loans, guarantorship requests, repayments, shares, transactions, M-Pesa transaction records, and staff audit events. Monetary values are stored as integer Kenyan shillings.

## First-time setup

1. Install Node.js 18 or later.
2. From `backend/`, install packages and create a private environment file:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

3. Configure the local app settings in `.env` before starting the API:
   - Set `JWT_SECRET` to at least 32 bytes of unpredictable random data. Generate one with:
     `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`
   - Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` with at least 12 characters.
   - Set a separate `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, and unique `SUPER_ADMIN_PASSWORD` of at least 16 characters for the highest-trust account. Keep both administrator credentials private and different.
   - Set `DATABASE_URL` to a local SQLite value such as `file:./dev.db` for development. For PostgreSQL deployments, use a Postgres connection string instead. Keep credentials URL-encoded where required and do not share them in source control or chat.
   - `DEFAULT_LOAN_INTEREST_RATE` controls the illustrative annual flat rate used when a member submits a loan application (defaults to `12`).
   - Set `FRONTEND_ORIGIN` to the exact dashboard origin.
   - To enable Daraja STK Push, configure `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `DARAJA_ENV=sandbox`, `DARAJA_SHORTCODE`, `DARAJA_PASSKEY`, and a publicly reachable HTTPS `DARAJA_CALLBACK_URL` ending in `/api/mpesa/stk/callback`. Use `DARAJA_TRANSACTION_TYPE=CustomerPayBillOnline` for a Paybill or `CustomerBuyGoodsOnline` for a Till. Do not copy placeholder credentials into `.env`.
   - To enable the member AI assistant, configure `AZURE_OPENAI_ENDPOINT` (your Azure OpenAI resource HTTPS endpoint), `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_KEY`, and optionally `AZURE_OPENAI_API_VERSION` (defaults to `2024-10-21`). Keep the API key only in the private `.env`; do not commit or share it. The assistant is available only to authenticated members after their first password change and is limited to 10 requests per 15 minutes.
   - To enable password reset emails, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. `FRONTEND_ORIGIN` must include the frontend origin where reset links should open. Reset tokens are stored as SHA-256 hashes, expire after 30 minutes, and are single-use. Keep SMTP credentials private in `.env`.
   - Keep `.env` private; it is ignored by Git.
4. Generate the Prisma client and synchronize the configured database schema. The local schema is `prisma/schema.prisma` and defaults to SQLite for rapid development:

   ```powershell
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run db:super-admin
   ```

For an existing installation, inspect the target database before synchronizing schema changes. `npm run db:push` can modify the configured database, so review any Prisma warnings and back up existing data first. If Prisma reports existing NULL values in the required `users.password_hash` column, do not use `--force-reset`; review and repair the affected account deliberately before retrying. Set the three `SUPER_ADMIN_*` values in your private `backend/.env`, then run `npm run db:super-admin` once from `backend/` or from the workspace root. The root command forwards to the backend script. The seed does not print or email the password.

5. Start the API with `npm run dev`. Start the frontend from `frontend/` with `npm run dev`.

The administrator seed creates one standard administrator. The separate `npm run db:super-admin` command creates the highest-trust account from the `SUPER_ADMIN_*` settings. It refuses to overwrite accounts, requires a different email and password from the standard administrator, and is safe to rerun for an existing super-admin. Passwords are bcrypt-hashed and never printed. Restrict access to `.env` and clear these bootstrap values from the environment after setup if practical.

For local demonstrations only, `npm run db:seed:demo` creates six role-specific staff accounts and seven member portal accounts with zero starting balances. It prints each generated password once; each account must change its password at first sign-in. Keep these demo records out of production. Rerunning the command recognizes a complete demo set without changing or printing passwords; it stops without changes if it finds a partial or conflicting set.

Public membership applications are available at `POST /api/membership-applications`. Applicants must be Kenyan citizens aged 18 or older and provide registration, identification, KRA PIN, next-of-kin, income, membership-category, and application details with three required documents. Applications are rate-limited to five per hour per client IP. Uploaded PDFs/JPEGs/PNGs are limited to 5 MB each, checked by file signature, and stored outside the static web root in `backend/private/member-applications/`; that directory is excluded from Git. Administrators review applications in the dashboard and may approve or reject them. Only approval creates an active member, savings account, and usable portal login. Protect the host filesystem and define retention/encryption policies before production use. Entrance fee, share capital, and monthly contribution amounts are intentionally marked “to be confirmed”; the form does not collect a payment.

## Staff roles and audit history

The super administrator is the highest-trust account and retains full access. It can create or reassign staff (including administrator and super-administrator accounts), disable accounts, and set individual API permission overrides. The last active super administrator cannot be disabled or demoted, and an administrator cannot manage super-administrator accounts or grant administrator-level roles. Standard administrators retain their normal operational access and can manage non-administrator staff.

Permission overrides let the super administrator limit an individual account below its role defaults. Unchecked permissions are denied server-side; restoring role defaults removes the override. Changes to role, permissions, or account status revoke existing sessions so users must sign in again.

The cashier can view members, savings accounts, the ledger, and mobile payments, and can record savings deposits and withdrawals. Credit officers can view member/loan details, submit loan applications, and review guarantor-consented guarantee requests, but cannot approve or disburse loans. Accountants have read-only operational reports. Board/committee users receive only aggregate member, savings, share, and loan-status summaries. Auditors have read-only operational record access; the private system activity report is restricted to the super administrator and cannot be granted through role permission overrides. IT support can view staff accounts and the role matrix but cannot access member or financial records or secrets. These are conservative initial scopes; changes to financial permissions require explicit SACCO policy approval.

Every API request that reaches the application audit middleware is recorded, including reads, changes, sign-in attempts, and public requests. The super-admin-only `GET /api/audit?page=&limit=` endpoint returns up to 100 records per page. Events contain the actor (or anonymous status), role, HTTP method, path, response status, and timestamp; request bodies, credentials, query strings, and financial values are not copied into the log. This is an operational activity report, not an immutable or tamper-evident audit system. Retention and export rules have not been configured.

## API

The dashboard and member portal use the session cookie set by `POST /api/auth/login`, which accepts `email`, `password`, and `accountType` (`member`, `staff`, `admin`, or `super_admin`). The backend verifies the selected account type against the stored role; selecting a higher role does not grant extra permissions. `GET /api/auth/me` returns the signed-in account role and full name; `POST /api/auth/logout` clears its session. Staff APIs enforce the role-specific permissions documented below; administrator provisioning remains separate from member portal accounts.

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | API and database readiness |
| `GET /api/staff/roles` | List configured staff roles and permissions (administrator or IT support) |
| `GET /api/staff/users` | List staff accounts without password data (administrator or IT support) |
| `POST /api/staff` | Create a staff account with a one-time temporary password (administrator; elevated roles require super administrator) |
| `PATCH /api/staff/:userId` | Change staff role, override individual permissions, or enable/disable account (super administrator; limited staff management for administrators) |
| `GET /api/audit?page=&limit=` | Read the paginated private system activity report (super administrator only) |
| `GET /api/dashboard/summary` | Read aggregate-only portfolio summary (administrator, accountant, auditor, or board) |
| `GET /api/auth/session` | Check the current browser session; returns `user: null` when signed out |
| `POST /api/membership-applications` | Submit a member application and required identity documents |
| `GET /api/membership-applications` | List applications for administrator review |
| `GET /api/membership-applications/:applicationId/documents/:documentType` | Download a private application document as an administrator |
| `PATCH /api/membership-applications/:applicationId/review` | Approve or reject an application |
| `POST /api/auth/forgot-password` | Email a single-use password reset link when SMTP is configured |
| `POST /api/auth/reset-password` | Set a new password using a valid reset link token |
| `POST /api/auth/google` | Sign in an existing active account with a verified Google identity |
| `POST /api/auth/google/link` | Link a verified Google identity to the authenticated account |
| `POST /api/member-portal/payments/stk` | Request a Daraja STK Push for the signed-in member's savings account or active loan |
| `GET /api/member-portal/payments/:paymentId` | Check the signed-in member's payment status against Daraja |
| `POST /api/mpesa/stk/callback` | Receive an STK callback and verify success using Daraja's authenticated status query |
| `GET /api/members?search=&limit=` | Search/list members and savings accounts |
| `GET /api/members/:memberId/profile` | Read a member profile, application/KYC, next of kin, employment, income, accounts, loans, shares, and recent ledger/mobile payments (administrator, credit officer, accountant, or auditor) |
| `POST /api/members` | Create a member and their initial savings account |
| `PATCH /api/members/:memberId` | Update member details or suspend/reactivate membership |
| `POST /api/members/:memberId/portal-account` | Create a member-linked login and return its one-time temporary password |
| `GET /api/member-portal` | Get only the signed-in member's profile, savings, loans, and ledger history |
| `POST /api/member-portal/loans` | Submit a loan application for the signed-in member |
| `GET /api/member-portal/loans/:loanId/schedule` | View the signed-in member's illustrative schedule for their own loan |
| `GET /api/member-portal/loans/:loanId/documents/:documentId` | Download a supporting document for the signed-in member's own loan |
| `GET /api/member-portal/guarantees` | View guarantees sent to or requested by the signed-in member |
| `POST /api/member-portal/guarantees` | Request a guarantee from another active member for a pending loan |
| `PATCH /api/member-portal/guarantees/:guaranteeId/response` | Accept or decline a guarantee request addressed to the signed-in member |
| `POST /api/member-portal/assistant/chat` | Ask the Azure OpenAI member assistant using only the signed-in member's account context |
| `POST /api/auth/change-password` | Change the signed-in user's password and revoke older sessions |
| `GET /api/savings` | List savings accounts |
| `POST /api/savings/:accountId/deposits` | Record a deposit and update the account atomically |
| `POST /api/savings/:accountId/withdrawals` | Withdraw without breaching the minimum balance |
| `GET /api/loans` | List loan applications and balances |
| `GET /api/loans/:loanId/schedule` | View an illustrative loan schedule (requires loan read permission) |
| `GET /api/loans/:loanId/documents/:documentId` | Download a private loan application document (requires loan read permission) |
| `GET /api/loans/guarantees` | List guarantee requests for staff with guarantee review permission |
| `PATCH /api/loans/guarantees/:guaranteeId/review` | Approve or reject a guarantor-consented request |
| `GET /api/loans/portfolio/analytics` | View loan pipeline, credit portfolio exposures, status and recorded-risk summaries |
| `GET /api/shares` | List member share holdings |
| `GET /api/shares/report` | View aggregated recorded share holdings without calculating or paying dividends |
| `GET /api/mpesa/transactions` | View/filter recent mobile payment transactions for reconciliation |
| `POST /api/loans` | Create a pending loan application |
| `PATCH /api/loans/:loanId/status` | Approve or reject a pending loan |
| `POST /api/loans/:loanId/disburse` | Disburse an approved loan and record the transaction |
| `POST /api/loans/:loanId/repayments` | Record a repayment and update the loan atomically |
| `GET /api/transactions?limit=` | List recent ledger transactions |

Request bodies are validated. Duplicate member IDs, phones, references, emails, and portal links are rejected by database constraints. Read responses omit national ID values. New members can register through the public signup flow described above. Administrators can also provision portal access from the Members page for an active member with a recorded email. The API displays a randomly generated temporary password once; share it out-of-band. The member must set a new password before any portal data is returned.

Member portal requests are scoped to the authenticated account's linked member ID; the API does not accept a member ID for profile, savings, or loan-history reads. Members can view only their own profile, accounts, applications, and transactions, and can submit an application for themselves. They cannot make cash deposits, withdrawals, manually record repayments, approve loans, or view other members. When Daraja is configured, members can request an STK Push for their own active savings account or loan. A member can have only one pending loan application. The member-facing application uses `DEFAULT_LOAN_INTEREST_RATE`; applications are pending until an administrator reviews them. Applications can optionally record employment, occupation, employer, monthly income, and existing monthly commitments. Members or staff may attach optional income proof, bank statements, or guarantor-consent supporting documents (PDF/JPEG/PNG, up to 5 MB each). These are not configured eligibility criteria or confirmed SACCO requirements. Documents are stored outside the static web root and downloads are authorized and scoped to the loan/member. An uploaded consent file does not replace the guarantor's in-portal consent. Contact details and official downloadable form links must be supplied by the SACCO; the UI directs users to contact their office until then.

Loan schedules and the loan calculator use the existing flat-rate method and are illustrative only. Schedule dates are projections (application date before disbursement); there is no contractual due-date or arrears-aging policy, and recorded repayments are allocated oldest-first for display. The calculator reports estimated amounts and an optional installment-to-stated-income ratio; it does not determine eligibility or approval. No affordability thresholds or maximum loan policy have been configured.

Guarantorship requests are member-scoped. A borrower may request coverage from another active member with portal access for a pending loan. The guarantor must accept before staff review, and staff with `guarantees.review` permission must approve before the guarantee is recorded. Reserved requests and approved coverage cannot exceed the related loan principal; there is no configured global guarantor cap. Approved coverage is released when the loan is fully repaid and active requests are cancelled if the pending loan is rejected. These records do not post money, create collection instructions, or define legal liability; guarantee amount and outstanding loan balance are displayed separately.

The optional Azure OpenAI assistant is disabled unless its backend environment settings are configured. Before a question is sent, the member must explicitly consent in the portal. The backend sends only the question, the limited account context shown in the consent notice, and up to eight recent chat messages; it does not send names, contact details, account identifiers, or transaction references and does not persist the chat. Azure OpenAI processes the request under the configured Azure service and deployment. The assistant is informational only and cannot make loan decisions or account changes. Review your Azure data-processing, retention, and regional settings before enabling it for real member data.

Daraja STK Push is disabled until sandbox or production credentials and a publicly reachable HTTPS callback URL are configured. Callback payloads alone never settle payments: the API verifies the matching CheckoutRequestID using Daraja's authenticated status query, validates callback amount and phone against the saved payment intent, and posts the receipt and ledger changes atomically. Checkout IDs and receipt numbers are unique, callbacks are idempotent, and mismatched confirmations are held for manual review. Loan repayments reduce the current outstanding balance; penalty, interest, and principal are not modeled separately by the current schema. A public callback URL, sandbox testing, operational reconciliation, and independent security review are still required before any real-money use.

## Security controls

- Passwords use bcrypt hashing; no plaintext password is stored.
- Authentication uses an eight-hour, signed HS256 JWT in an `HttpOnly`, `SameSite=Strict` cookie; production cookies are marked `Secure`. Active users are checked on each authenticated request.
- Login requests are rate-limited. API request bodies are size-limited and validated with Zod.
- Helmet sets security-related HTTP headers. CORS is limited to explicitly configured frontend origins, and unsafe browser requests with an unapproved `Origin` are rejected.
- Staff endpoints enforce role-specific permissions server-side; hiding a page in the frontend is not the security boundary. Member routes enforce the member role and server-side member scoping. Temporary passwords must be rotated before protected access.
- Password changes increment the account's token version, invalidating previously issued sessions. Secrets are required from environment configuration; there is no built-in JWT fallback or default account.
- Password reset links are single-use, time-limited, stored only as token hashes, and invalidate existing sessions. The frontend exposes email-and-password sign-in and password recovery; Google sign-in and account-linking controls have been removed from the UI.
- Savings and loan accounting updates are grouped in database transactions and enforce balance constraints.

## Production limitations

This is a development baseline, **not a production banking system**. This application does not yet provide MFA, a staff invitation delivery service, tamper-evident audit logs or retention controls, backup/restore automation, operational monitoring, or a verified production M-Pesa integration. The UI's portfolio insights are descriptive rules, not credit decisions.

Before handling real member or financial data, obtain a security review, define a privacy/retention policy, add tested encrypted backups and recovery, enable HTTPS behind a correctly configured trusted proxy, rotate secrets, and assess applicable financial and data-protection requirements. The current project uses `prisma db push`; adopt versioned migrations and operational controls before production deployment.
