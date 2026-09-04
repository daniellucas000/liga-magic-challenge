import { dom } from './dom.js';
import { state, GAME_NAMES } from './state.js';
import { escapeHtml } from './utils.js';
import { getFilteredCards, getPaginatedCards } from './cards-data.js';

function getEmptyStateHtml(game) {
  let emptyImage = '';

  if (game === 'yugioh') {
    emptyImage = `<img src="images/empty-yugi.webp" alt="Nenhuma carta de Yu-Gi-Oh encontrada">`;
  }
  if (game === 'magic') {
    emptyImage = `<img src="images/magic.webp" alt="Nenhuma carta de Magic: The Gathering encontrada">`;
  }
  if (game === 'pokemon') {
    emptyImage = `<img src="images/empty-ash.jpeg" alt="Nenhuma carta de Pokémon encontrada">`;
  }

  return `
    <div class="empty-state">
      ${emptyImage}
      <h3>Nenhuma carta encontrada</h3>
      <p>Ajuste os filtros ou cadastre uma nova carta.</p>
    </div>
  `;
}

function cardRowHtml(c) {
  return `
    <tr>
        <td data-label="Imagem">${
          c.image_url
            ? `<img class="thumb" src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.english_name)}" onerror="this.style.visibility='hidden'">`
            : `<div class="thumb"></div>`
        }</td>
        <td data-label="Nome (EN)">${escapeHtml(c.english_name)}</td>
        <td data-label="Nome (PT)">${escapeHtml(c.portuguese_name || '—')}</td>
        <td data-label="Jogo"><span class="game-badge game-badge--${c.card_game}">${GAME_NAMES[c.card_game]}</span></td>
        <td data-label="Edição">${escapeHtml(c.edition_name)}</td>
        <td data-label="Raridade">${escapeHtml(c.rarity)}</td>
        <td data-label="Ações">
            <div class="row-actions">
                <button class="btn btn--ghost" style="padding:6px 12px; font-size:13px;" data-edit="${c.id}">Editar</button>
                <button class="btn btn--danger" data-delete="${c.id}">Excluir</button>
            </div>
        </td>
    </tr>
  `;
}

function cardItemHtml(c) {
  return `
    <div class="card-item">
        ${
          c.image_url
            ? `<img class="card-item__image" src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.english_name)}" onerror="this.style.visibility='hidden'">`
            : `<div class="card-item__image"></div>`
        }
        <div class="card-item__body">
            <span class="card-item__name">${escapeHtml(c.english_name)}</span>
            <span class="card-item__meta">${escapeHtml(c.portuguese_name || '—')}</span>
            <span class="game-badge game-badge--${c.card_game}">${GAME_NAMES[c.card_game]}</span>
            <span class="card-item__meta">${escapeHtml(c.edition_name)} · ${escapeHtml(c.rarity)}</span>
        </div>
        <div class="card-item__actions">
            <button class="btn btn--ghost" style="flex:1; padding:6px; font-size:13px;" data-edit="${c.id}">Editar</button>
            <button class="btn btn--danger" style="flex:1;" data-delete="${c.id}">Excluir</button>
        </div>
    </div>
  `;
}

export function renderSortIndicators() {
  [dom.sortNameBtn, dom.sortRarityBtn].forEach((btn) => {
    if (!btn) return;
    const column = btn.dataset.sortColumn;
    const arrow = btn.querySelector('.sort-arrow');
    const isActive = state.sortColumn === column;

    btn.classList.toggle('is-active', isActive);
    if (arrow) {
      arrow.textContent = isActive
        ? state.sortDirection === 'asc'
          ? '▲'
          : '▼'
        : '⇅';
    }
  });
}

export function renderPagination(totalItems, totalPages) {
  if (totalItems === 0) {
    dom.paginationEl.style.display = 'none';
    return;
  }

  dom.paginationEl.style.display = 'flex';
  dom.paginationInfo.textContent = `Página ${state.currentPage} de ${totalPages}`;
  dom.paginationPrev.disabled = state.currentPage <= 1;
  dom.paginationNext.disabled = state.currentPage >= totalPages;
}

export function renderStats() {
  const total = state.cardsCache.length;
  const countByGame = { magic: 0, pokemon: 0, yugioh: 0 };

  state.cardsCache.forEach((c) => {
    if (countByGame[c.card_game] !== undefined) {
      countByGame[c.card_game]++;
    }
  });

  dom.statTotal.textContent = total;
  dom.statMagic.textContent = countByGame.magic;
  dom.statPokemon.textContent = countByGame.pokemon;
  dom.statYugioh.textContent = countByGame.yugioh;
}

function renderTable() {
  const game = dom.gameFilter.value;
  const filtered = getFilteredCards(game, dom.searchFilter.value);
  const { pageItems, totalPages } = getPaginatedCards(filtered);

  renderPagination(filtered.length, totalPages);

  dom.tableBody.innerHTML =
    filtered.length === 0
      ? `<tr><td colspan="7">${getEmptyStateHtml(game)}</td></tr>`
      : pageItems.map(cardRowHtml).join('');
}

function renderGrid() {
  const game = dom.gameFilter.value;
  const filtered = getFilteredCards(game, dom.searchFilter.value);
  const { pageItems, totalPages } = getPaginatedCards(filtered);

  renderPagination(filtered.length, totalPages);

  dom.cardsViewEl.innerHTML =
    filtered.length === 0
      ? `<div style="grid-column: 1 / -1;">${getEmptyStateHtml(game)}</div>`
      : pageItems.map(cardItemHtml).join('');
}

export function render() {
  renderSortIndicators();

  if (state.currentView === 'table') {
    renderTable();
  } else {
    renderGrid();
  }
}
