import React, { useCallback, useEffect, useState } from 'react';
import { apiDownload, apiRequest, currency, dateTime } from './api.js';
import MemberAssistant from './MemberAssistant.jsx';
import LoanSchedule from './LoanSchedule.jsx';
import GuarantorshipPanel from './GuarantorshipPanel.jsx';
import LoanTools from './LoanTools.jsx';
import GuarantorsForm from './GuarantorsForm.jsx';

export function ChangePassword({ onChanged }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = data.get('newPassword');
    if (newPassword !== data.get('confirmPassword')) {
      setError('The new passwords do not match.');
      setSaving(false);
      return;
    }
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: data.get('currentPassword'),
          newPassword,
        }),
      });
      form.reset();
      onChanged();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">Secure your account</div>
        <h1>Set a new password</h1>
        <p>Your administrator provided a temporary password. Change it before viewing your account.</p>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        <label className="form-field">Temporary password
          <input type="password" name="currentPassword" autoComplete="current-password" required maxLength={72} />
        </label>
        <label className="form-field">New password
          <input type="password" name="newPassword" autoComplete="new-password" required minLength={12} maxLength={72} />
        </label>
        <label className="form-field">Confirm new password
          <input type="password" name="confirmPassword" autoComplete="new-password" required minLength={12} maxLength={72} />
        </label>
        <button className="primary-button sign-in-button" type="submit" disabled={saving}>
          {saving ? 'Updating…' : 'Change password'}
        </button>
      </form>
    </main>
  );
}

function MemberPortal({ user, onSignOut, onPasswordChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('savings_deposit');
  const [payment, setPayment] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [scheduleLoanId, setScheduleLoanId] = useState('');

  const loadPortal = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiRequest('/member-portal'));
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user.passwordChangeRequired) loadPortal();
  }, [user.passwordChangeRequired, loadPortal]);

  if (user.passwordChangeRequired) {
    return <ChangePassword onChanged={onPasswordChanged} />;
  }

  async function applyForLoan(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setApplicationMessage('');
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      const result = await apiRequest('/member-portal/loans', { method: 'POST', body: fields });
      const guaranteeMessage = result.guarantorRequestsCreated
        ? ` ${result.guarantorRequestsCreated} guarantor request${result.guarantorRequestsCreated === 1 ? '' : 's'} sent; each must accept before staff review.`
        : '';
      setApplicationMessage(`Application ${result.loan.loanNo} submitted for ${currency(result.loan.principal)}. It is awaiting review.${guaranteeMessage}`);
      form.reset();
      await loadPortal();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadLoanDocument(loan, document) {
    try {
      await apiDownload(
        `/member-portal/loans/${loan.id}/documents/${document.id}`,
        `${document.documentType}.${document.extension}`
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function initiatePayment(event) {
    event.preventDefault();
    setPaymentBusy(true);
    setPaymentError('');
    setPayment(null);
    const fields = new FormData(event.currentTarget);
    const purpose = fields.get('purpose');
    const body = {
      purpose,
      amount: Number(fields.get('amount')),
      phone: fields.get('phone'),
      ...(purpose === 'savings_deposit'
        ? { accountId: fields.get('accountId') }
        : { loanId: fields.get('loanId') }),
    };
    try {
      const result = await apiRequest('/member-portal/payments/stk', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setPayment(result.payment);
    } catch (requestError) {
      setPaymentError(requestError.message);
    } finally {
      setPaymentBusy(false);
    }
  }

  async function checkPaymentStatus() {
    if (!payment) return;
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const result = await apiRequest(`/member-portal/payments/${payment.id}`);
      setPayment(result.payment);
      if (result.payment.status === 'completed') await loadPortal();
    } catch (requestError) {
      setPaymentError(requestError.message);
    } finally {
      setPaymentBusy(false);
    }
  }

  const hasPendingApplication = data?.loans.some((loan) => loan.status === 'pending');
  const activeSavingsAccounts = data?.accounts.filter((account) => account.status === 'active') || [];
  const activeLoans = data?.loans.filter((loan) => loan.status === 'active') || [];

  return (
    <div className="member-portal">
      <header className="member-portal-header">
        <div className="brand-wrap">
          <div className="brand-logo">M</div>
          <div className="brand-text">Sacco<span>Banking</span><small>Member portal</small></div>
        </div>
        <div className="member-portal-actions">
          <div className="profile-pill">
            <div className="profile-avatar">{user.fullName?.charAt(0)?.toUpperCase() || 'M'}</div>
            <div><strong>{user.fullName}</strong><small>Member</small></div>
          </div>
          <button type="button" className="logout-button" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <main className="member-portal-content">
        <section className="member-welcome panel">
          <div>
            <div className="eyebrow">Member portal</div>
            <h1>Welcome, {data?.member.fullName || user.fullName}</h1>
            <p>View your savings, track your loan applications, and keep up with your account activity.</p>
          </div>
          {data?.member && <div className="member-number"><span>Member number</span><strong>{data.member.memberNo}</strong></div>}
        </section>

        {error && <div className="alert error-alert" role="alert"><span>{error}</span><button type="button" className="link-button" onClick={loadPortal}>Retry</button></div>}
        {applicationMessage && <div className="alert success-alert" role="status">{applicationMessage}</div>}
        {loading && !data && <div className="empty-state">Loading your account…</div>}

        {data && (
          <>
            <section className="member-summary-grid" aria-label="Your account summary">
              <article className="member-summary-card">
                <span>Total savings</span><strong>{currency(data.summary.savingsBalance)}</strong>
                <small>Across your active savings accounts</small>
              </article>
              <article className="member-summary-card">
                <span>Savings accounts</span><strong>{data.accounts.length}</strong>
                <small>Accounts linked to your membership</small>
              </article>
              <article className="member-summary-card">
                <span>Loan applications</span><strong>{data.loans.length}</strong>
                <small>Pending, approved, or completed</small>
              </article>
            </section>

            <section className="panel member-payment-panel">
              <div className="panel-head">
                <div><h2>Pay with M-Pesa</h2><p className="muted">{data.darajaEnabled ? 'A payment prompt will be sent to your phone. Your account updates only after Daraja confirms payment.' : 'M-Pesa payments are not configured yet. Contact your SACCO administrator.'}</p></div>
              </div>
              {paymentError && <div className="alert error-alert" role="alert">{paymentError}</div>}
              <form className="member-payment-form" onSubmit={initiatePayment}>
                <label className="form-field">Payment type
                  <select name="purpose" value={paymentPurpose} onChange={(event) => setPaymentPurpose(event.target.value)}>
                    <option value="savings_deposit">Savings deposit</option>
                    <option value="loan_repayment">Loan repayment</option>
                  </select>
                </label>
                {paymentPurpose === 'savings_deposit' ? (
                  <label className="form-field">Savings account
                    <select name="accountId" required disabled={!activeSavingsAccounts.length}>
                      {activeSavingsAccounts.map((account) => <option key={account.id} value={account.id}>{account.accountNo}</option>)}
                    </select>
                  </label>
                ) : (
                  <label className="form-field">Active loan
                    <select name="loanId" required disabled={!activeLoans.length}>
                      {activeLoans.map((loan) => <option key={loan.id} value={loan.id}>{loan.loanNo} · {currency(loan.outstandingBalance)} outstanding</option>)}
                    </select>
                  </label>
                )}
                <label className="form-field">Amount (KES)
                  <input name="amount" type="number" min="1" max="100000000" step="1" required />
                </label>
                <label className="form-field">M-Pesa phone number
                  <input name="phone" type="tel" defaultValue={data.member.phone} placeholder="0712345678" autoComplete="tel" required />
                </label>
                <button className="primary-button" type="submit" disabled={!data.darajaEnabled || paymentBusy || (paymentPurpose === 'savings_deposit' ? !activeSavingsAccounts.length : !activeLoans.length)}>
                  {paymentBusy ? 'Processing…' : data.darajaEnabled ? 'Send payment prompt' : 'M-Pesa unavailable'}
                </button>
              </form>
              {payment && (
                <div className={`payment-status payment-status-${payment.status}`} role="status">
                  <div><strong>M-Pesa status: {payment.status}</strong><span>{currency(payment.amount)} · {payment.purpose === 'savings_deposit' ? 'Savings deposit' : 'Loan repayment'}</span>
                    {payment.resultDescription && <small>{payment.resultDescription}</small>}
                    {payment.receiptNumber && <small>M-Pesa receipt: {payment.receiptNumber}</small>}
                  </div>
                  {payment.status === 'pending' && <button className="secondary-button" type="button" disabled={paymentBusy} onClick={checkPaymentStatus}>Check status</button>}
                </div>
              )}
              {paymentPurpose === 'savings_deposit' && !activeSavingsAccounts.length && <p className="loan-rate-note">No active savings account is available for a deposit.</p>}
              {paymentPurpose === 'loan_repayment' && !activeLoans.length && <p className="loan-rate-note">No active loan is available for repayment.</p>}
            </section>

            <MemberAssistant />
            <LoanTools canReviewGuarantees={false} />

            <div className="member-portal-grid">
              <section className="panel">
                <div className="panel-head"><div><h2>My savings accounts</h2><p className="muted">Your balances and account status.</p></div></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Account</th><th>Balance</th><th>Minimum</th><th>Status</th></tr></thead>
                    <tbody>{data.accounts.map((account) => (
                      <tr key={account.id}>
                        <td className="member-name">{account.accountNo}</td>
                        <td>{currency(account.balance)}</td>
                        <td>{currency(account.minimumBalance)}</td>
                        <td><span className={`status-badge status-${account.status}`}>{account.status}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {!data.accounts.length && <div className="empty-state">No savings accounts are linked to your membership.</div>}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head"><div><h2>My loan applications</h2><p className="muted">Decisions and outstanding balances.</p></div></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Loan</th><th>Requested</th><th>Outstanding</th><th>Status</th><th>Schedule</th><th>Documents</th></tr></thead>
                    <tbody>{data.loans.map((loan) => (
                      <tr key={loan.id}>
                        <td><span className="member-name">{loan.loanNo}</span><small className="table-subtext">{loan.termMonths} months · {Number(loan.interestRate)}% p.a.</small></td>
                        <td>{currency(loan.principal)}</td>
                        <td>{currency(loan.outstandingBalance)}</td>
                        <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
                        <td><button type="button" className="table-action" onClick={() => setScheduleLoanId(scheduleLoanId === loan.id ? '' : loan.id)}>{scheduleLoanId === loan.id ? 'Hide' : 'View'}</button></td>
                        <td>{(loan.applicationDocuments || []).map((document) => (
                          <button key={document.id} type="button" className="table-action" onClick={() => downloadLoanDocument(loan, document)}>
                            {document.documentType.replaceAll(/([A-Z])/g, ' $1').toLowerCase()}
                          </button>
                        ))}{!loan.applicationDocuments?.length && '—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {!data.loans.length && <div className="empty-state">You have no loan applications.</div>}
                </div>
                {scheduleLoanId && <LoanSchedule loanId={scheduleLoanId} endpoint="/member-portal/loans" />}
              </section>

              <section className="panel">
                <div className="panel-head"><div><h2>Apply for a loan</h2><p className="muted">Applications are reviewed by SACCO staff; submission does not guarantee approval.</p></div></div>
                <div className="alert page-callout loan-contact-note" role="note">
                  <strong>Loan application support / official forms:</strong> Contact your SACCO office for current requirements and fillable forms. Contact details and verified download links have not been provided.
                </div>
                {hasPendingApplication ? (
                  <div className="page-callout">You already have an application awaiting a decision. You can apply again after it is reviewed.</div>
                ) : (
                  <form className="member-loan-form" onSubmit={applyForLoan}>
                    {formError && <div className="alert error-alert" role="alert">{formError}</div>}
                    <label className="form-field">Amount requested (KES)
                      <input type="number" name="principal" min="1" max="1000000000" step="1" required />
                    </label>
                    <label className="form-field">Repayment term
                      <select name="termMonths" defaultValue="12">
                        {[3, 6, 9, 12, 18, 24, 36].map((months) => <option key={months} value={months}>{months} months</option>)}
                      </select>
                    </label>
                    <label className="form-field">Purpose (optional)
                      <textarea name="applicationNote" rows="3" maxLength="300" placeholder="Briefly describe the purpose of the loan." />
                    </label>
                    <label className="form-field">Employment status (optional)
                      <select name="employmentStatus" defaultValue="">
                        <option value="">Choose if known</option>
                        <option value="employed">Employed</option>
                        <option value="self_employed">Self-employed</option>
                        <option value="other">Other / not provided</option>
                      </select>
                    </label>
                    <label className="form-field">Occupation / income source (optional)
                      <input name="occupation" type="text" maxLength="120" />
                    </label>
                    <label className="form-field">Employer name (if applicable)
                      <input name="employerName" type="text" maxLength="120" />
                    </label>
                    <label className="form-field">Monthly income (KES, optional)
                      <input name="monthlyIncome" type="number" min="0" max="999999999999999" step="1" />
                    </label>
                    <label className="form-field">Existing monthly commitments (KES, optional)
                      <input name="monthlyCommitments" type="number" min="0" max="999999999999999" step="1" />
                    </label>
                    <GuarantorsForm />
                    <label className="form-field">Proof of income (optional)
                      <input name="incomeProof" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
                    </label>
                    <label className="form-field">Recent bank statement (optional)
                      <input name="bankStatement" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
                    </label>
                    <label className="form-field">Guarantor consent document (optional)
                      <input name="guarantorConsent" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
                    </label>
                    <p className="application-help">Common supporting documents only; none are required by this form. PDF, JPEG, or PNG files up to 5 MB each are accepted. Confirm the SACCO’s official requirements. An uploaded consent document does not replace the guarantor’s consent in the portal.</p>
                    <p className="loan-rate-note">Illustrative flat-rate estimate: {Number(import.meta.env.VITE_DEFAULT_LOAN_RATE || 12)}% annual interest. Final terms are subject to SACCO review.</p>
                    <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</button>
                  </form>
                )}
              </section>

              <section className="panel member-statement">
                <div className="panel-head"><div><h2>Recent account activity</h2><p className="muted">Your latest ledger entries.</p></div></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Reference</th><th>Type</th><th>Amount</th><th>Channel</th><th>Status</th></tr></thead>
                    <tbody>{data.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{dateTime(transaction.createdAt)}</td>
                        <td>{transaction.reference}</td>
                        <td>{transaction.type.replaceAll('_', ' ')}</td>
                        <td>{currency(transaction.amount)}</td>
                        <td>{transaction.channel}</td>
                        <td>{transaction.status}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {!data.transactions.length && <div className="empty-state">No transactions have been recorded yet.</div>}
                </div>
              </section>
            </div>

            <GuarantorshipPanel loans={data.loans} />

            <section className="panel member-profile-card">
              <div><div className="eyebrow">Membership</div><h2>Your profile</h2></div>
              <div><span>Phone</span><strong>{data.member.phone}</strong></div>
              <div><span>Email</span><strong>{data.member.email}</strong></div>
              <div><span>Member since</span><strong>{dateTime(data.member.joinedAt)}</strong></div>
              <div><span>Status</span><strong>{data.member.status}</strong></div>
            </section>
          </>
        )}
        <p className="member-portal-notice">Balances and transactions are read-only in the member portal. Contact your SACCO office for corrections or payment support.</p>
      </main>
    </div>
  );
}

export default MemberPortal;
