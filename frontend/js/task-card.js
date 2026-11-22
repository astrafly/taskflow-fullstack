// Shared HTML for a single task, used on the dashboard and tasks list.
import { escapeHTML, formatDate, isOverdue, label } from './utils.js';

export function taskCard(task, { showActions = true } = {}) {
  const overdue = isOverdue(task);
  return `
    <article class="card task-item">
      <div>
        <h3>${escapeHTML(task.title)}</h3>
        <div class="task-meta">
          <span class="badge badge-${escapeHTML(task.status)}">${label(task.status)}</span>
          <span class="badge badge-${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span>
          · Due ${escapeHTML(formatDate(task.dueDate))}${overdue ? ' <strong style="color:var(--danger)">(overdue)</strong>' : ''}
        </div>
      </div>
      ${
        showActions
          ? `<div class="task-actions">
              <a class="btn btn-small btn-ghost" href="task-form.html?id=${escapeHTML(task._id)}">Edit</a>
              <button class="btn btn-small btn-danger" data-delete="${escapeHTML(task._id)}">Delete</button>
             </div>`
          : ''
      }
    </article>`;
}
