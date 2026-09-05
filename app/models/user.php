<?php

namespace App\Models;

use App\Database;

class User
{
    public static function findByUsername(string $username): ?array
    {
        $stmt = Database::connect()->prepare(
            'SELECT id, username, password_hash, role FROM users WHERE username = ?'
        );
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function create(string $username, string $passwordHash): int
    {
        $stmt = Database::connect()->prepare(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)'
        );
        $stmt->execute([$username, $passwordHash]);
        return (int) Database::connect()->lastInsertId();
    }

    public static function getAll(): array
    {
        return Database::connect()
            ->query('SELECT id, username, role, created_at FROM users ORDER BY username ASC')
            ->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::connect()->prepare('SELECT id, username, role FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function updateRole(int $id, string $role): void
    {
        $stmt = Database::connect()->prepare('UPDATE users SET role = ? WHERE id = ?');
        $stmt->execute([$role, $id]);
    }
}
