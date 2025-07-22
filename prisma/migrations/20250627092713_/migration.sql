/*
  Warnings:

  - You are about to drop the column `continent` on the `Travel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `continent`,
    ADD COLUMN `destination` VARCHAR(191) NOT NULL DEFAULT 'À renseigner';
