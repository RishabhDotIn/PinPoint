// assets/js/api.js
// API client for PinPoint backend (password-based auth)
const BACKEND_BASE = 'https://pinpoint-49yg.onrender.com/';

let accessToken = sessionStorage.getItem('accessToken') || null;

function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem('accessToken', token);
  else sessionStorage.removeItem('accessToken');
}

function clearAccessToken() {
  setAccessToken(null);
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
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    const ref = await refreshToken();
    if (ref && ref.accessToken) {
      opts.headers.Authorization = `Bearer ${ref.accessToken}`;
      res = await fetch(url, opts);
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      clearAccessToken();
    }
  }
  return res;
}

export const Api = {
  setAccessToken,
  clearAccessToken,
  checkEmail,
  register,
  login,
  refreshToken,
  getMe: async () => (await authFetch(`${BACKEND_BASE}v1/me`)).json(),
  updateMe: async (payload) => (await authFetch(`${BACKEND_BASE}v1/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  getCampuses: async (q) => (await authFetch(`${BACKEND_BASE}v1/campuses${q ? `?q=${encodeURIComponent(q)}` : ''}`)).json(),
  logout: async () => fetch(`${BACKEND_BASE}v1/auth/logout`, { method: 'POST', credentials: 'include' }),
  // Posts API
  getPosts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.campusId) query.append('campusId', params.campusId);
    if (params.status) query.append('status', params.status);
    if (params.bounds) query.append('bounds', JSON.stringify(params.bounds));
    return (await authFetch(`${BACKEND_BASE}v1/posts${query.toString() ? `?${query.toString()}` : ''}`)).json();
  },
  getPost: async (id) => (await authFetch(`${BACKEND_BASE}v1/posts/${id}`)).json(),
  createPost: async (payload) => (await authFetch(`${BACKEND_BASE}v1/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  updatePost: async (id, payload) => (await authFetch(`${BACKEND_BASE}v1/posts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  // Messages API
  getMessages: async (postId) => (await authFetch(`${BACKEND_BASE}v1/messages/${postId}`)).json(),
  sendMessage: async (payload) => (await authFetch(`${BACKEND_BASE}v1/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json(),
  markMessageRead: async (messageId) => (await authFetch(`${BACKEND_BASE}v1/messages/${messageId}/read`, { method: 'PATCH' })).json()
};
