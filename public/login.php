<?php
ob_start();
?>
<div class="login-shell">
    <div class="login-card">
        <div class="login-card__header">
            <div class="login-card__logo">
                <img src="images/orange-logo.png" alt="Logo Liga Magic" />
                <span>Gerenciador</span>
            </div>
        </div>
        <div class="login-card__body">
            <div class="error-msg" id="login-error"></div>
            <form id="login-form" novalidate>
                <div class="field">
                    <label for="username">Usuário</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        autocomplete="username"
                        required />
                </div>
                <div class="field">
                    <label for="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        autocomplete="current-password"
                        required />
                </div>
                <button type="submit" class="btn btn--primary" id="btn-login">
                    Entrar
                </button>
            </form>
            <p class="hint">
                Não tem conta? <a href="register.php">Cadastre-se</a><br>
                login: admin - senha: admin123
            </p>
        </div>
    </div>
</div>

<script src="javascript/login.js"></script>
<?php
$content = ob_get_clean();
$pageTitle = 'Portal de Cartas — Acesso';
include __DIR__ . '/partials/layout.php';
