/*
  Warnings:

  - You are about to drop the `SubjectDepartments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SubjectDepartments" DROP CONSTRAINT "SubjectDepartments_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubjectDepartments" DROP CONSTRAINT "SubjectDepartments_subjectId_fkey";

-- AlterTable
ALTER TABLE "public"."Subject" ADD COLUMN     "subjectDepartments" INTEGER[];

-- DropTable
DROP TABLE "public"."SubjectDepartments";
