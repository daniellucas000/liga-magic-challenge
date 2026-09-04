<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

require_once __DIR__ . '/../app/data-base.php';
require_once __DIR__ . '/../app/http.php';
require_once __DIR__ . '/../app/router.php';
require_once __DIR__ . '/../app/models/user.php';
require_once __DIR__ . '/../app/models/card.php';
require_once __DIR__ . '/../app/controllers/auth-controller.php';
require_once __DIR__ . '/../app/controllers/card-controller.php';

$router = new App\Router();

require __DIR__ . '/../routes/api.php';

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
