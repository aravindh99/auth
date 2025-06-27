-- AlterTable
ALTER TABLE `user_projects` ADD COLUMN `lastAccessed` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `customRole` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `userId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_sessions_token_key`(`token`),
    INDEX `user_sessions_userId_idx`(`userId`),
    INDEX `user_sessions_token_idx`(`token`),
    INDEX `user_sessions_isActive_idx`(`isActive`),
    INDEX `user_sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(50) NULL,
    `projectId` INTEGER NULL,
    `details` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_projectId_idx`(`projectId`),
    INDEX `audit_logs_success_idx`(`success`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
