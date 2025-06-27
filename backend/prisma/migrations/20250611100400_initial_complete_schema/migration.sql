-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'SUB_USER') NOT NULL,
    `companyName` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_isActive_idx`(`isActive`),
    INDEX `users_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customProjectId` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `projectUrl` VARCHAR(500) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_customProjectId_key`(`customProjectId`),
    INDEX `projects_customProjectId_idx`(`customProjectId`),
    INDEX `projects_name_idx`(`name`),
    INDEX `projects_isActive_idx`(`isActive`),
    INDEX `projects_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_projects` (
    `userId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `user_projects_userId_idx`(`userId`),
    INDEX `user_projects_projectId_idx`(`projectId`),
    INDEX `user_projects_isActive_idx`(`isActive`),
    PRIMARY KEY (`userId`, `projectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `otp` VARCHAR(10) NOT NULL,
    `purpose` ENUM('REGISTRATION', 'FORGOT_PASSWORD') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otp_requests_email_idx`(`email`),
    INDEX `otp_requests_expiresAt_idx`(`expiresAt`),
    INDEX `otp_requests_purpose_idx`(`purpose`),
    INDEX `otp_requests_isUsed_idx`(`isUsed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    INDEX `refresh_tokens_token_idx`(`token`),
    INDEX `refresh_tokens_expiresAt_idx`(`expiresAt`),
    INDEX `refresh_tokens_isRevoked_idx`(`isRevoked`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_projects` ADD CONSTRAINT `user_projects_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_projects` ADD CONSTRAINT `user_projects_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
