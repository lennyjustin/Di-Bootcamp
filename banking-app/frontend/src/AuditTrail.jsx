import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, dateTime } from './api.js';

export default function AuditTrail() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(`/audit?page=${page}&limit=100`);
      setEvents(result.events);
      setTotal(result.total);
      setHasNextPage(result.hasNextPage);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Super administrator only</div>
          <h2>Private activity report</h2>
          <p>System API activity, including reads, changes, sign-in attempts, and public requests. Request bodies and financial data are excluded.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadEvents} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="alert error-alert" role="alert">{error}</div>}
      <article className="panel table-wrap">
        {loading ? <div className="empty-state">Loading audit history…</div> : (
          <table>
            <thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Operation</th><th>Path</th><th>Result</th></tr></thead>
            <tbody>{events.map((event) => (
              <tr key={event.id}>
                <td>{dateTime(event.createdAt)}</td>
                <td className="member-name">{event.actorName}</td>
                <td>{event.actorRole.replaceAll('_', ' ')}</td>
                <td>{event.method}</td>
                <td><code>{event.path}</code></td>
                <td>{event.statusCode ?? 'In progress'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {!loading && !events.length && <div className="empty-state">No API activity has been recorded yet.</div>}
      </article>
      <div className="management-heading">
        <p className="page-callout">Showing {events.length ? (page - 1) * 100 + 1 : 0}–{Math.min(page * 100, total)} of {total} events. Retention and export rules have not been configured.</p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || page === 1}>Previous</button>
          <button type="button" className="secondary-button" onClick={() => setPage((current) => current + 1)} disabled={loading || !hasNextPage}>Next</button>
        </div>
      </div>
    </section>
  );
}
