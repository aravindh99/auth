-- AlterTable
ALTER TABLE `users` ADD COLUMN `companyAddress` TEXT NULL,
    ADD COLUMN `companyPhone` VARCHAR(20) NULL,
    ADD COLUMN `isSuspended` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `suspendedAt` DATETIME(3) NULL,
    ADD COLUMN `suspendedBy` INTEGER NULL,
    ADD COLUMN `suspensionReason` VARCHAR(500) NULL,
    ADD COLUMN `unsuspendedAt` DATETIME(3) NULL,
    ADD COLUMN `unsuspendedBy` INTEGER NULL;

-- CreateIndex
CREATE INDEX `users_isSuspended_idx` ON `users`(`isSuspended`);

-- CreateIndex
CREATE INDEX `users_suspendedBy_idx` ON `users`(`suspendedBy`);

-- CreateIndex
CREATE INDEX `users_companyName_idx` ON `users`(`companyName`);
