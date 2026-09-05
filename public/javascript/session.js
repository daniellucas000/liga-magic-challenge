import { apiFetch } from './api.js';

export async function checkSession({ requireAdmin = false } = {}) {
  try {
    const res = await apiFetch('/session');
    if (!res.ok) {
      window.location.href = 'login.php';
      return null;
    }
    const data = await res.json();

    if (requireAdmin && data.user.role !== 'admin') {
      window.location.href = 'dashboard.php';
      return null;
    }

    return data.user;
  } catch (e) {
    window.location.href = 'login.php';
    return null;
  }
}

export function bindHeader(user) {
  document.getElementById('user-name').textContent = user.username;

  const manageUsersBtn = document.getElementById('manage-users-btn');
  if (manageUsersBtn && user.role === 'admin') {
    manageUsersBtn.style.display = '';
  }

  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (e) {}
    window.location.href = 'login.php';
  });
}
