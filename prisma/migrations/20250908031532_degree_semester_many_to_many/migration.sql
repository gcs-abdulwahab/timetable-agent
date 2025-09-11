/*
  Warnings:

  - You are about to drop the column `programId` on the `Semester` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Semester" DROP CONSTRAINT "Semester_programId_fkey";

-- AlterTable
ALTER TABLE "public"."Program" ADD COLUMN     "institutionId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Semester" DROP COLUMN "programId";

-- AddForeignKey
ALTER TABLE "public"."Program" ADD CONSTRAINT "Program_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
