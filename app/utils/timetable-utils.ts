// Timetable utility functions

export interface Department {
  id: number;
  name: string;
  shortName: string;
  offersBSDegree: boolean;
  bsSemesterAvailability?: {
    offeredLevels?: number[];
    excludedLevels?: number[];
  };
}

export interface Semester {
  id: number;
  name: string;
  isActive: boolean;
}

// Return departments active for a given semester id.
export function getActiveDepartmentsForSemester(semesterId: number, departments: Department[], semesters: Semester[]) {
  // Basic implementation: return departments that offer BS degree.
  // If further semester-scoped filtering is needed, inspect bsSemesterAvailability.
  return departments.filter(d => d.offersBSDegree);
}
