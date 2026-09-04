import { state, PAGE_SIZE } from './state.js';

export function sortCards(cards) {
  if (!state.sortColumn) return cards;

  return [...cards].sort((a, b) => {
    const valueA = String(a[state.sortColumn] || '').toLowerCase();
    const valueB = String(b[state.sortColumn] || '').toLowerCase();
    const result = valueA.localeCompare(valueB, 'pt-BR', {
      sensitivity: 'base',
    });
    return state.sortDirection === 'asc' ? result : -result;
  });
}

export function getFilteredCards(gameFilterValue, searchValue) {
  const search = searchValue.trim().toLowerCase();

  const filtered = state.cardsCache.filter((c) => {
    const matchesGame = !gameFilterValue || c.card_game === gameFilterValue;
    const matchesSearch =
      !search ||
      c.english_name.toLowerCase().includes(search) ||
      (c.portuguese_name || '').toLowerCase().includes(search);
    return matchesGame && matchesSearch;
  });

  return sortCards(filtered);
}

export function getPaginatedCards(filtered) {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  if (state.currentPage > totalPages) {
    state.currentPage = totalPages;
  }

  const start = (state.currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return { pageItems, totalPages };
}

export function handleSort(column, onSorted) {
  if (state.sortColumn === column) {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortColumn = column;
    state.sortDirection = 'asc';
  }
  state.currentPage = 1;
  onSorted();
}
