-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Semester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "year" INTEGER,
    "term" TEXT,
    "isActive" BOOLEAN,
    "startDate" TEXT,
    "endDate" TEXT
);
INSERT INTO "new_Semester" ("code", "endDate", "id", "isActive", "name", "startDate", "term", "year") SELECT "code", "endDate", "id", "isActive", "name", "startDate", "term", "year" FROM "Semester";
DROP TABLE "Semester";
ALTER TABLE "new_Semester" RENAME TO "Semester";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
