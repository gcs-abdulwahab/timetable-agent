// UI-related types
export type Notification = { message: string; type: 'success' | 'error' } | null;
export type ConflictTooltip = { show: boolean; content: string; x: number; y: number };
export type DragOverlay = {
  show: boolean;
  x: number;
  y: number;
  subject: import('./timetable').Subject;
  teacher: import('./timetable').Teacher;
  daysDisplay: string;
} | null;
export type DraftData = {
  groupKey: string;
  entries: import('./timetable').TimetableEntry[];
  subject: import('./timetable').Subject;
  teacher: import('./timetable').Teacher;
  departmentId: string;
  provisionalTimeSlotId: string;
} | null;
export type DeleteConfirmation = {
  show: boolean;
  groupKey: string;
  entries: import('./timetable').TimetableEntry[];
  subject: import('./timetable').Subject;
  teacher: import('./timetable').Teacher;
} | null;
export type AddEntryData = {
  selectedSemester: string;
  selectedDepartment: string;
  selectedSubject: string;
  selectedTeacher: string;
  selectedTimeSlot: string;
  selectedDays: string[];
  room: string;
};
