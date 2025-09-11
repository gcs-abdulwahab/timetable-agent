export interface DegreeSemesterSubject {
  id: number;
  degreeId: number;
  semesterId: number;
  subjectId: number;
  degree?: any;
  semester?: any;
  subject?: any;
}

export interface Semester {
  id: number;
  name: string;
  code?: string;
  isActive?: boolean;
  degreeSemesterSubjects?: DegreeSemesterSubject[];
  // ...other fields as needed
}
