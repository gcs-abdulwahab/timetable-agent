# Calendar Normalization System

This document describes the calendar semantics and slot model normalization system for the timetable project.

## Overview

The normalization system standardizes:

1. **Day codes**: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday  
2. **Day patterns**: (1-2) → [1,2], (1-3) → [1,2,3], etc.
3. **Periods**: Integers 1–6 (single period per subject per day)
4. **TimetableEntry models**: Both individual records and compact arrays supported

## Day Code System

### Basic Mapping
```typescript
const DAY_CODES = {
  MONDAY: 1,
  TUESDAY: 2, 
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
} as const;
```

### Conversion Functions
```typescript
// Convert between day names and codes
dayNameToCode('Monday')    // → 1
dayCodeToName(1)           // → 'Monday'

// Convert arrays
dayNamesToCodes(['Monday', 'Wednesday', 'Friday'])  // → [1, 3, 5]
dayCodesToNames([1, 3, 5])                          // → ['Monday', 'Wednesday', 'Friday']
```

## Day Pattern Parsing

The system supports various day pattern formats:

### Range Patterns
```typescript
parseDayPattern('(1-3)')    // → [1, 2, 3] (Monday-Wednesday)
parseDayPattern('(1-2)')    // → [1, 2]    (Monday-Tuesday)
parseDayPattern('(4-6)')    // → [4, 5, 6] (Thursday-Saturday)
```

### Comma-Separated Patterns
```typescript
parseDayPattern('(1,3,5)')  // → [1, 3, 5] (Monday, Wednesday, Friday)
parseDayPattern('(2,4,6)')  // → [2, 4, 6] (Tuesday, Thursday, Saturday)
```

### Single Day Patterns
```typescript
parseDayPattern('1')        // → [1]       (Monday only)
parseDayPattern('(3)')      // → [3]       (Wednesday only)
```

### Formatting Back to Patterns
```typescript
formatDayPattern([1, 2, 3]) // → '(1-3)'   (consecutive range)
formatDayPattern([1, 3, 5]) // → '(1,3,5)' (non-consecutive)
formatDayPattern([1])       // → '1'       (single day)
```

## TimetableEntry Models

The system supports two TimetableEntry structures:

### Option 1: Individual Records (Current System)
One record per (subject, day, period) - matches existing structure:

```typescript
interface TimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;  // 'ts1', 'ts2', etc. (period 1-6)
  day: string;         // 'Monday', 'Tuesday', etc.
  room?: string;
  note?: string;
  endTimeSlotId?: string;
  isLab?: boolean;
}

// Example: 3-credit course meeting Monday-Wednesday
[
  { id: 'cs101_1', subjectId: 'cs101', day: 'Monday', timeSlotId: 'ts2', ... },
  { id: 'cs101_2', subjectId: 'cs101', day: 'Tuesday', timeSlotId: 'ts2', ... },
  { id: 'cs101_3', subjectId: 'cs101', day: 'Wednesday', timeSlotId: 'ts2', ... }
]
```

### Option 2: Compact Records with Arrays
One record per subject with arrays of days/periods:

```typescript
interface CompactTimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  dayCodes: DayCode[];     // [1, 2, 3] for Monday-Wednesday
  periods: Period[];       // [2, 2, 2] for period 2
  timeSlotIds: string[];   // ['ts2', 'ts2', 'ts2']
  room?: string;
  note?: string;
  endTimeSlotId?: string;
  isLab?: boolean;
}

// Example: Same 3-credit course as compact entry
{
  id: 'cs101',
  subjectId: 'cs101',
  dayCodes: [1, 2, 3],        // Monday, Tuesday, Wednesday
  periods: [2, 2, 2],         // All period 2
  timeSlotIds: ['ts2', 'ts2', 'ts2'],
  ...
}
```

## Adapter Functions

### Converting Between Formats

```typescript
import {
  toNormalizedEntry,
  toLegacyEntry,
  toCompactEntries,
  fromCompactEntries
} from './calendarNormalization';

// Individual entry normalization
const legacyEntry: TimetableEntry = {
  id: 'test1', 
  day: 'Tuesday', 
  timeSlotId: 'ts3', 
  ...
};

const normalized = toNormalizedEntry(legacyEntry);
// Result: { ..., dayCode: 2, period: 3 }

const backToLegacy = toLegacyEntry(normalized);
// Result: { ..., day: 'Tuesday', timeSlotId: 'ts3' }

// Batch conversion to compact format
const entries: TimetableEntry[] = [...]; // Multiple entries for same subject
const compact = toCompactEntries(entries);
const backToEntries = fromCompactEntries(compact);
```

### Validation

```typescript
import { DefaultTimetableAdapter } from './calendarNormalization';

const adapter = new DefaultTimetableAdapter();
const validation = adapter.validateEntries(entries);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // Example errors:
  // - "Entry 0: Invalid day 'Sunday'"
  // - "Entry 1: Invalid period in timeSlotId 'invalid'"
  // - "Entry 2: Missing required fields"
}
```

## Generator Adapter Interface

For timetable generators to output exact TimetableEntry shape:

```typescript
interface TimetableGeneratorAdapter {
  // Convert generator output to project format
  adaptToProjectFormat<T>(generatorOutput: T): TimetableEntry[];
  
  // Convert project format to generator input
  adaptFromProjectFormat(entries: TimetableEntry[]): unknown;
  
  // Validate entries conform to requirements
  validateEntries(entries: TimetableEntry[]): { valid: boolean; errors: string[] };
}

// Usage example
class CustomGeneratorAdapter implements TimetableGeneratorAdapter {
  adaptToProjectFormat(generatorOutput: CustomFormat[]): TimetableEntry[] {
    return generatorOutput.map(item => ({
      id: item.courseId,
      semesterId: item.semester,
      subjectId: item.subject,
      teacherId: item.instructor,
      timeSlotId: `ts${item.period}`,
      day: dayCodeToName(item.dayCode),
      room: item.classroom
    }));
  }
  
  adaptFromProjectFormat(entries: TimetableEntry[]): CustomFormat[] {
    return entries.map(entry => ({
      courseId: entry.id,
      semester: entry.semesterId,
      subject: entry.subjectId,
      instructor: entry.teacherId,
      period: parseInt(entry.timeSlotId.replace('ts', '')),
      dayCode: dayNameToCode(entry.day),
      classroom: entry.room
    }));
  }
  
  validateEntries(entries: TimetableEntry[]) {
    // Custom validation logic
    return { valid: true, errors: [] };
  }
}
```

## Utility Functions

### Pattern Analysis

```typescript
// Get day pattern from existing entries
const entries = [
  { day: 'Monday', subjectId: 'cs101', ... },
  { day: 'Wednesday', subjectId: 'cs101', ... },
  { day: 'Friday', subjectId: 'cs101', ... }
];

const pattern = getDayPatternFromEntries(entries);
console.log(pattern); // '(1,3,5)'

// Validate schedule patterns
const isValid = isValidSchedulePattern(entries);
console.log(isValid); // true if all entries have same subject/teacher/period
```

### Credit Hour Mapping

Based on existing patterns in the codebase:

- **3-credit courses**: Typically meet 3 days per week (1-3) or (4-6)
- **2-credit courses**: Meet 2 days per week (1-2) or (1,3) etc.
- **1-credit labs**: Meet 1 day per week (3) or (5) etc.

```typescript
// Example usage for scheduling
const creditHours = subject.creditHours;
let dayPattern: string;

switch (creditHours) {
  case 3:
    dayPattern = '(1-3)'; // Monday-Wednesday
    break;
  case 2:
    dayPattern = '(1,3)'; // Monday, Wednesday
    break;
  case 1:
    dayPattern = '3';     // Wednesday only
    break;
  default:
    dayPattern = '1';     // Default to Monday
}

const dayCodes = parseDayPattern(dayPattern);
```

## Integration Examples

### Complete Workflow Example

```typescript
import {
  parseDayPattern,
  formatDayPattern,
  toCompactEntries,
  fromCompactEntries,
  DefaultTimetableAdapter,
  getDayPatternFromEntries
} from './calendarNormalization';

// 1. Parse day requirements from course configuration
const courseConfig = {
  subjectId: 'cs101',
  creditHours: 3,
  preferredDays: '(1-3)', // Monday-Wednesday
  period: 2
};

const dayCodes = parseDayPattern(courseConfig.preferredDays);
console.log(dayCodes); // [1, 2, 3]

// 2. Generate individual timetable entries
const entries: TimetableEntry[] = dayCodes.map((dayCode, index) => ({
  id: `${courseConfig.subjectId}_${dayCode}`,
  semesterId: 'sem1',
  subjectId: courseConfig.subjectId,
  teacherId: 't1',
  timeSlotId: `ts${courseConfig.period}`,
  day: dayCodeToName(dayCode),
  room: 'CS-101'
}));

// 3. Validate the generated entries
const adapter = new DefaultTimetableAdapter();
const validation = adapter.validateEntries(entries);

if (validation.valid) {
  console.log('Generated valid timetable entries');
  
  // 4. Convert to compact format if needed
  const compact = toCompactEntries(entries);
  console.log('Compact format:', compact[0]);
  // { dayCodes: [1,2,3], periods: [2,2,2], ... }
  
  // 5. Analyze the pattern
  const detectedPattern = getDayPatternFromEntries(entries);
  console.log('Detected pattern:', detectedPattern); // '(1-3)'
  
} else {
  console.error('Validation failed:', validation.errors);
}

// 6. Convert back for storage/display
const restored = fromCompactEntries(compact);
console.log('Restored entries:', restored.length); // 3
```

## Decision: TimetableEntry Structure

**Recommendation**: Use **Option 1** (one record per subject, day, period) for the following reasons:

1. **Compatibility**: Matches existing codebase structure
2. **Simplicity**: Easier to query, filter, and manipulate individual slots
3. **Database normalization**: Better fits relational database patterns
4. **Conflict detection**: Easier to detect scheduling conflicts
5. **UI rendering**: Simpler to render in timetable grids

The compact format (Option 2) is available through adapter functions for generators that prefer array-based representations, but the core system continues to use individual records.

## Summary

The calendar normalization system provides:

- ✅ **Standardized day codes**: 1-6 for Monday-Saturday
- ✅ **Day pattern parsing**: (1-2) → [1,2], (1-3) → [1,2,3]  
- ✅ **Period validation**: Integers 1-6 only
- ✅ **TimetableEntry adapters**: Both individual and compact formats supported
- ✅ **Generator compatibility**: Adapters for external timetable generators
- ✅ **Validation**: Comprehensive entry validation with detailed error reporting
- ✅ **Utilities**: Pattern analysis, schedule validation, format conversion

The system maintains backward compatibility while providing a robust foundation for timetable generation and management.
