/*
  Warnings:

  - You are about to drop the column `team` on the `GameParticipant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[txId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eliminatedPlayersCnt` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Made the column `buyIn` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `move` on the `GameLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `txId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('ROCK', 'PAPER', 'SCISSORS');

-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'WAITING_FRIEND';

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "eliminatedPlayersCnt" INTEGER NOT NULL,
ALTER COLUMN "buyIn" SET NOT NULL;

-- AlterTable
ALTER TABLE "GameLog" ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "move",
ADD COLUMN     "move" "MoveType" NOT NULL;

-- AlterTable
ALTER TABLE "GameParticipant" DROP COLUMN "team";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "txId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txId_key" ON "Transaction"("txId");
