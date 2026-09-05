<?php
ob_start();
?>
<?php include __DIR__ . '/partials/header.php'; ?>
<main>
    <div class="page-head">
        <div>
            <h2>Cartas cadastradas</h2>
            <p>Liste, adicione, edite e remova cartas do acervo.</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <a href="users.php" class="btn btn--secondary" id="manage-users-btn">Usuários</a>
            <button class="btn btn--primary" id="new-card-btn" style="width: fit-content;">+ Nova carta</button>
        </div>
    </div>

    <div class="stats-bar" id="stats-bar">
        <div class="stats-bar__item" style="--accent-color: linear-gradient(180deg, #6c757d, #adb5bd);">
            <span class="stats-bar__value" id="stat-total">0</span>
            <span class="stats-bar__label">Total</span>
        </div>

        <div class="stats-bar__item" style="--accent-color: linear-gradient(180deg, #C3C4C5, #D4301F);">
            <span class="stats-bar__value" id="stat-magic">0</span>
            <span class="stats-bar__label">Magic: The Gathering</span>
        </div>

        <div class="stats-bar__item" style="--accent-color: linear-gradient(180deg, #3466AF, #FFCB05);">
            <span class="stats-bar__value" id="stat-pokemon">0</span>
            <span class="stats-bar__label">Pokémon</span>
        </div>

        <div class="stats-bar__item" style="--accent-color: linear-gradient(180deg, #F2411F, #F9F9EE);">
            <span class="stats-bar__value" id="stat-yugioh">0</span>
            <span class="stats-bar__label">Yu-Gi-Oh!</span>
        </div>
    </div>

    <div class="filters">
        <div class="field">
            <select id="game-filter">
                <option value="">Todos os jogos</option>
                <option value="magic">Magic: The Gathering</option>
                <option value="pokemon">Pokémon</option>
                <option value="yugioh">Yu-Gi-Oh!</option>
            </select>
        </div>
        <div class="field">
            <input type="text" id="search-filter" placeholder="Buscar por nome..." />
        </div>

        <div class="view-toggle" role="group" aria-label="Modo de visualização">
            <button type="button" class="view-toggle__btn is-active" id="view-table-btn" aria-pressed="true" title="Visualizar em tabela">
                <span class="icon">☰</span>
            </button>
            <button type="button" class="view-toggle__btn" id="view-cards-btn" aria-pressed="false" title="Visualizar em cards">
                <span class="icon">🂠</span>
            </button>
        </div>
    </div>

    <div class="card-table-wrap" id="table-view">
        <table>
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>
                        <button type="button" class="table-sort" id="sort-name">
                            Nome (inglês)
                            <span class="sort-arrow">↕</span>
                        </button>
                    </th>
                    <th>Nome (português)</th>
                    <th>Jogo</th>
                    <th>Edição</th>
                    <th>
                        <button type="button" class="table-sort" id="sort-rarity">
                            Raridade
                            <span class="sort-arrow">↕</span>
                        </button>
                    </th>
                    <th id="actions-header">Ações</th>
                </tr>
            </thead>
            <tbody id="table-body">
                <tr class="loading-row">
                    <td colspan="7">Carregando cartas...</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="cards-grid" id="cards-view" style="display:none;"></div>
    <div class="pagination" id="pagination">
        <button class="btn btn--ghost" id="pagination-prev" disabled>‹ Anterior</button>
        <span class="pagination__info" id="pagination-info"></span>
        <button class="btn btn--ghost" id="pagination-next" disabled>Próxima ›</button>
    </div>
</main>

<div class="modal-overlay" id="modal-overlay">
    <div class="modal">
        <div class="modal__header">
            <h2 id="modal-title">Nova carta</h2>
            <button
                class="modal__close"
                id="close-modal-btn"
                aria-label="Fechar">
                &times;
            </button>
        </div>
        <div class="modal__body">
            <div class="error-msg" id="form-error"></div>
            <form id="form-carta" novalidate enctype="multipart/form-data">
                <input type="hidden" id="card-id" />

                <div class="field-row">
                    <div class="field">
                        <label for="english_name">Nome (inglês) <span>*</span></label>
                        <input type="text" id="english_name" required />
                    </div>
                    <div class="field">
                        <label for="portuguese_name">Nome (português)</label>
                        <input type="text" id="portuguese_name" />
                    </div>
                </div>

                <div class="field">
                    <label for="card_game">Card Game <span>*</span></label>
                    <select id="card_game" required>
                        <option value="">Selecione um jogo...</option>
                        <option value="magic">Magic: The Gathering</option>
                        <option value="pokemon">Pokémon</option>
                        <option value="yugioh">Yu-Gi-Oh!</option>
                    </select>
                </div>

                <div class="field">
                    <label for="edition">Edição <span>*</span></label>
                    <select id="edition" required disabled>
                        <option value="">Selecione um jogo primeiro</option>
                    </select>
                </div>

                <div class="field-row">
                    <div class="field">
                        <label for="rarity">Raridade <span>*</span></label>
                        <input
                            type="text"
                            id="rarity"
                            placeholder="Ex: Rara, Comum..."
                            required />
                    </div>
                    <div class="field">
                        <label for="image_file">Imagem da carta</label>
                        <input type="file" id="image_file" accept="image/png, image/jpeg, image/webp" />
                        <img id="image_preview" style="display:none; max-width:120px; margin-top:8px; border-radius:6px;" />
                        <input type="hidden" id="image_url" name="image_url" />
                    </div>
                </div>
            </form>
        </div>
        <div class="modal__footer">
            <button class="btn btn--ghost" id="cancel-btn">Cancelar</button>
            <button
                class="btn btn--primary"
                id="save-btn"
                style="width: auto; padding-left: 24px; padding-right: 24px">
                Salvar carta
            </button>
        </div>
    </div>
</div>

<div id="confirm-modal-overlay" class="modal-overlay">
    <div class="modal">
        <p id="confirm-modal-message"></p>
        <div class="modal-actions">
            <button id="confirm-modal-cancel">Cancelar</button>
            <button id="confirm-modal-ok" class="btn-danger">Confirmar</button>
        </div>
    </div>
</div>

<div class="toast" id="toast"></div>

<script type="module" src="javascript/main.js"></script>
<?php
$content = ob_get_clean();
$pageTitle = 'LigaMagic - Gerenciador';
include __DIR__ . '/partials/layout.php';
