<?php

use App\Controllers\AuthController;
use App\Controllers\CardController;
use App\Controllers\UserController;

/** @var App\Router $router */

$router->add('POST', '/api/login',   [AuthController::class, 'login']);
$router->add('POST', '/api/logout',  [AuthController::class, 'logout']);
$router->add('GET',  '/api/session', [AuthController::class, 'session']);

$router->add('GET',    '/api/cards',    [CardController::class, 'getAll'],    auth: true);
$router->add('POST',   '/api/cards',    [CardController::class, 'create'],     auth: true, roles: ['admin', 'editor']);
$router->add('PUT',    '/api/cards',    [CardController::class, 'update'],    auth: true, roles: ['admin', 'editor']);
$router->add('POST',   '/api/cards/{id}/duplicate', [CardController::class, 'duplicate'], auth: true, roles: ['admin', 'editor']);
$router->add('DELETE', '/api/cards',    [CardController::class, 'delete'],    auth: true, roles: ['admin', 'editor']);
$router->add('POST', '/api/cards/bulk-delete', [CardController::class, 'bulkDelete'], auth: true, roles: ['admin', 'editor']);

$router->add('GET',    '/api/editions', [CardController::class, 'editions'],  auth: true);
$router->add('POST', '/api/upload-image', [CardController::class, 'uploadImage'], auth: true, roles: ['admin', 'editor']);

$router->add('POST', '/api/register', [AuthController::class, 'register']);

$router->add('GET', '/api/users', [UserController::class, 'getAll'], auth: true, roles: ['admin']);
$router->add('PUT', '/api/users/{id}/role', [UserController::class, 'updateRole'], auth: true, roles: ['admin']);
