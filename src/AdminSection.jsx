import React, { useState, useEffect } from 'react';

export default function AdminSection({ token }) {
  const [users, setUsers] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [tab, setTab] = useState('users');
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', displayName: '', password: '', role: 'user' });
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const flash = (msg, isError) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000); }
    else { setMessage(msg); setTimeout(() => setMessage(''), 4000); }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers });
      if (res.ok) { const data = await res.json(); setUsers(data.users); }
    } catch {}
  };

  const loadChangelog = async () => {
    try {
      const res = await fetch('/api/changelog', { headers });
      if (res.ok) { const data = await res.json(); setChangelog(data.entries || []); }
    } catch {}
  };

  useEffect(() => { loadUsers(); loadChangelog(); }, []);

  const createUser = async () => {
    if (!newUser.username || !newUser.password) { flash('Username and password required', true); return; }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers, body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        flash(`Account created for ${data.user.displayName}`);
        setNewUser({ username: '', displayName: '', password: '', role: 'user' });
        setShowCreate(false);
        loadUsers();
      } else {
        flash(data.error, true);
      }
    } catch { flash('Failed to create user', true); }
  };

  const deleteUser = async (username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${username}`, { method: 'DELETE', headers });
      if (res.ok) { flash('User deleted'); loadUsers(); }
      else { const d = await res.json(); flash(d.error, true); }
    } catch { flash('Failed to delete', true); }
  };

  const doResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 4) { flash('Password must be at least 4 characters', true); return; }
    try {
      const res = await fetch(`/api/admin/users/${resetTarget}/reset-password`, {
        method: 'POST', headers, body: JSON.stringify({ newPassword: resetPassword })
      });
      if (res.ok) { flash('Password reset'); setResetTarget(null); setResetPassword(''); }
      else { const d = await res.json(); flash(d.error, true); }
    } catch { flash('Failed to reset password', true); }
  };

  const s = {
    card: { background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    header: { padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
    btnPrimary: { padding: '8px 16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
    btnDanger: { padding: '6px 12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
    btnGhost: { padding: '6px 12px', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Administration</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['users', 'changelog'].map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === 'changelog') loadChangelog(); }}
            style={{
              padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: tab === t ? '1px solid #1e40af' : '1px solid #e2e8f0',
              background: tab === t ? '#1e40af' : 'white',
              color: tab === t ? 'white' : '#475569'
            }}>
            {t === 'users' ? 'User Accounts' : 'Change Log'}
          </button>
        ))}
      </div>

      {/* Messages */}
      {message && <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '8px', fontSize: '13px', color: '#065f46', marginBottom: '16px' }}>{message}</div>}
      {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', color: '#991b1b', marginBottom: '16px' }}>{error}</div>}

      {/* Users Tab */}
      {tab === 'users' && (
        <div style={s.card}>
          <div style={s.header}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>User Accounts ({users.length})</span>
            <button onClick={() => setShowCreate(!showCreate)} style={s.btnPrimary}>
              {showCreate ? 'Cancel' : '+ Create User'}
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Username *</label>
                  <input style={s.input} placeholder="e.g. jsmith" value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Display Name</label>
                  <input style={s.input} placeholder="e.g. John Smith" value={newUser.displayName}
                    onChange={e => setNewUser({ ...newUser, displayName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Password *</label>
                  <input style={s.input} type="password" placeholder="Min 4 characters" value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Role</label>
                  <select style={s.input} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button onClick={createUser} style={s.btnPrimary}>Create Account</button>
            </div>
          )}

          {/* User list */}
          {users.map(u => (
            <div key={u.username} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                  {u.displayName}
                  {u.role === 'admin' && <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>Admin</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  @{u.username} &bull; Created {new Date(u.createdAt).toLocaleDateString()} by {u.createdBy}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {resetTarget === u.username ? (
                  <>
                    <input style={{ ...s.input, width: '140px' }} type="password" placeholder="New password"
                      value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                    <button onClick={doResetPassword} style={s.btnPrimary}>Set</button>
                    <button onClick={() => { setResetTarget(null); setResetPassword(''); }} style={s.btnGhost}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setResetTarget(u.username)} style={s.btnGhost}>Reset Password</button>
                    <button onClick={() => deleteUser(u.username)} style={s.btnDanger}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Changelog Tab */}
      {tab === 'changelog' && (
        <div style={s.card}>
          <div style={s.header}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Recent Changes</span>
            <button onClick={loadChangelog} style={s.btnGhost}>Refresh</button>
          </div>
          {changelog.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No changes recorded yet</div>
          ) : (
            changelog.slice(0, 50).map((entry, i) => {
              const icons = {
                login: '🔑', boundary_saved: '🗺️', boundary_locked: '🔒', boundary_unlocked: '🔓',
                user_created: '👤', user_deleted: '❌', password_change: '🔐', password_reset: '🔐'
              };
              return (
                <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', marginTop: '2px' }}>{icons[entry.action] || '📝'}</span>
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a' }}>{entry.detail}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
