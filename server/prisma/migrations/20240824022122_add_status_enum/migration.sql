/*
  Warnings:

  - Changed the type of `status` on the `Friend` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GAME_INVITE', 'FRIEND_REQUEST');

-- AlterTable
ALTER TABLE "Friend" DROP COLUMN "status",
ADD COLUMN     "status" "FriendStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;
