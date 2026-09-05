import { apiFetch } from './api.js';
import { checkSession, bindHeader } from './session.js';
import { showToast, escapeHtml, formatDate } from './utils.js';

const dom = {
  tableBody: document.getElementById('users-table-body'),
  toast: document.getElementById('toast'),
};

const VALID_ROLES = ['admin', 'editor', 'viewer'];

function userRowHtml(user, currentUserId) {
  const isSelf = String(user.id) === String(currentUserId);

  const roleCell = isSelf
    ? `<span class="game-badge">${escapeHtml(user.role)}</span>`
    : `<div class="field">
        <select data-role-select="${user.id}">
         ${VALID_ROLES.map(
           (r) =>
             `<option value="${r}" ${r === user.role ? 'selected' : ''}>${r}</option>`
         ).join('')}
       </select>  
      </div>
      `;

  return `
    <tr>
      <td data-label="Usuário">${escapeHtml(user.username)}${isSelf ? ' (você)' : ''}</td>
      <td data-label="Cargo">${roleCell}</td>
      <td data-label="Cadastrado em">${escapeHtml(formatDate(user.created_at))}</td>
      <td data-label="Ações">
        ${
          isSelf
            ? '—'
            : `<button class="btn btn--primary" style="width: max-content" data-save-role="${user.id}">Salvar</button>`
        }
      </td>
    </tr>
  `;
}

async function loadUsers(currentUserId) {
  dom.tableBody.innerHTML =
    '<tr class="loading-row"><td colspan="4">Carregando usuários...</td></tr>';

  try {
    const res = await apiFetch('/users');
    if (!res.ok) {
      dom.tableBody.innerHTML =
        '<tr class="loading-row"><td colspan="4">Falha ao carregar usuários.</td></tr>';
      return;
    }

    const data = await res.json();
    const users = data.users || [];

    dom.tableBody.innerHTML = users
      .map((u) => userRowHtml(u, currentUserId))
      .join('');
  } catch (e) {
    dom.tableBody.innerHTML =
      '<tr class="loading-row"><td colspan="4">Falha ao carregar usuários.</td></tr>';
  }
}

async function saveRole(id) {
  const select = document.querySelector(`[data-role-select="${id}"]`);
  const btn = document.querySelector(`[data-save-role="${id}"]`);
  const role = select.value;

  btn.disabled = true;

  try {
    const res = await apiFetch(`/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(
        dom.toast,
        data.error || 'Não foi possível atualizar o cargo.',
        'error'
      );
      return;
    }

    showToast(dom.toast, 'Cargo atualizado com sucesso.');
  } catch (e) {
    showToast(dom.toast, 'Erro de conexão com o servidor.', 'error');
  } finally {
    btn.disabled = false;
  }
}

dom.tableBody.addEventListener('click', (e) => {
  const saveBtn = e.target.closest('[data-save-role]');
  if (saveBtn) saveRole(saveBtn.dataset.saveRole);
});

checkSession({ requireAdmin: true }).then((user) => {
  if (!user) return;
  bindHeader(user);
  loadUsers(user.id);
});
