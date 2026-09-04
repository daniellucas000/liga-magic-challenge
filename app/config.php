<?php

function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);

        if (getenv($key) !== false) {
            continue;
        }

        putenv($key . '=' . trim($value));
    }
}

loadEnv(__DIR__ . '/../.env');
