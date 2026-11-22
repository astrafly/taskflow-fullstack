import { requireAuth, getUser } from '../auth.js';
import { api } from '../api.js';
import { renderNav } from '../nav.js';
import { spinner, showError, toast, confirmDialog } from '../ui.js';
import { escapeHTML, formatDate } from '../utils.js';

const tableEl = document.querySelector('#user-table');
const pageEl = document.querySelector('#pagination');
const state = { page: 1 };
const me = getUser();

function init() {
  tableEl.addEventListener('click', async (e) => {
    const { toggle, remove } = e.target.dataset;
    if (toggle) return changeActive(toggle, e.target.dataset.active !== 'true');
    if (remove) return deleteUser(remove);
  });
  load();
}

async function load() {
  spinner(tableEl);
  try {
    const { data: users, pagination } = await api(`/users?page=${state.page}&limit=10`);
    tableEl.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${users.map((u) => `
            <tr>
              <td>${escapeHTML(u.name)}</td>
              <td>${escapeHTML(u.email)}</td>
              <td><span class="badge badge-${escapeHTML(u.role)}">${escapeHTML(u.role)}</span></td>
              <td>${escapeHTML(formatDate(u.createdAt))}</td>
              <td>${u.isActive ? 'Active' : 'Inactive'}</td>
              <td class="task-actions">
                ${u._id === me.id ? '<span class="task-meta">(you)</span>' : `
                  <button class="btn btn-small btn-ghost" data-toggle="${escapeHTML(u._id)}" data-active="${u.isActive}">
                    ${u.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button class="btn btn-small btn-danger" data-remove="${escapeHTML(u._id)}">Delete</button>`}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    renderPagination(pagination);
  } catch (err) {
    showError(tableEl, err.message);
  }
}

async function changeActive(id, makeActive) {
  try {
    await api(`/users/${id}/active`, { method: 'PATCH', body: { isActive: makeActive } });
    toast(makeActive ? 'User activated' : 'User deactivated', 'success');
    load();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function deleteUser(id) {
  const ok = await confirmDialog('Delete this user and all of their tasks?');
  if (!ok) return;
  try {
    await api(`/users/${id}`, { method: 'DELETE' });
    toast('User deleted', 'success');
    load();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderPagination({ page, pages }) {
  pageEl.innerHTML = pages > 1
    ? `<button class="btn btn-ghost btn-small" id="prev" ${page <= 1 ? 'disabled' : ''}>Previous</button>
       <span>Page ${page} of ${pages}</span>
       <button class="btn btn-ghost btn-small" id="next" ${page >= pages ? 'disabled' : ''}>Next</button>`
    : '';
  pageEl.querySelector('#prev')?.addEventListener('click', () => { state.page--; load(); });
  pageEl.querySelector('#next')?.addEventListener('click', () => { state.page++; load(); });
}

// This must stay at the very bottom of the file.
if (requireAuth('admin')) {
  renderNav('admin.html');
  init();
}