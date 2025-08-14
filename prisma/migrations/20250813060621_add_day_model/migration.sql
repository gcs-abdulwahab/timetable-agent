-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "dayCode" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "workingHours" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Day_dayCode_key" ON "Day"("dayCode");
