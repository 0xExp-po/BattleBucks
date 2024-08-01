/*
  Warnings:

  - The primary key for the `game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `game` DROP FOREIGN KEY `Game_firstPlayerId_fkey`;

-- DropForeignKey
ALTER TABLE `game` DROP FOREIGN KEY `Game_secondPlayerId_fkey`;

-- DropForeignKey
ALTER TABLE `game` DROP FOREIGN KEY `Game_winnerId_fkey`;

-- DropForeignKey
ALTER TABLE `gamelog` DROP FOREIGN KEY `GameLog_gameId_fkey`;

-- DropForeignKey
ALTER TABLE `gamelog` DROP FOREIGN KEY `GameLog_playerId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_userId_fkey`;

-- DropIndex
DROP INDEX `User_name_key` ON `user`;

-- AlterTable
ALTER TABLE `game` DROP PRIMARY KEY,
    ADD COLUMN `gameType` ENUM('v1v1', 'BattleRoyale') NOT NULL DEFAULT 'v1v1',
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `buyIn` DOUBLE NULL DEFAULT 0,
    MODIFY `firstPlayerId` VARCHAR(191) NOT NULL,
    MODIFY `secondPlayerId` VARCHAR(191) NULL,
    MODIFY `winnerId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `gamelog` MODIFY `gameId` VARCHAR(191) NOT NULL,
    MODIFY `playerId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `transaction` MODIFY `senderId` VARCHAR(191) NOT NULL,
    MODIFY `receiverId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    ADD COLUMN `isOnline` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `name` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_firstPlayerId_fkey` FOREIGN KEY (`firstPlayerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_secondPlayerId_fkey` FOREIGN KEY (`secondPlayerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameLog` ADD CONSTRAINT `GameLog_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameLog` ADD CONSTRAINT `GameLog_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
