/*
  Warnings:

  - You are about to drop the column `ouDormir` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `ouManger` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `queFaire` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `transports` on the `Travel` table. All the data in the column will be lost.
  - Added the required column `accommodation` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budget` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weather` to the `Travel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `ouDormir`,
    DROP COLUMN `ouManger`,
    DROP COLUMN `queFaire`,
    DROP COLUMN `transports`,
    ADD COLUMN `accommodation` TEXT NOT NULL,
    ADD COLUMN `budget` INTEGER NOT NULL,
    ADD COLUMN `duration` VARCHAR(191) NOT NULL,
    ADD COLUMN `practicalInfos` TEXT NULL,
    ADD COLUMN `todoList` TEXT NULL,
    ADD COLUMN `weather` VARCHAR(191) NOT NULL,
    MODIFY `itinerary` TEXT NOT NULL,
    MODIFY `photos` TEXT NULL;
