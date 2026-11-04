import React, { useCallback, useEffect, useState } from 'react';
import { apiRequest, dateTime } from './api.js';

export default function StaffAccess({ user }) {
  const [roles, setRoles] = useState([]);
  const [permissionCatalog, setPermissionCatalog] = useState({});
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadStaff = useCallback(async () => {
    setError('');
    try {
      const [roleData, userData] = await Promise.all([
        apiRequest('/staff/roles'),
        apiRequest('/staff/users'),
      ]);
      setRoles(roleData.roles);
      setPermissionCatalog(roleData.permissionCatalog);
      setUsers(userData.users);
    } catch (requestError) {
      if (requestError.status === 401) window.dispatchEvent(new Event('sacco:unauthorized'));
      setError(requestError.message);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthError('');
    try {
      setHealth(await apiRequest('/health'));
    } catch (requestError) {
      setHealth(null);
      setHealthError(requestError.message);
    }
  }, []);

  useEffect(() => {
    loadStaff();
    loadHealth();
  }, [loadStaff, loadHealth]);

  async function createStaff(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    setTemporaryPassword('');
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      const result = await apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify({
          fullName: values.get('fullName'),
          email: values.get('email'),
          role: values.get('role'),
        }),
      });
      setTemporaryPassword(result.temporaryPassword);
      setMessage(`Created ${result.user.fullName}'s ${result.user.role.replaceAll('_', ' ')} account.`);
      form.reset();
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(staffUser) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest(`/staff/${staffUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !staffUser.isActive }),
      });
      setMessage(`${staffUser.fullName}'s account is ${staffUser.isActive ? 'disabled' : 'enabled'}.`);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(staffUser, role) {
    if (role === staffUser.role) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest(`/staff/${staffUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setMessage(`${staffUser.fullName}'s role was updated. Their active session has been revoked.`);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
      await loadStaff();
    } finally {
      setBusy(false);
    }
  }

  async function savePermissions(staffUser, permissions = selectedPermissions) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest(`/staff/${staffUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissionOverrides: permissions }),
      });
      setMessage(`${staffUser.fullName}'s permissions were updated. Their active session has been revoked.`);
      setEditingUserId(null);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function resetPermissions(staffUser) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest(`/staff/${staffUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissionOverrides: null }),
      });
      setMessage(`${staffUser.fullName}'s role defaults have been restored.`);
      setEditingUserId(null);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyTemporaryPassword() {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setMessage('Temporary password copied. Share it directly and securely with the new staff member.');
    } catch {
      setError('Clipboard access is unavailable. Select and copy the temporary password manually.');
    }
  }

  const isSuperAdmin = user.role === 'super_admin';
  const canManageStaff = isSuperAdmin || user.permissions?.includes('*') || user.permissions?.includes('staff.manage');
  const selectableRoles = roles.filter((role) => (
    role.id !== 'member' && (isSuperAdmin || !['admin', 'super_admin'].includes(role.id))
  ));
  const editableStaffUser = users.find((staffUser) => staffUser.id === editingUserId);

  return (
    <section className="management-page">
      <div className="management-heading">
        <div>
          <div className="eyebrow">Access control</div>
          <h2>Staff access</h2>
          <p>{isSuperAdmin
            ? 'Highest-trust access: manage staff roles, set individual API permissions, disable accounts, and restore role defaults.'
            : 'Manage permitted staff accounts. Administrator roles and individual permission overrides require a super administrator.'}</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => { loadStaff(); loadHealth(); }}>Refresh</button>
      </div>

      {error && <div className="alert error-alert" role="alert">{error}</div>}
      {message && <div className="alert signup-notice" role="status">{message}</div>}
      {user.role === 'it_support' && (
        <article className="panel application-section">
          <h3>System health</h3>
          {healthError
            ? <div className="alert error-alert" role="alert">{healthError}</div>
            : <p>API: <strong>{health?.status || 'Checking…'}</strong> · Database: <strong>{health?.database || 'Checking…'}</strong></p>}
        </article>
      )}

      {canManageStaff && (
        <article className="panel application-section">
          <h3>Create staff account</h3>
          <p className="application-help">A strong one-time password is generated by the server. It is shown only once, and the staff member must replace it at first sign-in.</p>
          <form className="application-grid" onSubmit={createStaff}>
            <label className="form-field">Full name
              <input name="fullName" minLength={2} maxLength={120} required />
            </label>
            <label className="form-field">Work email
              <input name="email" type="email" maxLength={254} required />
            </label>
            <label className="form-field">Role
              <select name="role" required defaultValue="cashier">
                {selectableRoles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
            </label>
            <button type="submit" className="primary-button" disabled={busy || !selectableRoles.length}>
              {busy ? 'Saving…' : 'Create staff account'}
            </button>
          </form>
          {temporaryPassword && (
            <div className="alert signup-notice" role="status">
              <strong>Temporary password — share securely now; it will not be shown again.</strong>
              <p><code>{temporaryPassword}</code></p>
              <button type="button" className="secondary-button" onClick={copyTemporaryPassword}>Copy password</button>
            </div>
          )}
        </article>
      )}

      <article className="panel table-wrap">
        <div className="panel-head"><h3>Staff accounts</h3></div>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Password</th><th>Created</th>{canManageStaff && <th>Action</th>}</tr></thead>
          <tbody>{users.filter((staffUser) => staffUser.role !== 'member').map((staffUser) => (
            <tr key={staffUser.id}>
              <td className="member-name">{staffUser.fullName}</td>
              <td>{staffUser.email}</td>
              <td>{canManageStaff && (isSuperAdmin || !['admin', 'super_admin'].includes(staffUser.role))
                ? <select aria-label={`Role for ${staffUser.fullName}`} value={staffUser.role} disabled={busy} onChange={(event) => changeRole(staffUser, event.target.value)}>
                  {selectableRoles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
                </select>
                : roles.find((role) => role.id === staffUser.role)?.label || staffUser.role}</td>
              <td><span className={`status-badge ${staffUser.isActive ? 'status-active' : 'status-inactive'}`}>{staffUser.isActive ? 'Active' : 'Disabled'}</span></td>
              <td>{staffUser.passwordChangeRequired ? 'Change required' : 'Set'}</td>
              <td>{dateTime(staffUser.createdAt)}</td>
              {canManageStaff && <td>
                {isSuperAdmin && staffUser.id !== user.id && staffUser.role !== 'super_admin' && (
                  <button type="button" className="table-action" disabled={busy} onClick={() => {
                    setEditingUserId(staffUser.id);
                    setSelectedPermissions(staffUser.permissions);
                  }}>Set access</button>
                )}
                {(isSuperAdmin || !['admin', 'super_admin'].includes(staffUser.role)) && (
                  <button type="button" className="table-action" disabled={busy || staffUser.id === user.id} onClick={() => toggleStatus(staffUser)}>
                    {staffUser.isActive ? 'Disable' : 'Enable'}
                  </button>
                )}
              </td>}
            </tr>
          ))}</tbody>
        </table>
        {!users.length && <div className="empty-state">No staff accounts found.</div>}
      </article>

      {isSuperAdmin && editableStaffUser && editableStaffUser.role !== 'super_admin' && (
        <article className="panel application-section">
          <div className="panel-head">
            <h3>Access for {editableStaffUser.fullName}</h3>
            <button type="button" className="link-button" onClick={() => setEditingUserId(null)}>Close</button>
          </div>
          <p className="application-help">Choose the exact API capabilities this person needs. Unchecked capabilities are denied even if the role normally includes them.</p>
          <div className="application-grid">
            {Object.entries(permissionCatalog).map(([permission, label]) => (
              <label className="application-consent" key={permission}>
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={(event) => setSelectedPermissions((current) => (
                    event.target.checked
                      ? [...current, permission]
                      : current.filter((value) => value !== permission)
                  ))}
                />
                <span><strong>{label}</strong><br /><code>{permission}</code></span>
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" disabled={busy} onClick={() => resetPermissions(editableStaffUser)}>Restore role defaults</button>
            <button type="button" className="primary-button" disabled={busy} onClick={() => savePermissions(editableStaffUser)}>Save access</button>
          </div>
        </article>
      )}

      <div className="insight-cards">
        {roles.filter((role) => role.id !== 'member').map((role) => (
          <article className="panel" key={role.id}>
            <strong>{role.label}</strong>
            <p>{role.description}</p>
            <small>{role.permissions.includes('*') ? 'All permissions' : role.permissions.join(' · ')}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
