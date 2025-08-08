// Simple test script to check conflicts
const { checkScheduleConflicts, validateTimetable } = require('./app/components/conflictChecker.ts');

console.log('🔍 Testing Timetable Conflicts...\n');

try {
  const validation = validateTimetable();
  
  console.log('📊 Timetable Validation Results:');
  console.log('================================');
  console.log(`Valid: ${validation.isValid ? '✅ YES' : '❌ NO'}`);
  console.log(`Total Conflicts Found: ${validation.conflicts.length}\n`);
  
  if (validation.conflicts.length > 0) {
    console.log('🚨 CONFLICT DETAILS:');
    console.log('====================');
    
    validation.conflicts.forEach((conflict, index) => {
      console.log(`\n${index + 1}. ${conflict.type.toUpperCase()} CONFLICT`);
      console.log(`   Time: ${conflict.day} at ${conflict.timeSlot}`);
      console.log(`   Details: ${conflict.details}`);
      console.log(`   Conflicting Entries: ${conflict.conflictingEntries.join(', ')}`);
    });
    
    // Group conflicts by type
    const teacherConflicts = validation.conflicts.filter(c => c.type === 'teacher');
    const roomConflicts = validation.conflicts.filter(c => c.type === 'room');
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Teacher Conflicts: ${teacherConflicts.length}`);
    console.log(`   Room Conflicts: ${roomConflicts.length}`);
    console.log(`   Total Conflicts: ${validation.conflicts.length}`);
  } else {
    console.log('✅ No conflicts found in the timetable!');
  }
  
} catch (error) {
  console.error('❌ Error testing conflicts:', error.message);
}
