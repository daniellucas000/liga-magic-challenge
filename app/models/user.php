<?php

namespace App\Models;

use App\Database;

class User
{
    public static function findByUsername(string $username): ?array
    {
        $stmt = Database::connect()->prepare(
            'SELECT id, username, password_hash FROM users WHERE username = ?'
        );
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        return $user ?: null;
    }
}
