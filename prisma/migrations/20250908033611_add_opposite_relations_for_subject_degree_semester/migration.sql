-- AlterTable
ALTER TABLE "public"."Subject" ADD COLUMN     "degreeId" INTEGER,
ADD COLUMN     "semesterId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "public"."Degree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
