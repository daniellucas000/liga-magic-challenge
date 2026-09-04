<?php

namespace App\Services;

class ImageUploadService
{
    private const ALLOWED_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    private const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    public static function upload(array $file): array
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'Falha no upload da imagem.'];
        }

        if ($file['size'] > self::MAX_SIZE) {
            return ['success' => false, 'error' => 'A imagem deve ter no máximo 2MB.'];
        }

        $mimeType = mime_content_type($file['tmp_name']);
        if (!array_key_exists($mimeType, self::ALLOWED_TYPES)) {
            return ['success' => false, 'error' => 'Formato inválido. Envie apenas JPG, PNG ou WEBP.'];
        }

        if (@getimagesize($file['tmp_name']) === false) {
            return ['success' => false, 'error' => 'O arquivo enviado não é uma imagem válida.'];
        }

        $extension = self::ALLOWED_TYPES[$mimeType];
        $fileName = bin2hex(random_bytes(8)) . '.' . $extension;

        $uploadDir = __DIR__ . '/../../public/uploads/cards/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $fileName)) {
            return ['success' => false, 'error' => 'Falha ao salvar a imagem no servidor.'];
        }

        return ['success' => true, 'path' => 'uploads/cards/' . $fileName];
    }
}
