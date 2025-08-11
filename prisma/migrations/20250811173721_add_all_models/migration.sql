-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "offersBSDegree" BOOLEAN NOT NULL,
    "bsSemesterAvailability" JSONB
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "creditHours" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "semesterLevel" INTEGER NOT NULL,
    "isCore" BOOLEAN NOT NULL,
    "semesterId" TEXT
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "building" TEXT,
    "floor" INTEGER,
    "hasProjector" BOOLEAN,
    "hasAC" BOOLEAN,
    "description" TEXT,
    "programTypes" JSONB NOT NULL,
    "primaryDepartmentId" TEXT,
    "availableForOtherDepartments" BOOLEAN
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "period" INTEGER NOT NULL
);
