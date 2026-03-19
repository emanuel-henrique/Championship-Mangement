/*
  Warnings:

  - You are about to drop the column `team_id` on the `players` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_team_id_fkey";

-- DropIndex
DROP INDEX "players_team_id_jersey_number_key";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "team_id";
