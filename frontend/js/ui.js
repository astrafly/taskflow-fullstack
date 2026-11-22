// Small UI helpers: toasts, spinners, confirm dialog, field errors.
import { escapeHTML } from './utils.js';

function container() {
  let el = document.querySelector('.toast-container');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

export function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message; // textContent is safe: no HTML parsing
  container().appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export function spinner(target, text = 'Loading...') {
  target.innerHTML = `<div class="loading"><div class="spinner"></div>${escapeHTML(text)}</div>`;
}

export function showError(target, message) {
  target.innerHTML = `<p class="error-box">${escapeHTML(message)}</p>`;
}

// Returns a Promise<boolean>: true if the user clicked "Confirm".
export function confirmDialog(message, confirmText = 'Delete') {
  return new Promise((resolve) => {
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <p>${escapeHTML(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-answer="no">Cancel</button>
          <button class="btn btn-danger" data-answer="yes">${escapeHTML(confirmText)}</button>
        </div>
      </div>`;
    backdrop.classList.add('open');
    backdrop.onclick = (e) => {
      const answer = e.target.dataset.answer;
      if (!answer && e.target !== backdrop) return;
      backdrop.classList.remove('open');
      resolve(answer === 'yes');
    };
  });
}

// Shows a server validation error next to the matching field.
export function setFieldErrors(form, errors = []) {
  form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  errors.forEach(({ field, msg }) => {
    const el = form.querySelector(`[data-error="${field}"]`);
    if (el) el.textContent = msg;
  });
}

export function setBusy(button, busy, text = 'Please wait...') {
  button.disabled = busy;
  if (busy) {
    button.dataset.label = button.textContent;
    button.textContent = text;
  } else if (button.dataset.label) {
    button.textContent = button.dataset.label;
  }
}
