/*
  Warnings:

  - You are about to drop the column `photo` on the `Travel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `photo`,
    ADD COLUMN `photos` VARCHAR(191) NULL;
