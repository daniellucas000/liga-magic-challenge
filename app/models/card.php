<?php

namespace App\Models;

use App\Database;

class Card
{
    public static function getAll(): array
    {
        return Database::connect()
            ->query('SELECT * FROM cards ORDER BY created_at DESC')
            ->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::connect()->prepare('SELECT * FROM cards WHERE id = ?');
        $stmt->execute([$id]);

        $card = $stmt->fetch();

        return $card ?: null;
    }

    public static function create(array $data): int
    {
        $stmt = Database::connect()->prepare(
            'INSERT INTO cards (english_name, portuguese_name, card_game, edition_id, edition_name, image_url, rarity)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        $stmt->execute([
            $data['english_name'],
            $data['portuguese_name'],
            $data['card_game'],
            $data['edition_id'],
            $data['edition_name'],
            $data['image_url'],
            $data['rarity'],
        ]);

        return (int) Database::connect()->lastInsertId();
    }

    public static function update(int $id, array $data): void
    {
        $stmt = Database::connect()->prepare(
            'UPDATE cards SET english_name=?, portuguese_name=?, card_game=?, edition_id=?,
             edition_name=?, image_url=?, rarity=? WHERE id=?'
        );

        $stmt->execute([
            $data['english_name'],
            $data['portuguese_name'],
            $data['card_game'],
            $data['edition_id'],
            $data['edition_name'],
            $data['image_url'],
            $data['rarity'],
            $id,
        ]);
    }

    public static function delete(int $id): bool
    {
        $stmt = Database::connect()->prepare('DELETE FROM cards WHERE id = ?');

        $stmt->execute([$id]);

        return $stmt->rowCount() > 0;
    }
}
