/*
  Warnings:

  - You are about to drop the column `ouDormir` on the `Travel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `ouDormir`;

-- CreateTable
CREATE TABLE `Hebergement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `prix` VARCHAR(191) NOT NULL,
    `travelId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Hebergement` ADD CONSTRAINT `Hebergement_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
