export interface TimetableEntry {
  id: number;
  subjectId: number;
  teacherId: number;
  timeSlotId: number;
  dayId: number;
  roomId: number;
  // semesterId and departmentId removed: derive these from subjectId
}
