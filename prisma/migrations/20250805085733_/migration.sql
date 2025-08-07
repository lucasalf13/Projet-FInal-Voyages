/*
  Warnings:

  - You are about to drop the column `itinerary` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `queFaire` on the `Travel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `itinerary`,
    DROP COLUMN `queFaire`;

-- CreateTable
CREATE TABLE `Itinerary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `travelId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Itinerary` ADD CONSTRAINT `Itinerary_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
