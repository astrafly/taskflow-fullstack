import { requireAuth, getUser, refreshUser } from '../auth.js';
import { api, ApiError } from '../api.js';
import { renderNav } from '../nav.js';
import { setFieldErrors, setBusy, toast } from '../ui.js';
import { SERVER_URL } from '../config.js';

const profileForm = document.querySelector('#profile-form');
const passwordForm = document.querySelector('#password-form');
const preview = document.querySelector('#avatar-preview');

function showAvatar(path) {
  preview.src = path
    ? `${SERVER_URL}${path}`
    : 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#dde3ec"/><text x="40" y="50" font-size="32" text-anchor="middle" fill="#1f3a5f">?</text></svg>'
      );
}

async function init() {
  const user = getUser();
  profileForm.elements.name.value = user.name;
  showAvatar(user.avatar);
  try {
    const fresh = await refreshUser();
    profileForm.elements.name.value = fresh.name;
    showAvatar(fresh.avatar);
  } catch { /* keep cached values */ }
}

// Preview the chosen picture before uploading.
profileForm.elements.avatar.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) preview.src = URL.createObjectURL(file);
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldErrors(profileForm);
  const submit = profileForm.querySelector('button[type="submit"]');

  const formData = new FormData();
  formData.append('name', profileForm.elements.name.value.trim());
  const file = profileForm.elements.avatar.files[0];
  if (file) formData.append('avatar', file);

  setBusy(submit, true, 'Saving...');
  try {
    await api('/users/profile', { method: 'PUT', body: formData, isForm: true });
    await refreshUser();
    toast('Profile updated', 'success');
    renderNav('profile.html');
  } catch (err) {
    setFieldErrors(profileForm, err.errors);
    toast(err instanceof ApiError ? err.message : 'Could not save profile', 'error');
  } finally {
    setBusy(submit, false);
  }
});

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldErrors(passwordForm);
  const submit = passwordForm.querySelector('button[type="submit"]');
  const body = {
    currentPassword: passwordForm.elements.currentPassword.value,
    newPassword: passwordForm.elements.newPassword.value,
  };
  if (body.newPassword.length < 8) {
    return setFieldErrors(passwordForm, [{ field: 'newPassword', msg: 'At least 8 characters' }]);
  }

  setBusy(submit, true, 'Updating...');
  try {
    await api('/auth/change-password', { method: 'PUT', body });
    passwordForm.reset();
    toast('Password changed', 'success');
  } catch (err) {
    setFieldErrors(passwordForm, err.errors);
    toast(err.message, 'error');
  } finally {
    setBusy(submit, false);
  }
});

// This must stay at the very bottom of the file.
if (requireAuth()) {
  renderNav('profile.html');
  init();
}