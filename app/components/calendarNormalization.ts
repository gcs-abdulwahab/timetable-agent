// Calendar Normalization Utilities
// Provides standardized day codes, pattern parsing, and TimetableEntry adapters

import { TimetableEntry } from './data';

// ========= DAY CODE CONSTANTS =========
/**
 * Normalized day codes: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
 */
export const DAY_CODES = {
  MONDAY: 1,
  TUESDAY: 2, 
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
} as const;

export type DayCode = typeof DAY_CODES[keyof typeof DAY_CODES];

// ========= DAY NAME MAPPINGS =========
/**
 * Map day names to normalized day codes
 */
export const DAY_NAME_TO_CODE: Record<string, DayCode> = {
  'Monday': DAY_CODES.MONDAY,
  'Tuesday': DAY_CODES.TUESDAY,
  'Wednesday': DAY_CODES.WEDNESDAY,
  'Thursday': DAY_CODES.THURSDAY,
  'Friday': DAY_CODES.FRIDAY,
  'Saturday': DAY_CODES.SATURDAY
};

/**
 * Map normalized day codes to day names
 */
export const DAY_CODE_TO_NAME: Record<DayCode, string> = {
  [DAY_CODES.MONDAY]: 'Monday',
  [DAY_CODES.TUESDAY]: 'Tuesday',
  [DAY_CODES.WEDNESDAY]: 'Wednesday',
  [DAY_CODES.THURSDAY]: 'Thursday',
  [DAY_CODES.FRIDAY]: 'Friday',
  [DAY_CODES.SATURDAY]: 'Saturday'
};

// ========= PERIOD CONSTANTS =========
/**
 * Valid period numbers (single period per subject per day)
 */
export const VALID_PERIODS = [1, 2, 3, 4, 5, 6] as const;
export type Period = typeof VALID_PERIODS[number];

// ========= DAY PATTERN PARSING =========

/**
 * Parse day pattern strings to arrays of day codes
 * Examples:
 * - "(1-2)" → [1,2]
 * - "(1-3)" → [1,2,3]
 * - "(2,4,6)" → [2,4,6]
 * - "1" → [1]
 */
export function parseDayPattern(pattern: string): DayCode[] {
  const trimmed = pattern.trim();
  
  // Remove parentheses if present
  const cleaned = trimmed.replace(/[()]/g, '');
  
  // Handle range patterns like "1-3"
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const result: DayCode[] = [];
    for (let i = start; i <= end; i++) {
      if (i >= 1 && i <= 6) {
        result.push(i as DayCode);
      }
    }
    return result;
  }
  
  // Handle comma-separated patterns like "2,4,6" or "1,3,5"
  if (cleaned.includes(',')) {
    return cleaned.split(',')
      .map(d => parseInt(d.trim()))
      .filter(d => d >= 1 && d <= 6)
      .map(d => d as DayCode);
  }
  
  // Handle single day like "1"
  const singleDay = parseInt(cleaned);
  if (singleDay >= 1 && singleDay <= 6) {
    return [singleDay as DayCode];
  }
  
  return [];
}

/**
 * Create day pattern string from array of day codes
 * Examples:
 * - [1,2] → "(1-2)"
 * - [1,2,3] → "(1-3)"
 * - [2,4,6] → "(2,4,6)"
 * - [1] → "1"
 */
export function formatDayPattern(dayCodes: DayCode[]): string {
  if (dayCodes.length === 0) return '';
  if (dayCodes.length === 1) return dayCodes[0].toString();
  
  const sorted = [...dayCodes].sort((a, b) => a - b);
  
  // Check if it's a consecutive range
  const isConsecutive = sorted.every((day, index) => {
    if (index === 0) return true;
    return day === sorted[index - 1] + 1;
  });
  
  if (isConsecutive && sorted.length > 1) {
    return `(${sorted[0]}-${sorted[sorted.length - 1]})`;
  }
  
  // Non-consecutive or complex pattern
  return `(${sorted.join(',')})`;
}

// ========= DAY CODE CONVERSION UTILITIES =========

/**
 * Convert day name to day code
 */
export function dayNameToCode(dayName: string): DayCode | null {
  return DAY_NAME_TO_CODE[dayName] || null;
}

/**
 * Convert day code to day name
 */
export function dayCodeToName(dayCode: DayCode): string {
  return DAY_CODE_TO_NAME[dayCode] || '';
}

/**
 * Convert array of day names to day codes
 */
export function dayNamesToCodes(dayNames: string[]): DayCode[] {
  return dayNames
    .map(name => dayNameToCode(name))
    .filter((code): code is DayCode => code !== null);
}

/**
 * Convert array of day codes to day names
 */
export function dayCodesToNames(dayCodes: DayCode[]): string[] {
  return dayCodes.map(code => dayCodeToName(code));
}

// ========= TIMETABLE ENTRY ADAPTERS =========

/**
 * Normalized TimetableEntry structure option 1:
 * One record per (subject, day, period) - matches current structure
 */
export interface NormalizedTimetableEntry extends Omit<TimetableEntry, 'day'> {
  dayCode: DayCode; // Use day code instead of day name
  period: Period;   // Ensure period is typed correctly
}

/**
 * Alternative TimetableEntry structure option 2:
 * One record per subject with arrays of days/periods
 */
export interface CompactTimetableEntry extends Omit<TimetableEntry, 'day' | 'timeSlotId'> {
  dayCodes: DayCode[];  // Array of day codes for this subject
  periods: Period[];    // Array of periods for this subject
  timeSlotIds: string[]; // Array of time slot IDs (one per day/period combination)
}

// ========= ADAPTER FUNCTIONS =========

/**
 * Convert legacy TimetableEntry to NormalizedTimetableEntry
 */
export function toNormalizedEntry(entry: TimetableEntry): NormalizedTimetableEntry | null {
  const dayCode = dayNameToCode(entry.day);
  if (!dayCode) return null;
  
  // Extract period from timeSlotId (assuming format like 'ts1', 'ts2', etc.)
  const periodMatch = entry.timeSlotId.match(/ts(\d+)/);
  const period = periodMatch ? parseInt(periodMatch[1]) : null;
  
  if (!period || !VALID_PERIODS.includes(period as Period)) {
    return null;
  }
  
  return {
    ...entry,
    dayCode,
    period: period as Period
  };
}

/**
 * Convert NormalizedTimetableEntry back to legacy TimetableEntry
 */
export function toLegacyEntry(entry: NormalizedTimetableEntry): TimetableEntry {
  const { dayCode, period, ...rest } = entry;
  return {
    ...rest,
    day: dayCodeToName(dayCode),
    timeSlotId: `ts${period}`
  };
}

/**
 * Convert array of TimetableEntry to CompactTimetableEntry
 * Groups entries by (subjectId, teacherId, room, semesterId)
 */
export function toCompactEntries(entries: TimetableEntry[]): CompactTimetableEntry[] {
  const grouped = new Map<string, TimetableEntry[]>();
  
  // Group entries by key
  entries.forEach(entry => {
    const key = `${entry.subjectId}-${entry.teacherId}-${entry.room || 'no-room'}-${entry.semesterId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(entry);
  });
  
  // Convert groups to compact entries
  const compactEntries: CompactTimetableEntry[] = [];
  
  grouped.forEach(groupEntries => {
    if (groupEntries.length === 0) return;
    
    const first = groupEntries[0];
    const dayCodes: DayCode[] = [];
    const periods: Period[] = [];
    const timeSlotIds: string[] = [];
    
    groupEntries.forEach(entry => {
      const dayCode = dayNameToCode(entry.day);
      if (dayCode) {
        dayCodes.push(dayCode);
        
        // Extract period from timeSlotId
        const periodMatch = entry.timeSlotId.match(/ts(\d+)/);
        const period = periodMatch ? parseInt(periodMatch[1]) : null;
        if (period && VALID_PERIODS.includes(period as Period)) {
          periods.push(period as Period);
          timeSlotIds.push(entry.timeSlotId);
        }
      }
    });
    
    if (dayCodes.length > 0) {
      // Sort by day codes to maintain consistent ordering
      const sortedIndices = Array.from({ length: dayCodes.length }, (_, i) => i)
        .sort((a, b) => dayCodes[a] - dayCodes[b]);
      
      compactEntries.push({
        id: first.id,
        semesterId: first.semesterId,
        subjectId: first.subjectId,
        teacherId: first.teacherId,
        room: first.room,
        note: first.note,
        endTimeSlotId: first.endTimeSlotId,
        isLab: first.isLab,
        dayCodes: sortedIndices.map(i => dayCodes[i]),
        periods: sortedIndices.map(i => periods[i]),
        timeSlotIds: sortedIndices.map(i => timeSlotIds[i])
      });
    }
  });
  
  return compactEntries;
}

/**
 * Convert CompactTimetableEntry back to array of TimetableEntry
 */
export function fromCompactEntries(compactEntries: CompactTimetableEntry[]): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  
  compactEntries.forEach(compact => {
    // Create one entry for each day/period combination
    for (let i = 0; i < compact.dayCodes.length; i++) {
      const dayCode = compact.dayCodes[i];
      const period = i < compact.periods.length ? compact.periods[i] : compact.periods[0];
      const timeSlotId = i < compact.timeSlotIds.length ? compact.timeSlotIds[i] : `ts${period}`;
      
      entries.push({
        id: `${compact.id}_${dayCode}_${period}`,
        semesterId: compact.semesterId,
        subjectId: compact.subjectId,
        teacherId: compact.teacherId,
        timeSlotId,
        day: dayCodeToName(dayCode),
        room: compact.room,
        note: compact.note,
        endTimeSlotId: compact.endTimeSlotId,
        isLab: compact.isLab
      });
    }
  });
  
  return entries;
}

// ========= GENERATOR ADAPTER INTERFACE =========

/**
 * Adapter interface for timetable generators to output exact TimetableEntry shape
 */
export interface TimetableGeneratorAdapter {
  /**
   * Convert generator output to project's TimetableEntry format
   */
  adaptToProjectFormat<T>(generatorOutput: T): TimetableEntry[];
  
  /**
   * Convert project's TimetableEntry format to generator input
   */
  adaptFromProjectFormat(entries: TimetableEntry[]): unknown;
  
  /**
   * Validate that entries conform to project requirements
   */
  validateEntries(entries: TimetableEntry[]): { valid: boolean; errors: string[] };
}

/**
 * Default adapter implementation
 */
export class DefaultTimetableAdapter implements TimetableGeneratorAdapter {
  adaptToProjectFormat<T>(generatorOutput: T): TimetableEntry[] {
    // If already in correct format, return as-is
    if (Array.isArray(generatorOutput) && 
        generatorOutput.every(item => this.isValidTimetableEntry(item))) {
      return generatorOutput as TimetableEntry[];
    }
    
    // Add custom conversion logic here for specific generator formats
    throw new Error('Unsupported generator output format');
  }
  
  adaptFromProjectFormat(entries: TimetableEntry[]): TimetableEntry[] {
    return entries; // Default: no conversion needed
  }
  
  validateEntries(entries: TimetableEntry[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    entries.forEach((entry, index) => {
      if (!this.isValidTimetableEntry(entry)) {
        errors.push(`Entry ${index}: Invalid timetable entry structure`);
        return;
      }
      
      const dayCode = dayNameToCode(entry.day);
      if (!dayCode) {
        errors.push(`Entry ${index}: Invalid day "${entry.day}"`);
      }
      
      const periodMatch = entry.timeSlotId.match(/ts(\d+)/);
      const period = periodMatch ? parseInt(periodMatch[1]) : null;
      if (!period || !VALID_PERIODS.includes(period as Period)) {
        errors.push(`Entry ${index}: Invalid period in timeSlotId "${entry.timeSlotId}"`);
      }
      
      if (!entry.id || !entry.semesterId || !entry.subjectId || !entry.teacherId) {
        errors.push(`Entry ${index}: Missing required fields`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private isValidTimetableEntry(item: any): item is TimetableEntry {
    return item && 
           typeof item === 'object' &&
           typeof item.id === 'string' &&
           typeof item.semesterId === 'string' &&
           typeof item.subjectId === 'string' &&
           typeof item.teacherId === 'string' &&
           typeof item.timeSlotId === 'string' &&
           typeof item.day === 'string';
  }
}

// ========= UTILITY FUNCTIONS =========

/**
 * Get day pattern from array of TimetableEntry for same subject/teacher/period
 */
export function getDayPatternFromEntries(entries: TimetableEntry[]): string {
  const dayCodes = entries
    .map(entry => dayNameToCode(entry.day))
    .filter((code): code is DayCode => code !== null)
    .sort();
  
  return formatDayPattern([...new Set(dayCodes)]);
}

/**
 * Check if entries represent a valid schedule pattern
 */
export function isValidSchedulePattern(entries: TimetableEntry[]): boolean {
  if (entries.length === 0) return false;
  
  // All entries should have same subject, teacher, and period
  const first = entries[0];
  const allSame = entries.every(entry => 
    entry.subjectId === first.subjectId &&
    entry.teacherId === first.teacherId &&
    entry.timeSlotId === first.timeSlotId
  );
  
  if (!allSame) return false;
  
  // All days should be valid and unique
  const daySet = new Set(entries.map(entry => entry.day));
  return daySet.size === entries.length && 
         entries.every(entry => dayNameToCode(entry.day) !== null);
}
