-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL
);
