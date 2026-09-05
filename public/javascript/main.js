import { dom } from './dom.js';
import { state } from './state.js';
import { apiFetch } from './api.js';
import { checkSession, bindHeader } from './session.js';
import { render, renderStats } from './render.js';
import {
  handleSort,
  toggleSelect,
  clearSelection,
  selectAll,
} from './cards-data.js';
import { showToast } from './utils.js';
import {
  openNewModal,
  openEditModal,
  closeModal,
  saveCard,
  deleteCard,
  duplicateCard,
  fetchEditions,
  confirmModal,
} from './modal.js';

async function initSession() {
  const user = await checkSession();
  if (!user) return;

  bindHeader(user, { manageUsersBtn: dom.manageUsersBtn });
  state.userRole = user.role;

  if (state.userRole === 'viewer') {
    dom.newCardBtn.style.display = 'none';
    dom.actionsHeader.style.display = 'none';
    dom.selectAllHeader.style.display = 'none';
  }
}

async function loadCards() {
  dom.tableBody.innerHTML =
    '<tr class="loading-row"><td colspan="8">Carregando cartas...</td></tr>';

  try {
    const res = await apiFetch('/cards');

    if (!res.ok) {
      dom.tableBody.innerHTML =
        '<tr class="loading-row"><td colspan="8">Falha ao carregar as cartas.</td></tr>';
      return;
    }

    const data = await res.json();
    state.cardsCache = data.cards || [];
    clearSelection();
    updateBulkBar();
    renderStats();
    render();
  } catch (e) {
    dom.tableBody.innerHTML =
      '<tr class="loading-row"><td colspan="8">Falha ao carregar as cartas.</td></tr>';
  }
}

function updateBulkBar() {
  const count = state.selectedIds.size;
  dom.bulkActionsBar.style.display = count > 0 ? 'flex' : 'none';
  dom.bulkSelectedCount.textContent = `${count} selecionada${count === 1 ? '' : 's'}`;
}

function handleListClick(e) {
  const editBtn = e.target.closest('[data-edit]');
  const deleteBtn = e.target.closest('[data-delete]');
  const duplicateBtn = e.target.closest('[data-duplicate]');
  const selectCheckbox = e.target.closest('[data-select]');

  if (editBtn) openEditModal(editBtn.dataset.edit);
  if (deleteBtn) deleteCard(deleteBtn.dataset.delete, loadCards);
  if (duplicateBtn) duplicateCard(duplicateBtn.dataset.duplicate, loadCards);

  if (selectCheckbox) {
    toggleSelect(Number(selectCheckbox.dataset.select));
    updateBulkBar();
    dom.selectAllCheckbox.checked = false;
    render();
  }
}

async function bulkDelete() {
  const confirmed = await confirmModal(
    `Tem certeza que deseja excluir ${state.selectedIds.size} carta(s)? Esta ação não pode ser desfeita.`
  );
  if (!confirmed) return;

  dom.bulkDeleteBtn.disabled = true;

  try {
    const res = await apiFetch('/cards/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...state.selectedIds] }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(dom.toast, data.error || 'Não foi possível excluir.', 'error');
      return;
    }

    if (data.skipped?.length) {
      showToast(
        dom.toast,
        `${data.deleted.length} excluída(s), ${data.skipped.length} sem permissão.`,
        'error'
      );
    } else {
      showToast(dom.toast, `${data.deleted.length} carta(s) excluída(s).`);
    }

    clearSelection();
    updateBulkBar();
    loadCards();
  } catch (e) {
    showToast(dom.toast, 'Erro de conexão com o servidor.', 'error');
  } finally {
    dom.bulkDeleteBtn.disabled = false;
  }
}

function setView(view) {
  state.currentView = view;
  state.currentPage = 1;
  localStorage.setItem('cardsViewMode', view);

  const isTable = view === 'table';
  dom.tableViewEl.style.display = isTable ? '' : 'none';
  dom.cardsViewEl.style.display = isTable ? 'none' : 'grid';

  dom.viewTableBtn.classList.toggle('is-active', isTable);
  dom.viewTableBtn.setAttribute('aria-pressed', String(isTable));
  dom.viewCardsBtn.classList.toggle('is-active', !isTable);
  dom.viewCardsBtn.setAttribute('aria-pressed', String(!isTable));

  render();
}

function bindEvents() {
  dom.tableBody.addEventListener('click', handleListClick);
  dom.cardsViewEl.addEventListener('click', handleListClick);

  dom.gameFilter.addEventListener('change', function () {
    state.currentPage = 1;
    render();
  });

  dom.searchFilter.addEventListener('input', function () {
    state.currentPage = 1;
    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(render, 200);
  });

  dom.sortNameBtn.addEventListener('click', () =>
    handleSort('english_name', render)
  );
  dom.sortRarityBtn.addEventListener('click', () =>
    handleSort('rarity', render)
  );

  dom.viewTableBtn.addEventListener('click', () => setView('table'));
  dom.viewCardsBtn.addEventListener('click', () => setView('cards'));

  dom.cardGameSelect.addEventListener('change', function () {
    if (!dom.cardGameSelect.value) {
      dom.editionSelect.disabled = true;
      dom.editionSelect.innerHTML =
        '<option value="">Selecione um jogo primeiro</option>';
      return;
    }
    fetchEditions(dom.cardGameSelect.value);
  });

  dom.imageFileInput.addEventListener('change', function () {
    const selectedFile = dom.imageFileInput.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      dom.imagePreview.src = e.target.result;
      dom.imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(selectedFile);
  });

  dom.newCardBtn.addEventListener('click', openNewModal);
  dom.closeModalBtn.addEventListener('click', closeModal);
  dom.cancelBtn.addEventListener('click', closeModal);
  dom.modalOverlay.addEventListener('click', function (e) {
    if (e.target === dom.modalOverlay) closeModal();
  });

  dom.saveBtn.addEventListener('click', () => saveCard(loadCards));

  dom.paginationPrev.addEventListener('click', function () {
    if (state.currentPage > 1) {
      state.currentPage--;
      render();
    }
  });

  dom.paginationNext.addEventListener('click', function () {
    state.currentPage++;
    render();
  });

  dom.selectAllCheckbox.addEventListener('change', function () {
    if (this.checked) {
      selectAll(state.cardsCache.map((c) => c.id));
    } else {
      clearSelection();
    }
    updateBulkBar();
    render();
  });

  dom.bulkDeleteBtn.addEventListener('click', bulkDelete);
}

bindEvents();
setView(state.currentView);
initSession().then(loadCards);
