import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import uploadRouter from './routes/upload.js';
import { startCleanupInterval } from './services/uploader.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/upload', uploadRouter);

// ── SPA fallback ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start session cleanup ────────────────────────────────────
startCleanupInterval();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 VividMusic Uploader running on http://localhost:${PORT}`);
});
