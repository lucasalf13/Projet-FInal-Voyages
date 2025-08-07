/*
  Warnings:

  - You are about to drop the `Hebergement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Hebergement` DROP FOREIGN KEY `Hebergement_travelId_fkey`;

-- AlterTable
ALTER TABLE `Travel` ADD COLUMN `ouDormir` JSON NULL;

-- DropTable
DROP TABLE `Hebergement`;
