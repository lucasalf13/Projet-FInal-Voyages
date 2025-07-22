/*
  Warnings:

  - You are about to drop the column `accommodation` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `practicalInfos` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `todoList` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `weather` on the `Travel` table. All the data in the column will be lost.
  - You are about to alter the column `itinerary` on the `Travel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.
  - Made the column `photos` on table `Travel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `accommodation`,
    DROP COLUMN `budget`,
    DROP COLUMN `duration`,
    DROP COLUMN `practicalInfos`,
    DROP COLUMN `todoList`,
    DROP COLUMN `weather`,
    ADD COLUMN `ouDormir` JSON NULL,
    ADD COLUMN `ouManger` JSON NULL,
    ADD COLUMN `queFaire` JSON NULL,
    ADD COLUMN `transports` JSON NULL,
    MODIFY `itinerary` JSON NOT NULL,
    MODIFY `photos` JSON NOT NULL;
