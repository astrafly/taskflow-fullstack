// Escape user text before putting it into innerHTML (prevents XSS).
export function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function debounce(fn, wait = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function formatDate(value) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function isOverdue(task) {
  return task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();
}

export function label(status) {
  return { todo: 'To do', 'in-progress': 'In progress', done: 'Done' }[status] || status;
}
