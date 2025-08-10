#!/usr/bin/env node

/**
 * Generate TimetableEntry objects from the blueprint
 * 
 * For each subject in the blueprint:
 * - Resolve subjectId, roomId (via room map), teacherId (via teacher map)
 * - Resolve days array from the day pattern
 * - For each day in days:
 *   - Create a TimetableEntry with stable id (e.g., "{subjectCode}-{day}-{period}")
 *   - Include subjectId, teacherId, roomId, day, period
 *   - Include departmentId/sectionId/semester if required by the model
 * - Accumulate all entries in memory for validation prior to writing
 */

const fs = require('fs');
const path = require('path');

// Helper function to convert numeric day to day name
function getDayName(dayNumber) {
  const days = {
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };
  return days[dayNumber] || 'Unknown';
}

// Helper function to resolve room ID, handling chemistry special assignments
function resolveRoomId(subjectCode, departmentId, blueprintRoomId, chemistryAssignments, day, period) {
  // Check if this is a chemistry subject with specific room assignment
  if (departmentId === 'd2') { // Chemistry department
    const chemSubject = chemistryAssignments.find(assignment => 
      assignment.subjectCode === subjectCode && 
      assignment.day === getDayName(day) && 
      assignment.period === period
    );
    if (chemSubject) {
      return chemSubject.roomId;
    }
  }
  
  // Use blueprint room ID if available
  return blueprintRoomId;
}

// Helper function to resolve teacher ID from subject code
function resolveTeacherId(subjectCode, subjectTeacherMap) {
  return subjectTeacherMap[subjectCode] || null;
}

// Helper function to generate stable ID
function generateStableId(subjectCode, day, period) {
  const dayName = getDayName(day);
  return `${subjectCode}-${dayName}-${period}`.toLowerCase();
}

async function generateTimetableEntries() {
  try {
    console.log('🚀 Starting TimetableEntry generation from blueprint...');
    
    // Load required data files
    console.log('📁 Loading data files...');
    
    const blueprintPath = path.join(__dirname, '../data/allocations.blueprint.json');
    const subjectTeacherMapPath = path.join(__dirname, '../data/subject-teacher-map.json');
    const chemistryAssignmentsPath = path.join(__dirname, '../data/chemistry-room-assignments.json');
    
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    const subjectTeacherData = JSON.parse(fs.readFileSync(subjectTeacherMapPath, 'utf8'));
    const chemistryData = JSON.parse(fs.readFileSync(chemistryAssignmentsPath, 'utf8'));
    
    const subjectTeacherMap = subjectTeacherData.subjectTeacherMap;
    const chemistryAssignments = chemistryData.chemistryRoomAssignments;
    
    console.log(`📋 Loaded ${blueprint.length} departments from blueprint`);
    console.log(`👨‍🏫 Loaded ${Object.keys(subjectTeacherMap).length} subject-teacher mappings`);
    console.log(`🧪 Loaded ${chemistryAssignments.length} chemistry room assignments`);
    
    const allEntries = [];
    let totalSubjectsProcessed = 0;
    let entriesGenerated = 0;
    
    // Process each department in the blueprint
    for (const departmentBlueprint of blueprint) {
      const { department, departmentId, roomId: blueprintRoomId, allocations } = departmentBlueprint;
      
      console.log(`\n🏢 Processing ${department} (${departmentId}) - ${allocations.length} subjects`);
      
      // Process each subject allocation
      for (const allocation of allocations) {
        const { subjectId, subjectCode, days, period, timeSlotId } = allocation;
        
        totalSubjectsProcessed++;
        
        // Resolve teacher ID
        const teacherId = resolveTeacherId(subjectCode, subjectTeacherMap);
        if (!teacherId) {
          console.warn(`⚠️  No teacher found for subject ${subjectCode}`);
        }
        
        // Process each day for this subject
        for (const day of days) {
          // Resolve room ID (special handling for chemistry)
          const roomId = resolveRoomId(subjectCode, departmentId, blueprintRoomId, chemistryAssignments, day, period);
          
          // Generate stable ID
          const entryId = generateStableId(subjectCode, day, period);
          
          // Create TimetableEntry object
          const entry = {
            id: entryId,
            semesterId: 'sem5', // Assuming semester 5 based on the data patterns
            subjectId: subjectId.toString(),
            teacherId: teacherId,
            timeSlotId: timeSlotId,
            day: getDayName(day),
            room: roomId,
            // Additional metadata for validation and organization
            departmentId: departmentId,
            period: period,
            subjectCode: subjectCode
          };
          
          allEntries.push(entry);
          entriesGenerated++;
          
          console.log(`  ✅ Generated entry: ${entryId} (${subjectCode}, ${getDayName(day)}, Period ${period}, Room: ${roomId || 'TBD'})`);
        }
      }
    }
    
    console.log(`\n📊 Generation Summary:`);
    console.log(`   📚 Total subjects processed: ${totalSubjectsProcessed}`);
    console.log(`   📝 Total entries generated: ${entriesGenerated}`);
    console.log(`   🏢 Departments processed: ${blueprint.length}`);
    
    // Validation checks
    console.log(`\n🔍 Performing validation checks...`);
    
    // Check for duplicate IDs
    const entryIds = allEntries.map(entry => entry.id);
    const duplicateIds = entryIds.filter((id, index) => entryIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.error(`❌ Found ${duplicateIds.length} duplicate entry IDs:`, [...new Set(duplicateIds)]);
    } else {
      console.log(`✅ All entry IDs are unique`);
    }
    
    // Check for entries without teachers
    const entriesWithoutTeachers = allEntries.filter(entry => !entry.teacherId);
    if (entriesWithoutTeachers.length > 0) {
      console.warn(`⚠️  ${entriesWithoutTeachers.length} entries have no assigned teacher`);
    } else {
      console.log(`✅ All entries have assigned teachers`);
    }
    
    // Check for entries without rooms
    const entriesWithoutRooms = allEntries.filter(entry => !entry.room);
    if (entriesWithoutRooms.length > 0) {
      console.warn(`⚠️  ${entriesWithoutRooms.length} entries have no assigned room`);
      console.log(`   These are primarily Chemistry subjects that need room assignment`);
    } else {
      console.log(`✅ All entries have assigned rooms`);
    }
    
    // Group by department for summary
    const entriesByDepartment = allEntries.reduce((acc, entry) => {
      if (!acc[entry.departmentId]) {
        acc[entry.departmentId] = [];
      }
      acc[entry.departmentId].push(entry);
      return acc;
    }, {});
    
    console.log(`\n📈 Entries by Department:`);
    for (const [deptId, entries] of Object.entries(entriesByDepartment)) {
      const deptName = blueprint.find(d => d.departmentId === deptId)?.department || deptId;
      console.log(`   ${deptName} (${deptId}): ${entries.length} entries`);
    }
    
    // Save the generated entries to a JSON file
    const outputPath = path.join(__dirname, '../data/generated-timetable-entries.json');
    const outputData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceBlueprint: 'allocations.blueprint.json',
        totalEntries: allEntries.length,
        totalSubjects: totalSubjectsProcessed,
        totalDepartments: blueprint.length,
        validationSummary: {
          duplicateIds: duplicateIds.length,
          entriesWithoutTeachers: entriesWithoutTeachers.length,
          entriesWithoutRooms: entriesWithoutRooms.length
        }
      },
      timetableEntries: allEntries
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\n💾 Generated timetable entries saved to: ${outputPath}`);
    
    // Also create a simplified version with just the entries array for easy importing
    const entriesOnlyPath = path.join(__dirname, '../data/timetable-entries-only.json');
    fs.writeFileSync(entriesOnlyPath, JSON.stringify(allEntries, null, 2));
    console.log(`💾 Entries-only version saved to: ${entriesOnlyPath}`);
    
    console.log(`\n🎉 TimetableEntry generation completed successfully!`);
    
    return {
      success: true,
      totalEntries: allEntries.length,
      entries: allEntries,
      metadata: outputData.metadata
    };
    
  } catch (error) {
    console.error('❌ Error generating timetable entries:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the script if called directly
if (require.main === module) {
  generateTimetableEntries()
    .then((result) => {
      if (result.success) {
        console.log(`\n✅ Script completed successfully with ${result.totalEntries} entries generated.`);
        process.exit(0);
      } else {
        console.error(`\n❌ Script failed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { generateTimetableEntries };
