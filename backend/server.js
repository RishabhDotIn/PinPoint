import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import meRouter from './src/routes/me.js';
import campusesRouter from './src/routes/campuses.js';

const app = express();

// CORS - adjust origins as needed
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)), credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// OTP proxy to avoid browser CORS on the auth service
const OTP_UPSTREAM = process.env.OTP_UPSTREAM || 'https://emailvalidator-g7gq.onrender.com';
const forwardSetCookie = (res, upstreamRes) => {
  try {
    const cookie = upstreamRes.headers.get('set-cookie');
    if (cookie) res.set('set-cookie', cookie);
  } catch {}
};

app.post('/v1/auth/request-otp', async (req, res) => {
  try {
    const upstream = await fetch(`${OTP_UPSTREAM}/v1/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    forwardSetCookie(res, upstream);
    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('OTP proxy request-otp failed', e);
    res.status(502).json({ error: { message: 'Upstream OTP service unavailable' } });
  }
});

app.post('/v1/auth/verify-otp', async (req, res) => {
  try {
    const upstream = await fetch(`${OTP_UPSTREAM}/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    forwardSetCookie(res, upstream);
    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('OTP proxy verify-otp failed', e);
    res.status(502).json({ error: { message: 'Upstream OTP service unavailable' } });
  }
});

app.post('/v1/auth/refresh', async (req, res) => {
  try {
    const upstream = await fetch(`${OTP_UPSTREAM}/v1/auth/refresh`, { method: 'POST' });
    forwardSetCookie(res, upstream);
    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('OTP proxy refresh failed', e);
    res.status(502).json({ error: { message: 'Upstream OTP service unavailable' } });
  }
});

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
