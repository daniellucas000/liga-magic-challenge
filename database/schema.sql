SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS card_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE card_portal;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    english_name VARCHAR(150) NOT NULL,
    portuguese_name VARCHAR(150) NULL,
    card_game ENUM('magic', 'pokemon', 'yugioh') NOT NULL,
    edition_id VARCHAR(20) NOT NULL,
    edition_name VARCHAR(100) NOT NULL,
    image VARCHAR(500) NULL,
    rarity VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cards_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;