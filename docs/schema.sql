-- Verdict Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id CHAR(36) PRIMARY KEY,
    firebaseUid VARCHAR(255) NOT NULL UNIQUE,
    phoneNumber VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    fullName VARCHAR(255),
    role ENUM('user', 'lawyer', 'admin') DEFAULT 'user',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Lawyers Table
CREATE TABLE IF NOT EXISTS Lawyers (
    id CHAR(36) PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    practiceArea VARCHAR(255) NOT NULL,
    experienceYears INTEGER DEFAULT 0,
    state VARCHAR(255),
    city VARCHAR(255),
    location VARCHAR(255), -- Legacy field
    barId VARCHAR(255),
    bio TEXT,
    rating FLOAT DEFAULT 0,
    badges JSON,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
