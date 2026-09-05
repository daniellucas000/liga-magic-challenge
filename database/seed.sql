SET NAMES utf8mb4;

USE card_portal;

-- login: admin  |  password: admin123

INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$12$s68/qy3Ijolc6WVdoJYzUORwDuWJRCSn6lMIgilzAOgSmTtNejuNy', 'admin');

INSERT INTO cards (
    english_name,
    portuguese_name,
    card_game,
    edition_id,
    edition_name,
    image,
    rarity,
    created_by
) VALUES
('Lightning Bolt', 'Raio', 'magic', 'dom', 'Dominaria', NULL, 'Comum', 1),
('Charizard', NULL, 'pokemon', 'base1', 'Base Set', NULL, 'Rara Holográfica', 1),
('Blue-Eyes White Dragon', 'Dragão Branco de Olhos Azuis', 'yugioh', 'lob', 'Legend of Blue Eyes White Dragon', NULL, 'Ultra Rara', 1);