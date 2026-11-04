import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiDownload, apiRequest, currency, dateTime } from './api.js';
import MemberProfile from './MemberProfile.jsx';
import GuarantorsForm from './GuarantorsForm.jsx';
import LoanSchedule from './LoanSchedule.jsx';
import LoanTools from './LoanTools.jsx';

const pageDetails = {
  Members: ['Members', 'Register members and manage membership status.'],
  Savings: ['Savings accounts', 'Review balances and record deposits or withdrawals.'],
  Loans: ['Loans', 'Review applications, record disbursements, and repayments.'],
  'Shares & dividends': ['Shares & dividend reporting', 'Review recorded share holdings; no dividend calculation or payout is enabled.'],
  Transactions: ['Financial ledger', 'Read-only view of the latest recorded ledger activity.'],
  'Portfolio insights': ['Portfolio insights', 'A descriptive snapshot of current portfolio data.'],
  Reports: ['Reports', 'Export recent ledger activity for reporting.'],
};

function Field({ field, members, onChange }) {
  if (field.type === 'section') {
    return <div className="loan-form-section"><h3>{field.label}</h3></div>;
  }

  if (field.type === 'file') {
    return (
      <label className="form-field" htmlFor={field.name}>
        {field.label}
        <input id={field.name} name={field.name} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
      </label>
    );
  }

  const common = {
    id: field.name,
    name: field.name,
    required: field.required !== false,
    defaultValue: field.defaultValue ?? '',
  };

  return (
    <label className="form-field" htmlFor={field.name}>
      {field.label}
      {field.name === 'memberId' ? (
        <select {...common} onChange={onChange}>
          <option value="">Choose a member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>{member.fullName} ({member.memberNo})</option>
          ))}
        </select>
      ) : field.options ? (
        <select {...common}>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          {...common}
          rows={field.rows || 3}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          {...common}
          type={field.type || 'text'}
          min={field.min}
          max={field.max}
          step={field.step}
          maxLength={field.maxLength}
        />
      )}
    </label>
  );
}

function ActionForm({ title, fields, members, busy, error, loanApplication, onCancel, onSubmit }) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const selectedMember = members.find((member) => member.id === selectedMemberId);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel();
    }}>
      <form className={`action-modal${loanApplication ? ' loan-application-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onSubmit={onSubmit}>
        <div className="panel-head">
          <h2 id="action-modal-title">{title}</h2>
          <button type="button" className="link-button" onClick={onCancel} disabled={busy} aria-label="Close form">Close</button>
        </div>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        {loanApplication && <div className="application-help">
          Complete the member, loan, employment, and financial details below. Fields marked optional can be left blank. This application does not guarantee approval; confirm the SACCO’s current requirements with its office.
        </div>}
        {fields.some((field) => field.name === 'memberId') && members.length === 0 && (
          <div className="alert error-alert" role="status">Register an active member before creating a loan application.</div>
        )}
        {fields.map((field) => (
          <React.Fragment key={field.name}>
            <Field
              field={field}
              members={members}
              {...(field.name === 'memberId' ? { onChange: (event) => setSelectedMemberId(event.target.value) } : {})}
            />
            {loanApplication && field.name === 'memberId' && selectedMember && (
              <div className="loan-member-summary" aria-live="polite">
                <strong>{selectedMember.fullName}</strong>
                <span>Member no. {selectedMember.memberNo}</span>
                <span>{selectedMember.phone}</span>
                {selectedMember.email && <span>{selectedMember.email}</span>}
              </div>
            )}
          </React.Fragment>
        ))}
        {loanApplication && <GuarantorsForm members={members} excludeMemberId={selectedMemberId} />}
        {loanApplication && <div className="loan-guarantor-note">
          <strong>Consent and review</strong>
          <p>Requests are sent to the selected guarantors after submission. Each guarantor must accept, and SACCO staff must review the request before it is recorded as approved. An uploaded consent document does not replace this process.</p>
        </div>}
        {loanApplication && <p className="application-help">PDF, JPEG, or PNG files up to 5 MB each are accepted. These are common supporting documents, not verified SACCO requirements; the SACCO may request other documents.</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? (loanApplication ? 'Submitting…' : 'Saving…') : (loanApplication ? 'Submit application' : 'Save')}</button>
        </div>
      </form>
    </div>
  );
}

function exportTransactions(transactions) {
  const columns = ['Date', 'Member', 'Reference', 'Type', 'Amount (KES)', 'Balance after (KES)', 'Channel', 'Status'];
  const values = transactions.map((item) => [
    item.createdAt,
    item.member?.fullName || '—',
    item.reference,
    item.type,
    item.amount,
    item.balanceAfter ?? '',
    item.channel,
    item.status,
  ]);
  const escapeCsv = (value) => {
    const text = String(value ?? '');
    const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  };
  const csv = [columns, ...values].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sacco-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ManagementPage({ page, search, onChanged, user }) {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [shareSummary, setShareSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [portalCredentials, setPortalCredentials] = useState(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [profileMemberId, setProfileMemberId] = useState(null);
  const [scheduleLoanId, setScheduleLoanId] = useState('');
  const [detailsLoanId, setDetailsLoanId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const requestId = useRef(0);
  const [title, description] = pageDetails[page] || pageDetails.Members;

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadRecords = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const requests = {
        Members: () => apiRequest(`/members?limit=100&search=${encodeURIComponent(debouncedSearch)}`).then((data) => data.members),
        Savings: () => apiRequest('/savings').then((data) => data.accounts),
        Loans: () => apiRequest('/loans').then((data) => data.loans),
        'Shares & dividends': () => apiRequest('/shares/report').then((data) => {
          setShareSummary(data.summary);
          return data.holdings;
        }),
        Transactions: () => apiRequest('/transactions?limit=100').then((data) => data.transactions),
        Reports: () => apiRequest('/transactions?limit=100').then((data) => data.transactions),
        'Portfolio insights': () => apiRequest('/dashboard').then((data) => {
          setDashboard(data);
          return [];
        }),
      };
      const data = await requests[page]();
      if (currentRequestId === requestId.current) setRecords(data);
    } catch (requestError) {
      if (currentRequestId === requestId.current) {
        if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
        setError(requestError.message);
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, [page, debouncedSearch, refreshKey]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  useEffect(() => {
    if (page !== 'Transactions') return undefined;
    const timer = window.setInterval(() => setRefreshKey((key) => key + 1), 30000);
    return () => window.clearInterval(timer);
  }, [page]);

  useEffect(() => {
    if (page === 'Loans' || page === 'Savings') {
      apiRequest('/members?limit=100')
        .then(({ members: activeMembers }) => setMembers(activeMembers.filter((member) => member.status === 'active')))
        .catch((requestError) => setError(requestError.message));
    }
  }, [page]);

  const visibleRecords = useMemo(() => {
    if (!search || page === 'Members') return records;
    const needle = search.toLowerCase();
    return records.filter((record) => JSON.stringify(record).toLowerCase().includes(needle));
  }, [records, search, page]);

  function openForm(action, record = null) {
    setFormError('');
    setForm({ action, record });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    for (const [key, value] of Object.entries(payload)) {
      if (['amount', 'principal', 'interestRate', 'termMonths'].includes(key) && value !== '') payload[key] = Number(value);
    }

    let path;
    const method = 'POST';
    if (page === 'Members') path = '/members';
    if (page === 'Savings') {
      const endpoint = form.action === 'deposit' ? 'deposits' : 'withdrawals';
      path = `/savings/${form.record.id}/${endpoint}`;
    }
    if (page === 'Loans' && form.action === 'new') path = '/loans';
    if (page === 'Loans' && form.action === 'repayment') path = `/loans/${form.record.id}/repayments`;

    try {
      const body = page === 'Loans' && form.action === 'new'
        ? formData
        : JSON.stringify(payload);
      await apiRequest(path, { method, body });
      setForm(null);
      setRefreshKey((key) => key + 1);
      onChanged();
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setFormError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateMemberStatus(member) {
    const status = member.status === 'active' ? 'suspended' : 'active';
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/members/${member.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setRefreshKey((key) => key + 1);
      onChanged();
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function createPortalAccount(member) {
    setBusy(true);
    setError('');
    setCopiedCredentials(false);
    try {
      const result = await apiRequest(`/members/${member.id}/portal-account`, {
        method: 'POST',
        body: JSON.stringify({ confirmEmail: member.email }),
      });
      setPortalCredentials(result.portalAccount);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateLoan(loan, action) {
    setBusy(true);
    setError('');
    try {
      if (action === 'disburse') {
        await apiRequest(`/loans/${loan.id}/disburse`, { method: 'POST' });
      } else {
        await apiRequest(`/loans/${loan.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: action }),
        });
      }
      setRefreshKey((key) => key + 1);
      onChanged();
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const formFields = form?.action === 'new' && page === 'Members'
    ? [
      { name: 'fullName', label: 'Full name', maxLength: 120 },
      { name: 'phone', label: 'Phone number', maxLength: 20 },
      { name: 'nationalId', label: 'National ID', maxLength: 32 },
      { name: 'email', label: 'Email address', type: 'email', required: false, maxLength: 254 },
      { name: 'address', label: 'Address', required: false, maxLength: 300 },
    ]
    : page === 'Savings'
      ? [
        { name: 'amount', label: 'Amount (KES)', type: 'number', min: 1, step: 1 },
        { name: 'channel', label: 'Channel', options: [{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank' }, { value: 'mpesa', label: 'M-Pesa' }] },
        { name: 'description', label: 'Description', required: false, maxLength: 250 },
      ]
      : form?.action === 'new'
        ? [
          { name: 'member-section', type: 'section', label: 'Member details' },
          { name: 'memberId', label: 'Member' },
          { name: 'loan-section', type: 'section', label: 'Loan request' },
          { name: 'principal', label: 'Principal (KES)', type: 'number', min: 1, step: 1 },
          { name: 'interestRate', label: 'Annual interest rate (%)', type: 'number', min: 0, max: 100, step: 0.01 },
          { name: 'termMonths', label: 'Term (months)', type: 'number', min: 1, max: 120, step: 1 },
          { name: 'applicationNote', label: 'Loan purpose', type: 'textarea', required: false, maxLength: 300 },
          { name: 'employment-section', type: 'section', label: 'Employment and finances' },
          { name: 'employmentStatus', label: 'Employment status', required: false, options: [{ value: '', label: 'Choose if known' }, { value: 'employed', label: 'Employed' }, { value: 'self_employed', label: 'Self-employed' }, { value: 'other', label: 'Other / not provided' }] },
          { name: 'occupation', label: 'Occupation / income source', required: false, maxLength: 120 },
          { name: 'employerName', label: 'Employer name (if applicable)', required: false, maxLength: 120 },
          { name: 'monthlyIncome', label: 'Monthly income (KES, optional)', type: 'number', min: 0, step: 1, required: false },
          { name: 'monthlyCommitments', label: 'Existing monthly commitments (KES, optional)', type: 'number', min: 0, step: 1, required: false },
          { name: 'documents-section', type: 'section', label: 'Supporting documents (optional)' },
          { name: 'incomeProof', label: 'Proof of income (optional)', type: 'file' },
          { name: 'bankStatement', label: 'Recent bank statement (optional)', type: 'file' },
          { name: 'guarantorConsent', label: 'Guarantor consent document (optional)', type: 'file' },
        ]
        : [
          { name: 'amount', label: 'Repayment amount (KES)', type: 'number', min: 1, step: 1 },
          { name: 'channel', label: 'Channel', options: [{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank' }, { value: 'mpesa', label: 'M-Pesa' }] },
        ];

  const filteredTransactions = visibleRecords;
  const hasPermission = (permission) => user.role === 'super_admin'
    || user.permissions?.includes('*')
    || user.permissions?.includes(permission);
  const canManageMembers = hasPermission('members.manage');
  const canApplyForLoans = hasPermission('loans.apply');
  const canPostSavings = hasPermission('savings.post');
  const canReviewLoans = hasPermission('loans.review');
  const canDisburseLoans = hasPermission('loans.disburse');
  const canRecordRepayments = hasPermission('loans.repay');
  const canReviewGuarantees = hasPermission('guarantees.review');
  const canViewMemberProfiles = hasPermission('members.profile.read');
  const titleAction = (page === 'Members' && canManageMembers) || (page === 'Loans' && canApplyForLoans);
  const pageDescription = page === 'Members' && !canManageMembers
    ? 'Review member records using your assigned access.'
    : page === 'Savings' && !canPostSavings
      ? 'Read-only review of savings account balances.'
      : page === 'Loans' && !canReviewLoans && !canDisburseLoans
        ? 'Review the loan pipeline and submit applications; final approval and disbursement remain restricted.'
        : description;

  return (
    <section className="management-page">
      <div className="management-heading">
        <div><div className="eyebrow">Management</div><h2>{title}</h2><p>{pageDescription}</p></div>
        {titleAction && (
          <button type="button" className="primary-button" onClick={() => openForm('new')}>
            {page === 'Members' ? 'Add member' : 'New loan application'}
          </button>
        )}
        {page === 'Reports' && (
          <button type="button" className="primary-button" onClick={() => exportTransactions(visibleRecords)} disabled={!visibleRecords.length}>
            Export CSV
          </button>
        )}
      </div>

      {page === 'Loans' && <>
        <div className="alert page-callout loan-contact-note" role="note">
          <strong>Loan application support / official forms:</strong> Contact your SACCO office for current requirements and fillable forms. Contact details and verified download links have not been provided.
        </div>
        <section className="loan-eligibility-note" aria-labelledby="loan-eligibility-title">
          <h3 id="loan-eligibility-title">Common eligibility checks</h3>
          <p>These are general checks only, not verified rules for this SACCO. Confirm minimum membership period, regular savings or share contributions, loan limits, repayment capacity, guarantor or collateral requirements, and any arrears or existing-loan restrictions with the SACCO before applying.</p>
        </section>
      </>}
      {error && <div className="alert error-alert" role="alert">{error} <button type="button" className="link-button" onClick={loadRecords}>Retry</button></div>}
      {loading ? <div className="empty-state">Loading {title.toLowerCase()}…</div> : (
        <>
          {page === 'Members' && (
            <div className="panel table-wrap">
              <table><thead><tr><th>Member no.</th><th>Name</th><th>Phone</th><th>Email</th><th>Joined</th><th>Status</th><th>Portal access</th><th>Profile</th><th>Action</th></tr></thead>
                <tbody>{visibleRecords.map((member) => <tr key={member.id}>
                  <td>{member.memberNo}</td><td className="member-name">{member.fullName}</td><td>{member.phone}</td>
                  <td>{member.email || '—'}</td><td>{dateTime(member.joinedAt)}</td>
                  <td><span className={`status-badge status-${member.status}`}>{member.status}</span></td>
                  <td>{member.portalAccess?.enabled
                    ? <span className={`status-badge ${member.portalAccess.active ? 'status-active' : 'status-inactive'}`}>{member.portalAccess.active ? 'Enabled' : 'Disabled'}</span>
                    : canManageMembers && <button type="button" className="table-action" disabled={busy || member.status !== 'active' || !member.email} title={!member.email ? 'Add an email address to the member record first' : undefined} onClick={() => createPortalAccount(member)}>Create access</button>}</td>
                  <td>{canViewMemberProfiles && <button type="button" className="table-action" onClick={() => setProfileMemberId(member.id)}>View profile</button>}</td>
                  <td>{canManageMembers && <button type="button" className="table-action" disabled={busy} onClick={() => updateMemberStatus(member)}>{member.status === 'active' ? 'Suspend' : 'Reactivate'}</button>}</td>
                </tr>)}</tbody>
              </table>
              {!visibleRecords.length && <div className="empty-state">No members found.</div>}
            </div>
          )}

          {page === 'Savings' && (
            <div className="panel table-wrap">
              <table><thead><tr><th>Account no.</th><th>Member</th><th>Phone</th><th>Balance</th><th>Minimum</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{visibleRecords.map((account) => <tr key={account.id}>
                  <td>{account.accountNo}</td><td className="member-name">{account.member.fullName}</td><td>{account.member.phone}</td>
                  <td>{currency(account.balance)}</td><td>{currency(account.minimumBalance)}</td>
                  <td><span className={`status-badge status-${account.status}`}>{account.status}</span></td>
                  <td className="action-cell">
                    {canPostSavings && <>
                      <button className="table-action" type="button" disabled={busy || account.status !== 'active'} onClick={() => openForm('deposit', account)}>Deposit</button>
                      <button className="table-action" type="button" disabled={busy || account.status !== 'active'} onClick={() => openForm('withdrawal', account)}>Withdraw</button>
                    </>}
                  </td>
                </tr>)}</tbody>
              </table>
              {!visibleRecords.length && <div className="empty-state">No savings accounts found.</div>}
            </div>
          )}

          {page === 'Loans' && (
            <>
              <div className="panel table-wrap">
                <table><thead><tr><th>Loan no.</th><th>Member</th><th>Principal</th><th>Outstanding</th><th>Term</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{visibleRecords.map((loan) => <React.Fragment key={loan.id}>
                    <tr>
                      <td>{loan.loanNo}</td><td className="member-name">{loan.member.fullName}</td><td>{currency(loan.principal)}</td>
                      <td>{currency(loan.outstandingBalance)}</td><td>{loan.termMonths} months</td>
                      <td><span className={`status-badge status-${loan.status}`}>{loan.status}</span></td>
                      <td className="action-cell">
                        <button className="table-action" type="button" onClick={() => setDetailsLoanId(detailsLoanId === loan.id ? '' : loan.id)}>{detailsLoanId === loan.id ? 'Hide details' : 'Details'}</button>
                        <button className="table-action" type="button" onClick={() => setScheduleLoanId(scheduleLoanId === loan.id ? '' : loan.id)}>{scheduleLoanId === loan.id ? 'Hide schedule' : 'Schedule'}</button>
                        {canReviewLoans && loan.status === 'pending' && <>
                          <button className="table-action" type="button" disabled={busy} onClick={() => updateLoan(loan, 'approved')}>Approve</button>
                          <button className="table-action danger-action" type="button" disabled={busy} onClick={() => updateLoan(loan, 'rejected')}>Reject</button>
                        </>}
                        {canDisburseLoans && loan.status === 'approved' && <button className="table-action" type="button" disabled={busy} onClick={() => updateLoan(loan, 'disburse')}>Disburse</button>}
                        {canRecordRepayments && loan.status === 'active' && <button className="table-action" type="button" disabled={busy} onClick={() => openForm('repayment', loan)}>Repayment</button>}
                      </td>
                    </tr>
                    {detailsLoanId === loan.id && <tr><td colSpan="7">
                      <div className="loan-application-details">
                        <strong>Application details</strong>
                        <p>Purpose: {loan.applicationNote || 'Not provided'}</p>
                        <p>Employment: {loan.employmentStatus?.replaceAll('_', ' ') || 'Not provided'} · Occupation / source: {loan.occupation || 'Not provided'} · Employer: {loan.employerName || 'Not provided'}</p>
                        <p>Monthly income: {loan.monthlyIncome === null ? 'Not provided' : currency(loan.monthlyIncome)} · Existing commitments: {loan.monthlyCommitments === null ? 'Not provided' : currency(loan.monthlyCommitments)}</p>
                        <div className="application-document-actions">
                          {(loan.applicationDocuments || []).map((document) => (
                            <button key={document.id} type="button" className="table-action" onClick={async () => {
                              try {
                                await apiDownload(`/loans/${loan.id}/documents/${document.id}`, `${document.documentType}.${document.extension}`);
                              } catch (requestError) {
                                setError(requestError.message);
                              }
                            }}>Download {document.documentType.replaceAll(/([A-Z])/g, ' $1').toLowerCase()}</button>
                          ))}
                          {!loan.applicationDocuments?.length && <span>No supporting documents uploaded.</span>}
                        </div>
                        <p className="application-help">Attachments are supporting information, not a decision, proof of guarantor consent, or a confirmed SACCO requirement.</p>
                      </div>
                    </td></tr>}
                  </React.Fragment>)}</tbody>
                </table>
                {!visibleRecords.length && <div className="empty-state">No loan applications found.</div>}
              </div>
              {scheduleLoanId && <section className="panel application-section">
                <div className="panel-head"><div><h3>Loan repayment schedule</h3></div><button type="button" className="link-button" onClick={() => setScheduleLoanId('')}>Close</button></div>
                <LoanSchedule loanId={scheduleLoanId} />
              </section>}
              <LoanTools canReviewGuarantees={canReviewGuarantees} />
            </>
          )}

          {page === 'Shares & dividends' && (
            <>
              <div className="report-summary panel">
                <div><span>Members with shares</span><strong>{shareSummary?.membersWithShares || 0}</strong></div>
                <div><span>Share holding records</span><strong>{shareSummary?.holdingRecords || 0}</strong></div>
                <div><span>Total recorded units</span><strong>{(shareSummary?.totalUnits || 0).toLocaleString('en-KE')}</strong></div>
                <div><span>Total recorded share value</span><strong>{currency(shareSummary?.totalValue)}</strong></div>
              </div>
              <p className="page-callout">Dividend policy/rates are not configured. This is a read-only share report; no dividend entitlement is estimated, posted, or paid.</p>
              <div className="panel table-wrap">
              <table><thead><tr><th>Member no.</th><th>Member</th><th>Total units</th><th>Share value</th><th>Holding records</th></tr></thead>
                <tbody>{visibleRecords.map((holding) => <tr key={holding.member.id}>
                  <td>{holding.member.memberNo}</td><td className="member-name">{holding.member.fullName}</td><td>{holding.units}</td>
                  <td>{currency(holding.shareValue)}</td><td>{holding.records}</td>
                </tr>)}</tbody>
              </table>
              {!visibleRecords.length && <div className="empty-state">No share holdings recorded.</div>}
              </div>
            </>
          )}

          {page === 'Transactions' && (
            <>
              <div className="management-heading"><p className="page-callout">Read-only ledger; automatically refreshed every 30 seconds. Only the latest 100 records are shown.</p><button type="button" className="secondary-button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>Refresh now</button></div>
              <TransactionTable records={filteredTransactions} />
            </>
          )}

          {page === 'Reports' && (
            <>
              <div className="report-summary panel">
                <div><span>Transactions included</span><strong>{records.length}</strong></div>
                <div><span>Deposits</span><strong>{currency(records.filter((item) => item.type === 'deposit').reduce((total, item) => total + item.amount, 0))}</strong></div>
                <div><span>Loan disbursements</span><strong>{currency(records.filter((item) => item.type === 'loan_disbursement').reduce((total, item) => total + item.amount, 0))}</strong></div>
              </div>
              <TransactionTable records={filteredTransactions} />
            </>
          )}

          {page === 'Portfolio insights' && dashboard && (
            <div className="insight-cards">
              <article className="panel"><span>Active members</span><strong>{dashboard.summary.members}</strong><p>Members with active membership status.</p></article>
              <article className="panel"><span>Active savings</span><strong>{currency(dashboard.summary.savings)}</strong><p>Current balance across active savings accounts.</p></article>
              <article className="panel"><span>Active loan balance</span><strong>{currency(dashboard.loanPortfolio.active)}</strong><p>Outstanding value of active loans.</p></article>
              <article className="panel"><span>Pending loan value</span><strong>{currency(dashboard.loanPortfolio.pending)}</strong><p>Principal currently awaiting a decision.</p></article>
              <article className="panel"><span>Overdue/defaulted</span><strong>{currency(dashboard.loanPortfolio.overdue)}</strong><p>Balances marked overdue or defaulted.</p></article>
              <article className="panel"><span>Share value</span><strong>{currency(dashboard.summary.shares)}</strong><p>Recorded member share holdings.</p></article>
              <p className="page-callout">These figures describe the records in the database and are not credit decisions or financial advice.</p>
            </div>
          )}
        </>
      )}

      {form && (
        <ActionForm
          title={form.action === 'new' ? (page === 'Members' ? 'Register member' : 'Create loan application') : form.action === 'repayment' ? 'Record loan repayment' : `Record ${form.action}`}
          fields={formFields}
          members={members}
          busy={busy}
          error={formError}
          loanApplication={page === 'Loans' && form.action === 'new'}
          onCancel={() => setForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {profileMemberId && <MemberProfile memberId={profileMemberId} onClose={() => setProfileMemberId(null)} />}
      {portalCredentials && (
        <div className="modal-backdrop" role="presentation">
          <section className="action-modal credentials-modal" role="dialog" aria-modal="true" aria-labelledby="portal-credentials-title">
            <div className="panel-head">
              <h2 id="portal-credentials-title">Member portal created</h2>
              <button type="button" className="link-button" onClick={() => setPortalCredentials(null)} aria-label="Close credentials">Close</button>
            </div>
            <p className="page-callout">Share this temporary password with the member using a secure channel. It is shown only once, and the member must change it before viewing their account.</p>
            <div className="credential-line"><span>Login email</span><strong>{portalCredentials.email}</strong></div>
            <div className="credential-line"><span>Temporary password</span><code>{portalCredentials.temporaryPassword}</code></div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(portalCredentials.temporaryPassword);
                  setCopiedCredentials(true);
                } catch {
                  setError('Clipboard access failed. Select and copy the temporary password manually.');
                }
              }}>{copiedCredentials ? 'Copied' : 'Copy password'}</button>
              <button type="button" className="primary-button" onClick={() => setPortalCredentials(null)}>Done</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function TransactionTable({ records }) {
  return (
    <div className="panel table-wrap">
      <table><thead><tr><th>Date</th><th>Reference</th><th>Member</th><th>Type</th><th>Amount</th><th>Balance</th><th>Channel</th><th>Status</th></tr></thead>
        <tbody>{records.map((transaction) => <tr key={transaction.id}>
          <td>{dateTime(transaction.createdAt)}</td><td>{transaction.reference}</td><td className="member-name">{transaction.member?.fullName || '—'}</td>
          <td>{transaction.type.replaceAll('_', ' ')}</td><td>{currency(transaction.amount)}</td>
          <td>{transaction.balanceAfter === null ? '—' : currency(transaction.balanceAfter)}</td><td>{transaction.channel}</td>
          <td><span className={`status-badge status-${transaction.status}`}>{transaction.status}</span></td>
        </tr>)}</tbody>
      </table>
      {!records.length && <div className="empty-state">No transactions found.</div>}
    </div>
  );
}
