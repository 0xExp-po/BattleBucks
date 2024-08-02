/*
  Warnings:

  - A unique constraint covering the columns `[telegramID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telegramID` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramID" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramID_key" ON "User"("telegramID");
