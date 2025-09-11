export interface DegreeSemesterSubject {
  id: number;
  degreeId: number;
  semesterId: number;
  subjectId: number;
  degree?: any;
  semester?: any;
  subject?: any;
}

export interface Degree  {
  id: number;
  name: string;
  programId: number;
  degreeSemesterSubjects?: DegreeSemesterSubject[];
  // ...other fields as needed
};
