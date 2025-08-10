import { readFileSync } from 'fs';
import { join } from 'path';

// Types for timetable entries and validation
export interface TimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room: string;
  roomId?: string; // Normalized room identifier
  departmentId: string;
  period: number;
  subjectCode: string;
}

export interface ValidationConflict {
  type: 'room' | 'teacher' | 'subject-multiplicity';
  severity: 'hard' | 'soft';
  description: string;
  entries: TimetableEntry[];
  timeSlot: string;
  day: string;
  details: string;
}

export interface SoftCheckViolation {
  type: 'department-pattern' | 'chemistry-period' | 'room-usage';
  description: string;
  entry: TimetableEntry;
  expected: string;
  actual: string;
}

export interface ValidationResult {
  isValid: boolean;
  hardConflicts: ValidationConflict[];
  softViolations: SoftCheckViolation[];
  summary: {
    totalEntries: number;
    roomConflicts: number;
    teacherConflicts: number;
    subjectMultiplicityViolations: number;
    softViolations: number;
  };
  autoResolutions: AutoResolution[];
}

export interface AutoResolution {
  type: 'period-shift';
  entryId: string;
  originalPeriod: number;
  newPeriod: number;
  reason: string;
  success: boolean;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  semesterId: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  primaryDepartmentId?: string;
  availableForOtherDepartments?: boolean;
}

// Load data helper functions
function loadJsonData<T>(filename: string): T[] {
  try {
    const dataPath = join(process.cwd(), 'data', filename);
    const data = readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Warning: Could not load ${filename}:`, error);
    return [];
  }
}

export function loadTimetableEntries(): TimetableEntry[] {
  const data = loadJsonData<any>('generated-timetable-entries.json');
  return Array.isArray(data) ? data : data.timetableEntries || [];
}

export function loadDepartments(): Department[] {
  return loadJsonData<Department>('departments.json');
}

export function loadSubjects(): Subject[] {
  return loadJsonData<Subject>('subjects.json');
}

export function loadRooms(): Room[] {
  return loadJsonData<Room>('rooms.json');
}

// Validation functions
export function validateTimetableConflicts(entries: TimetableEntry[]): ValidationResult {
  const hardConflicts: ValidationConflict[] = [];
  const softViolations: SoftCheckViolation[] = [];
  const autoResolutions: AutoResolution[] = [];

  // Load reference data
  const departments = loadDepartments();
  const subjects = loadSubjects();
  const rooms = loadRooms();

  // Normalize room identifiers
  const normalizedEntries = normalizeRoomIds(entries, rooms);

  // Hard constraint checks
  const roomConflicts = checkRoomConflicts(normalizedEntries);
  const teacherConflicts = checkTeacherConflicts(normalizedEntries);
  const subjectMultiplicityConflicts = checkSubjectMultiplicity(normalizedEntries, subjects);

  hardConflicts.push(...roomConflicts, ...teacherConflicts, ...subjectMultiplicityConflicts);

  // Soft constraint checks
  const departmentPatternViolations = checkDepartmentPatterns(normalizedEntries, departments, subjects);
  const chemistryPeriodViolations = checkChemistryPeriods(normalizedEntries, subjects);
  const roomUsageViolations = checkRoomUsage(normalizedEntries, departments, rooms);

  softViolations.push(...departmentPatternViolations, ...chemistryPeriodViolations, ...roomUsageViolations);

  // Auto-resolution for conflicts
  const resolvedConflicts = attemptAutoResolution(hardConflicts, normalizedEntries, rooms, departments);
  autoResolutions.push(...resolvedConflicts);

  const summary = {
    totalEntries: normalizedEntries.length,
    roomConflicts: roomConflicts.length,
    teacherConflicts: teacherConflicts.length,
    subjectMultiplicityViolations: subjectMultiplicityConflicts.length,
    softViolations: softViolations.length,
  };

  return {
    isValid: hardConflicts.length === 0,
    hardConflicts,
    softViolations,
    summary,
    autoResolutions,
  };
}

function normalizeRoomIds(entries: TimetableEntry[], rooms: Room[]): TimetableEntry[] {
  const roomNameToId = new Map(rooms.map(room => [room.name.toLowerCase(), room.id]));
  
  return entries.map(entry => ({
    ...entry,
    roomId: roomNameToId.get(entry.room.toLowerCase()) || entry.room,
  }));
}

function checkRoomConflicts(entries: TimetableEntry[]): ValidationConflict[] {
  const conflicts: ValidationConflict[] = [];
  const roomTimeSlotMap = new Map<string, TimetableEntry[]>();

  // Group entries by room, day, and period
  entries.forEach(entry => {
    const key = `${entry.roomId}_${entry.day}_${entry.period}`;
    if (!roomTimeSlotMap.has(key)) {
      roomTimeSlotMap.set(key, []);
    }
    roomTimeSlotMap.get(key)!.push(entry);
  });

  // Check for conflicts (more than one entry per room-day-period)
  roomTimeSlotMap.forEach((entriesInSlot, key) => {
    if (entriesInSlot.length > 1) {
      const [roomId, day, period] = key.split('_');
      const conflictDetails = entriesInSlot.map(entry => 
        `${entry.subjectCode} (${entry.teacherId})`
      ).join(', ');

      conflicts.push({
        type: 'room',
        severity: 'hard',
        description: `Room conflict: Multiple classes scheduled in room ${entriesInSlot[0].room}`,
        entries: entriesInSlot,
        timeSlot: `ts${period}`,
        day,
        details: `Conflicting classes: ${conflictDetails}`,
      });
    }
  });

  return conflicts;
}

function checkTeacherConflicts(entries: TimetableEntry[]): ValidationConflict[] {
  const conflicts: ValidationConflict[] = [];
  const teacherTimeSlotMap = new Map<string, TimetableEntry[]>();

  // Group entries by teacher, day, and period
  entries.forEach(entry => {
    const key = `${entry.teacherId}_${entry.day}_${entry.period}`;
    if (!teacherTimeSlotMap.has(key)) {
      teacherTimeSlotMap.set(key, []);
    }
    teacherTimeSlotMap.get(key)!.push(entry);
  });

  // Check for conflicts (more than one entry per teacher-day-period)
  teacherTimeSlotMap.forEach((entriesInSlot, key) => {
    if (entriesInSlot.length > 1) {
      const [teacherId, day, period] = key.split('_');
      const conflictDetails = entriesInSlot.map(entry => 
        `${entry.subjectCode} in ${entry.room}`
      ).join(', ');

      conflicts.push({
        type: 'teacher',
        severity: 'hard',
        description: `Teacher conflict: Teacher ${teacherId} has multiple classes scheduled`,
        entries: entriesInSlot,
        timeSlot: `ts${period}`,
        day,
        details: `Conflicting classes: ${conflictDetails}`,
      });
    }
  });

  return conflicts;
}

function checkSubjectMultiplicity(entries: TimetableEntry[], subjects: Subject[]): ValidationConflict[] {
  const conflicts: ValidationConflict[] = [];
  const subjectPatternMap = new Map<string, Map<string, TimetableEntry[]>>();

  // Group entries by subject and day
  entries.forEach(entry => {
    const subject = subjects.find(s => s.id === entry.subjectId);
    if (!subject) return;

    const subjectKey = `${entry.subjectId}_${entry.semesterId}`;
    if (!subjectPatternMap.has(subjectKey)) {
      subjectPatternMap.set(subjectKey, new Map());
    }
    
    const subjectMap = subjectPatternMap.get(subjectKey)!;
    if (!subjectMap.has(entry.day)) {
      subjectMap.set(entry.day, []);
    }
    subjectMap.get(entry.day)!.push(entry);
  });

  // Check for duplicate IDs within same subject-day combinations
  subjectPatternMap.forEach((dayMap, subjectKey) => {
    dayMap.forEach((entriesInDay, day) => {
      const idMap = new Map<string, TimetableEntry[]>();
      
      entriesInDay.forEach(entry => {
        if (!idMap.has(entry.id)) {
          idMap.set(entry.id, []);
        }
        idMap.get(entry.id)!.push(entry);
      });

      idMap.forEach((duplicateEntries, id) => {
        if (duplicateEntries.length > 1) {
          conflicts.push({
            type: 'subject-multiplicity',
            severity: 'hard',
            description: `Duplicate entry IDs for subject ${duplicateEntries[0].subjectCode}`,
            entries: duplicateEntries,
            timeSlot: duplicateEntries[0].timeSlotId,
            day,
            details: `Duplicate ID "${id}" found ${duplicateEntries.length} times`,
          });
        }
      });
    });
  });

  return conflicts;
}

function checkDepartmentPatterns(
  entries: TimetableEntry[], 
  departments: Department[], 
  subjects: Subject[]
): SoftCheckViolation[] {
  const violations: SoftCheckViolation[] = [];

  // This is a placeholder for department pattern checking
  // Would need to implement based on specific department requirements
  // For now, checking that entries match their department's expected patterns

  entries.forEach(entry => {
    const subject = subjects.find(s => s.id === entry.subjectId);
    if (subject && subject.departmentId !== entry.departmentId) {
      violations.push({
        type: 'department-pattern',
        description: 'Subject assignment does not match department',
        entry,
        expected: subject.departmentId,
        actual: entry.departmentId,
      });
    }
  });

  return violations;
}

function checkChemistryPeriods(entries: TimetableEntry[], subjects: Subject[]): SoftCheckViolation[] {
  const violations: SoftCheckViolation[] = [];

  entries.forEach(entry => {
    const subject = subjects.find(s => s.id === entry.subjectId);
    if (subject && subject.departmentId === 'd2') { // Chemistry department
      if (entry.period < 3 || entry.period > 6) {
        violations.push({
          type: 'chemistry-period',
          description: 'Chemistry subjects should only use periods 3-6',
          entry,
          expected: 'Periods 3-6',
          actual: `Period ${entry.period}`,
        });
      }
    }
  });

  return violations;
}

function checkRoomUsage(
  entries: TimetableEntry[], 
  departments: Department[], 
  rooms: Room[]
): SoftCheckViolation[] {
  const violations: SoftCheckViolation[] = [];

  entries.forEach(entry => {
    const room = rooms.find(r => r.id === entry.roomId || r.name === entry.room);
    if (room && room.primaryDepartmentId && 
        room.primaryDepartmentId !== entry.departmentId && 
        !room.availableForOtherDepartments) {
      violations.push({
        type: 'room-usage',
        description: 'Department using room not available to them',
        entry,
        expected: `Room for department ${room.primaryDepartmentId}`,
        actual: `Used by department ${entry.departmentId}`,
      });
    }
  });

  return violations;
}

function attemptAutoResolution(
  conflicts: ValidationConflict[], 
  entries: TimetableEntry[], 
  rooms: Room[], 
  departments: Department[]
): AutoResolution[] {
  const resolutions: AutoResolution[] = [];

  // For room and teacher conflicts, try to shift periods within allowed range
  conflicts.forEach(conflict => {
    if (conflict.type === 'room' || conflict.type === 'teacher') {
      conflict.entries.forEach((entry, index) => {
        if (index === 0) return; // Keep first entry, try to move others

        // Try to find an alternative period for this room/department
        const allowedPeriods = getAllowedPeriodsForEntry(entry, rooms, departments);
        const currentPeriod = entry.period;
        
        for (const newPeriod of allowedPeriods) {
          if (newPeriod !== currentPeriod && !hasConflictAtPeriod(entries, entry, newPeriod)) {
            resolutions.push({
              type: 'period-shift',
              entryId: entry.id,
              originalPeriod: currentPeriod,
              newPeriod,
              reason: `Resolved ${conflict.type} conflict`,
              success: true,
            });
            break;
          }
        }
      });
    }
  });

  return resolutions;
}

function getAllowedPeriodsForEntry(
  entry: TimetableEntry, 
  rooms: Room[], 
  departments: Department[]
): number[] {
  // Default periods 1-6
  let allowedPeriods = [1, 2, 3, 4, 5, 6];

  // Chemistry department restriction (periods 3-6)
  if (entry.departmentId === 'd2') {
    allowedPeriods = [3, 4, 5, 6];
  }

  // Could add more department-specific restrictions here

  return allowedPeriods;
}

function hasConflictAtPeriod(
  entries: TimetableEntry[], 
  entryToCheck: TimetableEntry, 
  period: number
): boolean {
  return entries.some(entry => 
    entry.id !== entryToCheck.id &&
    entry.day === entryToCheck.day &&
    entry.period === period &&
    (entry.teacherId === entryToCheck.teacherId || 
     entry.roomId === entryToCheck.roomId || 
     entry.room === entryToCheck.room)
  );
}

// Utility functions for reporting
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push('=== TIMETABLE VALIDATION REPORT ===');
  lines.push(`Total Entries: ${result.summary.totalEntries}`);
  lines.push(`Validation Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
  lines.push('');

  if (result.hardConflicts.length > 0) {
    lines.push('HARD CONFLICTS:');
    result.hardConflicts.forEach((conflict, index) => {
      lines.push(`${index + 1}. ${conflict.description}`);
      lines.push(`   Time: ${conflict.day}, ${conflict.timeSlot}`);
      lines.push(`   Details: ${conflict.details}`);
      lines.push(`   Affected entries: ${conflict.entries.length}`);
      lines.push('');
    });
  }

  if (result.softViolations.length > 0) {
    lines.push('SOFT VIOLATIONS:');
    result.softViolations.forEach((violation, index) => {
      lines.push(`${index + 1}. ${violation.description}`);
      lines.push(`   Entry: ${violation.entry.id} (${violation.entry.subjectCode})`);
      lines.push(`   Expected: ${violation.expected}, Actual: ${violation.actual}`);
      lines.push('');
    });
  }

  if (result.autoResolutions.length > 0) {
    lines.push('AUTO-RESOLUTIONS ATTEMPTED:');
    result.autoResolutions.forEach((resolution, index) => {
      lines.push(`${index + 1}. ${resolution.reason}`);
      lines.push(`   Entry: ${resolution.entryId}`);
      lines.push(`   Period change: ${resolution.originalPeriod} → ${resolution.newPeriod}`);
      lines.push(`   Status: ${resolution.success ? 'SUCCESS' : 'FAILED'}`);
      lines.push('');
    });
  }

  lines.push('=== SUMMARY ===');
  lines.push(`Room Conflicts: ${result.summary.roomConflicts}`);
  lines.push(`Teacher Conflicts: ${result.summary.teacherConflicts}`);
  lines.push(`Subject Multiplicity Violations: ${result.summary.subjectMultiplicityViolations}`);
  lines.push(`Soft Violations: ${result.summary.softViolations}`);
  lines.push(`Auto-resolutions Attempted: ${result.autoResolutions.length}`);

  return lines.join('\n');
}

export function applyAutoResolutions(
  entries: TimetableEntry[], 
  resolutions: AutoResolution[]
): TimetableEntry[] {
  const updatedEntries = [...entries];
  
  resolutions.forEach(resolution => {
    if (resolution.success) {
      const entryIndex = updatedEntries.findIndex(e => e.id === resolution.entryId);
      if (entryIndex >= 0) {
        updatedEntries[entryIndex] = {
          ...updatedEntries[entryIndex],
          period: resolution.newPeriod,
          timeSlotId: `ts${resolution.newPeriod}`,
        };
      }
    }
  });

  return updatedEntries;
}
