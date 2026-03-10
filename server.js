import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = join(__dirname, 'data');
const BOUNDARY_FILE = join(DATA_DIR, 'boundary.json');

// Ensure data directory exists
import { mkdirSync } from 'fs';
try { mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}

app.use(express.json({ limit: '1mb' }));

// Serve the built Vite app
app.use(express.static(join(__dirname, 'dist')));

// --- API Routes ---

// GET /api/boundary — load current boundary + lock status
app.get('/api/boundary', (req, res) => {
  try {
    if (existsSync(BOUNDARY_FILE)) {
      const data = JSON.parse(readFileSync(BOUNDARY_FILE, 'utf8'));
      // Auto-expire lock after 30 minutes
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
    console.error('Error reading boundary:', err);
    res.status(500).json({ error: 'Failed to load boundary' });
  }
});

// POST /api/boundary — save boundary (requires lock or no lock active)
app.post('/api/boundary', (req, res) => {
  try {
    const { vertices, savedBy, parcelsInsideCount } = req.body;
    if (!vertices || !Array.isArray(vertices) || vertices.length < 3) {
      return res.status(400).json({ error: 'Invalid boundary data' });
    }

    let existing = {};
    if (existsSync(BOUNDARY_FILE)) {
      existing = JSON.parse(readFileSync(BOUNDARY_FILE, 'utf8'));
    }

    // Check lock
    if (existing.lock && existing.lock.lockedBy !== savedBy) {
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
      savedBy: savedBy || 'unknown',
      parcelsInsideCount: parcelsInsideCount || 0,
      lock: null // unlock on save
    };

    writeFileSync(BOUNDARY_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error saving boundary:', err);
    res.status(500).json({ error: 'Failed to save boundary' });
  }
});

// POST /api/boundary/lock — lock or unlock boundary editing
app.post('/api/boundary/lock', (req, res) => {
  try {
    const { action, lockedBy } = req.body; // action: 'lock' or 'unlock'

    let data = {};
    if (existsSync(BOUNDARY_FILE)) {
      data = JSON.parse(readFileSync(BOUNDARY_FILE, 'utf8'));
    }

    if (action === 'lock') {
      // Check if already locked by someone else (and not expired)
      if (data.lock && data.lock.lockedBy !== lockedBy) {
        const elapsed = Date.now() - new Date(data.lock.lockedAt).getTime();
        if (elapsed < 30 * 60 * 1000) {
          return res.status(423).json({
            error: `Already locked by ${data.lock.lockedBy}`,
            lock: data.lock
          });
        }
      }
      data.lock = { lockedBy, lockedAt: new Date().toISOString() };
    } else if (action === 'unlock') {
      data.lock = null;
    }

    writeFileSync(BOUNDARY_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, lock: data.lock });
  } catch (err) {
    console.error('Error updating lock:', err);
    res.status(500).json({ error: 'Failed to update lock' });
  }
});

// SPA fallback — serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Southborough DIF server running on port ${PORT}`);
});
