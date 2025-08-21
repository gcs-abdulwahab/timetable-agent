/*
  Warnings:

  - You are about to drop the column `color` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `semesterLevel` on the `Subject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Subject" DROP COLUMN "color",
DROP COLUMN "semesterLevel";

-- CreateTable
CREATE TABLE "public"."SubjectDepartments" (
    "subjectId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "SubjectDepartments_pkey" PRIMARY KEY ("subjectId","departmentId")
);

-- AddForeignKey
ALTER TABLE "public"."SubjectDepartments" ADD CONSTRAINT "SubjectDepartments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectDepartments" ADD CONSTRAINT "SubjectDepartments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
