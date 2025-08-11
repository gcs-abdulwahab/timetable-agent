// app/components/data.ts

// Types only. No hardcoded arrays here.
// Utility: Get offered levels for a department
export function getOfferedLevelsForDept(department: Department): number[] {
  return department.bsSemesterAvailability?.offeredLevels ?? [];
}

// Utility: Set offered levels for a department (returns a new object)
export function setOfferedLevelsForDept(department: Department, newLevels: number[]): Department {
  return {
    ...department,
    bsSemesterAvailability: {
      ...department.bsSemesterAvailability,
      offeredLevels: newLevels,
    },
  };
}

// Utility: Compute next offered levels (toggle)
export function computeNextOfferedLevels(department: Department, level: number): number[] {
  const current = getOfferedLevelsForDept(department);
  if (current.includes(level)) {
    return current.filter(l => l !== level);
  } else {
    return [...current, level].sort((a, b) => a - b);
  }
}

// Utility: Count subjects for department and level (requires subjects array)
// Utility: Check if a department has any subjects or offered levels
export function departmentHasSubjectsOrLevels(department: Department, subjects?: Subject[]): boolean {
  const hasSubjects = subjects ? subjects.some(s => s.departmentId === department.id) : false;
  const levels = getOfferedLevelsForDept(department);
  return hasSubjects || (levels.length > 0);
}
// This is a stub; real implementation should use API data
export function countSubjectsForDeptLevel(departmentId: string, level: number, subjects?: Subject[]): number {
  if (!subjects) return 0;
  return subjects.filter(s => s.departmentId === departmentId && s.semesterLevel === level).length;
}
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean;
  bsSemesterAvailability?: {
    offeredLevels?: number[];
    excludedLevels?: number[];
  };
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: 'Spring' | 'Fall';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  shortName?: string;
  departmentId: string;
  designation?: string;
  contactNumber?: string;
  email?: string;
  dateOfBirth?: string;
  seniority?: number;
  cnic?: string;
  personnelNumber?: string;
}

export interface Subject {
  id: string | number; // allow numeric ids present in subjects.json
  name: string;
  shortName?: string;
  code: string;
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number;
  isCore: boolean;
  isMajor?: boolean;
  teachingDepartmentIds?: string[];
  semesterId?: string;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  period: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type?: 'Classroom' | 'Laboratory' | 'Auditorium' | 'Other';
  building?: string;
  floor?: number;
  hasProjector?: boolean;
  hasAC?: boolean;
  description?: string;
  programTypes: ('Inter' | 'BS')[];
  primaryDepartmentId?: string;
  availableForOtherDepartments?: boolean;
}

export interface TimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string | number;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room?: string;
  note?: string;
  endTimeSlotId?: string;
  isLab?: boolean;
}

// export days of week
// The export daysOfWeek was not found in module [project]/app/components/data.ts [app-client] (ecmascript).
// The module has no exports at all.

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

// Import and export timeSlots from timeslots.json
export const timeSlots: TimeSlot[] = [
  { id: "ts1", start: "8:00", end: "9:00", period: 1 },
  { id: "ts2", start: "9:00", end: "10:00", period: 2 },
  { id: "ts3", start: "10:00", end: "11:00", period: 3 },
  { id: "ts4", start: "11:15", end: "12:15", period: 4 },
  { id: "ts5", start: "12:15", end: "1:15", period: 5 },
  { id: "ts6", start: "1:30", end: "2:30", period: 6 },
  { id: "ts7", start: "2:30", end: "3:30", period: 7 }
];

// Helper function to get departments that offer degrees for a specific semester
// Accept semesterLevel (number) instead of semesterId
export function getActiveDepartmentsForSemester(semesterLevel: number, departments: Department[]): Department[] {
  return departments.filter(
    d =>
      d.offersBSDegree &&
      d.bsSemesterAvailability?.offeredLevels?.includes(semesterLevel)
  );
  }

// Placeholder rooms array - this should be replaced with API calls
export const rooms: Room[] = [];

