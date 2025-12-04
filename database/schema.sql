-- Create a new database for the HeartGame project
CREATE DATABASE heartgame_db;

USE heartgame_db;


-- ============================
-- USERS TABLE
-- Stores user accounts, login info, and creation timestamp
-- ============================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID for each user
    username VARCHAR(100) NOT NULL UNIQUE,   -- Username (must be unique)
    password VARCHAR(255) NOT NULL,          -- Hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Auto-set user registration time
);


-- ============================
-- SCORES TABLE
-- Stores game scores for each user; multiple entries per user allowed
-- ============================
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique ID for each score entry
    user_id INT NOT NULL,                     -- ID of the user who made the score
    score INT NOT NULL,                       -- The actual score value
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the score was recorded

    -- Link score to the users table
    -- If a user is deleted, their scores are also deleted (CASCADE)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
