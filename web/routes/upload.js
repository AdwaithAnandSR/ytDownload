import express from 'express';
import {
  sessions,
  createSession,
  startSession,
  addSSEClient,
  removeSSEClient,
} from '../services/uploader.js';

const router = express.Router();

// ── POST /api/upload/start ────────────────────────────────────
// Body: { cloudName, apiKey, apiSecret, source, limit?, skip? }
router.post('/start', async (req, res) => {
  try {
    const {
      cloudName, apiKey, apiSecret,
      source,
      limit = 50,
      skip  = 0,
    } = req.body;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary credentials (cloudName, apiKey, apiSecret) are required.',
      });
    }
    if (!source || !source.trim()) {
      return res.status(400).json({
        success: false,
        message: 'YouTube source URL / ID is required.',
      });
    }

    const credentials = { cloudName, apiKey, apiSecret };
    const session = createSession({
      credentials,
      source:  source.trim(),
      limit:   Math.max(1, parseInt(limit, 10)  || 50),
      skip:    Math.max(0, parseInt(skip, 10)   || 0),
    });

    // Fire and forget — updates flow through SSE
    startSession(session.id).catch((err) =>
      console.error('Unhandled session error:', err),
    );

    return res.json({
      success:   true,
      sessionId: session.id,
      message:   'Upload session started.',
    });
  } catch (err) {
    console.error('[upload/start]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/upload/status/:sessionId  (SSE) ─────────────────
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Immediately send full current state
  const { credentials: _creds, ...safe } = session; // never expose credentials
  res.write(`data: ${JSON.stringify({ type: 'init', session: safe })}\n\n`);

  addSSEClient(sessionId, res);

  // Keepalive comment every 25 s
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (_) {}
  }, 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeSSEClient(sessionId, res);
  });
});

// ── GET /api/upload/session/:sessionId ───────────────────────
router.get('/session/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  const { credentials: _creds, ...safe } = session;
  return res.json({ success: true, session: safe });
});

// ── GET /api/upload/sessions ──────────────────────────────────
router.get('/sessions', (_req, res) => {
  const list = [];
  for (const [id, s] of sessions) {
    list.push({
      id,
      status:      s.status,
      source:      s.source,
      stats:       s.stats,
      startedAt:   s.startedAt,
      completedAt: s.completedAt,
      expiresAt:   s.expiresAt,
    });
  }
  return res.json({ success: true, sessions: list });
});

export default router;
