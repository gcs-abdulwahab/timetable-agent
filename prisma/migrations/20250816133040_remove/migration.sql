/*
  Warnings:

  - You are about to drop the column `day` on the `TimetableEntry` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `TimetableEntry` table. All the data in the column will be lost.
  - Added the required column `dayId` to the `TimetableEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `TimetableEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TimetableEntry" DROP COLUMN "day",
DROP COLUMN "room",
ADD COLUMN     "dayId" INTEGER NOT NULL,
ADD COLUMN     "roomId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."TimetableEntry" ADD CONSTRAINT "TimetableEntry_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."Day"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimetableEntry" ADD CONSTRAINT "TimetableEntry_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
