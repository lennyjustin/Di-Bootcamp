# Frontend

This folder contains the React + Vite public overview site, administrator dashboard, and member portal for the micro-SACCO platform.

The signed-in dashboard provides API-backed member registration/status management, savings deposits and withdrawals, loan applications and servicing, share holdings, transaction history, portfolio insights, and CSV export of the latest 100 transactions. Share purchases/dividends and live M-Pesa payments are not enabled. The app uses React state for its current screens; Redux is not needed for this scope.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`

## Environment

Copy `.env.example` to `.env` if the API is not running at `http://localhost:5000/api`, and set `VITE_API_URL` to the backend API origin.

Set `VITE_GOOGLE_CLIENT_ID` to the Google Identity Services web client ID to show the Google sign-in button. Set the same `GOOGLE_CLIENT_ID` in the backend environment. Google sign-in does not create accounts. If your Google email differs from your SaccoBanking email, first sign in with your SaccoBanking password, then connect Google from the signed-in account.

Visitors can apply for membership from the public home page. Applications collect eligibility and member details, next of kin, income, a password, and required identity documents; the administrator reviews and approves applications before member accounts are activated. Fee, share-capital, and monthly-contribution amounts are shown as awaiting confirmation, and no payment is taken in the application flow. Password reset links require backend SMTP settings. See [../backend/README.md](../backend/README.md) for setup and security details. The site does not include demo credentials or invented financial performance figures.

Administrators can open member profiles with online application details, employment/income, next of kin, account and loan history, share holdings, and recent ledger/mobile payment entries. Ledger, mobile-payment monitoring, credit portfolio, and share/dividend reporting are read-only; payment status is refreshed on the mobile-payment screen, and dividends or late-payment aging are not inferred without an approved policy and required source data.
