<?php

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Erro interno no servidor.']);
    exit;
});

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

require_once __DIR__ . '/../app/config.php';
require_once __DIR__ . '/../app/data-base.php';
require_once __DIR__ . '/../app/http.php';
require_once __DIR__ . '/../app/router.php';
require_once __DIR__ . '/../app/models/user.php';
require_once __DIR__ . '/../app/models/card.php';
require_once __DIR__ . '/../app/services/image-upload-service.php';
require_once __DIR__ . '/../app/services/card-validator-service.php';
require_once __DIR__ . '/../app/controllers/user-controller.php';
require_once __DIR__ . '/../app/controllers/auth-controller.php';
require_once __DIR__ . '/../app/controllers/card-controller.php';

$router = new App\Router();

require __DIR__ . '/../routes/api.php';

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
