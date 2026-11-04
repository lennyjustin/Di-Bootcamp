import React, { useEffect, useState } from 'react';
import { apiRequest, currency } from './api.js';

function formatDueDate(value) {
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export default function LoanSchedule({ loanId, endpoint = '/loans' }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest(`${endpoint}/${loanId}/schedule`)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) {
          if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [endpoint, loanId]);

  if (loading) return <div className="empty-state">Loading illustrative repayment schedule…</div>;
  if (error) return <div className="alert error-alert" role="alert">{error}</div>;
  if (!data) return null;
  const amounts = data.schedule.installments.map((installment) => installment.amount);
  const lowestInstallment = Math.min(...amounts);
  const highestInstallment = Math.max(...amounts);
  const installmentRange = lowestInstallment === highestInstallment
    ? currency(lowestInstallment)
    : `${currency(lowestInstallment)}–${currency(highestInstallment)}`;

  return (
    <div className="loan-schedule">
      <div className="report-summary">
        <div><span>Estimated total repayable</span><strong>{currency(data.schedule.totalRepayable)}</strong></div>
        <div><span>Estimated monthly installment range</span><strong>{installmentRange}</strong></div>
        <div><span>Loan status</span><strong>{data.loan.status}</strong></div>
      </div>
      {data.schedule.isProjection && <p className="page-callout">Projected dates use the application date because this loan has not been disbursed.</p>}
      <p className="application-help">{data.schedule.notice}</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Installment</th><th>Projected due date</th><th>Scheduled</th><th>Recorded paid</th><th>Remaining</th><th>Tracking</th></tr></thead>
          <tbody>{data.schedule.installments.map((installment) => (
            <tr key={installment.number}>
              <td>{installment.number}</td>
              <td>{formatDueDate(installment.dueDate)}</td>
              <td>{currency(installment.amount)}</td>
              <td>{currency(installment.paid)}</td>
              <td>{currency(installment.remaining)}</td>
              <td><span className={`status-badge status-${installment.status}`}>{installment.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
