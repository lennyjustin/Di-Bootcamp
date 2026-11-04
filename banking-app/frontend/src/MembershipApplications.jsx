import React, { useCallback, useEffect, useState } from 'react';
import { apiDownload, apiRequest } from './api.js';

const dateLabel = (value) => new Intl.DateTimeFormat('en-KE', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const membershipLabel = (value) => value === 'common_bond' ? 'Common bond' : 'Open membership';
const employmentLabel = (value) => value.replaceAll('_', ' ');

export default function MembershipApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/membership-applications');
      setApplications(result.applications);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  async function review(application, status) {
    let reviewNote;
    if (status === 'rejected') {
      reviewNote = window.prompt('Enter a reason for rejecting this application:');
      if (!reviewNote?.trim()) return;
    } else if (!window.confirm(`Approve ${application.applicant.fullName}'s membership application? This activates their member and savings accounts.`)) {
      return;
    }

    setBusyId(application.id);
    setError('');
    setMessage('');
    try {
      const result = await apiRequest(`/membership-applications/${application.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewNote }),
      });
      setMessage(result.message);
      await loadApplications();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  async function downloadDocument(application, type) {
    setError('');
    try {
      await apiDownload(
        `/membership-applications/${application.id}/documents/${type}`,
        `${application.id}-${type}-document`
      );
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    }
  }

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Management</div>
          <h2>Membership applications</h2>
          <p>Review applicant eligibility, details, and private supporting documents before activating membership.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadApplications} disabled={loading}>Refresh</button>
      </div>

      <div className="alert signup-notice" role="note">
        Application financial terms remain unconfirmed. Do not collect an entrance fee, share capital, or monthly contribution until the SACCO approves and communicates its official amounts.
      </div>
      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {message && <div className="alert success-alert" role="status">{message}</div>}
      {loading ? <div className="empty-state">Loading membership applications…</div> : (
        <div className="application-review-list">
          {applications.map((application) => (
            <article className="panel application-review-card" key={application.id}>
              <div className="application-review-heading">
                <div>
                  <span className={`status-badge status-${application.status}`}>{application.status}</span>
                  <h3>{application.applicant.fullName}</h3>
                  <p>{application.applicant.email} · {application.applicant.phone}</p>
                  <small>Submitted {dateLabel(application.createdAt)} · {membershipLabel(application.membershipType)}</small>
                </div>
                {application.status === 'pending' && (
                  <div className="application-review-actions">
                    <button type="button" className="primary-button" disabled={busyId === application.id} onClick={() => review(application, 'approved')}>
                      {busyId === application.id ? 'Saving…' : 'Approve'}
                    </button>
                    <button type="button" className="secondary-button danger-action" disabled={busyId === application.id} onClick={() => review(application, 'rejected')}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
              <details className="application-review-details">
                <summary>Review application and documents</summary>
                <div className="application-review-grid">
                  <section>
                    <h4>Member and eligibility</h4>
                    <dl>
                      <dt>Date of birth</dt><dd>{new Date(application.dateOfBirth).toLocaleDateString('en-KE')}</dd>
                      <dt>Citizenship</dt><dd>{application.citizenship}</dd>
                      <dt>Identification</dt><dd>{application.identificationType === 'national_id' ? 'National ID' : 'Passport'} · {application.identificationNumber}</dd>
                      <dt>Residential address</dt><dd>{application.address}</dd>
                      <dt>KRA PIN</dt><dd>{application.kraPin}</dd>
                      <dt>Membership type</dt><dd>{membershipLabel(application.membershipType)}</dd>
                      {application.commonBondDetails && <><dt>Common bond</dt><dd>{application.commonBondDetails}</dd></>}
                    </dl>
                  </section>
                  <section>
                    <h4>Next of kin</h4>
                    <dl>
                      <dt>Name</dt><dd>{application.nextOfKinName}</dd>
                      <dt>Relationship</dt><dd>{application.nextOfKinRelationship}</dd>
                      <dt>Phone</dt><dd>{application.nextOfKinPhone}</dd>
                    </dl>
                    <h4>Income details</h4>
                    <dl>
                      <dt>Employment</dt><dd>{employmentLabel(application.employmentStatus)}</dd>
                      <dt>Occupation/source</dt><dd>{application.occupation}</dd>
                      {application.employerName && <><dt>Employer</dt><dd>{application.employerName}</dd></>}
                      <dt>Monthly income</dt><dd>KES {application.monthlyIncome.toLocaleString('en-KE')}</dd>
                    </dl>
                  </section>
                  <section className="application-review-wide">
                    <h4>Application statement</h4>
                    <p>{application.applicationStatement}</p>
                    <h4>Supporting documents</h4>
                    <div className="application-document-actions">
                      {Object.entries({ passport: 'Passport photograph', kraPin: 'KRA PIN document', identification: 'Identification document' }).map(([type, label]) => (
                        <button key={type} type="button" className="table-action" disabled={!application.documents[type]} onClick={() => downloadDocument(application, type)}>
                          Download {label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
                {application.reviewNote && <div className="alert signup-notice">Review note: {application.reviewNote}</div>}
              </details>
            </article>
          ))}
          {!applications.length && <div className="empty-state">There are no membership applications to review.</div>}
        </div>
      )}
    </section>
  );
}
