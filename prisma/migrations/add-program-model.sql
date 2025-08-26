-- Migration: Add Program model and relation to TimeSlot

ALTER TABLE "TimeSlot" ADD COLUMN "programId" INTEGER;

CREATE TABLE "Program" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "TimeSlot"
ADD CONSTRAINT "TimeSlot_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL;
