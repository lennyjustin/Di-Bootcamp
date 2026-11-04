import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, dateTime } from './api.js';

export default function AuditTrail() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/audit?limit=100');
      setEvents(result.events);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Accountability</div>
          <h2>Audit trail</h2>
          <p>Authenticated staff operations and sensitive record access. Request details and financial data are intentionally excluded.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadEvents} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="alert error-alert" role="alert">{error}</div>}
      <article className="panel table-wrap">
        {loading ? <div className="empty-state">Loading audit history…</div> : (
          <table>
            <thead><tr><th>Time</th><th>Staff member</th><th>Role</th><th>Operation</th><th>Path</th><th>Result</th></tr></thead>
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
        {!loading && !events.length && <div className="empty-state">No staff activity has been recorded yet.</div>}
      </article>
      <p className="page-callout">Audit events record requests and response status, not request bodies. Retention and export rules have not been configured.</p>
    </section>
  );
}
