import { login } from '../auth.js';
import { ApiError } from '../api.js';
import { setFieldErrors, setBusy } from '../ui.js';

if (localStorage.getItem('token')) location.href = 'dashboard.html';

const form = document.querySelector('#login-form');
const submit = form.querySelector('button[type="submit"]');
const formError = document.querySelector('#form-error');

document.querySelector('#show-pass').addEventListener('change', (e) => {
  document.querySelector('#password').type = e.target.checked ? 'text' : 'password';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value;
  setFieldErrors(form);
  formError.textContent = '';

  if (!email || !password) {
    setFieldErrors(form, [
      { field: 'email', msg: email ? '' : 'Email is required' },
      { field: 'password', msg: password ? '' : 'Password is required' },
    ]);
    return;
  }

  setBusy(submit, true, 'Logging in...');
  try {
    await login(email, password);
    location.href = 'dashboard.html';
  } catch (err) {
    formError.textContent = err instanceof ApiError ? err.message : 'Something went wrong';
    setFieldErrors(form, err.errors);
  } finally {
    setBusy(submit, false);
  }
});
