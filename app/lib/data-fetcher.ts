// Client-side data fetcher that uses API routes instead of direct database access

// Types for consistency with schema
export interface Day {
  id: string;
  name: string;
  shortName: string;
  dayCode: number;
  isActive: boolean;
  workingHours: string;
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

export interface Teacher {
  id: string;
  name: string;
  shortName: string;
  departmentId: string;
  designation?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number;
  isCore: boolean;
  semesterId?: string;
}

export interface Room {
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
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  period: number;
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room: string;
  semesterId: string;
  departmentId: string;
}

// Helper function to fetch data from API endpoints
async function fetchFromApi<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (!response.ok) {
      console.error(`API error for ${endpoint}:`, response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}

// API fetchers for all entities
export async function getDepartments(): Promise<Department[]> {
  return fetchFromApi<Department>('departments');
}

export async function getTeachers(): Promise<Teacher[]> {
  return fetchFromApi<Teacher>('teachers');
}

export async function getSubjects(): Promise<Subject[]> {
  return fetchFromApi<Subject>('subjects');
}

export async function getRooms(): Promise<Room[]> {
  return fetchFromApi<Room>('rooms');
}

export async function getTimeSlots(): Promise<TimeSlot[]> {
  return fetchFromApi<TimeSlot>('timeslots');
}

export async function getSemesters(): Promise<Semester[]> {
  return fetchFromApi<Semester>('semesters');
}

export async function getDays(): Promise<Day[]> {
  return fetchFromApi<Day>('days');
}

export async function getActiveDays(): Promise<Day[]> {
  const days = await getDays();
  return days.filter(day => day.isActive);
}

export async function getTimetableEntries(): Promise<TimetableEntry[]> {
  return fetchFromApi<TimetableEntry>('timetable-entries');
}

// Filtered fetchers
export async function getTeachersByDepartment(departmentId: string): Promise<Teacher[]> {
  const teachers = await getTeachers();
  return teachers.filter(teacher => teacher.departmentId === departmentId);
}

export async function getSubjectsByDepartment(departmentId: string): Promise<Subject[]> {
  const subjects = await getSubjects();
  return subjects.filter(subject => subject.departmentId === departmentId);
}

export async function getSubjectsBySemester(semesterId: string): Promise<Subject[]> {
  const subjects = await getSubjects();
  return subjects.filter(subject => subject.semesterId === semesterId);
}

export async function getRoomsByType(roomType: string): Promise<Room[]> {
  const rooms = await getRooms();
  return rooms.filter(room => room.type.toLowerCase().includes(roomType.toLowerCase()));
}

export async function getActiveSemester(): Promise<Semester | null> {
  const semesters = await getSemesters();
  return semesters.find(semester => semester.isActive) || null;
}

// Utility functions
export async function getDepartmentById(id: string): Promise<Department | null> {
  const departments = await getDepartments();
  return departments.find(dept => dept.id === id) || null;
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const teachers = await getTeachers();
  return teachers.find(teacher => teacher.id === id) || null;
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find(subject => subject.id === id) || null;
}

export async function getRoomById(id: string): Promise<Room | null> {
  const rooms = await getRooms();
  return rooms.find(room => room.id === id) || null;
}

// Data validation functions
export async function validateDataIntegrity(): Promise<{
  isValid: boolean;
  errors: string[];
  summary: {
    departments: number;
    teachers: number;
    subjects: number;
    rooms: number;
    timeSlots: number;
    semesters: number;
    activeDays: number;
  };
}> {
  const errors: string[] = [];
  
  try {
    // Fetch all entities to count them
    const [
      departments,
      teachers,
      subjects,
      rooms,
      timeSlots,
      semesters,
      activeDays
    ] = await Promise.all([
      getDepartments(),
      getTeachers(),
      getSubjects(),
      getRooms(),
      getTimeSlots(),
      getSemesters(),
      getActiveDays()
    ]);

    // Validate minimum requirements
    if (departments.length === 0) errors.push('No departments found');
    if (teachers.length === 0) errors.push('No teachers found');
    if (subjects.length === 0) errors.push('No subjects found');
    if (rooms.length === 0) errors.push('No rooms found');
    if (timeSlots.length === 0) errors.push('No time slots found');
    if (semesters.length === 0) errors.push('No semesters found');
    if (activeDays.length === 0) errors.push('No active days found');

    // Validate we have exactly 6 active days (Monday-Saturday)
    if (activeDays.length !== 6) {
      errors.push(`Expected 6 active days, found ${activeDays.length}`);
    }

    // Validate active semester exists
    const activeSemester = await getActiveSemester();
    if (!activeSemester) {
      errors.push('No active semester found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      summary: {
        departments: departments.length,
        teachers: teachers.length,
        subjects: subjects.length,
        rooms: rooms.length,
        timeSlots: timeSlots.length,
        semesters: semesters.length,
        activeDays: activeDays.length,
      }
    };
  } catch (error) {
    console.error('Error validating data integrity:', error);
    return {
      isValid: false,
      errors: [`Data integrity validation failed: ${error}`],
      summary: {
        departments: 0,
        teachers: 0,
        subjects: 0,
        rooms: 0,
        timeSlots: 0,
        semesters: 0,
        activeDays: 0,
      }
    };
  }
}
