/*
  Warnings:

  - You are about to drop the column `degreeId` on the `Semester` table. All the data in the column will be lost.
  - Added the required column `programId` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Semester" DROP CONSTRAINT "Semester_degreeId_fkey";

-- AlterTable
ALTER TABLE "public"."Semester" DROP COLUMN "degreeId",
ADD COLUMN     "programId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Semester" ADD CONSTRAINT "Semester_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
