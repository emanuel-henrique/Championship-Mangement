-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "assist_player_id" INTEGER;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_assist_player_id_fkey" FOREIGN KEY ("assist_player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
