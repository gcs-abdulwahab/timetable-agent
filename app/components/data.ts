// Types for our timetable data
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean;
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
  id: string;
  name: string;
  shortName: string;
  code: string;
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number;
  isCore: boolean;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  period: number;
}

export interface TimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room?: string;
  note?: string;
  endTimeSlotId?: string;
  isLab?: boolean;
}

// Utility functions
export function getOfferedLevelsForDept(_deptId: string): number[] {
  // Dummy implementation; parameter intentionally unused
  return [1, 2, 3, 4, 5, 6, 7, 8];
}
export function setOfferedLevelsForDept(_deptId: string, _levels: number[]): void {
  // Dummy implementation; parameters intentionally unused
}

export function computeNextOfferedLevels(department: Department, level: number): number[] {
  // Dummy: toggles the level in/out of the offered levels
  const current = getOfferedLevelsForDept(department.id);
  if (current.includes(level)) {
    return current.filter(l => l !== level);
  } else {
    return [...current, level].sort((a, b) => a - b);
  }
}

export function countSubjectsForDeptLevel(subjects: Subject[], departmentId: string, level: number): number {
  // Dummy: counts subjects for department and level
  return subjects.filter(s => s.departmentId === departmentId && s.semesterLevel === level).length;
}

// Dummy async getters for conflictChecker
export async function getSemesters(): Promise<Semester[]> {
  return [];
}
export async function getSubjects(): Promise<Subject[]> {
  return [];
}
export async function getTeachers(): Promise<Teacher[]> {
  return [];
}
export async function getTimetableEntries(): Promise<TimetableEntry[]> {
  return [];
}
