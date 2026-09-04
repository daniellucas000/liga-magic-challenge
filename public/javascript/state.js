export const API_BASE = '/api';

export const GAME_NAMES = {
  magic: 'Magic: The Gathering',
  pokemon: 'Pokémon',
  yugioh: 'Yu-Gi-Oh!',
};

export const PAGE_SIZE = 8;

export const state = {
  cardsCache: [],
  editionRequestTicket: 0,
  searchDebounceTimer: null,
  currentView: localStorage.getItem('cardsViewMode') || 'table',
  currentPage: 1,
  sortColumn: null,
  sortDirection: 'asc',
};
