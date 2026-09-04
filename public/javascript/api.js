import { API_BASE } from './state.js';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
  });

  if (response.status === 401) {
    window.location.href = 'login.php';
    throw new Error('unauthorized');
  }

  return response;
}
