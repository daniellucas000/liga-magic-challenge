<?php

namespace App\Controllers;

use App\Http;
use App\Models\User;

class UserController
{
    private const VALID_ROLES = ['admin', 'editor', 'viewer'];

    public function getAll(): void
    {
        Http::json(['users' => User::getAll()]);
    }

    public function updateRole($id): void
    {
        $id = (int) $id;
        $data = Http::jsonBody();
        $role = $data['role'] ?? '';

        if (!is_array($data)) {
            Http::json(['error' => 'Corpo da requisição inválido.'], 422);
            return;
        }

        if (!in_array($role, self::VALID_ROLES, true)) {
            Http::json(['error' => 'Role inválida.'], 422);
            return;
        }

        if ($id === (int) $_SESSION['user_id']) {
            Http::json(['error' => 'Você não pode alterar sua própria role.'], 422);
            return;
        }

        $user = User::getById($id);
        if (!$user) {
            Http::json(['error' => 'Usuário não encontrado.'], 404);
            return;
        }

        User::updateRole($id, $role);
        Http::json(['ok' => true]);
    }
}
