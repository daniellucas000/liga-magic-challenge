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
            return;
        }

        $user = User::findByUsername($username);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Http::json(['error' => 'Nome de usuário ou senha inválidos.'], 401);
            return;
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        Http::json(['user' => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']]]);
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
            return;
        }
        Http::json([
            'authenticated' => true,
            'user' => ['id' => $_SESSION['user_id'], 'username' => $_SESSION['username'], 'role' => $_SESSION['role']],
        ]);
    }

    public function register(): void
    {
        Http::startSession();
        $data = Http::jsonBody();
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '' || $password === '') {
            Http::json(['error' => 'Por favor, forneça o nome de usuário e a senha.'], 422);
            return;
        }

        if (strlen($password) < 6) {
            Http::json(['error' => 'A senha deve ter no mínimo 6 caracteres.'], 422);
            return;
        }

        if (User::findByUsername($username)) {
            Http::json(['error' => 'Este nome de usuário já está em uso.'], 409);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $id = User::create($username, $passwordHash);

        session_regenerate_id(true);
        $_SESSION['user_id'] = $id;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = 'editor';

        Http::json(['user' => ['id' => $id, 'username' => $username, 'role' => 'editor']], 201);
    }
}
