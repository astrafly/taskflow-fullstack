// One place for every network call. Adds the token and handles errors.
import { API_URL } from './config.js';

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api(path, { method = 'GET', body, isForm = false } = {}) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  const data = await res.json().catch(() => ({}));

  // Token expired or invalid: clear the session and go to login.
  if (res.status === 401 && token) {
    localStorage.clear();
    if (!location.pathname.endsWith('login.html')) location.href = 'login.html';
  }

  if (!res.ok) throw new ApiError(data.message || 'Something went wrong', res.status, data.errors);
  return data;
}
