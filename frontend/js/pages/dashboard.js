import { requireAuth } from '../auth.js';
import { api } from '../api.js';
import { renderNav } from '../nav.js';
import { spinner, showError } from '../ui.js';
import { taskCard } from '../task-card.js';

if (requireAuth()) {
  renderNav('dashboard.html');
  loadDashboard();
}

async function loadDashboard() {
  const stats = document.querySelector('#stats');
  const recent = document.querySelector('#recent');
  spinner(recent);
  try {
    const [statsRes, tasksRes] = await Promise.all([
      api('/tasks/stats'),
      api('/tasks?limit=5&sort=-createdAt'),
    ]);
    const s = statsRes.data;
    const list = tasksRes.data;

    stats.innerHTML = [
      ['Total', s.total],
      ['To do', s.byStatus.todo],
      ['In progress', s.byStatus['in-progress']],
      ['Done', s.byStatus.done],
      ['Overdue', s.overdue],
    ]
      .map(([label, value]) => `<div class="card card-stat"><div class="value">${value}</div><div class="label">${label}</div></div>`)
      .join('');

    recent.innerHTML = list.length
      ? list.map((t) => taskCard(t, { showActions: false })).join('')
      : '<p class="empty">No tasks yet. Create your first one!</p>';
  } catch (err) {
    showError(recent, err.message);
  }
}
