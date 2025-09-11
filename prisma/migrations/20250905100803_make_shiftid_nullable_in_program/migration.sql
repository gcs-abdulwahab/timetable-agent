-- AlterTable
ALTER TABLE "public"."Program" ADD COLUMN     "shiftId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Program" ADD CONSTRAINT "Program_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
