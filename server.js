import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = join(__dirname, 'data');
const BOUNDARY_FILE = join(DATA_DIR, 'boundary.json');
const USERS_FILE = join(DATA_DIR, 'users.json');
const CHANGELOG_FILE = join(DATA_DIR, 'changelog.json');

try { mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(join(__dirname, 'dist')));

// --- Helpers ---

function hashPassword(password, salt) {
  return createHash('sha256').update(password + salt).digest('hex');
}

function loadJSON(file, fallback) {
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {}
  return fallback;
}

function saveJSON(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

function getUsers() { return loadJSON(USERS_FILE, { users: [] }); }
function saveUsers(data) { saveJSON(USERS_FILE, data); }

function getChangelog() { return loadJSON(CHANGELOG_FILE, { entries: [] }); }
function addChangelogEntry(entry) {
  const log = getChangelog();
  log.entries.unshift({ ...entry, timestamp: new Date().toISOString() });
  // Keep last 200 entries
  if (log.entries.length > 200) log.entries = log.entries.slice(0, 200);
  saveJSON(CHANGELOG_FILE, log);
}

// Session tokens — in-memory (cleared on server restart, users just re-login)
const sessions = new Map();

function createSession(user) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, {
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: Date.now()
  });
  return token;
}

function getSession(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  // Expire after 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function requireAuth(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Not logged in' });
    return null;
  }
  return session;
}

function requireAdmin(req, res) {
  const session = requireAuth(req, res);
  if (!session) return null;
  if (session.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return session;
}

// --- Bootstrap: create default admin if no users exist ---
function ensureAdminExists() {
  const data = getUsers();
  if (data.users.length === 0) {
    const salt = randomBytes(16).toString('hex');
    data.users.push({
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
      passwordHash: hashPassword('admin', salt),
      salt,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    });
    saveUsers(data);
    console.log('Default admin account created (username: admin, password: admin)');
    console.log('IMPORTANT: Change the admin password after first login!');
  }
}
ensureAdminExists();

// =============================================
// AUTH ROUTES
// =============================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const data = getUsers();
  const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = createSession(user);
  addChangelogEntry({ action: 'login', user: user.displayName, detail: `${user.displayName} logged in` });

  res.json({
    token,
    user: { username: user.username, displayName: user.displayName, role: user.role }
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// GET /api/auth/me — check current session
app.get('/api/auth/me', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user: { username: session.username, displayName: session.displayName, role: session.role } });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', (req, res) => {
  const session = requireAuth(req, res);
  if (!session) return;

  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const data = getUsers();
  const user = data.users.find(u => u.username === session.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Verify current password
  if (hashPassword(currentPassword, user.salt) !== user.passwordHash) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newSalt = randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.salt = newSalt;
  saveUsers(data);

  addChangelogEntry({ action: 'password_change', user: session.displayName, detail: `${session.displayName} changed their password` });
  res.json({ success: true });
});

// =============================================
// ADMIN: USER MANAGEMENT
// =============================================

// GET /api/admin/users — list all users
app.get('/api/admin/users', (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;

  const data = getUsers();
  // Don't send password hashes
  const safeUsers = data.users.map(u => ({
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    createdAt: u.createdAt,
    createdBy: u.createdBy
  }));
  res.json({ users: safeUsers });
});

// POST /api/admin/users — create a new user (admin only)
app.post('/api/admin/users', (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;

  const { username, displayName, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const data = getUsers();
  if (data.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const salt = randomBytes(16).toString('hex');
  const newUser = {
    username: username.toLowerCase(),
    displayName: displayName || username,
    role: role === 'admin' ? 'admin' : 'user',
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: new Date().toISOString(),
    createdBy: session.displayName
  };

  data.users.push(newUser);
  saveUsers(data);

  addChangelogEntry({
    action: 'user_created',
    user: session.displayName,
    detail: `${session.displayName} created account for ${newUser.displayName} (${newUser.role})`
  });

  res.json({
    success: true,
    user: { username: newUser.username, displayName: newUser.displayName, role: newUser.role }
  });
});

// DELETE /api/admin/users/:username — delete a user (admin only)
app.delete('/api/admin/users/:username', (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;

  const target = req.params.username.toLowerCase();
  if (target === session.username) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const data = getUsers();
  const idx = data.users.findIndex(u => u.username === target);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const removed = data.users.splice(idx, 1)[0];
  saveUsers(data);

  addChangelogEntry({
    action: 'user_deleted',
    user: session.displayName,
    detail: `${session.displayName} deleted account for ${removed.displayName}`
  });

  res.json({ success: true });
});

// POST /api/admin/users/:username/reset-password — reset a user's password (admin only)
app.post('/api/admin/users/:username/reset-password', (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const data = getUsers();
  const user = data.users.find(u => u.username === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newSalt = randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.salt = newSalt;
  saveUsers(data);

  addChangelogEntry({
    action: 'password_reset',
    user: session.displayName,
    detail: `${session.displayName} reset password for ${user.displayName}`
  });

  res.json({ success: true });
});

// =============================================
// CHANGELOG
// =============================================

// GET /api/changelog — get recent changes
app.get('/api/changelog', (req, res) => {
  const session = requireAuth(req, res);
  if (!session) return;
  res.json(getChangelog());
});

// =============================================
// BOUNDARY ROUTES (now with auth)
// =============================================

app.get('/api/boundary', (req, res) => {
  try {
    if (existsSync(BOUNDARY_FILE)) {
      const data = JSON.parse(readFileSync(BOUNDARY_FILE, 'utf8'));
      if (data.lock && data.lock.lockedAt) {
        const elapsed = Date.now() - new Date(data.lock.lockedAt).getTime();
        if (elapsed > 30 * 60 * 1000) {
          data.lock = null;
          writeFileSync(BOUNDARY_FILE, JSON.stringify(data, null, 2));
        }
      }
      res.json(data);
    } else {
      res.json({ vertices: null, lock: null, savedAt: null, savedBy: null });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load boundary' });
  }
});

app.post('/api/boundary', (req, res) => {
  const session = requireAuth(req, res);
  if (!session) return;

  try {
    const { vertices, parcelsInsideCount } = req.body;
    if (!vertices || !Array.isArray(vertices) || vertices.length < 3) {
      return res.status(400).json({ error: 'Invalid boundary data' });
    }

    let existing = {};
    if (existsSync(BOUNDARY_FILE)) {
      existing = JSON.parse(readFileSync(BOUNDARY_FILE, 'utf8'));
    }

    if (existing.lock && existing.lock.lockedBy !== session.displayName) {
      const elapsed = Date.now() - new Date(existing.lock.lockedAt).getTime();
      if (elapsed < 30 * 60 * 1000) {
        return res.status(423).json({
          error: `Boundary is locked by ${existing.lock.lockedBy}`,
          lock: existing.lock
        });
      }
    }

    const data = {
      vertices,
      savedAt: new Date().toISOString(),
      savedBy: session.displayName,
      parcelsInsideCount: parcelsInsideCount || 0,
      lock: null
    };

    writeFileSync(BOUNDARY_FILE, JSON.stringify(data, null, 2));

    addChangelogEntry({
      action: 'boundary_saved',
      user: session.displayName,
      detail: `${session.displayName} saved boundary (${vertices.length} vertices, ${parcelsInsideCount} parcels)`
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save boundary' });
  }
});

app.post('/api/boundary/lock', (req, res) => {
  const session = requireAuth(req, res);
  if (!session) return;

  try {
    const { action } = req.body;
    let data = loadJSON(BOUNDARY_FILE, {});

    if (action === 'lock') {
      if (data.lock && data.lock.lockedBy !== session.displayName) {
        const elapsed = Date.now() - new Date(data.lock.lockedAt).getTime();
        if (elapsed < 30 * 60 * 1000) {
          return res.status(423).json({
            error: `Already locked by ${data.lock.lockedBy}`,
            lock: data.lock
          });
        }
      }
      data.lock = { lockedBy: session.displayName, lockedAt: new Date().toISOString() };

      addChangelogEntry({
        action: 'boundary_locked',
        user: session.displayName,
        detail: `${session.displayName} locked boundary for editing`
      });
    } else if (action === 'unlock') {
      data.lock = null;
      addChangelogEntry({
        action: 'boundary_unlocked',
        user: session.displayName,
        detail: `${session.displayName} unlocked boundary`
      });
    }

    saveJSON(BOUNDARY_FILE, data);
    res.json({ success: true, lock: data.lock });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lock' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Southborough DIF server running on port ${PORT}`);
});
