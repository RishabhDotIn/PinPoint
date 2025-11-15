import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import meRouter from './src/routes/me.js';
import campusesRouter from './src/routes/campuses.js';
import authRouter from './src/routes/auth.js';

const app = express();

// CORS - adjustable origins with wildcard support (e.g., *.vercel.app)
const allowedOriginsRaw = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const matchOrigin = (origin) => {
  if (!origin) return true; // same-origin or non-browser requests
  if (allowedOriginsRaw.length === 0) return true; // allow all if not configured
  for (const rule of allowedOriginsRaw) {
    if (!rule) continue;
    if (rule.startsWith('*.')) {
      // wildcard subdomain: *.example.com matches https://sub.example.com
      const host = rule.slice(2);
      try {
        const u = new URL(origin);
        if (u.hostname === host || u.hostname.endsWith('.' + host)) return true;
      } catch {}
    } else if (rule === origin) {
      return true;
    }
  }
  return false;
};
app.use(cors({ origin: (origin, cb) => cb(null, matchOrigin(origin)), credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Auth routes (password-based)
app.use('/v1/auth', authRouter);

// Routes
app.use('/v1/me', meRouter); // GET /v1/me, PATCH /v1/me
app.use('/v1/campuses', campusesRouter); // GET /v1/campuses

// Mongo connect
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'pinpoint' });
    const port = process.env.PORT || 10000;
    app.listen(port, () => console.log(`API listening on :${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
