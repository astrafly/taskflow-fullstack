import { requireAuth } from '../auth.js';
import { api } from '../api.js';
import { renderNav } from '../nav.js';
import { spinner, showError, toast, confirmDialog } from '../ui.js';
import { debounce } from '../utils.js';
import { taskCard } from '../task-card.js';

const listEl = document.querySelector('#task-list');
const pageEl = document.querySelector('#pagination');
const state = { page: 1, search: '', status: '', priority: '', sort: '-createdAt' };

function init() {
  document.querySelector('#search').addEventListener('input', debounce((e) => {
    state.search = e.target.value.trim();
    state.page = 1;
    load();
  }));
  ['status', 'priority', 'sort'].forEach((id) =>
    document.querySelector(`#${id}`).addEventListener('change', (e) => {
      state[id] = e.target.value;
      state.page = 1;
      load();
    })
  );

  listEl.addEventListener('click', async (e) => {
    const id = e.target.dataset.delete;
    if (!id) return;
    const ok = await confirmDialog('Delete this task? This cannot be undone.');
    if (!ok) return;
    try {
      await api(`/tasks/${id}`, { method: 'DELETE' });
      toast('Task deleted', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  load();
}

async function load() {
  spinner(listEl);
  const params = new URLSearchParams({ page: state.page, limit: 10, sort: state.sort });
  if (state.search) params.set('search', state.search);
  if (state.status) params.set('status', state.status);
  if (state.priority) params.set('priority', state.priority);

  try {
    const { data, pagination } = await api(`/tasks?${params}`);
    listEl.innerHTML = data.length
      ? data.map((t) => taskCard(t)).join('')
      : '<p class="empty">No tasks match your filters.</p>';
    renderPagination(pagination);
  } catch (err) {
    showError(listEl, err.message);
    pageEl.innerHTML = '';
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
if (requireAuth()) {
  renderNav('tasks.html');
  init();
}