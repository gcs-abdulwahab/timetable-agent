/*
  Warnings:

  - You are about to drop the column `workingHours` on the `Day` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `TimetableEntry` table. All the data in the column will be lost.
  - You are about to drop the column `semesterId` on the `TimetableEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TimetableEntry" DROP CONSTRAINT "TimetableEntry_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimetableEntry" DROP CONSTRAINT "TimetableEntry_semesterId_fkey";

-- AlterTable
ALTER TABLE "public"."Day" DROP COLUMN "workingHours";

-- AlterTable
ALTER TABLE "public"."TimetableEntry" DROP COLUMN "departmentId",
DROP COLUMN "semesterId";
