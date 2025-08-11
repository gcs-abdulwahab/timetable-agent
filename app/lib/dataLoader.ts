import { Subject, Teacher, Department } from '../components/data';

// Types for loading data from JSON files
export interface JsonSubject {
  id: string;
  name: string;
  shortName: string;
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

export interface JsonTeacher {
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

export interface JsonDepartment {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean;
  bsSemesterAvailability?: {
    offeredLevels?: number[];
    excludedLevels?: number[];
  };
}

// Load subjects from JSON file
export async function loadSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch('/api/data/subjects');
    if (!response.ok) {
      throw new Error(`Failed to load subjects: ${response.statusText}`);
    }
    const jsonSubjects: JsonSubject[] = await response.json();
    
    return jsonSubjects.map(subject => ({
      ...subject,
      shortName: subject.shortName || subject.name,
      isMajor: subject.isMajor ?? true,
      teachingDepartmentIds: subject.teachingDepartmentIds ?? [subject.departmentId]
    }));
  } catch (error) {
    console.error('Error loading subjects from JSON:', error);
    // Fallback to empty array or could fallback to hardcoded data
    return [];
  }
}

// Load teachers from JSON file
export async function loadTeachers(): Promise<Teacher[]> {
  try {
    const response = await fetch('/api/data/teachers');
    if (!response.ok) {
      throw new Error(`Failed to load teachers: ${response.statusText}`);
    }
    const jsonTeachers: JsonTeacher[] = await response.json();
    
    return jsonTeachers.map(teacher => ({
      ...teacher,
      shortName: teacher.shortName || teacher.name
    }));
  } catch (error) {
    console.error('Error loading teachers from JSON:', error);
    // Fallback to empty array or could fallback to hardcoded data
    return [];
  }
}

// Load departments from JSON file
export async function loadDepartments(): Promise<Department[]> {
  try {
    const response = await fetch('/api/data/departments');
    if (!response.ok) {
      throw new Error(`Failed to load departments: ${response.statusText}`);
    }
    const jsonDepartments: JsonDepartment[] = await response.json();
    
    return jsonDepartments;
  } catch (error) {
    console.error('Error loading departments from JSON:', error);
    // Fallback to empty array or could fallback to hardcoded data
    return [];
  }
}

// Utility function to load all data at once
export async function loadAllData(): Promise<{
  subjects: Subject[];
  teachers: Teacher[];
  departments: Department[];
}> {
  const [subjects, teachers, departments] = await Promise.all([
    loadSubjects(),
    loadTeachers(),
    loadDepartments()
  ]);

  return { subjects, teachers, departments };
}
