// Timetable utility functions

// Types for departments and semesters
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean; // Indicates if the department offers BS degree programs
  bsSemesterAvailability?: {
    offeredLevels?: number[];
    excludedLevels?: number[];
  };
}

export interface Semester {
  id: string;
  name: string;
  isActive: boolean;
}

// Helper function to get semester level from semester name or ID
export const getSemesterLevel = (semOrId: string, semesters: { id: string; name: string }[]): number => {
  const sem = semesters.find((s) => s.id === semOrId);
  if (!sem) return NaN;
  const m = sem.name ? sem.name.match(/\d+/) : null;
  return m ? parseInt(m[0], 10) : NaN;
};

// Helper function to check if a department offers courses in a specific semester
export const departmentOffersInSemester = (dept: Department, semOrId: string, semesters: { id: string; name: string }[]): boolean => {
  if (!dept.offersBSDegree) return false;
  const level = getSemesterLevel(semOrId, semesters);
  if (!Number.isFinite(level)) {
    // Fallback: if semester level cannot be parsed, do not filter out the department
    return dept.offersBSDegree;
  }
  const av = dept.bsSemesterAvailability;
  if (av && Array.isArray(av.offeredLevels) && av.offeredLevels.length) {
    return av.offeredLevels.includes(level);
  }
  if (av && Array.isArray(av.excludedLevels) && av.excludedLevels.length) {
    return !av.excludedLevels.includes(level);
  }
  // Default: if availability not specified, allow all semesters for BS departments
  return dept.offersBSDegree;
};

// Main function to get active departments for a specific semester
export const getActiveDepartmentsForSemester = (semOrId: string, departments: Department[], semesters: { id: string; name: string }[]): Department[] => {
  return departments.filter((d: Department) => departmentOffersInSemester(d, semOrId, semesters));
};

// Semester availability normalization utilities
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Returns offered levels array for a department by normalizing bsSemesterAvailability.
 * - If offeredLevels exists, use it.
 * - Else if excludedLevels exists, offered levels are LEVELS minus excludedLevels.
 * - Else if offersBSDegree true, return all LEVELS; otherwise return empty array.
 */
export const getOfferedLevelsForDept = (dept: Department): number[] => {
  const availability = dept.bsSemesterAvailability;
  
  // If offeredLevels exists, use it
  if (availability?.offeredLevels && Array.isArray(availability.offeredLevels)) {
    return [...availability.offeredLevels];
  }
  
  // Else if excludedLevels exists, offered levels are LEVELS minus excludedLevels
  if (availability?.excludedLevels && Array.isArray(availability.excludedLevels)) {
    return LEVELS.filter(level => !availability.excludedLevels!.includes(level));
  }
  
  // Else if offersBSDegree true, return all LEVELS; otherwise return empty array
  return dept.offersBSDegree ? [...LEVELS] : [];
};

/**
 * Returns the updated department object with bsSemesterAvailability.offeredLevels set to the provided array
 * and removes excludedLevels to standardize storage going forward.
 */
export const setOfferedLevelsForDept = (dept: Department, offeredLevels: number[]): Department => {
  return {
    ...dept,
    bsSemesterAvailability: {
      offeredLevels: [...offeredLevels]
      // excludedLevels is intentionally omitted to remove it
    }
  };
};

/**
 * Computes the next offeredLevels array when a level is toggled.
 * If the level is currently offered, it will be removed.
 * If the level is not currently offered, it will be added.
 */
export const computeNextOfferedLevels = (dept: Department, toggledLevel: number): number[] => {
  const currentLevels = getOfferedLevelsForDept(dept);
  
  if (currentLevels.includes(toggledLevel)) {
    // Remove the level
    return currentLevels.filter(level => level !== toggledLevel);
  } else {
    // Add the level
    return [...currentLevels, toggledLevel].sort((a, b) => a - b);
  }
};
