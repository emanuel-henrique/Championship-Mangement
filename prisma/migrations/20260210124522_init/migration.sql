/*
  Warnings:

  - You are about to drop the column `format` on the `championships` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `round` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `winner_team_id` on the `matches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_winner_team_id_fkey";

-- AlterTable
ALTER TABLE "championships" DROP COLUMN "format";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "group",
DROP COLUMN "round",
DROP COLUMN "winner_team_id";

-- DropEnum
DROP TYPE "ChampionshipFormat";

-- DropEnum
DROP TYPE "MatchRound";
