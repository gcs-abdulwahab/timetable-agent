import { PrismaClient } from '../../lib/generated/prisma';

const prisma = new PrismaClient();

// Types for our timetable data
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean; // Indicates if the department offers BS degree programs
  bsSemesterAvailability?: {
    offeredLevels?: number[];
    excludedLevels?: number[];
  };
}

export interface Subject {
  id: string;
  name: string;
  departmentId: string;
  semesterLevel: number;
  isMajor?: boolean;
  teachingDepartmentIds?: string[];
}

export interface Teacher {
  id: string;
  name: string;
  departmentId: string;
}

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Prisma data fetchers
export async function getDepartments() {
  return await prisma.department.findMany();
}

export async function getSemesters() {
  return await prisma.semester.findMany();
}

export async function getSubjects() {
  return await prisma.subject.findMany();
}

export async function getTeachers() {
  return await prisma.teacher.findMany();
}

// Fetch time slots from Prisma
export async function getTimeSlots() {
  return await prisma.timeSlot.findMany();
}

// Fetch timetable entries from Prisma
export async function getTimetableEntries() {
  return await prisma.timetableEntry.findMany();
}

// Helper functions for semester availability
export const getSemesterLevel = (semOrId: string, semesters: { id: string; name: string }[]): number => {
  const sem = semesters.find((s) => s.id === semOrId);
  if (!sem) return NaN;
  const m = sem.name ? sem.name.match(/\d+/) : null;
  return m ? parseInt(m[0], 10) : NaN;
};

export const departmentOffersInSemester = (dept: Department, semOrId: string, semesters: { id: string; name: string }[]): boolean => {
  if (!dept.offersBSDegree) return false;
  const level = getSemesterLevel(semOrId, semesters);
  if (!Number.isFinite(level)) {
    // Fallback: if semester level cannot be parsed, do not filter out the department
    return dept.offersBSDegree;
  }
  const av = dept.bsSemesterAvailability;
  if (av && Array.isArray(av.offeredLevels) && av.offeredLevels.length) {
    return av.offeredLevels.includes(level);
  }
  if (av && Array.isArray(av.excludedLevels) && av.excludedLevels.length) {
    return !av.excludedLevels.includes(level);
  }
  // Default: if availability not specified, allow all semesters for BS departments
  return dept.offersBSDegree;
};

export const getActiveDepartmentsForSemester = (semOrId: string, departments: Department[], semesters: { id: string; name: string }[]): Department[] => {
  return departments.filter((d: Department) => departmentOffersInSemester(d, semOrId, semesters));
};

// Semester availability normalization utilities
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Returns offered levels array for a department by normalizing bsSemesterAvailability.
 * - If offeredLevels exists, use it.
 * - Else if excludedLevels exists, offered levels are LEVELS minus excludedLevels.
 * - Else if offersBSDegree true, return all LEVELS; otherwise return empty array.
 */
export const getOfferedLevelsForDept = (dept: Department): number[] => {
  const availability = dept.bsSemesterAvailability;
  
  // If offeredLevels exists, use it
  if (availability?.offeredLevels && Array.isArray(availability.offeredLevels)) {
    return [...availability.offeredLevels];
  }
  
  // Else if excludedLevels exists, offered levels are LEVELS minus excludedLevels
  if (availability?.excludedLevels && Array.isArray(availability.excludedLevels)) {
    return LEVELS.filter(level => !availability.excludedLevels!.includes(level));
  }
  
  // Else if offersBSDegree true, return all LEVELS; otherwise return empty array
  return dept.offersBSDegree ? [...LEVELS] : [];
};

/**
 * Returns the updated department object with bsSemesterAvailability.offeredLevels set to the provided array
 * and removes excludedLevels to standardize storage going forward.
 */
export const setOfferedLevelsForDept = (dept: Department, offeredLevels: number[]): Department => {
  return {
    ...dept,
    bsSemesterAvailability: {
      offeredLevels: [...offeredLevels]
      // excludedLevels is intentionally omitted to remove it
    }
  };
};

/**
 * Counts subjects for given departmentId and semester level.
 */
export const countSubjectsForDeptLevel = (subjects: Subject[], departmentId: string, semesterLevel: number): number => {
  return subjects.filter(subject => 
    subject.departmentId === departmentId && subject.semesterLevel === semesterLevel
  ).length;
};

/**
 * Computes the next offeredLevels array when a level is toggled.
 * If the level is currently offered, it will be removed.
 * If the level is not currently offered, it will be added.
 */
export const computeNextOfferedLevels = (dept: Department, toggledLevel: number): number[] => {
  const currentLevels = getOfferedLevelsForDept(dept);
  
  if (currentLevels.includes(toggledLevel)) {
    // Remove the level
    return currentLevels.filter(level => level !== toggledLevel);
  } else {
    // Add the level
    return [...currentLevels, toggledLevel].sort((a, b) => a - b);
  }
};

/**
 * Checks if a department has any subjects across all levels or any offered levels configured.
 * Used for warning when toggling offersBSDegree off.
 */
export const departmentHasSubjectsOrLevels = (dept: Department, subjects: Subject[]): boolean => {
  const hasSubjects = subjects.some(subject => subject.departmentId === dept.id);
  const currentLevels = getOfferedLevelsForDept(dept);
  const hasConfiguredLevels = currentLevels.length > 0;
  
  return hasSubjects || hasConfiguredLevels;
};

export type TimetableEntry = {
  id: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room: string;
  semesterId: string;
  departmentId: string;
};

export const timeSlots: TimeSlot[] = [
  { id: 'ts1', start: '08:00', end: '08:50', period: 1 },
  { id: 'ts2', start: '09:00', end: '09:50', period: 2 },
  { id: 'ts3', start: '10:00', end: '10:50', period: 3 },
  { id: 'ts4', start: '11:00', end: '11:50', period: 4 },
  { id: 'ts5', start: '12:00', end: '12:50', period: 5 },
  { id: 'ts6', start: '01:00', end: '01:50', period: 6 },
  { id: 'ts7', start: '02:00', end: '02:50', period: 7 },
];

