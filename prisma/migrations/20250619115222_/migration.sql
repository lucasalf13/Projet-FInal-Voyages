/*
  Warnings:

  - You are about to drop the column `created_at` on the `Travel` table. All the data in the column will be lost.
  - Added the required column `continent` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo` to the `Travel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `created_at`,
    ADD COLUMN `continent` VARCHAR(191) NOT NULL,
    ADD COLUMN `photo` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `_Favoris` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_Favoris_AB_unique`(`A`, `B`),
    INDEX `_Favoris_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_Favoris` ADD CONSTRAINT `_Favoris_A_fkey` FOREIGN KEY (`A`) REFERENCES `Travel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_Favoris` ADD CONSTRAINT `_Favoris_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
