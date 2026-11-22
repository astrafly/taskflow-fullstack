// Builds the navbar on every private page and highlights the current link.
import { getUser, logout } from './auth.js';
import { escapeHTML } from './utils.js';

export function renderNav(activePage) {
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  const links = [
    ['dashboard.html', 'Dashboard'],
    ['tasks.html', 'Tasks'],
    ['profile.html', 'Profile'],
    ...(isAdmin ? [['admin.html', 'Admin']] : []),
  ];

  const nav = document.querySelector('#navbar');
  if (!nav) return;
  nav.className = 'navbar';
  nav.innerHTML = `
    <a class="brand" href="dashboard.html">TaskFlow</a>
    <nav>
      ${links
        .map(([href, text]) => `<a href="${href}" class="${href === activePage ? 'active' : ''}">${text}</a>`)
        .join('')}
      <span>${escapeHTML(user?.name || '')}</span>
      <a href="#" id="logout-link">Log out</a>
    </nav>`;
  nav.querySelector('#logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}
