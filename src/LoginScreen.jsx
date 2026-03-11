import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('dif-token', data.token);
        localStorage.setItem('dif-user', JSON.stringify(data.user));
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', padding: '40px', width: '380px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            SOUTHBOROUGH DIF
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Route 9 Corridor Proposal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: '8px', fontSize: '13px', color: '#991b1b', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#1e40af',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          Contact your administrator for account access
        </div>
      </div>
    </div>
  );
}
