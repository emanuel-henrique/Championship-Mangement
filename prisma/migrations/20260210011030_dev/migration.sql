/*
  Warnings:

  - Added the required column `round` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChampionshipFormat" AS ENUM ('LEAGUE', 'KNOCKOUT', 'GROUPS_KNOCKOUT');

-- CreateEnum
CREATE TYPE "MatchRound" AS ENUM ('GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');

-- AlterTable
ALTER TABLE "championships" ADD COLUMN     "format" "ChampionshipFormat" NOT NULL DEFAULT 'LEAGUE';

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "group" TEXT,
ADD COLUMN     "round" "MatchRound" NOT NULL,
ADD COLUMN     "winner_team_id" INTEGER;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
