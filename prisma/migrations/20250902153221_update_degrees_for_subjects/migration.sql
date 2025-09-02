/*
  Warnings:

  - You are about to drop the column `degreeId` on the `Subject` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_degreeId_fkey";

-- AlterTable
ALTER TABLE "public"."Subject" DROP COLUMN "degreeId";
