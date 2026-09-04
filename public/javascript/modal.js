import { dom } from './dom.js';
import { state } from './state.js';
import { apiFetch } from './api.js';
import { escapeHtml, showToast } from './utils.js';

export function showFormError(msg) {
  dom.formError.textContent = msg;
  dom.formError.classList.add('visible');
}

export function clearFormError() {
  dom.formError.textContent = '';
  dom.formError.classList.remove('visible');
}

function resetImageField() {
  dom.imageFileInput.value = '';
  dom.imageUrlInput.value = '';
  dom.imagePreview.src = '';
  dom.imagePreview.style.display = 'none';
}

function showImagePreview(url) {
  if (!url) {
    dom.imagePreview.style.display = 'none';
    return;
  }
  dom.imagePreview.src = url;
  dom.imagePreview.style.display = 'block';
}

export async function fetchEditions(game) {
  const myTicket = ++state.editionRequestTicket;

  dom.editionSelect.disabled = true;
  dom.editionSelect.innerHTML = '<option value="">Carregando...</option>';
  dom.editionLoading.classList.add('visible');

  try {
    const res = await apiFetch(`/editions?game=${encodeURIComponent(game)}`);
    const data = await res.json();

    // A newer request has started since this one was sent — discard this result.
    if (myTicket !== state.editionRequestTicket) return;

    const editions = data.editions || [];

    dom.editionSelect.innerHTML =
      '<option value="">Selecione a edição...</option>' +
      editions
        .map(
          (e) =>
            `<option value="${e.id}" data-name="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`
        )
        .join('');
    dom.editionSelect.disabled = false;
  } catch (e) {
    if (myTicket !== state.editionRequestTicket) return;
    dom.editionSelect.innerHTML =
      '<option value="">Falha ao carregar edições</option>';
  } finally {
    if (myTicket === state.editionRequestTicket) {
      dom.editionLoading.classList.remove('visible');
    }
  }
}

export function openNewModal() {
  dom.modalTitle.textContent = 'Nova carta';
  dom.cardIdInput.value = '';
  dom.englishNameInput.value = '';
  dom.portugueseNameInput.value = '';
  dom.cardGameSelect.value = '';
  dom.editionSelect.innerHTML =
    '<option value="">Selecione um jogo primeiro</option>';
  dom.editionSelect.disabled = true;
  dom.rarityInput.value = '';
  resetImageField();
  clearFormError();
  dom.modalOverlay.classList.add('visible');
}

export async function openEditModal(id) {
  const card = state.cardsCache.find((c) => String(c.id) === String(id));
  if (!card) return;

  dom.modalTitle.textContent = 'Editar carta';
  dom.cardIdInput.value = card.id;
  dom.englishNameInput.value = card.english_name;
  dom.portugueseNameInput.value = card.portuguese_name || '';
  dom.cardGameSelect.value = card.card_game;
  dom.rarityInput.value = card.rarity;

  dom.imageFileInput.value = '';
  dom.imageUrlInput.value = card.image_url || '';
  showImagePreview(card.image_url || '');

  clearFormError();
  dom.modalOverlay.classList.add('visible');

  await fetchEditions(card.card_game);
  dom.editionSelect.value = card.edition_id;
}

export function closeModal() {
  dom.modalOverlay.classList.remove('visible');
}

async function uploadImageIfNeeded() {
  const selectedFile = dom.imageFileInput.files[0];

  // Sem arquivo novo selecionado: mantém o caminho já existente (ex: edição sem trocar a imagem)
  if (!selectedFile) {
    return dom.imageUrlInput.value.trim() || '';
  }

  const formData = new FormData();
  formData.append('image_file', selectedFile);

  const res = await apiFetch('/upload-image', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Falha ao enviar a imagem.');
  }

  return data.path;
}

export async function saveCard(loadCards) {
  clearFormError();

  const editionOption = dom.editionSelect.selectedOptions[0];
  const payload = {
    english_name: dom.englishNameInput.value.trim(),
    portuguese_name: dom.portugueseNameInput.value.trim(),
    card_game: dom.cardGameSelect.value,
    edition_id: dom.editionSelect.value,
    edition_name: editionOption
      ? editionOption.getAttribute('data-name') || editionOption.textContent
      : '',
    rarity: dom.rarityInput.value.trim(),
    image_url: '',
  };

  if (
    !payload.english_name ||
    !payload.card_game ||
    !payload.edition_id ||
    !payload.rarity
  ) {
    showFormError('Por favor, preencha todos os campos obrigatórios (*).');
    return;
  }

  const id = dom.cardIdInput.value;
  const method = id ? 'PUT' : 'POST';
  if (id) payload.id = Number(id);

  dom.saveBtn.disabled = true;
  dom.saveBtn.textContent = 'Salvando...';

  try {
    payload.image_url = await uploadImageIfNeeded();

    const res = await apiFetch('/cards', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showFormError(data.error || 'Não foi possível salvar a carta.');
      return;
    }

    closeModal();
    showToast(
      dom.toast,
      id ? 'Carta atualizada com sucesso.' : 'Carta registrada com sucesso.'
    );
    loadCards();
  } catch (e) {
    showFormError(e.message || 'Erro de conexão com o servidor.');
  } finally {
    dom.saveBtn.disabled = false;
    dom.saveBtn.textContent = 'Salvar carta';
  }
}

export async function deleteCard(id, loadCards) {
  const confirmDelete = window.confirm(
    'Tem certeza que deseja excluir esta carta? Esta ação não pode ser desfeita.'
  );
  if (!confirmDelete) return;

  const deleteBtn = document.querySelector(`[data-delete="${id}"]`);
  if (deleteBtn) deleteBtn.disabled = true;

  try {
    const res = await apiFetch(`/cards?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(dom.toast, data.error || 'Não foi possível excluir.', 'error');
      if (deleteBtn) deleteBtn.disabled = false;
      return;
    }

    showToast(dom.toast, 'Cartão deletado.');
    loadCards();
  } catch (e) {
    showToast(dom.toast, 'Erro de conexão com o servidor.', 'error');
    if (deleteBtn) deleteBtn.disabled = false;
  }
}
