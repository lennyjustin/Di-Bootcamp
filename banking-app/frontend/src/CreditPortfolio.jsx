import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, currency, dateTime } from './api.js';

const stages = [
  ['Awaiting decision', 'pending'],
  ['Approved · awaiting disbursement', 'approved'],
  ['Active / performing', 'active'],
  ['Overdue', 'overdue'],
  ['Defaulted', 'defaulted'],
  ['Repaid', 'repaid'],
  ['Rejected', 'rejected'],
];

export default function CreditPortfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiRequest('/loans/portfolio/analytics'));
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);
  const summary = data?.summary;

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Credit risk · recorded data</div>
          <h2>Credit portfolio &amp; loan pipeline</h2>
          <p>Applications, approvals, current balances, and status-based recovery exposure.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadPortfolio} disabled={loading}>Refresh</button>
      </div>

      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {loading && !data ? <div className="empty-state">Loading credit portfolio…</div> : data && (
        <>
          <div className="insight-cards credit-portfolio-cards">
            <article className="panel"><span>Total loan records</span><strong>{summary.totalLoans}</strong><p>All recorded application and loan statuses.</p></article>
            <article className="panel"><span>Awaiting decision</span><strong>{summary.pending.count}</strong><p>{currency(summary.pending.principal)} principal awaiting review.</p></article>
            <article className="panel"><span>Approved, not disbursed</span><strong>{summary.approvedForDisbursement.count}</strong><p>{currency(summary.approvedForDisbursement.principal)} approved principal.</p></article>
            <article className="panel"><span>Active balance</span><strong>{currency(summary.active.outstanding)}</strong><p>{summary.active.count} active loans.</p></article>
            <article className="panel"><span>Overdue / defaulted balance</span><strong>{currency(summary.recovery.outstanding)}</strong><p>{summary.recovery.count} loans in recorded recovery statuses.</p></article>
            <article className="panel"><span>Status-based recovery share</span><strong>{summary.statusBasedRecoveryShare}%</strong><p>Of active plus overdue/defaulted outstanding balance.</p></article>
          </div>

          <article className="panel credit-pipeline-panel">
            <div className="panel-head"><h3>Pipeline by stage</h3></div>
            <div className="report-summary">
              {stages.map(([label, status]) => {
                const loans = data.pipeline.filter((loan) => loan.status === status);
                const principal = loans.reduce((total, loan) => total + loan.principal, 0);
                return <div key={status}><span>{label}</span><strong>{loans.length} · {currency(principal)}</strong></div>;
              })}
            </div>
          </article>

          <div className="panel table-wrap">
            <table><thead><tr><th>Applied</th><th>Loan</th><th>Member</th><th>Stage</th><th>Principal</th><th>Repayable</th><th>Outstanding</th><th>Rate / term</th><th>Risk review signal</th><th>Application note</th></tr></thead>
              <tbody>{data.pipeline.map((loan) => (
                <tr key={loan.id}>
                  <td>{dateTime(loan.appliedAt)}</td><td>{loan.loanNo}</td><td>{loan.member.fullName} ({loan.member.memberNo})</td>
                  <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
                  <td>{currency(loan.principal)}</td><td>{currency(loan.totalRepayable)}</td><td>{currency(loan.outstandingBalance)}</td>
                  <td>{loan.interestRate}% · {loan.termMonths} mo.</td>
                  <td title={loan.aiDecisionNote || ''}>{loan.aiRiskLevel ? `${loan.aiRiskLevel}${loan.aiRiskScore === null ? '' : ` · ${loan.aiRiskScore}`}` : 'Not recorded'}{loan.aiDecisionNote ? ` · ${loan.aiDecisionNote}` : ''}</td>
                  <td>{loan.applicationNote || '—'}</td>
                </tr>
              ))}</tbody>
            </table>
            {!data.pipeline.length && <div className="empty-state">No loan records available.</div>}
            {data.pipeline.length < summary.totalLoans && <p className="application-help">Showing the latest {data.pipeline.length} of {summary.totalLoans} loans.</p>}
          </div>

          {summary.aiRiskCounts && Object.keys(summary.aiRiskCounts).length > 0 && (
            <p className="page-callout">Stored risk labels: {Object.entries(summary.aiRiskCounts).map(([risk, count]) => `${risk}: ${count}`).join(' · ')}. These are stored review signals, not automated approval decisions.</p>
          )}
          <p className="page-callout">{summary.performanceNote} This dashboard is informational and does not change loan decisions or post ledger entries.</p>
        </>
      )}
    </section>
  );
}
