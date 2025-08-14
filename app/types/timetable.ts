// Timetable-related types
export type Subject = {
  id: string;
  name: string;
  departmentId: string;
  semesterLevel: number;
  shortName?: string;
  semesterId?: string;
  teachingDepartmentIds?: string[];
  code?: string;
  color?: string;
};

export type Teacher = {
  id: string;
  name: string;
  departmentId: string;
  shortName?: string;
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  type: string;
  building?: string;
  floor?: number;
  hasProjector?: boolean;
  hasAC?: boolean;
  description?: string;
  programTypes: string[];
  primaryDepartmentId?: string;
  availableForOtherDepartments?: boolean;
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

export type Semester = {
  id: string;
  name: string;
  isActive: boolean;
};
