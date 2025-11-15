import { Router } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

const ACCESS_TTL_SEC = 15 * 60; // 15 minutes
const REFRESH_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

function signAccessToken(email) {
  return jwt.sign({ sub: email, email }, process.env.AUTH_JWT_SECRET, { expiresIn: ACCESS_TTL_SEC });
}

function signRefreshToken(email) {
  return jwt.sign({ sub: email, typ: 'refresh' }, process.env.AUTH_REFRESH_SECRET || process.env.AUTH_JWT_SECRET, {
    expiresIn: REFRESH_TTL_SEC,
  });
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_TTL_SEC * 1000,
    path: '/v1/auth',
  });
}

// Check whether a user exists and whether a password is set
router.get('/check', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: { message: 'Email required' } });
    const user = await User.findOne({ email }).select('passwordHash _id');
    return res.json({ exists: !!user, hasPassword: !!user?.passwordHash });
  } catch (e) {
    return res.status(500).json({ error: { message: 'Check failed' } });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: { message: 'Email and password required' } });
    const pw = String(password);
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 characters and include letters and numbers' } });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing && existing.passwordHash) {
      return res.status(409).json({ error: { message: 'User already exists' } });
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase() },
      { $set: { name: name || undefined, passwordHash } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const accessToken = signAccessToken(user.email);
    const refreshToken = signRefreshToken(user.email);
    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken });
  } catch (e) {
    console.error('register failed', e);
    return res.status(500).json({ error: { message: 'Registration failed' } });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: { message: 'Email and password required' } });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const accessToken = signAccessToken(user.email);
    const refreshToken = signRefreshToken(user.email);
    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken });
  } catch (e) {
    console.error('login failed', e);
    return res.status(500).json({ error: { message: 'Login failed' } });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: { message: 'No refresh token' } });
    try {
      const payload = jwt.verify(token, process.env.AUTH_REFRESH_SECRET || process.env.AUTH_JWT_SECRET);
      if (payload?.typ !== 'refresh') throw new Error('bad');
      const accessToken = signAccessToken(payload.sub);
      return res.json({ accessToken });
    } catch (e) {
      return res.status(401).json({ error: { message: 'Invalid refresh token' } });
    }
  } catch (e) {
    return res.status(500).json({ error: { message: 'Refresh failed' } });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('refresh_token', { path: '/v1/auth' });
    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: true });
  }
});

export default router;
