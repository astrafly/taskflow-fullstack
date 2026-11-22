import { requireAuth } from '../auth.js';
import { api, ApiError } from '../api.js';
import { renderNav } from '../nav.js';
import { setFieldErrors, setBusy, toast } from '../ui.js';

const form = document.querySelector('#task-form');
const submit = document.querySelector('#save-btn');
const formError = document.querySelector('#form-error');
const taskId = new URLSearchParams(location.search).get('id');

async function init() {
  if (!taskId) return;
  document.querySelector('#form-title').textContent = 'Edit task';
  try {
    const { data: task } = await api(`/tasks/${taskId}`);
    form.title.value = task.title;
    form.description.value = task.description || '';
    form.status.value = task.status;
    form.priority.value = task.priority;
    form.dueDate.value = task.dueDate ? task.dueDate.slice(0, 10) : '';
  } catch (err) {
    formError.textContent = err.message;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldErrors(form);
  formError.textContent = '';

  const body = {
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    status: form.status.value,
    priority: form.priority.value,
    dueDate: form.dueDate.value || '',
  };

  if (!body.title) return setFieldErrors(form, [{ field: 'title', msg: 'Title is required' }]);

  setBusy(submit, true, 'Saving...');
  try {
    if (taskId) {
      await api(`/tasks/${taskId}`, { method: 'PUT', body });
    } else {
      await api('/tasks', { method: 'POST', body });
    }
    toast('Task saved', 'success');
    setTimeout(() => (location.href = 'tasks.html'), 600);
  } catch (err) {
    formError.textContent = err instanceof ApiError ? err.message : 'Something went wrong';
    setFieldErrors(form, err.errors);
    setBusy(submit, false);
  }
});

// This must stay at the very bottom of the file.
if (requireAuth()) {
  renderNav('tasks.html');
  init();
}