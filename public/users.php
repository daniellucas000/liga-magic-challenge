<?php
ob_start();
?>
<?php include __DIR__ . '/partials/header.php'; ?>

<main>
    <div class="page-head">
        <div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <a class="" href="dashboard.php">◀</a>
                <h2>Usuários</h2>
            </div>
            <p>Gerencie as função de acesso da equipe.</p>
        </div>
    </div>

    <div class="card-table-wrap" id="table-view">
        <table>
            <thead>
                <tr>
                    <th>Usuário</th>
                    <th>Role</th>
                    <th>Cadastrado em</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="users-table-body">
                <tr class="loading-row">
                    <td colspan="4">Carregando usuários...</td>
                </tr>
            </tbody>
        </table>
    </div>
</main>

<div class="toast" id="toast"></div>

<script type="module" src="javascript/users.js"></script>
<?php
$content = ob_get_clean();
$pageTitle = 'LigaMagic - Usuários';
include __DIR__ . '/partials/layout.php';
