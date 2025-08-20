import type { TimetableEntry } from "../types";

/**
 * Returns a comma-separated string of day numbers for the given timetable entries.
 */
export function formatDaysDisplay(entries: TimetableEntry[]): string {
  const dayMap: { [key: string]: number } = {
    'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };
  const dayNumbers = entries.map(entry => dayMap[entry.dayId]).filter(num => num !== undefined).sort((a, b) => a - b);
  return dayNumbers.join(", ");
}
