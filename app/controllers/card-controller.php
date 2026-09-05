<?php

namespace App\Controllers;

use App\Http;
use App\Models\Card;
use App\Services\CardValidator;
use App\Services\ImageUploadService;

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
        Http::json(['cards' => Card::getAll()]);
    }

    public function create(): void
    {
        $data = Http::jsonBody();

        if (!is_array($data)) {
            Http::json(['error' => 'Corpo da requisição inválido.'], 422);
            return;
        }

        $error = CardValidator::validate($data);
        if ($error) {
            Http::json(['error' => $error], 422);
            return;
        }

        $normalized = CardValidator::normalize($data);
        $normalized['created_by'] = (int) $_SESSION['user_id'];

        $id = Card::create($normalized);
        Http::json(['id' => $id], 201);
    }

    public function update(): void
    {
        $data = Http::jsonBody();
        if (!is_array($data)) {
            Http::json(['error' => 'Corpo da requisição inválido.'], 422);
            return;
        }

        $id = (int) ($data['id'] ?? 0);
        if ($id <= 0) {
            Http::json(['error' => 'O ID da carta é obrigatório.'], 422);
            return;
        }

        $card = Card::getById($id);
        if (!$card) {
            Http::json(['error' => 'Carta não encontrada.'], 404);
            return;
        }

        if ($error = $this->assertOwnership($card)) {
            Http::json(['error' => $error], 403);
            return;
        }

        $error = CardValidator::validate($data);
        if ($error) {
            Http::json(['error' => $error], 422);
            return;
        }

        Card::update($id, CardValidator::normalize($data));
        Http::json(['ok' => true]);
    }

    public function duplicate($id): void
    {
        $id = (int) $id;
        if ($id <= 0) {
            Http::json(['error' => 'O ID da carta é obrigatório.'], 422);
            return;
        }

        $card = Card::getById($id);
        if (!$card) {
            Http::json(['error' => 'Carta não encontrada.'], 404);
            return;
        }

        if ($error = $this->assertOwnership($card)) {
            Http::json(['error' => $error], 403);
            return;
        }

        unset($card['id']);
        $card['english_name'] = $card['english_name'] . ' - cópia';
        if (!empty($card['portuguese_name'])) {
            $card['portuguese_name'] = $card['portuguese_name'] . ' - cópia';
        }
        $card['created_by'] = (int) $_SESSION['user_id'];
        $card['created_at'] = date('Y-m-d H:i:s');

        $newId = Card::create($card);
        Http::json(['id' => $newId, 'message' => 'Carta duplicada com sucesso'], 201);
    }

    public function delete(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            Http::json(['error' => 'O ID da carta é obrigatório.'], 422);
            return;
        }

        $card = Card::getById($id);
        if (!$card) {
            Http::json(['error' => 'Carta não encontrada.'], 404);
            return;
        }

        if ($error = $this->assertOwnership($card)) {
            Http::json(['error' => $error], 403);
            return;
        }

        Card::delete($id);
        Http::json(['ok' => true]);
    }

    public function bulkDelete(): void
    {
        $data = Http::jsonBody();

        if (!is_array($data) || empty($data['ids']) || !is_array($data['ids'])) {
            Http::json(['error' => 'IDs são obrigatórios.'], 422);
            return;
        }

        $ids = array_map('intval', $data['ids']);
        $deleted = [];
        $skipped = [];

        foreach ($ids as $id) {
            $card = Card::getById($id);

            if (!$card || $this->assertOwnership($card)) {
                $skipped[] = $id;
                continue;
            }

            Card::delete($id);
            $deleted[] = $id;
        }

        Http::json(['deleted' => $deleted, 'skipped' => $skipped]);
    }

    public function editions(): void
    {
        $game = $_GET['game'] ?? '';

        if (!in_array($game, self::VALID_GAMES, true)) {
            Http::json(['error' => 'Carta de jogo inválida.'], 422);
            return;
        }

        usleep(400000);
        Http::json(['editions' => self::EDITIONS[$game] ?? []]);
    }

    public function uploadImage(): void
    {
        if (empty($_FILES['image_file'])) {
            Http::json(['error' => 'Nenhuma imagem foi enviada.'], 422);
            return;
        }

        $result = ImageUploadService::upload($_FILES['image_file']);

        if (!$result['success']) {
            Http::json(['error' => $result['error']], 422);
            return;
        }

        Http::json(['path' => $result['path']], 201);
    }

    private function assertOwnership(array $card): ?string
    {
        if ($_SESSION['role'] === 'admin') {
            return null;
        }

        if ((int) $card['created_by'] !== (int) $_SESSION['user_id']) {
            return 'Você não tem permissão para modificar esta carta.';
        }

        return null;
    }
}
