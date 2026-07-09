const BASE = "http://localhost:8080/api";

/* ──────────────────────────────────────────────────────────────
   LOCAL (OFFLINE) AUTH FALLBACK
   When backend is unreachable, store users in localStorage.
   This lets the app work completely offline.
────────────────────────────────────────────────────────────── */
const LOCAL_KEY = 'ws_local_users';

const getLocalUsers = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); } catch { return {}; }
};
const saveLocalUsers = (u) => localStorage.setItem(LOCAL_KEY, JSON.stringify(u));

const localAuth = {
  register: (username, password, name, gender, age) => {
    const users = getLocalUsers();
    if (users[username]) throw new Error('Username already taken!');
    const user = { username, password, name: name || username, gender: gender || 'other', age: age || 8 };
    users[username] = user;
    saveLocalUsers(users);
    return { ...user, token: `local_${username}_${Date.now()}` };
  },
  login: (username, password) => {
    const users = getLocalUsers();
    const u = users[username];
    if (!u) throw new Error('Username not found! Please create an account first.');
    if (u.password !== password) throw new Error('Wrong password! Try again.');
    return { ...u, token: `local_${username}_${Date.now()}` };
  },
};

/* ──────────────────────────────────────────────────────────────
   BACKEND CHECK
────────────────────────────────────────────────────────────── */
const isBackendOnline = async () => {
  try {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '__ping__', password: '__ping__' }),
      signal: AbortSignal.timeout(2500),
    });
    return r.status !== 0; // any response (even 401) = online
  } catch { return false; }
};

/* ──────────────────────────────────────────────────────────────
   PUBLIC API
────────────────────────────────────────────────────────────── */
export const authApi = {
  login: async (username, password) => {
    // Try backend first
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return res.json();
      // Backend responded but credentials wrong
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    } catch (e) {
      // If network error (backend offline), use local fallback
      if (e.name === 'TypeError' || e.name === 'AbortError' || e.message?.includes('fetch')) {
        console.warn('Backend offline — using local auth');
        return localAuth.login(username, password);
      }
      throw e;
    }
  },

  register: async (username, password, name, gender, age) => {
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, gender, age }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return res.json();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    } catch (e) {
      if (e.name === 'TypeError' || e.name === 'AbortError' || e.message?.includes('fetch')) {
        console.warn('Backend offline — using local auth');
        return localAuth.register(username, password, name, gender, age);
      }
      throw e;
    }
  },
};
