(function () {
  const API_BASE = '/api';

  const form = document.getElementById('form-login');
  const erroBox = document.getElementById('erro-login');
  const btnEntrar = document.getElementById('btn-entrar');

  function mostrarErro(msg) {
    erroBox.textContent = msg;
    erroBox.classList.add('visible');
  }

  function limparErro() {
    erroBox.textContent = '';
    erroBox.classList.remove('visible');
  }

  fetch(`${API_BASE}/session`, { credentials: 'include' })
    .then((res) => {
      if (res.ok) window.location.href = 'dashboard.php';
    })
    .catch(() => {});

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    limparErro();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('senha').value;

    if (!username || !password) {
      mostrarErro('Preencha usuário e senha.');
      return;
    }

    btnEntrar.disabled = true;
    btnEntrar.textContent = 'Entrando...';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const dados = await res.json();

      if (!res.ok) {
        mostrarErro(dados.error || 'Não foi possível entrar.');
        return;
      }

      window.location.href = 'dashboard.php';
    } catch (err) {
      mostrarErro('Erro de conexão com o servidor.');
    } finally {
      btnEntrar.disabled = false;
      btnEntrar.textContent = 'Entrar';
    }
  });
})();
