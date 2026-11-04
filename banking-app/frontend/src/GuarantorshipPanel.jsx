import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, currency, dateTime } from './api.js';

function GuaranteeTable({ title, description, requests, columns, emptyMessage }) {
  return (
    <section className="panel application-section">
      <div className="panel-head"><div><h3>{title}</h3><p className="muted">{description}</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead>
          <tbody>{requests.map((request) => (
            <tr key={request.id}>
              {columns.map((column) => <td key={column.label}>{column.render(request)}</td>)}
            </tr>
          ))}</tbody>
        </table>
        {!requests.length && <div className="empty-state">{emptyMessage}</div>}
      </div>
    </section>
  );
}

export default function GuarantorshipPanel({ loans }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadGuarantees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiRequest('/member-portal/guarantees'));
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGuarantees(); }, [loadGuarantees]);

  async function requestGuarantee(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await apiRequest('/member-portal/guarantees', {
        method: 'POST',
        body: JSON.stringify({
          loanId: fields.get('loanId'),
          guarantorMemberNo: fields.get('guarantorMemberNo'),
          amount: Number(fields.get('amount')),
        }),
      });
      setMessage(result.message);
      form.reset();
      await loadGuarantees();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function respond(request, status) {
    setBusyId(request.id);
    setError('');
    setMessage('');
    try {
      const result = await apiRequest(`/member-portal/guarantees/${request.id}/response`, {
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

  const requestColumns = [
    { label: 'Requested', render: (request) => dateTime(request.createdAt) },
    { label: 'Borrower', render: (request) => `${request.borrower.fullName} (${request.borrower.memberNo})` },
    { label: 'Loan', render: (request) => `${request.loan.loanNo} · ${currency(request.loan.principal)}` },
    { label: 'Requested coverage', render: (request) => currency(request.amount) },
    { label: 'Respond', render: (request) => <>
      <button type="button" className="table-action" disabled={busyId === request.id} onClick={() => respond(request, 'accepted')}>Accept</button>
      <button type="button" className="table-action danger-action" disabled={busyId === request.id} onClick={() => respond(request, 'declined')}>Decline</button>
    </> },
  ];
  const receivedColumns = [
    { label: 'Date', render: (request) => dateTime(request.createdAt) },
    { label: 'Borrower', render: (request) => `${request.borrower.fullName} (${request.borrower.memberNo})` },
    { label: 'Loan', render: (request) => `${request.loan.loanNo} · ${request.loan.status}` },
    { label: 'Recorded guarantee', render: (request) => currency(request.amount) },
    { label: 'Loan balance', render: (request) => currency(request.loan.outstandingBalance) },
    { label: 'Status', render: (request) => <span className={`status-badge status-${request.status}`}>{request.status}</span> },
  ];
  const sentColumns = [
    { label: 'Date', render: (request) => dateTime(request.createdAt) },
    { label: 'My loan', render: (request) => `${request.loan.loanNo} · ${request.loan.status}` },
    { label: 'Guarantor', render: (request) => `${request.guarantor.fullName} (${request.guarantor.memberNo})` },
    { label: 'Requested amount', render: (request) => currency(request.amount) },
    { label: 'Status', render: (request) => <span className={`status-badge status-${request.status}`}>{request.status}</span> },
  ];
  const eligibleLoans = loans.filter((loan) => loan.status === 'pending');

  return (
    <section className="panel application-section">
      <div className="panel-head">
        <div><h2>Guarantorship control panel</h2><p className="muted">Manage consent requests, recorded guarantee amounts, and guarantees requested for your loans.</p></div>
        <button type="button" className="secondary-button" onClick={loadGuarantees} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {message && <div className="alert signup-notice" role="status">{message}</div>}
      <p className="page-callout">Only accepted by the guarantor and approved by SACCO staff requests are recorded as approved guarantees. The recorded amount is not a legal-liability determination, collection instruction, or ledger transaction.</p>
      <form className="application-grid" onSubmit={requestGuarantee}>
        <label className="form-field">My loan awaiting review
          <select name="loanId" required disabled={!eligibleLoans.length}>
            <option value="">Choose a pending loan</option>
            {eligibleLoans.map((loan) => <option key={loan.id} value={loan.id}>{loan.loanNo} · {currency(loan.principal)}</option>)}
          </select>
        </label>
        <label className="form-field">Guarantor member number
          <input name="guarantorMemberNo" minLength="3" maxLength="32" required placeholder="Enter active member number" />
        </label>
        <label className="form-field">Requested amount (KES)
          <input name="amount" type="number" min="1" max="9007199254740991" step="1" required />
        </label>
        <div className="form-field"><span>&nbsp;</span>
          <button type="submit" className="primary-button" disabled={saving || !eligibleLoans.length}>{saving ? 'Sending…' : 'Request guarantee'}</button>
        </div>
      </form>
      {!eligibleLoans.length && <p className="application-help">You need a loan application awaiting review before you can request a guarantor.</p>}
      {loading ? <div className="empty-state">Loading your guarantee records…</div> : data && <>
        <GuaranteeTable title="Requests requiring my response" description="Your consent is required before staff review." requests={data.requests} columns={requestColumns} emptyMessage="No pending requests for your consent." />
        <GuaranteeTable title="My recorded guarantee liabilities" description="Approved coverage and outstanding loan balance are displayed separately." requests={data.liabilities} columns={receivedColumns} emptyMessage="No approved guarantee records." />
        <GuaranteeTable title="Guarantees I requested" description="Track consent and SACCO staff review status." requests={data.myGuarantees} columns={sentColumns} emptyMessage="You have not requested a guarantee." />
        {data.decisions.length > 0 && <GuaranteeTable title="My responses and released records" description="Accepted requests may still be awaiting SACCO staff review; released records are no longer active guarantees." requests={data.decisions.filter((request) => request.status !== 'approved')} columns={receivedColumns} emptyMessage="No additional decisions." />}
      </>}
    </section>
  );
}
