// API client for PinPoint backend (React version)
const BACKEND_BASE = 'https://pinpoint-49yg.onrender.com/';

let accessToken = sessionStorage.getItem('accessToken') || null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem('accessToken', token);
  else sessionStorage.removeItem('accessToken');
}

export function clearAccessToken() {
  setAccessToken(null);
}

async function authFetch(url, options = {}) {
  const opts = { ...options, credentials: 'include', headers: { ...(options.headers || {}) } };
  if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`;
  let res = await fetch(url, opts);
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    // attempt refresh
    try {
      const ref = await fetch(`${BACKEND_BASE}v1/auth/refresh`, { method: 'POST', credentials: 'include' }).then(r=>r.json());
      if (ref && ref.accessToken) {
        setAccessToken(ref.accessToken);
        opts.headers.Authorization = `Bearer ${ref.accessToken}`;
        res = await fetch(url, opts);
      } else {
        clearAccessToken();
      }
    } catch {
      clearAccessToken();
    }
  }
  return res;
}

export const Api = {
  setAccessToken,
  clearAccessToken,
  checkEmail: async (email) => (await fetch(`${BACKEND_BASE}v1/auth/check?email=${encodeURIComponent(email)}`, { method: 'GET', credentials: 'include' })).json(),
  register: async (email, password, name) => {
    const r = await fetch(`${BACKEND_BASE}v1/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password, name }) });
    const data = await r.json(); if (data && data.accessToken) setAccessToken(data.accessToken); return data;
  },
  login: async (email, password) => {
    const r = await fetch(`${BACKEND_BASE}v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
    const data = await r.json(); if (data && data.accessToken) setAccessToken(data.accessToken); return data;
  },
  refreshToken: async () => {
    const d = await fetch(`${BACKEND_BASE}v1/auth/refresh`, { method: 'POST', credentials: 'include' }).then(r=>r.json());
    if (d && d.accessToken) setAccessToken(d.accessToken); return d;
  },
  logout: async () => fetch(`${BACKEND_BASE}v1/auth/logout`, { method: 'POST', credentials: 'include' }),
  getMe: async () => (await authFetch(`${BACKEND_BASE}v1/me`)).json(),
  updateMe: async (payload) => (await authFetch(`${BACKEND_BASE}v1/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  getCampuses: async (q='') => (await authFetch(`${BACKEND_BASE}v1/campuses${q?`?q=${encodeURIComponent(q)}`:''}`)).json(),
};
