/*
  Warnings:

  - You are about to drop the column `code` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Semester` table. All the data in the column will be lost.
  - Added the required column `programId` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Semester" DROP COLUMN "code",
DROP COLUMN "isActive",
ADD COLUMN     "programId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Semester" ADD CONSTRAINT "Semester_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
