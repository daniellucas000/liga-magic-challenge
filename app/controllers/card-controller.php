<?php

namespace App\Controllers;

use App\Http;
use App\Models\Card;

class CardController
{
    private const VALID_GAMES = ['magic', 'pokemon', 'yugioh'];

    private const EDITIONS = [
        'magic' => [
            ['id' => 'dom', 'name' => 'Dominaria'],
            ['id' => 'war', 'name' => 'War of the Spark'],
            ['id' => 'eld', 'name' => 'Throne of Eldraine'],
            ['id' => 'hob', 'name' => 'The Hobbit'],
            ['id' => 'msh', 'name' => 'Marvel Super Heroes'],
        ],
        'pokemon' => [
            ['id' => 'base1', 'name' => 'Base Set'],
            ['id' => 'swsh1', 'name' => 'Sword & Shield'],
            ['id' => 'sv1', 'name' => 'Scarlet & Violet'],
            ['id' => '30c', 'name' => '30th Celebration'],
            ['id' => 'cri', 'name' => 'Chaos Rising'],
        ],
        'yugioh' => [
            ['id' => 'lob', 'name' => 'Legend of Blue Eyes White Dragon'],
            ['id' => 'mrd', 'name' => 'Metal Raiders'],
            ['id' => 'sdy', 'name' => 'Starter Deck: Yugi'],
            ['id' => 'rotd', 'name' => 'Rise of the Duelist'],
            ['id' => 'blzd', 'name' => 'Blazing Dominion'],
        ],
    ];

    public function getAll(): void
    {
        if (!empty($_GET['id'])) {
            $card = Card::getById((int) $_GET['id']);
            if (!$card) {
                Http::json(['error' => 'Carta não encontrada.'], 404);
            }
            Http::json(['card' => $card]);
        }
        Http::json(['cards' => Card::getAll()]);
    }

    public function create(): void
    {
        $data = Http::jsonBody();
        $error = $this->validate($data);
        if ($error) {
            Http::json(['error' => $error], 422);
        }
        $id = Card::create($this->normalize($data));
        Http::json(['id' => $id], 201);
    }

    public function update(): void
    {
        $data = Http::jsonBody();
        $id = (int) ($data['id'] ?? 0);

        if ($id <= 0) {
            Http::json(['error' => 'O ID da carta é obrigatório.'], 422);
        }

        $error = $this->validate($data);
        if ($error) {
            Http::json(['error' => $error], 422);
        }

        if (!Card::getById($id)) {
            Http::json(['error' => 'Carta não encontrada.'], 404);
        }

        Card::update($id, $this->normalize($data));
        Http::json(['ok' => true]);
    }

    public function delete(): void
    {
        $id = (int) ($_GET['id'] ?? 0);

        if ($id <= 0) {
            Http::json(['error' => 'O ID da carta é obrigatório.'], 422);
        }
        if (!Card::delete($id)) {
            Http::json(['error' => 'Carta não encontrada.'], 404);
        }
        Http::json(['ok' => true]);
    }

    public function editions(): void
    {
        $game = $_GET['game'] ?? '';

        if (!in_array($game, self::VALID_GAMES, true)) {
            Http::json(['error' => 'Carta de jogo inválida.'], 422);
        }

        usleep(400000);
        Http::json(['editions' => self::EDITIONS[$game] ?? []]);
    }

    private function validate(array $d): ?string
    {
        if (trim($d['english_name'] ?? '') === '') return 'O nome do cartão em inglês é obrigatório.';
        if (!in_array($d['card_game'] ?? '', self::VALID_GAMES, true)) return 'Carta de jogo inválida.';
        if (trim($d['edition_id'] ?? '') === '' || trim($d['edition_name'] ?? '') === '') return 'A edição do cartão é necessária.';
        if (trim($d['rarity'] ?? '') === '') return 'A raridade da carta é obrigatória..';
        return null;
    }

    private function normalize(array $d): array
    {
        return [
            'english_name'    => trim($d['english_name']),
            'portuguese_name' => trim($d['portuguese_name'] ?? '') ?: null,
            'card_game'       => $d['card_game'],
            'edition_id'      => trim($d['edition_id']),
            'edition_name'    => trim($d['edition_name']),
            'image_url'       => trim($d['image_url'] ?? '') ?: null,
            'rarity'          => trim($d['rarity']),
        ];
    }
}
