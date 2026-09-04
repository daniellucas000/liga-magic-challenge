<?php

use App\Controllers\AuthController;
use App\Controllers\CardController;

/** @var App\Router $router */

$router->add('POST', '/api/login',   [AuthController::class, 'login']);
$router->add('POST', '/api/logout',  [AuthController::class, 'logout']);
$router->add('GET',  '/api/session', [AuthController::class, 'session']);

$router->add('GET',    '/api/cards',    [CardController::class, 'getAll'],    auth: true);
$router->add('POST',   '/api/cards',    [CardController::class, 'create'],     auth: true);
$router->add('PUT',    '/api/cards',    [CardController::class, 'update'],    auth: true);
$router->add('DELETE', '/api/cards',    [CardController::class, 'delete'],    auth: true);
$router->add('GET',    '/api/editions', [CardController::class, 'editions'],  auth: true);
