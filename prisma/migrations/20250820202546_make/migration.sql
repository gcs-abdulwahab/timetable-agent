-- DropForeignKey
ALTER TABLE "public"."TimetableEntry" DROP CONSTRAINT "TimetableEntry_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."TimetableEntry" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."TimetableEntry" ADD CONSTRAINT "TimetableEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
