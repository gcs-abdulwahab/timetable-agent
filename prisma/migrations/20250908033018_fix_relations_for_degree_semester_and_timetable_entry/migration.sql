/*
  Warnings:

  - You are about to drop the column `creditHours` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `isCore` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `semesterId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `subjectDepartments` on the `Subject` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_semesterId_fkey";

-- AlterTable
ALTER TABLE "public"."Subject" DROP COLUMN "creditHours",
DROP COLUMN "isCore",
DROP COLUMN "semesterId",
DROP COLUMN "subjectDepartments",
ADD COLUMN     "credits" INTEGER,
ALTER COLUMN "code" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."DegreeSemesterSubject" (
    "id" SERIAL NOT NULL,
    "degreeId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "DegreeSemesterSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DegreeSemesterSubject_degreeId_semesterId_subjectId_key" ON "public"."DegreeSemesterSubject"("degreeId", "semesterId", "subjectId");

-- AddForeignKey
ALTER TABLE "public"."DegreeSemesterSubject" ADD CONSTRAINT "DegreeSemesterSubject_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "public"."Degree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DegreeSemesterSubject" ADD CONSTRAINT "DegreeSemesterSubject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DegreeSemesterSubject" ADD CONSTRAINT "DegreeSemesterSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
