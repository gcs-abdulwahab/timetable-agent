/*
  Warnings:

  - You are about to drop the column `dayId` on the `TimetableEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TimetableEntry" DROP CONSTRAINT "TimetableEntry_dayId_fkey";

-- AlterTable
ALTER TABLE "public"."TimetableEntry" DROP COLUMN "dayId",
ADD COLUMN     "dayIds" INTEGER[];
