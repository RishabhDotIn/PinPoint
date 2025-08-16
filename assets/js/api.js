// assets/js/api.js
// API client for OTP service and PinPoint backend
const OTP_API_BASE = 'https://emailvalidator-g7gq.onrender.com';
const BACKEND_BASE = '/'; // if deploying backend separately, set full URL e.g., 'https://pinpoint-api.onrender.com'

let accessToken = sessionStorage.getItem('accessToken') || null;

function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem('accessToken', token);
  else sessionStorage.removeItem('accessToken');
}

async function requestOtp(email) {
  const r = await fetch(`${OTP_API_BASE}/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
  return r.json();
}

async function verifyOtp(email, otp) {
  const r = await fetch(`${OTP_API_BASE}/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });
  const data = await r.json();
  if (data && data.accessToken) setAccessToken(data.accessToken);
  return data;
}

async function refreshToken() {
  const r = await fetch(`${OTP_API_BASE}/v1/auth/refresh`, { method: 'POST', credentials: 'include' });
  const data = await r.json();
  if (data && data.accessToken) setAccessToken(data.accessToken);
  return data;
}

async function authFetch(url, options = {}) {
  const opts = { ...options, credentials: 'include', headers: { ...(options.headers || {}) } };
  if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`;
  let res = await fetch(url, opts);
  if (res.status === 401) {
    const ref = await refreshToken();
    if (ref && ref.accessToken) {
      opts.headers.Authorization = `Bearer ${ref.accessToken}`;
      res = await fetch(url, opts);
    }
  }
  return res;
}

export const Api = {
  setAccessToken,
  requestOtp,
  verifyOtp,
  refreshToken,
  getMe: async () => (await authFetch(`${BACKEND_BASE}v1/me`)).json(),
  updateMe: async (payload) => (await authFetch(`${BACKEND_BASE}v1/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  getCampuses: async (q) => (await authFetch(`${BACKEND_BASE}v1/campuses${q ? `?q=${encodeURIComponent(q)}` : ''}`)).json(),
  logout: async () => fetch(`${OTP_API_BASE}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
};
