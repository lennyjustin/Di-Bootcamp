import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, currency } from './api.js';

export default function BoardOverview() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/dashboard/summary');
      setSummary(result.summary);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Board and committee</div>
          <h2>Portfolio overview</h2>
          <p>Aggregate recorded balances only. No member-level records or financial policy calculations are exposed.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadSummary} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {loading && !summary ? <div className="empty-state">Loading aggregate portfolio…</div> : summary && (
        <>
          <div className="insight-cards">
            <article className="panel"><span>Active members</span><strong>{summary.activeMembers}</strong></article>
            <article className="panel"><span>Recorded savings balance</span><strong>{currency(summary.savingsBalance)}</strong></article>
            <article className="panel"><span>Recorded share value</span><strong>{currency(summary.recordedShareValue)}</strong></article>
          </div>
          <article className="panel table-wrap">
            <div className="panel-head"><h3>Loan portfolio by recorded status</h3></div>
            <table>
              <thead><tr><th>Status</th><th>Loan count</th><th>Principal</th><th>Outstanding balance</th></tr></thead>
              <tbody>{summary.loanStatuses.map((loan) => (
                <tr key={loan.status}>
                  <td>{loan.status.replaceAll('_', ' ')}</td><td>{loan.count}</td>
                  <td>{currency(loan.principal)}</td><td>{currency(loan.outstandingBalance)}</td>
                </tr>
              ))}</tbody>
            </table>
            {!summary.loanStatuses.length && <div className="empty-state">No loan records available.</div>}
          </article>
          <p className="page-callout">{summary.note}</p>
        </>
      )}
    </section>
  );
}
