import { Degree } from './Degree';
import { Semester } from './Semester';
import { TimetableEntry } from './TimetableEntry';

export interface Subject {
  id: number;
  name: string;
  code?: string; // optional, e.g., ENG101
  credits?: number; // optional
  degreeSemesterSubjects?: DegreeSemesterSubject[];
  timetableEntries?: TimetableEntry[];
}

export interface DegreeSemesterSubject {
  id: number;
  degreeId: number;
  semesterId: number;
  subjectId: number;
  degree?: Degree;
  semester?: Semester;
  subject?: Subject;
}

