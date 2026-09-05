(function () {
  const API_BASE = '/api';

  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const btnLogin = document.getElementById('btn-login');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
  }

  fetch(`${API_BASE}/session`, { credentials: 'include' })
    .then((res) => {
      if (res.ok) window.location.href = 'dashboard.php';
    })
    .catch(() => {});

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      showError('Preencha usuário e senha.');
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Entrando...';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Não foi possível entrar.');
        return;
      }

      window.location.href = 'dashboard.php';
    } catch (err) {
      showError('Erro de conexão com o servidor.');
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Entrar';
    }
  });
})();
