/*
  Warnings:

  - You are about to drop the column `detail` on the `Itinerary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Itinerary` DROP COLUMN `detail`,
    ADD COLUMN `detail_en` TEXT NULL,
    ADD COLUMN `detail_es` TEXT NULL,
    ADD COLUMN `detail_fr` TEXT NULL,
    ADD COLUMN `detail_it` TEXT NULL;
