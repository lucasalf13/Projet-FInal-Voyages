/*
  Warnings:

  - You are about to drop the column `accommodation` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `practicalInfos` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `todoList` on the `Travel` table. All the data in the column will be lost.
  - You are about to drop the column `weather` on the `Travel` table. All the data in the column will be lost.
  - Added the required column `ouDormir` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ouManger` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queFaire` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transports` to the `Travel` table without a default value. This is not possible if the table is not empty.
  - Made the column `photos` on table `Travel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Travel` DROP COLUMN `accommodation`,
    DROP COLUMN `budget`,
    DROP COLUMN `duration`,
    DROP COLUMN `practicalInfos`,
    DROP COLUMN `todoList`,
    DROP COLUMN `weather`,
    ADD COLUMN `ouDormir` TEXT NOT NULL,
    ADD COLUMN `ouManger` TEXT NOT NULL,
    ADD COLUMN `queFaire` TEXT NOT NULL,
    ADD COLUMN `transports` TEXT NOT NULL,
    MODIFY `photos` TEXT NOT NULL;
