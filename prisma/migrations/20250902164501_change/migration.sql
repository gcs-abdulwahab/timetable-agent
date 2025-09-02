/*
  Warnings:

  - You are about to drop the column `endDate` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Semester` table. All the data in the column will be lost.
  - Added the required column `degreeId` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Semester" DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "term",
DROP COLUMN "year",
ADD COLUMN     "degreeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Semester" ADD CONSTRAINT "Semester_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "public"."Degree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
