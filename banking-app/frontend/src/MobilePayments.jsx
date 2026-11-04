import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, currency, dateTime } from './api.js';

export default function MobilePayments() {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadTransactions = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    const query = new URLSearchParams({ limit: '100' });
    if (status) query.set('status', status);
    if (purpose) query.set('purpose', purpose);
    try {
      const result = await apiRequest(`/mpesa/transactions?${query}`);
      setTransactions(result.transactions);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [status, purpose]);

  useEffect(() => {
    loadTransactions(true);
    const timer = window.setInterval(() => loadTransactions(), 30000);
    return () => window.clearInterval(timer);
  }, [loadTransactions]);

  const totals = transactions.reduce((summary, payment) => {
    summary[payment.status] = (summary[payment.status] || 0) + 1;
    summary.amount += payment.amount;
    return summary;
  }, { amount: 0 });

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Read-only reconciliation</div>
          <h2>Mobile payments</h2>
          <p>Latest 100 M-Pesa STK transactions. The list refreshes every 30 seconds; callbacks and receipts remain the payment source of truth.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => loadTransactions(true)} disabled={loading}>Refresh now</button>
      </div>

      <div className="report-summary panel">
        <div><span>Transactions shown</span><strong>{transactions.length}</strong></div>
        <div><span>Successful</span><strong>{totals.completed || 0}</strong></div>
        <div><span>Pending / review</span><strong>{(totals.pending || 0) + (totals.initiating || 0) + (totals.processing || 0) + (totals.review || 0)}</strong></div>
        <div><span>Amount shown</span><strong>{currency(totals.amount)}</strong></div>
      </div>

      <div className="payment-monitor-filters">
        <label className="form-field">Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {['pending', 'initiating', 'processing', 'completed', 'failed', 'review', 'cancelled'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="form-field">Purpose
          <select value={purpose} onChange={(event) => setPurpose(event.target.value)}>
            <option value="">All purposes</option>
            <option value="savings_deposit">Savings deposit</option>
            <option value="loan_repayment">Loan repayment</option>
            <option value="legacy">Legacy / unspecified</option>
          </select>
        </label>
        {lastUpdated && <span className="application-help">Updated {dateTime(lastUpdated)}</span>}
      </div>

      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {loading ? <div className="empty-state">Loading mobile payments…</div> : (
        <div className="panel table-wrap">
          <table><thead><tr><th>Requested</th><th>Member</th><th>Purpose</th><th>Loan</th><th>Phone</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Result</th></tr></thead>
            <tbody>{transactions.map((payment) => (
              <tr key={payment.id}>
                <td>{dateTime(payment.createdAt)}</td>
                <td>{payment.member ? `${payment.member.fullName} (${payment.member.memberNo})` : 'Unlinked payment'}</td>
                <td>{payment.purpose.replaceAll('_', ' ')}</td>
                <td>{payment.loan?.loanNo || '—'}</td>
                <td>{payment.phoneNumber || '—'}</td>
                <td>{currency(payment.amount)}</td>
                <td><span className={`status-badge status-${payment.status}`}>{payment.status}</span></td>
                <td>{payment.receiptNumber || '—'}</td>
                <td>{payment.resultDescription || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
          {!transactions.length && <div className="empty-state">No mobile payment transactions match these filters.</div>}
        </div>
      )}
      <p className="page-callout">This screen is read-only. It does not initiate, reverse, or settle payments. Phone numbers are masked and raw callback payloads are not exposed.</p>
    </section>
  );
}
