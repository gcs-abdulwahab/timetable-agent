#!/usr/bin/env node

/**
 * Timetable Validation Script for CI
 * 
 * This script validates the timetable data for:
 * - Room/teacher conflicts
 * - Allowed day patterns and period ranges
 * - Room-name→ID mapping coverage
 * - Data integrity checks
 */

const fs = require('fs');
const path = require('path');

// Load data files
function loadJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'data', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error(`❌ Error loading ${filename}: ${error.message}`);
    process.exit(1);
  }
}

// Load all data
const allocations = loadJsonFile('allocations.json');
const rooms = loadJsonFile('rooms.json');
const teachers = loadJsonFile('teachers.json');
const subjects = loadJsonFile('subjects.json');
const departments = loadJsonFile('departments.json');
const timeslots = loadJsonFile('timeslots.json');

// Validation constants
const ALLOWED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ALLOWED_PERIODS = [1, 2, 3, 4, 5, 6, 7];
const CHEMISTRY_DEPT_ID = 'd2';
const CHEMISTRY_ALLOWED_PERIODS = [3, 4, 5, 6];

// Validation results storage
const validationResults = {
  success: true,
  errors: [],
  warnings: [],
  stats: {
    totalAllocations: allocations.length,
    uniqueRooms: 0,
    uniqueTeachers: 0,
    conflicts: 0
  }
};

function addError(message) {
  validationResults.errors.push(message);
  validationResults.success = false;
}

function addWarning(message) {
  validationResults.warnings.push(message);
}

/**
 * 1. Check for room conflicts
 * No two classes should be in the same room at the same time
 */
function validateRoomConflicts() {
  console.log('🔍 Checking room conflicts...');
  
  const roomTimeSlots = new Map();
  
  allocations.forEach(allocation => {
    if (!allocation.room) return; // Skip allocations without rooms
    
    const key = `${allocation.room}_${allocation.day}_${allocation.timeSlotId}`;
    
    if (!roomTimeSlots.has(key)) {
      roomTimeSlots.set(key, []);
    }
    
    roomTimeSlots.get(key).push(allocation);
  });
  
  let conflicts = 0;
  roomTimeSlots.forEach((allocs, key) => {
    if (allocs.length > 1) {
      conflicts++;
      const [room, day, timeSlotId] = key.split('_');
      const conflictDetails = allocs.map(a => `${a.id} (${a.subjectId})`).join(', ');
      addError(`Room conflict: Room "${room}" on ${day} at ${timeSlotId} has multiple bookings: ${conflictDetails}`);
    }
  });
  
  validationResults.stats.conflicts += conflicts;
  console.log(`   Found ${conflicts} room conflicts`);
}

/**
 * 2. Check for teacher conflicts  
 * No teacher should teach multiple classes at the same time
 */
function validateTeacherConflicts() {
  console.log('🔍 Checking teacher conflicts...');
  
  const teacherTimeSlots = new Map();
  
  allocations.forEach(allocation => {
    if (!allocation.teacherId) return; // Skip allocations without teachers
    
    const key = `${allocation.teacherId}_${allocation.day}_${allocation.timeSlotId}`;
    
    if (!teacherTimeSlots.has(key)) {
      teacherTimeSlots.set(key, []);
    }
    
    teacherTimeSlots.get(key).push(allocation);
  });
  
  let conflicts = 0;
  teacherTimeSlots.forEach((allocs, key) => {
    if (allocs.length > 1) {
      conflicts++;
      const [teacherId, day, timeSlotId] = key.split('_');
      const teacher = teachers.find(t => t.id === teacherId);
      const teacherName = teacher ? teacher.name : teacherId;
      const conflictDetails = allocs.map(a => `${a.id} (${a.subjectId}) in ${a.room || 'TBA'}`).join(', ');
      addError(`Teacher conflict: ${teacherName} (${teacherId}) on ${day} at ${timeSlotId} has multiple classes: ${conflictDetails}`);
    }
  });
  
  validationResults.stats.conflicts += conflicts;
  console.log(`   Found ${conflicts} teacher conflicts`);
}

/**
 * 3. Validate day patterns and period ranges
 */
function validateDayPatternsAndPeriods() {
  console.log('🔍 Checking day patterns and period ranges...');
  
  let invalidDays = 0;
  let invalidPeriods = 0;
  let chemistryViolations = 0;
  
  allocations.forEach(allocation => {
    // Check valid days
    if (!ALLOWED_DAYS.includes(allocation.day)) {
      invalidDays++;
      addError(`Invalid day: "${allocation.day}" in allocation ${allocation.id}. Allowed days: ${ALLOWED_DAYS.join(', ')}`);
    }
    
    // Check valid periods
    const timeslot = timeslots.find(ts => ts.id === allocation.timeSlotId);
    if (timeslot && !ALLOWED_PERIODS.includes(timeslot.period)) {
      invalidPeriods++;
      addError(`Invalid period: ${timeslot.period} in allocation ${allocation.id}. Allowed periods: ${ALLOWED_PERIODS.join(', ')}`);
    }
    
    // Check chemistry department period restrictions
    const subject = subjects.find(s => s.id === allocation.subjectId);
    if (subject && subject.departmentId === CHEMISTRY_DEPT_ID && timeslot) {
      if (!CHEMISTRY_ALLOWED_PERIODS.includes(timeslot.period)) {
        chemistryViolations++;
        addError(`Chemistry period violation: Subject ${subject.code} (${allocation.id}) scheduled in period ${timeslot.period}. Chemistry subjects must be in periods ${CHEMISTRY_ALLOWED_PERIODS.join(', ')}`);
      }
    }
  });
  
  console.log(`   Found ${invalidDays} invalid days, ${invalidPeriods} invalid periods, ${chemistryViolations} chemistry violations`);
}

/**
 * 4. Verify room-name→ID mapping coverage
 */
function validateRoomMapping() {
  console.log('🔍 Checking room-name→ID mapping coverage...');
  
  const roomNameToId = new Map();
  rooms.forEach(room => {
    roomNameToId.set(room.name.toLowerCase(), room.id);
  });
  
  const allocatedRooms = new Set();
  const unmappedRooms = new Set();
  
  allocations.forEach(allocation => {
    if (allocation.room) {
      allocatedRooms.add(allocation.room);
      const normalizedName = allocation.room.toLowerCase();
      if (!roomNameToId.has(normalizedName)) {
        unmappedRooms.add(allocation.room);
      }
    }
  });
  
  validationResults.stats.uniqueRooms = allocatedRooms.size;
  
  unmappedRooms.forEach(roomName => {
    addWarning(`Room "${roomName}" used in allocations but not found in rooms.json`);
  });
  
  const coveragePercent = ((allocatedRooms.size - unmappedRooms.size) / allocatedRooms.size * 100).toFixed(1);
  console.log(`   Room mapping coverage: ${coveragePercent}% (${allocatedRooms.size - unmappedRooms.size}/${allocatedRooms.size})`);
  
  if (unmappedRooms.size > 0) {
    addWarning(`${unmappedRooms.size} rooms used in allocations are not mapped in rooms.json: ${Array.from(unmappedRooms).join(', ')}`);
  }
}

/**
 * 5. Data integrity checks
 */
function validateDataIntegrity() {
  console.log('🔍 Checking data integrity...');
  
  const teacherIds = new Set(teachers.map(t => t.id));
  const subjectIds = new Set(subjects.map(s => s.id));
  const timeslotIds = new Set(timeslots.map(ts => ts.id));
  
  const allocatedTeachers = new Set();
  let missingTeachers = 0;
  let missingSubjects = 0;
  let missingTimeslots = 0;
  let duplicateIds = 0;
  
  const allocationIds = new Set();
  
  allocations.forEach(allocation => {
    // Check for duplicate allocation IDs
    if (allocationIds.has(allocation.id)) {
      duplicateIds++;
      addError(`Duplicate allocation ID: ${allocation.id}`);
    } else {
      allocationIds.add(allocation.id);
    }
    
    // Check teacher references
    if (allocation.teacherId) {
      allocatedTeachers.add(allocation.teacherId);
      if (!teacherIds.has(allocation.teacherId)) {
        missingTeachers++;
        addError(`Teacher ID ${allocation.teacherId} in allocation ${allocation.id} not found in teachers.json`);
      }
    }
    
    // Check subject references
    if (allocation.subjectId && !subjectIds.has(allocation.subjectId)) {
      missingSubjects++;
      addError(`Subject ID ${allocation.subjectId} in allocation ${allocation.id} not found in subjects.json`);
    }
    
    // Check timeslot references
    if (allocation.timeSlotId && !timeslotIds.has(allocation.timeSlotId)) {
      missingTimeslots++;
      addError(`Timeslot ID ${allocation.timeSlotId} in allocation ${allocation.id} not found in timeslots.json`);
    }
  });
  
  validationResults.stats.uniqueTeachers = allocatedTeachers.size;
  
  console.log(`   Found ${duplicateIds} duplicate IDs, ${missingTeachers} missing teachers, ${missingSubjects} missing subjects, ${missingTimeslots} missing timeslots`);
}

/**
 * 6. Check for required fields
 */
function validateRequiredFields() {
  console.log('🔍 Checking required fields...');
  
  let missingFields = 0;
  
  allocations.forEach(allocation => {
    const requiredFields = ['id', 'subjectId', 'timeSlotId', 'day', 'semesterId'];
    
    requiredFields.forEach(field => {
      if (!allocation[field]) {
        missingFields++;
        addError(`Missing required field "${field}" in allocation ${allocation.id || 'unknown'}`);
      }
    });
  });
  
  console.log(`   Found ${missingFields} missing required fields`);
}

/**
 * Main validation function
 */
function runValidation() {
  console.log('🚀 Starting timetable validation...\n');
  
  validateRoomConflicts();
  validateTeacherConflicts();  
  validateDayPatternsAndPeriods();
  validateRoomMapping();
  validateDataIntegrity();
  validateRequiredFields();
  
  // Print summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('====================');
  console.log(`Status: ${validationResults.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Total Allocations: ${validationResults.stats.totalAllocations}`);
  console.log(`Unique Rooms: ${validationResults.stats.uniqueRooms}`);
  console.log(`Unique Teachers: ${validationResults.stats.uniqueTeachers}`);
  console.log(`Total Conflicts: ${validationResults.stats.conflicts}`);
  console.log(`Errors: ${validationResults.errors.length}`);
  console.log(`Warnings: ${validationResults.warnings.length}`);
  
  if (validationResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    validationResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    validationResults.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  if (validationResults.success) {
    console.log('\n🎉 All validations passed!');
  } else {
    console.log(`\n💥 Validation failed with ${validationResults.errors.length} error(s)`);
  }
  
  return validationResults.success;
}

// Export for testing or run if called directly
if (require.main === module) {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}

module.exports = { runValidation, validationResults };
