#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load timetable validation module (since this is a JS file, we'll implement directly)
class TimetableValidator {
  constructor() {
    this.dataPath = path.join(__dirname, 'data');
  }

  loadJsonData(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      let data = fs.readFileSync(filePath, 'utf-8');
      // Remove BOM if present
      if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
      }
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Warning: Could not load ${filename}:`, error.message);
      return [];
    }
  }

  loadTimetableEntries() {
    const data = this.loadJsonData('generated-timetable-entries.json');
    return Array.isArray(data) ? data : data.timetableEntries || [];
  }

  loadDepartments() {
    return this.loadJsonData('departments.json');
  }

  loadSubjects() {
    return this.loadJsonData('subjects.json');
  }

  loadRooms() {
    return this.loadJsonData('rooms.json');
  }

  normalizeRoomIds(entries, rooms) {
    const roomNameToId = new Map(rooms.map(room => [room.name.toLowerCase(), room.id]));
    
    return entries.map(entry => ({
      ...entry,
      roomId: roomNameToId.get(entry.room.toLowerCase()) || entry.room,
    }));
  }

  checkRoomConflicts(entries) {
    const conflicts = [];
    const roomTimeSlotMap = new Map();

    // Group entries by room, day, and period
    entries.forEach(entry => {
      const key = `${entry.roomId}_${entry.day}_${entry.period}`;
      if (!roomTimeSlotMap.has(key)) {
        roomTimeSlotMap.set(key, []);
      }
      roomTimeSlotMap.get(key).push(entry);
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

  checkTeacherConflicts(entries) {
    const conflicts = [];
    const teacherTimeSlotMap = new Map();

    // Group entries by teacher, day, and period
    entries.forEach(entry => {
      const key = `${entry.teacherId}_${entry.day}_${entry.period}`;
      if (!teacherTimeSlotMap.has(key)) {
        teacherTimeSlotMap.set(key, []);
      }
      teacherTimeSlotMap.get(key).push(entry);
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

  checkSubjectMultiplicity(entries, subjects) {
    const conflicts = [];
    const subjectPatternMap = new Map();

    // Group entries by subject and day
    entries.forEach(entry => {
      const subject = subjects.find(s => s.id === entry.subjectId);
      if (!subject) return;

      const subjectKey = `${entry.subjectId}_${entry.semesterId}`;
      if (!subjectPatternMap.has(subjectKey)) {
        subjectPatternMap.set(subjectKey, new Map());
      }
      
      const subjectMap = subjectPatternMap.get(subjectKey);
      if (!subjectMap.has(entry.day)) {
        subjectMap.set(entry.day, []);
      }
      subjectMap.get(entry.day).push(entry);
    });

    // Check for duplicate IDs within same subject-day combinations
    subjectPatternMap.forEach((dayMap, subjectKey) => {
      dayMap.forEach((entriesInDay, day) => {
        const idMap = new Map();
        
        entriesInDay.forEach(entry => {
          if (!idMap.has(entry.id)) {
            idMap.set(entry.id, []);
          }
          idMap.get(entry.id).push(entry);
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

  checkDepartmentPatterns(entries, departments, subjects) {
    const violations = [];

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

  checkChemistryPeriods(entries, subjects) {
    const violations = [];

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

  checkRoomUsage(entries, departments, rooms) {
    const violations = [];

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

  getAllowedPeriodsForEntry(entry, rooms, departments) {
    // Default periods 1-6
    let allowedPeriods = [1, 2, 3, 4, 5, 6];

    // Chemistry department restriction (periods 3-6)
    if (entry.departmentId === 'd2') {
      allowedPeriods = [3, 4, 5, 6];
    }

    return allowedPeriods;
  }

  hasConflictAtPeriod(entries, entryToCheck, period) {
    return entries.some(entry => 
      entry.id !== entryToCheck.id &&
      entry.day === entryToCheck.day &&
      entry.period === period &&
      (entry.teacherId === entryToCheck.teacherId || 
       entry.roomId === entryToCheck.roomId || 
       entry.room === entryToCheck.room)
    );
  }

  attemptAutoResolution(conflicts, entries, rooms, departments) {
    const resolutions = [];

    // For room and teacher conflicts, try to shift periods within allowed range
    conflicts.forEach(conflict => {
      if (conflict.type === 'room' || conflict.type === 'teacher') {
        conflict.entries.forEach((entry, index) => {
          if (index === 0) return; // Keep first entry, try to move others

          // Try to find an alternative period for this room/department
          const allowedPeriods = this.getAllowedPeriodsForEntry(entry, rooms, departments);
          const currentPeriod = entry.period;
          
          for (const newPeriod of allowedPeriods) {
            if (newPeriod !== currentPeriod && !this.hasConflictAtPeriod(entries, entry, newPeriod)) {
              resolutions.push({
                type: 'period-shift',
                entryId: entry.id,
                originalPeriod: currentPeriod,
                newPeriod,
                reason: `Resolved ${conflict.type} conflict`,
                success: true,
              });
              
              // Update the entry's period for subsequent conflict checks
              entry.period = newPeriod;
              entry.timeSlotId = `ts${newPeriod}`;
              break;
            }
          }
        });
      }
    });

    return resolutions;
  }

  validateTimetable(entries) {
    const hardConflicts = [];
    const softViolations = [];
    const autoResolutions = [];

    // Load reference data
    const departments = this.loadDepartments();
    const subjects = this.loadSubjects();
    const rooms = this.loadRooms();

    // Normalize room identifiers
    const normalizedEntries = this.normalizeRoomIds(entries, rooms);

    // Hard constraint checks
    const roomConflicts = this.checkRoomConflicts(normalizedEntries);
    const teacherConflicts = this.checkTeacherConflicts(normalizedEntries);
    const subjectMultiplicityConflicts = this.checkSubjectMultiplicity(normalizedEntries, subjects);

    hardConflicts.push(...roomConflicts, ...teacherConflicts, ...subjectMultiplicityConflicts);

    // Soft constraint checks
    const departmentPatternViolations = this.checkDepartmentPatterns(normalizedEntries, departments, subjects);
    const chemistryPeriodViolations = this.checkChemistryPeriods(normalizedEntries, subjects);
    const roomUsageViolations = this.checkRoomUsage(normalizedEntries, departments, rooms);

    softViolations.push(...departmentPatternViolations, ...chemistryPeriodViolations, ...roomUsageViolations);

    // Auto-resolution for conflicts
    if (hardConflicts.length > 0) {
      const resolvedConflicts = this.attemptAutoResolution(hardConflicts, normalizedEntries, rooms, departments);
      autoResolutions.push(...resolvedConflicts);
      
      // Re-validate after auto-resolution
      if (autoResolutions.some(r => r.success)) {
        console.log('\nRe-validating after auto-resolution...\n');
        const roomConflictsAfter = this.checkRoomConflicts(normalizedEntries);
        const teacherConflictsAfter = this.checkTeacherConflicts(normalizedEntries);
        const subjectMultiplicityConflictsAfter = this.checkSubjectMultiplicity(normalizedEntries, subjects);
        
        // Update the conflicts arrays with the new state
        hardConflicts.length = 0;
        hardConflicts.push(...roomConflictsAfter, ...teacherConflictsAfter, ...subjectMultiplicityConflictsAfter);
        
        if (roomConflictsAfter.length < roomConflicts.length || 
            teacherConflictsAfter.length < teacherConflicts.length) {
          console.log('✅ Some conflicts were successfully resolved!\n');
        }
      }
    }

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
      updatedEntries: normalizedEntries,
    };
  }

  generateReport(result) {
    const lines = [];
    
    lines.push('=== TIMETABLE VALIDATION REPORT ===');
    lines.push(`Total Entries: ${result.summary.totalEntries}`);
    lines.push(`Validation Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push('');

    if (result.hardConflicts.length > 0) {
      lines.push('🚨 HARD CONFLICTS:');
      result.hardConflicts.forEach((conflict, index) => {
        lines.push(`${index + 1}. ${conflict.description}`);
        lines.push(`   Time: ${conflict.day}, ${conflict.timeSlot}`);
        lines.push(`   Details: ${conflict.details}`);
        lines.push(`   Affected entries: ${conflict.entries.length}`);
        conflict.entries.forEach(entry => {
          lines.push(`     - ${entry.id}: ${entry.subjectCode}`);
        });
        lines.push('');
      });
    }

    if (result.softViolations.length > 0) {
      lines.push('⚠️  SOFT VIOLATIONS:');
      result.softViolations.forEach((violation, index) => {
        lines.push(`${index + 1}. ${violation.description}`);
        lines.push(`   Entry: ${violation.entry.id} (${violation.entry.subjectCode})`);
        lines.push(`   Expected: ${violation.expected}, Actual: ${violation.actual}`);
        lines.push('');
      });
    }

    if (result.autoResolutions.length > 0) {
      lines.push('🔧 AUTO-RESOLUTIONS ATTEMPTED:');
      result.autoResolutions.forEach((resolution, index) => {
        lines.push(`${index + 1}. ${resolution.reason}`);
        lines.push(`   Entry: ${resolution.entryId}`);
        lines.push(`   Period change: ${resolution.originalPeriod} → ${resolution.newPeriod}`);
        lines.push(`   Status: ${resolution.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        lines.push('');
      });
    }

    lines.push('=== SUMMARY ===');
    lines.push(`Room Conflicts: ${result.summary.roomConflicts}`);
    lines.push(`Teacher Conflicts: ${result.summary.teacherConflicts}`);
    lines.push(`Subject Multiplicity Violations: ${result.summary.subjectMultiplicityViolations}`);
    lines.push(`Soft Violations: ${result.summary.softViolations}`);
    lines.push(`Auto-resolutions Attempted: ${result.autoResolutions.length}`);
    
    const successfulResolutions = result.autoResolutions.filter(r => r.success).length;
    if (successfulResolutions > 0) {
      lines.push(`Auto-resolutions Successful: ${successfulResolutions}`);
    }

    return lines.join('\n');
  }
}

// Main execution
function main() {
  const validator = new TimetableValidator();
  
  console.log('🔍 Loading timetable entries...');
  const entries = validator.loadTimetableEntries();
  
  if (entries.length === 0) {
    console.log('❌ No timetable entries found. Please ensure generated-timetable-entries.json exists.');
    process.exit(1);
  }

  console.log(`📊 Found ${entries.length} timetable entries`);
  console.log('🔍 Validating conflicts and integrity...\n');

  const result = validator.validateTimetable(entries);
  const report = validator.generateReport(result);
  
  console.log(report);

  // Save updated entries if auto-resolutions were successful
  const successfulResolutions = result.autoResolutions.filter(r => r.success);
  if (successfulResolutions.length > 0) {
    const outputPath = path.join(__dirname, 'data', 'timetable-entries-resolved.json');
    const outputData = {
      metadata: {
        originalFile: 'generated-timetable-entries.json',
        validatedAt: new Date().toISOString(),
        autoResolutionsApplied: successfulResolutions.length,
        totalEntries: result.updatedEntries.length,
      },
      timetableEntries: result.updatedEntries,
    };
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Updated entries saved to: ${outputPath}`);
    } catch (error) {
      console.log(`\n❌ Failed to save updated entries: ${error.message}`);
    }
  }

  // Flag for manual review if needed
  const needsManualReview = result.hardConflicts.some(conflict => 
    !result.autoResolutions.some(resolution => 
      resolution.success && conflict.entries.some(entry => entry.id === resolution.entryId)
    )
  );

  if (needsManualReview) {
    console.log('\n🚩 MANUAL REVIEW REQUIRED:');
    console.log('Some conflicts could not be automatically resolved.');
    console.log('Please review the conflicts above and make manual adjustments.');
    process.exit(1);
  }

  if (result.isValid) {
    console.log('\n✅ Validation completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed. Please address the conflicts above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TimetableValidator;
