<?php

namespace App\Controllers;

use App\Http;
use App\Models\User;

class AuthController
{
    public function login(): void
    {
        Http::startSession();
        $data = Http::jsonBody();
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '' || $password === '') {
            Http::json(['error' => 'Por favor, forneça o nome de usuário e a senha.'], 422);
        }

        $user = User::findByUsername($username);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Http::json(['error' => 'Nome de usuário ou senha inválidos.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        Http::json(['user' => ['id' => $user['id'], 'username' => $user['username']]]);
    }

    public function logout(): void
    {
        Http::startSession();
        $_SESSION = [];
        session_destroy();
        Http::json(['ok' => true]);
    }

    public function session(): void
    {
        Http::startSession();
        if (empty($_SESSION['user_id'])) {
            Http::json(['authenticated' => false], 401);
        }
        Http::json([
            'authenticated' => true,
            'user' => ['id' => $_SESSION['user_id'], 'username' => $_SESSION['username']],
        ]);
    }
}
