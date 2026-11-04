import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, currency, dateTime } from './api.js';

function Detail({ label, value }) {
  return <div className="member-profile-detail"><dt>{label}</dt><dd>{value || '—'}</dd></div>;
}

export default function MemberProfile({ memberId, onClose }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(`/members/${memberId}/profile`);
      setMember(result.member);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [memberId, refreshKey]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshKey((key) => key + 1), 30000);
    return () => window.clearInterval(timer);
  }, [memberId]);

  return (
    <div className="modal-backdrop member-profile-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="member-profile-modal" role="dialog" aria-modal="true" aria-labelledby="member-profile-title">
        <div className="member-profile-heading">
          <div>
            <div className="eyebrow">Administrator · confidential member record</div>
            <h2 id="member-profile-title">{member?.fullName || 'Member profile'}</h2>
            {member && <p>{member.memberNo} · <span className={`status-badge status-${member.status}`}>{member.status}</span></p>}
          </div>
          <div className="application-review-actions">
            <button type="button" className="secondary-button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>Refresh</button>
            <button type="button" className="secondary-button" onClick={onClose}>Close</button>
          </div>
        </div>

        {error && <div className="alert error-alert" role="alert">{error}</div>}
        {loading && !member && <div className="empty-state">Loading member profile…</div>}
        {member && (
          <div className="member-profile-content">
            <section className="member-profile-section">
              <h3>Personal information</h3>
              <dl className="member-profile-grid">
                <Detail label="Full name" value={member.fullName} />
                <Detail label="Date of birth" value={member.dob ? new Date(member.dob).toLocaleDateString('en-KE') : null} />
                <Detail label="Phone" value={member.phone} />
                <Detail label="Email" value={member.email} />
                <Detail label="National ID / passport no." value={member.nationalId} />
                <Detail label="Residential address" value={member.address} />
                <Detail label="Member number" value={member.memberNo} />
                <Detail label="Joined" value={dateTime(member.joinedAt)} />
                <Detail label="Portal access" value={member.portalAccess.active ? 'Active' : member.portalAccess.enabled ? 'Disabled' : 'Not provisioned'} />
              </dl>
            </section>

            <section className="member-profile-section">
              <h3>Application, employment and income</h3>
              {member.application ? (
                <>
                  <dl className="member-profile-grid">
                    <Detail label="Application status" value={member.application.status} />
                    <Detail label="Citizenship" value={member.application.citizenship} />
                    <Detail label="Identification type" value={member.application.identificationType.replaceAll('_', ' ')} />
                    <Detail label="KRA PIN" value={member.application.kraPin} />
                    <Detail label="Membership type" value={member.application.membershipType.replaceAll('_', ' ')} />
                    <Detail label="Common bond" value={member.application.commonBondDetails} />
                    <Detail label="Employment status" value={member.application.employmentStatus.replaceAll('_', ' ')} />
                    <Detail label="Occupation" value={member.application.occupation} />
                    <Detail label="Employer" value={member.application.employerName} />
                    <Detail label="Monthly income" value={currency(member.application.monthlyIncome)} />
                    <Detail label="Application submitted" value={dateTime(member.application.createdAt)} />
                    <Detail label="Reviewed" value={member.application.reviewedAt ? dateTime(member.application.reviewedAt) : null} />
                  </dl>
                  {member.application.applicationStatement && <p className="member-profile-statement">{member.application.applicationStatement}</p>}
                  {member.application.reviewNote && <div className="alert signup-notice">Application review: {member.application.reviewNote}</div>}
                </>
              ) : <p className="page-callout">No online membership application is linked to this member record.</p>}
            </section>

            <section className="member-profile-section">
              <h3>Next of kin</h3>
              {member.application ? (
                <dl className="member-profile-grid">
                  <Detail label="Name" value={member.application.nextOfKinName} />
                  <Detail label="Relationship" value={member.application.nextOfKinRelationship} />
                  <Detail label="Phone" value={member.application.nextOfKinPhone} />
                </dl>
              ) : <p className="page-callout">Next-of-kin information is not available for this record.</p>}
            </section>

            <section className="member-profile-section">
              <h3>Savings accounts</h3>
              {member.accounts.length ? (
                <div className="table-wrap">
                  <table><thead><tr><th>Account</th><th>Status</th><th>Balance</th><th>Minimum balance</th><th>Interest</th></tr></thead>
                    <tbody>{member.accounts.map((account) => (
                      <tr key={account.id}><td>{account.accountNo}</td><td>{account.status}</td><td>{currency(account.balance)}</td><td>{currency(account.minimumBalance)}</td><td>{account.interestRate}%</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="page-callout">No savings account is linked.</p>}
            </section>

            <section className="member-profile-section">
              <h3>Loan history</h3>
              {member.loans.length ? member.loans.map((loan) => (
                <article className="member-profile-loan" key={loan.id}>
                  <div className="member-profile-loan-heading">
                    <strong>{loan.loanNo}</strong><span className={`status-badge status-${loan.status}`}>{loan.status}</span>
                  </div>
                  <dl className="member-profile-grid">
                    <Detail label="Principal" value={currency(loan.principal)} />
                    <Detail label="Outstanding" value={currency(loan.outstandingBalance)} />
                    <Detail label="Rate / term" value={`${loan.interestRate}% · ${loan.termMonths} months`} />
                    <Detail label="Applied" value={dateTime(loan.appliedAt)} />
                  </dl>
                  {loan.repayments.length > 0 && <p className="application-help">{loan.repayments.length} recent repayment(s); latest {dateTime(loan.repayments[0].paidAt)} · {currency(loan.repayments[0].amount)}</p>}
                </article>
              )) : <p className="page-callout">No loan applications recorded.</p>}
            </section>

            <section className="member-profile-section">
              <h3>Share holdings · dividends not calculated</h3>
              {member.shares.length ? (
                <div className="table-wrap">
                  <table><thead><tr><th>Units</th><th>Value per share</th><th>Total recorded value</th><th>Recorded</th></tr></thead>
                    <tbody>{member.shares.map((share) => (
                      <tr key={share.id}><td>{share.units}</td><td>{currency(share.valuePerShare)}</td><td>{currency(share.units * share.valuePerShare)}</td><td>{dateTime(share.createdAt)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="page-callout">No share holdings recorded. Dividend amounts are not calculated or paid by this system.</p>}
            </section>

            <section className="member-profile-section">
              <h3>Live financial ledger · latest {member.transactions.length} records</h3>
              {member.transactions.length ? (
                <div className="table-wrap">
                  <table><thead><tr><th>Date</th><th>Reference</th><th>Type</th><th>Channel</th><th>Status</th><th>Amount</th><th>Balance after</th></tr></thead>
                    <tbody>{member.transactions.map((transaction) => (
                      <tr key={transaction.id}><td>{dateTime(transaction.createdAt)}</td><td>{transaction.reference}</td><td>{transaction.type.replaceAll('_', ' ')}</td><td>{transaction.channel}</td><td>{transaction.status}</td><td>{currency(transaction.amount)}</td><td>{transaction.balanceAfter === null ? '—' : currency(transaction.balanceAfter)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="page-callout">No ledger transactions recorded.</p>}
            </section>

            <section className="member-profile-section">
              <h3>Mobile payments</h3>
              {member.mpesaTransactions.length ? (
                <div className="table-wrap">
                  <table><thead><tr><th>Date</th><th>Purpose</th><th>Phone</th><th>M-Pesa receipt</th><th>Status</th><th>Amount</th><th>Result</th></tr></thead>
                    <tbody>{member.mpesaTransactions.map((payment) => (
                      <tr key={payment.id}><td>{dateTime(payment.createdAt)}</td><td>{payment.purpose.replaceAll('_', ' ')}</td><td>{payment.phoneNumber || '—'}</td><td>{payment.receiptNumber || '—'}</td><td>{payment.status}</td><td>{currency(payment.amount)}</td><td>{payment.resultDescription || '—'}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="page-callout">No mobile-money payments recorded.</p>}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
