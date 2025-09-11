/*
  Warnings:

  - You are about to drop the `_DegreeSemesters` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_DegreeSemesters" DROP CONSTRAINT "_DegreeSemesters_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DegreeSemesters" DROP CONSTRAINT "_DegreeSemesters_B_fkey";

-- DropTable
DROP TABLE "public"."_DegreeSemesters";

-- CreateTable
CREATE TABLE "public"."DegreeSemester" (
    "degreeId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,

    CONSTRAINT "DegreeSemester_pkey" PRIMARY KEY ("degreeId","semesterId")
);

-- AddForeignKey
ALTER TABLE "public"."DegreeSemester" ADD CONSTRAINT "DegreeSemester_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "public"."Degree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DegreeSemester" ADD CONSTRAINT "DegreeSemester_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
