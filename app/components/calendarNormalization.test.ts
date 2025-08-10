import {
  DAY_CODES,
  parseDayPattern,
  formatDayPattern,
  dayNameToCode,
  dayCodeToName,
  dayNamesToCodes,
  dayCodesToNames,
  toNormalizedEntry,
  toLegacyEntry,
  toCompactEntries,
  fromCompactEntries,
  DefaultTimetableAdapter,
  getDayPatternFromEntries,
  isValidSchedulePattern
} from './calendarNormalization';
import { TimetableEntry } from './data';

describe('Calendar Normalization', () => {
  
  // ========= DAY PATTERN PARSING =========
  
  describe('parseDayPattern', () => {
    it('should parse range patterns correctly', () => {
      expect(parseDayPattern('(1-2)')).toEqual([1, 2]);
      expect(parseDayPattern('(1-3)')).toEqual([1, 2, 3]);
      expect(parseDayPattern('(4-6)')).toEqual([4, 5, 6]);
      expect(parseDayPattern('1-3')).toEqual([1, 2, 3]); // without parentheses
    });
    
    it('should parse comma-separated patterns correctly', () => {
      expect(parseDayPattern('(1,3,5)')).toEqual([1, 3, 5]);
      expect(parseDayPattern('(2,4,6)')).toEqual([2, 4, 6]);
      expect(parseDayPattern('1,3,5')).toEqual([1, 3, 5]); // without parentheses
    });
    
    it('should parse single day patterns correctly', () => {
      expect(parseDayPattern('1')).toEqual([1]);
      expect(parseDayPattern('(3)')).toEqual([3]);
      expect(parseDayPattern('6')).toEqual([6]);
    });
    
    it('should handle invalid patterns gracefully', () => {
      expect(parseDayPattern('(1-7)')).toEqual([1, 2, 3, 4, 5, 6]); // stops at valid range
      expect(parseDayPattern('(0-3)')).toEqual([1, 2, 3]); // starts at valid range
      expect(parseDayPattern('invalid')).toEqual([]);
      expect(parseDayPattern('')).toEqual([]);
    });
  });
  
  describe('formatDayPattern', () => {
    it('should format consecutive ranges correctly', () => {
      expect(formatDayPattern([1, 2])).toBe('(1-2)');
      expect(formatDayPattern([1, 2, 3])).toBe('(1-3)');
      expect(formatDayPattern([4, 5, 6])).toBe('(4-6)');
    });
    
    it('should format non-consecutive patterns correctly', () => {
      expect(formatDayPattern([1, 3, 5])).toBe('(1,3,5)');
      expect(formatDayPattern([2, 4, 6])).toBe('(2,4,6)');
    });
    
    it('should format single day correctly', () => {
      expect(formatDayPattern([1])).toBe('1');
      expect(formatDayPattern([6])).toBe('6');
    });
    
    it('should handle empty arrays', () => {
      expect(formatDayPattern([])).toBe('');
    });
    
    it('should sort and handle unsorted input', () => {
      expect(formatDayPattern([3, 1, 2])).toBe('(1-3)');
      expect(formatDayPattern([5, 1, 3])).toBe('(1,3,5)');
    });
  });
  
  // ========= DAY CODE CONVERSION =========
  
  describe('dayNameToCode and dayCodeToName', () => {
    it('should convert day names to codes correctly', () => {
      expect(dayNameToCode('Monday')).toBe(DAY_CODES.MONDAY);
      expect(dayNameToCode('Tuesday')).toBe(DAY_CODES.TUESDAY);
      expect(dayNameToCode('Wednesday')).toBe(DAY_CODES.WEDNESDAY);
      expect(dayNameToCode('Thursday')).toBe(DAY_CODES.THURSDAY);
      expect(dayNameToCode('Friday')).toBe(DAY_CODES.FRIDAY);
      expect(dayNameToCode('Saturday')).toBe(DAY_CODES.SATURDAY);
    });
    
    it('should handle invalid day names', () => {
      expect(dayNameToCode('Sunday')).toBeNull();
      expect(dayNameToCode('InvalidDay')).toBeNull();
      expect(dayNameToCode('')).toBeNull();
    });
    
    it('should convert day codes to names correctly', () => {
      expect(dayCodeToName(1)).toBe('Monday');
      expect(dayCodeToName(2)).toBe('Tuesday');
      expect(dayCodeToName(3)).toBe('Wednesday');
      expect(dayCodeToName(4)).toBe('Thursday');
      expect(dayCodeToName(5)).toBe('Friday');
      expect(dayCodeToName(6)).toBe('Saturday');
    });
  });
  
  describe('array conversions', () => {
    it('should convert arrays of day names to codes', () => {
      expect(dayNamesToCodes(['Monday', 'Wednesday', 'Friday']))
        .toEqual([1, 3, 5]);
      expect(dayNamesToCodes(['Tuesday', 'Thursday']))
        .toEqual([2, 4]);
    });
    
    it('should filter out invalid day names', () => {
      expect(dayNamesToCodes(['Monday', 'Sunday', 'Tuesday']))
        .toEqual([1, 2]);
    });
    
    it('should convert arrays of day codes to names', () => {
      expect(dayCodesToNames([1, 3, 5]))
        .toEqual(['Monday', 'Wednesday', 'Friday']);
      expect(dayCodesToNames([2, 4]))
        .toEqual(['Tuesday', 'Thursday']);
    });
  });
  
  // ========= TIMETABLE ENTRY ADAPTERS =========
  
  describe('toNormalizedEntry and toLegacyEntry', () => {
    const sampleEntry: TimetableEntry = {
      id: 'test1',
      semesterId: 'sem1',
      subjectId: 'cs101',
      teacherId: 't1',
      timeSlotId: 'ts2',
      day: 'Tuesday',
      room: 'Room101'
    };
    
    it('should convert to normalized entry correctly', () => {
      const normalized = toNormalizedEntry(sampleEntry);
      expect(normalized).toEqual({
        ...sampleEntry,
        dayCode: 2,
        period: 2
      });
    });
    
    it('should handle invalid day names', () => {
      const invalidEntry = { ...sampleEntry, day: 'Sunday' };
      expect(toNormalizedEntry(invalidEntry)).toBeNull();
    });
    
    it('should handle invalid time slot IDs', () => {
      const invalidEntry = { ...sampleEntry, timeSlotId: 'invalid' };
      expect(toNormalizedEntry(invalidEntry)).toBeNull();
    });
    
    it('should convert back to legacy entry correctly', () => {
      const normalized = toNormalizedEntry(sampleEntry);
      expect(normalized).not.toBeNull();
      
      if (normalized) {
        const legacy = toLegacyEntry(normalized);
        expect(legacy).toEqual(sampleEntry);
      }
    });
  });
  
  describe('toCompactEntries and fromCompactEntries', () => {
    const sampleEntries: TimetableEntry[] = [
      {
        id: 'test1',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts2',
        day: 'Monday',
        room: 'Room101'
      },
      {
        id: 'test2',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts2',
        day: 'Tuesday',
        room: 'Room101'
      },
      {
        id: 'test3',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts2',
        day: 'Wednesday',
        room: 'Room101'
      }
    ];
    
    it('should convert to compact entries correctly', () => {
      const compact = toCompactEntries(sampleEntries);
      expect(compact).toHaveLength(1);
      expect(compact[0]).toEqual({
        id: 'test1',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        room: 'Room101',
        note: undefined,
        endTimeSlotId: undefined,
        isLab: undefined,
        dayCodes: [1, 2, 3], // Monday, Tuesday, Wednesday
        periods: [2, 2, 2], // All same period
        timeSlotIds: ['ts2', 'ts2', 'ts2']
      });
    });
    
    it('should convert back from compact entries correctly', () => {
      const compact = toCompactEntries(sampleEntries);
      const restored = fromCompactEntries(compact);
      
      expect(restored).toHaveLength(3);
      const sortedRestored = restored.sort((a, b) => dayNameToCode(a.day)! - dayNameToCode(b.day)!);
      expect(sortedRestored[0].day).toBe('Monday');
      expect(sortedRestored[1].day).toBe('Tuesday');
      expect(sortedRestored[2].day).toBe('Wednesday');
      expect(restored.every(entry => entry.timeSlotId === 'ts2')).toBe(true);
    });
  });
  
  // ========= ADAPTER VALIDATION =========
  
  describe('DefaultTimetableAdapter', () => {
    const adapter = new DefaultTimetableAdapter();
    
    const validEntry: TimetableEntry = {
      id: 'test1',
      semesterId: 'sem1',
      subjectId: 'cs101',
      teacherId: 't1',
      timeSlotId: 'ts2',
      day: 'Tuesday',
      room: 'Room101'
    };
    
    it('should validate valid entries', () => {
      const result = adapter.validateEntries([validEntry]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect invalid day names', () => {
      const invalidEntry = { ...validEntry, day: 'Sunday' };
      const result = adapter.validateEntries([invalidEntry]);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Entry 0: Invalid day "Sunday"');
    });
    
    it('should detect invalid time slot IDs', () => {
      const invalidEntry = { ...validEntry, timeSlotId: 'invalid' };
      const result = adapter.validateEntries([invalidEntry]);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid period in timeSlotId');
    });
    
    it('should detect missing required fields', () => {
      const invalidEntry = { ...validEntry, id: '' };
      const result = adapter.validateEntries([invalidEntry]);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing required fields');
    });
    
    it('should adapt entries in correct format', () => {
      const result = adapter.adaptToProjectFormat([validEntry]);
      expect(result).toEqual([validEntry]);
    });
    
    it('should throw error for unsupported formats', () => {
      expect(() => adapter.adaptToProjectFormat('invalid')).toThrow();
    });
  });
  
  // ========= UTILITY FUNCTIONS =========
  
  describe('utility functions', () => {
    const entries: TimetableEntry[] = [
      {
        id: 'test1',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts2',
        day: 'Monday',
        room: 'Room101'
      },
      {
        id: 'test2',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts2',
        day: 'Wednesday',
        room: 'Room101'
      },
      {
        id: 'test3',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts2',
        day: 'Friday',
        room: 'Room101'
      }
    ];
    
    it('should get day pattern from entries', () => {
      const pattern = getDayPatternFromEntries(entries);
      expect(pattern).toBe('(1,3,5)'); // Monday, Wednesday, Friday
    });
    
    it('should validate schedule patterns', () => {
      expect(isValidSchedulePattern(entries)).toBe(true);
      
      // Invalid: different subjects
      const invalidEntries = [...entries];
      invalidEntries[1] = { ...invalidEntries[1], subjectId: 'cs102' };
      expect(isValidSchedulePattern(invalidEntries)).toBe(false);
      
      // Invalid: duplicate days
      const duplicateEntries = [entries[0], entries[0]];
      expect(isValidSchedulePattern(duplicateEntries)).toBe(false);
      
      // Invalid: empty array
      expect(isValidSchedulePattern([])).toBe(false);
    });
  });
  
  // ========= INTEGRATION TESTS =========
  
  describe('integration tests', () => {
    it('should handle round-trip conversions correctly', () => {
      const original: TimetableEntry = {
        id: 'integration_test',
        semesterId: 'sem1',
        subjectId: 'cs101',
        teacherId: 't1',
        timeSlotId: 'ts3',
        day: 'Wednesday',
        room: 'Room101'
      };
      
      // Legacy -> Normalized -> Legacy
      const normalized = toNormalizedEntry(original);
      expect(normalized).not.toBeNull();
      
      if (normalized) {
        const backToLegacy = toLegacyEntry(normalized);
        expect(backToLegacy).toEqual(original);
      }
      
      // Entries -> Compact -> Entries
      const entries = [original];
      const compact = toCompactEntries(entries);
      const backToEntries = fromCompactEntries(compact);
      
      expect(backToEntries).toHaveLength(1);
      expect(backToEntries[0].subjectId).toBe(original.subjectId);
      expect(backToEntries[0].day).toBe(original.day);
    });
    
    it('should parse and format day patterns consistently', () => {
      const testPatterns = [
        '(1-3)',
        '(1,3,5)',
        '1',
        '(4-6)'
      ];
      
      testPatterns.forEach(pattern => {
        const parsed = parseDayPattern(pattern);
        const formatted = formatDayPattern(parsed);
        const reparsed = parseDayPattern(formatted);
        expect(reparsed).toEqual(parsed);
      });
    });
  });
});
