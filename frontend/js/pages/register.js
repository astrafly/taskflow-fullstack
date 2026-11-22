import { register } from '../auth.js';
import { ApiError } from '../api.js';
import { setFieldErrors, setBusy } from '../ui.js';

const form = document.querySelector('#register-form');
const submit = form.querySelector('button[type="submit"]');
const formError = document.querySelector('#form-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldErrors(form);
  formError.textContent = '';

  const name = form.elements.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  // Quick client-side checks; the server checks again (never trust the browser alone).
  const clientErrors = [];
  if (name.length < 2) clientErrors.push({ field: 'name', msg: 'Name must be at least 2 characters' });
  if (!/^\S+@\S+\.\S+$/.test(email)) clientErrors.push({ field: 'email', msg: 'Enter a valid email' });
  if (password.length < 8) clientErrors.push({ field: 'password', msg: 'Password must be at least 8 characters' });
  if (clientErrors.length) return setFieldErrors(form, clientErrors);

  setBusy(submit, true, 'Creating account...');
  try {
    await register(name, email, password);
    location.href = 'dashboard.html';
  } catch (err) {
    formError.textContent = err instanceof ApiError ? err.message : 'Something went wrong';
    setFieldErrors(form, err.errors);
  } finally {
    setBusy(submit, false);
  }
});
