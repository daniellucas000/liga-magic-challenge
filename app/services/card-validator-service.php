<?php

namespace App\Services;

class CardValidator
{
    private const VALID_GAMES = ['magic', 'pokemon', 'yugioh'];

    public static function validate(array $d): ?string
    {
        if (trim($d['english_name'] ?? '') === '') return 'O nome da carta em inglês é obrigatório.';
        if (!in_array($d['card_game'] ?? '', self::VALID_GAMES, true)) return 'Carta de jogo inválida.';
        if (trim($d['edition_id'] ?? '') === '' || trim($d['edition_name'] ?? '') === '') return 'A edição do carta é necessária.';
        if (trim($d['rarity'] ?? '') === '') return 'A raridade da carta é obrigatória.';
        return null;
    }

    public static function normalize(array $d): array
    {
        return [
            'english_name'    => trim($d['english_name']),
            'portuguese_name' => trim($d['portuguese_name'] ?? '') ?: null,
            'card_game'       => $d['card_game'],
            'edition_id'      => trim($d['edition_id']),
            'edition_name'    => trim($d['edition_name']),
            'image'           => trim($d['image'] ?? '') ?: null,
            'rarity'          => trim($d['rarity']),
        ];
    }
}
