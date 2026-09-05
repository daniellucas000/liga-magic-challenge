(function () {
  const API_BASE = '/api';

  const form = document.getElementById('form-registro');
  const erroBox = document.getElementById('erro-registro');
  const btnCadastrar = document.getElementById('btn-cadastrar');

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

    if (password.length < 6) {
      mostrarErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    btnCadastrar.disabled = true;
    btnCadastrar.textContent = 'Cadastrando...';

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const dados = await res.json();

      if (!res.ok) {
        mostrarErro(dados.error || 'Não foi possível cadastrar.');
        return;
      }

      window.location.href = 'dashboard.php';
    } catch (err) {
      mostrarErro('Erro de conexão com o servidor.');
    } finally {
      btnCadastrar.disabled = false;
      btnCadastrar.textContent = 'Cadastrar';
    }
  });
})();
