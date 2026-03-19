/*
  Warnings:

  - A unique constraint covering the columns `[team_id,jersey_number]` on the table `players` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN     "team_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "players_team_id_jersey_number_key" ON "players"("team_id", "jersey_number");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
