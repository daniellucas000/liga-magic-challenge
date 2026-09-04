(function () {
  const API_BASE = '/api';

  const GAME_NAMES = {
    magic: 'Magic: The Gathering',
    pokemon: 'Pokémon',
    yugioh: 'Yu-Gi-Oh!',
  };

  let cardsCache = [];
  let editionRequestTicket = 0;
  let searchDebounceTimer = null;

  const userNameEl = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');
  const tableBody = document.getElementById('table-body');
  const gameFilter = document.getElementById('game-filter');
  const searchFilter = document.getElementById('search-filter');

  const newCardBtn = document.getElementById('new-card-btn');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const saveBtn = document.getElementById('save-btn');
  const formError = document.getElementById('form-error');

  const cardIdInput = document.getElementById('card-id');
  const englishNameInput = document.getElementById('english_name');
  const portugueseNameInput = document.getElementById('portuguese_name');
  const cardGameSelect = document.getElementById('card_game');
  const editionSelect = document.getElementById('edition');
  const editionLoading = document.getElementById('edition-loading');
  const rarityInput = document.getElementById('rarity');
  const imageUrlInput = document.getElementById('image_url');

  const toast = document.getElementById('toast');

  async function apiFetch(path, options = {}) {
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

  async function checkSession() {
    try {
      const res = await apiFetch('/session');
      if (!res.ok) {
        window.location.href = 'login.php';
        return;
      }
      const data = await res.json();
      userNameEl.textContent = data.user.username;
    } catch (e) {
      window.location.href = 'login.php';
    }
  }

  logoutBtn.addEventListener('click', async function () {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (e) {}
    window.location.href = 'login.php';
  });

  let toastTimer = null;
  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className =
      'toast visible' + (type === 'error' ? ' toast--danger' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  async function loadCards() {
    tableBody.innerHTML =
      '<tr class="loading-row"><td colspan="7">Loading cards...</td></tr>';

    try {
      const res = await apiFetch('/cards');

      if (!res.ok) {
        tableBody.innerHTML =
          '<tr class="loading-row"><td colspan="7">Failed to load cards.</td></tr>';
        return;
      }

      const data = await res.json();
      cardsCache = data.cards || [];
      renderTable();
    } catch (e) {
      tableBody.innerHTML =
        '<tr class="loading-row"><td colspan="7">Failed to load cards.</td></tr>';
    }
  }

  function renderTable() {
    const game = gameFilter.value;
    const search = searchFilter.value.trim().toLowerCase();

    const filtered = cardsCache.filter((c) => {
      const matchesGame = !game || c.card_game === game;
      const matchesSearch =
        !search ||
        c.english_name.toLowerCase().includes(search) ||
        (c.portuguese_name || '').toLowerCase().includes(search);
      return matchesGame && matchesSearch;
    });

    if (filtered.length === 0) {
      let emptyImage = '';

      if (game === 'yugioh') {
        emptyImage = `
      <img
        src="images/empty-yugi.webp"
        alt="Nenhuma carta de Yu-Gi-Oh encontrada"
      >
    `;
      }

      if (game === 'magic') {
        emptyImage = `
      <img
        src="images/magic.webp"
        alt="Nenhuma carta de Magic: The Gathering encontrada"
      >
    `;
      }

      if (game === 'pokemon') {
        emptyImage = `
      <img
        src="images/empty-ash.jpeg"
        alt="Nenhuma carta de Pokémon encontrada"
      >
    `;
      }

      tableBody.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="empty-state">
          ${emptyImage}
          <h3>Nenhuma carta encontrada</h3>
          <p>Ajuste os filtros ou cadastre uma nova carta.</p>
        </div>
      </td>
    </tr>
  `;

      return;
    }

    tableBody.innerHTML = filtered
      .map(
        (c) => `
            <tr>
                <td data-label="Image">${
                  c.image_url
                    ? `<img class="thumb" src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.english_name)}" onerror="this.style.visibility='hidden'">`
                    : `<div class="thumb"></div>`
                }</td>
                <td data-label="Name (EN)">${escapeHtml(c.english_name)}</td>
                <td data-label="Name (PT)">${escapeHtml(c.portuguese_name || '—')}</td>
                <td data-label="Game"><span class="game-badge game-badge--${c.card_game}">${GAME_NAMES[c.card_game]}</span></td>
                <td data-label="Edition">${escapeHtml(c.edition_name)}</td>
                <td data-label="Rarity">${escapeHtml(c.rarity)}</td>
                <td data-label="Actions">
                    <div class="row-actions">
                        <button class="btn btn--ghost" style="padding:6px 12px; font-size:13px;" data-edit="${c.id}">Edit</button>
                        <button class="btn btn--danger" data-delete="${c.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `
      )
      .join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  tableBody.addEventListener('click', function (e) {
    const editBtn = e.target.closest('[data-edit]');
    const deleteBtn = e.target.closest('[data-delete]');
    if (editBtn) openEditModal(editBtn.dataset.edit);
    if (deleteBtn) deleteCard(deleteBtn.dataset.delete);
  });

  gameFilter.addEventListener('change', renderTable);
  searchFilter.addEventListener('input', function () {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(renderTable, 200);
  });

  async function fetchEditions(game) {
    const myTicket = ++editionRequestTicket;

    editionSelect.disabled = true;
    editionSelect.innerHTML = '<option value="">Loading...</option>';
    editionLoading.classList.add('visible');

    try {
      const res = await apiFetch(`/editions?game=${encodeURIComponent(game)}`);
      const data = await res.json();

      // A newer request has started since this one was sent — discard this result.
      if (myTicket !== editionRequestTicket) return;

      const editions = data.editions || [];

      editionSelect.innerHTML =
        '<option value="">Select the edition...</option>' +
        editions
          .map(
            (e) =>
              `<option value="${e.id}" data-name="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`
          )
          .join('');
      editionSelect.disabled = false;
    } catch (e) {
      if (myTicket !== editionRequestTicket) return;
      editionSelect.innerHTML =
        '<option value="">Failed to load editions</option>';
    } finally {
      if (myTicket === editionRequestTicket) {
        editionLoading.classList.remove('visible');
      }
    }
  }

  cardGameSelect.addEventListener('change', function () {
    if (!cardGameSelect.value) {
      editionSelect.disabled = true;
      editionSelect.innerHTML = '<option value="">Select a game first</option>';
      return;
    }
    fetchEditions(cardGameSelect.value);
  });

  function openNewModal() {
    modalTitle.textContent = 'Nova carta';
    cardIdInput.value = '';
    englishNameInput.value = '';
    portugueseNameInput.value = '';
    cardGameSelect.value = '';
    editionSelect.innerHTML = '<option value="">Select a game first</option>';
    editionSelect.disabled = true;
    rarityInput.value = '';
    imageUrlInput.value = '';
    clearFormError();
    modalOverlay.classList.add('visible');
  }

  async function openEditModal(id) {
    const card = cardsCache.find((c) => String(c.id) === String(id));
    if (!card) return;

    modalTitle.textContent = 'Edit card';
    cardIdInput.value = card.id;
    englishNameInput.value = card.english_name;
    portugueseNameInput.value = card.portuguese_name || '';
    cardGameSelect.value = card.card_game;
    rarityInput.value = card.rarity;
    imageUrlInput.value = card.image_url || '';
    clearFormError();
    modalOverlay.classList.add('visible');

    await fetchEditions(card.card_game);
    editionSelect.value = card.edition_id;
  }

  function closeModal() {
    modalOverlay.classList.remove('visible');
  }

  newCardBtn.addEventListener('click', openNewModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  function showFormError(msg) {
    formError.textContent = msg;
    formError.classList.add('visible');
  }
  function clearFormError() {
    formError.textContent = '';
    formError.classList.remove('visible');
  }

  saveBtn.addEventListener('click', async function () {
    clearFormError();

    const editionOption = editionSelect.selectedOptions[0];
    const payload = {
      english_name: englishNameInput.value.trim(),
      portuguese_name: portugueseNameInput.value.trim(),
      card_game: cardGameSelect.value,
      edition_id: editionSelect.value,
      edition_name: editionOption
        ? editionOption.getAttribute('data-name') || editionOption.textContent
        : '',
      rarity: rarityInput.value.trim(),
      image_url: imageUrlInput.value.trim(),
    };

    if (
      !payload.english_name ||
      !payload.card_game ||
      !payload.edition_id ||
      !payload.rarity
    ) {
      showFormError('Please fill in all required fields (*).');
      return;
    }

    const id = cardIdInput.value;
    const method = id ? 'PUT' : 'POST';
    if (id) payload.id = Number(id);

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const res = await apiFetch('/cards', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showFormError(data.error || 'Could not save the card.');
        return;
      }

      closeModal();
      showToast(
        id ? 'Card updated successfully.' : 'Carta registrada com sucesso.'
      );
      loadCards();
    } catch (e) {
      showFormError('Connection error with the server.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save card';
    }
  });

  async function deleteCard(id) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this card? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    const deleteBtn = tableBody.querySelector(`[data-delete="${id}"]`);
    if (deleteBtn) deleteBtn.disabled = true;

    try {
      const res = await apiFetch(`/cards?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not delete.', 'error');
        if (deleteBtn) deleteBtn.disabled = false;
        return;
      }

      showToast('Cartão deletado.');
      loadCards();
    } catch (e) {
      showToast('Connection error with the server.', 'error');
      if (deleteBtn) deleteBtn.disabled = false;
    }
  }

  checkSession().then(loadCards);
})();
