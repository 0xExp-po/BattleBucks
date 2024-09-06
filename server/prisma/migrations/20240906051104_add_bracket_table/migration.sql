/*
  Warnings:

  - You are about to drop the column `bracket` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "bracket";

-- CreateTable
CREATE TABLE "Bracket" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "player1Id" TEXT,
    "player2Id" TEXT,

    CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bracket_gameId_idx" ON "Bracket"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Bracket_gameId_round_position_key" ON "Bracket"("gameId", "round", "position");

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
