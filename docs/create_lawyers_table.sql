-- SQL to create the Lawyers table for the Verdict App
-- Run this in your MySQL database (phpMyAdmin, etc.)

CREATE TABLE IF NOT EXISTS `Lawyers` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `practice` VARCHAR(255) NOT NULL,
  `experience` VARCHAR(255) DEFAULT NULL,
  `state` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `barId` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `isVerified` TINYINT(1) DEFAULT 0,
  `rating` FLOAT DEFAULT 0,
  `badges` JSON DEFAULT NULL,
  `facebook` VARCHAR(255) DEFAULT NULL,
  `instagram` VARCHAR(255) DEFAULT NULL,
  `linkedin` VARCHAR(255) DEFAULT NULL,
  `boostExpiresAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `lawyers_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
