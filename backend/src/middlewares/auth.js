import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'Missing token' } });
  try {
    const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET);
    req.user = { sub: payload.sub, email: payload.email || payload.sub };
    return next();
  } catch (e) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}
