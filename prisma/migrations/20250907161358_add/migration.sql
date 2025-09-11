-- CreateTable
CREATE TABLE "public"."_DegreeSemesters" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DegreeSemesters_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DegreeSemesters_B_index" ON "public"."_DegreeSemesters"("B");

-- AddForeignKey
ALTER TABLE "public"."_DegreeSemesters" ADD CONSTRAINT "_DegreeSemesters_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Degree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DegreeSemesters" ADD CONSTRAINT "_DegreeSemesters_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
