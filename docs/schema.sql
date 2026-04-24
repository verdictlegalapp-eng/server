-- Verdict Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id CHAR(36) PRIMARY KEY,
    firebaseUid VARCHAR(255) UNIQUE,
    phoneNumber VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    image LONGTEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    legalNeed TEXT,
    role ENUM('user', 'lawyer', 'admin') DEFAULT 'user',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Lawyers Table
CREATE TABLE IF NOT EXISTS Lawyers (
    id CHAR(36) PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    practice VARCHAR(255) NOT NULL,
    experience VARCHAR(255),
    state VARCHAR(255),
    city VARCHAR(255),
    location VARCHAR(255),
    barId VARCHAR(255),
    bio TEXT,
    rating FLOAT DEFAULT 0,
    badges JSON,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- OTPs Table
CREATE TABLE IF NOT EXISTS Otps (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);
