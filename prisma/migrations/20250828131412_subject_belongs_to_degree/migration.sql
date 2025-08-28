/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `degreeId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_departmentId_fkey";

-- AlterTable
ALTER TABLE "public"."Subject" DROP COLUMN "departmentId",
ADD COLUMN     "degreeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "public"."Degree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
