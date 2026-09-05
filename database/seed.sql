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
('Blue-Eyes White Dragon', 'Dragão Branco de Olhos Azuis', 'yugioh', 'lob', 'Legend of Blue Eyes White Dragon', NULL, 'Ultra Rara', 1),
('War of the Spark', 'Guerra da Centelha', 'magic', 'war', 'War of the Spark', NULL, 'Rara Mítica', 1),
('Teferi, Hero of Dominaria', NULL, 'magic', 'dom', 'Dominaria', NULL, 'Rara Mítica', 1),
('Pikachu', NULL, 'pokemon', 'base1', 'Base Set', NULL, 'Comum', 1),
('Mewtwo', NULL, 'pokemon', 'sv1', 'Scarlet & Violet', NULL, 'Rara Holográfica', 1),
('Dark Magician', 'Mago Negro', 'yugioh', 'sdy', 'Starter Deck: Yugi', NULL, 'Ultra Rara', 1),
('Exodia the Forbidden One', 'Exodia, o Proibido', 'yugioh', 'lob', 'Legend of Blue Eyes White Dragon', NULL, 'Secreta', 1),
('Red-Eyes Black Dragon', 'Dragão Negro de Olhos Vermelhos', 'yugioh', 'mrd', 'Metal Raiders', NULL, 'Ultra Rara', 1),
('Throne of Eldraine', 'Trono de Eldraine', 'magic', 'eld', 'Throne of Eldraine', NULL, 'Rara', 1),
('Umbreon', NULL, 'pokemon', 'swsh1', 'Sword & Shield', NULL, 'Rara Secreta', 1),
('Rise of the Duelist', NULL, 'yugioh', 'rotd', 'Rise of the Duelist', NULL, 'Comum', 1);