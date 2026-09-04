<?php

namespace App;

class Http
{
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function requireAuth(): void
    {
        self::startSession();
        if (empty($_SESSION['user_id'])) {
            self::json(['error' => 'Not authenticated.'], 401);
        }
    }

    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;
    }

    public static function jsonBody(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        return is_array($data) ? $data : [];
    }
}
