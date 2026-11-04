import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, currency, dateTime } from './api.js';

const defaultRate = Number(import.meta.env.VITE_DEFAULT_LOAN_RATE || 12);

function calculateEstimate(amountValue, rateValue, termValue, incomeValue, commitmentsValue) {
  const principal = Number(amountValue);
  const rate = Number(rateValue);
  const term = Number(termValue);
  const income = Number(incomeValue);
  const commitments = Number(commitmentsValue);
  if (!Number.isSafeInteger(principal) || principal <= 0
    || !Number.isFinite(rate) || rate < 0 || rate > 100
    || !Number.isInteger(term) || term < 1 || term > 120) {
    return null;
  }
  const interest = Math.round(principal * (rate / 100) * (term / 12));
  const total = principal + interest;
  if (!Number.isSafeInteger(total)) return null;
  const baseInstallment = Math.floor(total / term);
  const monthly = baseInstallment + (total % term ? 1 : 0);
  const netIncome = income - commitments;
  return {
    interest,
    total,
    monthly,
    installmentRange: total % term ? `${currency(baseInstallment)}–${currency(baseInstallment + 1)}` : currency(baseInstallment),
    incomeShare: Number.isFinite(income) && income > 0 && Number.isFinite(netIncome)
      ? Math.round((monthly / income) * 100)
      : null,
    commitmentsExceedIncome: Number.isFinite(income) && Number.isFinite(commitments) && commitments > income,
  };
}

export default function LoanTools({ canReviewGuarantees }) {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(String(defaultRate));
  const [term, setTerm] = useState('12');
  const [income, setIncome] = useState('');
  const [commitments, setCommitments] = useState('0');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const affordabilityInputsValid = [income, commitments].every((value) => (
    value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0)
  ));
  const estimate = affordabilityInputsValid
    ? calculateEstimate(amount, rate, term, income, commitments)
    : null;

  const loadGuarantees = useCallback(async () => {
    if (!canReviewGuarantees) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/loans/guarantees');
      setRequests(result.requests);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [canReviewGuarantees]);

  useEffect(() => { loadGuarantees(); }, [loadGuarantees]);

  async function reviewGuarantee(request, status) {
    setBusyId(request.id);
    setError('');
    setMessage('');
    try {
      const result = await apiRequest(`/loans/guarantees/${request.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(result.message);
      await loadGuarantees();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="loan-tools">
      <section className="panel application-section">
        <div className="panel-head"><div><h3>Eligibility and affordability calculator</h3><p className="muted">Estimate only; no approved eligibility thresholds are configured.</p></div></div>
        <p className="page-callout">This calculator uses the current illustrative flat-rate method. It does not decide eligibility, approve credit, or promise final loan terms.</p>
        <div className="application-grid">
          <label className="form-field">Requested amount (KES)
            <input type="number" min="1" max="9007199254740991" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="form-field">Illustrative annual flat rate (%)
            <input type="number" min="0" max="100" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} />
          </label>
          <label className="form-field">Term (months)
            <input type="number" min="1" max="120" step="1" value={term} onChange={(event) => setTerm(event.target.value)} />
          </label>
          <label className="form-field">Monthly income (KES, optional)
            <input type="number" min="0" step="1" value={income} onChange={(event) => setIncome(event.target.value)} />
          </label>
          <label className="form-field">Existing monthly commitments (KES, optional)
            <input type="number" min="0" step="1" value={commitments} onChange={(event) => setCommitments(event.target.value)} />
          </label>
        </div>
        {estimate && (
          <div className="report-summary">
            <div><span>Illustrative interest</span><strong>{currency(estimate.interest)}</strong></div>
            <div><span>Estimated total repayable</span><strong>{currency(estimate.total)}</strong></div>
            <div><span>Estimated monthly installment</span><strong>{estimate.installmentRange}</strong></div>
            {estimate.incomeShare !== null && <div><span>Installment / stated income</span><strong>{estimate.incomeShare}%</strong></div>}
          </div>
        )}
        {!affordabilityInputsValid && <p className="alert error-alert">Income and existing commitments must be valid nonnegative amounts.</p>}
        {estimate?.commitmentsExceedIncome && <p className="alert error-alert">Entered monthly commitments exceed the entered income; review these inputs.</p>}
        {affordabilityInputsValid && !estimate && (amount || rate || term) && <p className="alert error-alert">Enter a positive whole-number amount and a valid rate/term to calculate an estimate.</p>}
      </section>

      {canReviewGuarantees && (
        <section className="panel application-section">
          <div className="panel-head">
            <div><h3>Guarantorship review</h3><p className="muted">Member consent is required before staff can approve a guarantee record.</p></div>
            <button type="button" className="secondary-button" onClick={loadGuarantees} disabled={loading}>Refresh</button>
          </div>
          {error && <div className="alert error-alert" role="alert">{error}</div>}
          {message && <div className="alert signup-notice" role="status">{message}</div>}
          {loading ? <div className="empty-state">Loading guarantee requests…</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Requested</th><th>Loan</th><th>Borrower</th><th>Guarantor</th><th>Requested amount</th><th>Loan status / balance</th><th>Status</th><th>Staff review</th></tr></thead>
                <tbody>{requests.map((request) => (
                  <tr key={request.id}>
                    <td>{dateTime(request.createdAt)}</td>
                    <td>{request.loan.loanNo}</td>
                    <td>{request.borrower.fullName} ({request.borrower.memberNo})</td>
                    <td>{request.guarantor.fullName} ({request.guarantor.memberNo})</td>
                    <td>{currency(request.amount)}</td>
                    <td>{request.loan.status} · {currency(request.loan.outstandingBalance)} outstanding</td>
                    <td><span className={`status-badge status-${request.status}`}>{request.status}</span></td>
                    <td>{request.status === 'accepted' ? <>
                      <button type="button" className="table-action" disabled={busyId === request.id} onClick={() => reviewGuarantee(request, 'approved')}>Approve</button>
                      <button type="button" className="table-action danger-action" disabled={busyId === request.id} onClick={() => reviewGuarantee(request, 'rejected')}>Reject</button>
                    </> : request.reviewNote || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
              {!requests.length && !error && <div className="empty-state">No guarantor requests are recorded yet.</div>}
            </div>
          )}
          <p className="application-help">No guarantee cap policy is configured. Approved amounts are tracked against the loan principal; approval does not post money or initiate collection.</p>
        </section>
      )}
    </div>
  );
}
