// assets/js/api.js
// API client for PinPoint backend (password-based auth)
const BACKEND_BASE = 'https://pinpoint-49yg.onrender.com/'; // Render backend base URL

let accessToken = sessionStorage.getItem('accessToken') || null;

function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem('accessToken', token);
  else sessionStorage.removeItem('accessToken');
}

async function checkEmail(email) {
  const r = await fetch(`${BACKEND_BASE}v1/auth/check?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    credentials: 'include'
  });
  return r.json();
}

async function register(email, password, name) {
  const r = await fetch(`${BACKEND_BASE}v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, name })
  });
  const data = await r.json();
  if (data && data.accessToken) setAccessToken(data.accessToken);
  return data;
}

async function login(email, password) {
  const r = await fetch(`${BACKEND_BASE}v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const data = await r.json();
  if (data && data.accessToken) setAccessToken(data.accessToken);
  return data;
}

async function refreshToken() {
  const r = await fetch(`${BACKEND_BASE}v1/auth/refresh`, { method: 'POST', credentials: 'include' });
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
  checkEmail,
  register,
  login,
  refreshToken,
  getMe: async () => (await authFetch(`${BACKEND_BASE}v1/me`)).json(),
  updateMe: async (payload) => (await authFetch(`${BACKEND_BASE}v1/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  getCampuses: async (q) => (await authFetch(`${BACKEND_BASE}v1/campuses${q ? `?q=${encodeURIComponent(q)}` : ''}`)).json(),
  logout: async () => fetch(`${BACKEND_BASE}v1/auth/logout`, { method: 'POST', credentials: 'include' })
};
