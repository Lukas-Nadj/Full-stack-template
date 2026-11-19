-- Initial database schema and starter seed data
-- Executed automatically on first container startup when db/volume is empty.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample starter data
INSERT INTO items (title, description) VALUES
    ('Welcome to Full-Stack Template', 'This starter app connects React, Node Express, and MySQL running in Docker.'),
    ('API Health Check', 'Visit /api/health to inspect live database connectivity status.'),
    ('Extend & Build', 'Add your own tables to db/init and your own endpoints in api/src.');
