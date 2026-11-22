import { api } from './api.js';

export async function login(email, password) {
  const { data } = await api('/auth/login', { method: 'POST', body: { email, password } });
  saveSession(data);
}

export async function register(name, email, password) {
  const { data } = await api('/auth/register', { method: 'POST', body: { name, email, password } });
  saveSession(data);
}

function saveSession(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function logout() {
  localStorage.clear();
  location.href = 'login.html';
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

// Call at the top of every private page. Redirects guests to login,
// and non-admins away from admin-only pages.
export function requireAuth(role) {
  const user = getUser();
  if (!user || !localStorage.getItem('token')) {
    location.href = 'login.html';
    return false;
  }
  if (role && user.role !== role) {
    location.href = '404.html';
    return false;
  }
  return true;
}

// Refresh the cached user from the server (e.g. after a profile change).
export async function refreshUser() {
  const { data } = await api('/auth/me');
  localStorage.setItem('user', JSON.stringify(data));
  return data;
}
