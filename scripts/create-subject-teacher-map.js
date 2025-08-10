const fs = require('fs');
const path = require('path');

/**
 * Creates a simplified subject code to teacher ID mapping from the assignment results
 */
function createSubjectTeacherMap() {
  try {
    // Read the assignment results
    const assignmentPath = path.join(process.cwd(), 'data', 'teacher-subject-mappings.json');
    if (!fs.existsSync(assignmentPath)) {
      throw new Error('Teacher assignment file not found. Please run the teacher assignment first.');
    }

    const assignmentData = JSON.parse(fs.readFileSync(assignmentPath, 'utf8'));
    const assignments = assignmentData.assignments;

    console.log('📋 Creating Subject→Teacher Mapping');
    console.log('===================================');
    
    // Create the mapping
    const subjectTeacherMap = {};
    const statsTracker = {
      totalMappings: 0,
      byDepartment: {},
      byAssignmentReason: {},
      placeholders: 0
    };

    assignments.forEach(assignment => {
      // Use subject code as key and teacher ID as value
      subjectTeacherMap[assignment.subjectCode] = assignment.teacherId;
      
      // Track statistics
      statsTracker.totalMappings++;
      
      if (assignment.isPlaceholder) {
        statsTracker.placeholders++;
      }
      
      // Track by department
      if (!statsTracker.byDepartment[assignment.departmentId]) {
        statsTracker.byDepartment[assignment.departmentId] = 0;
      }
      statsTracker.byDepartment[assignment.departmentId]++;
      
      // Track by assignment reason
      if (!statsTracker.byAssignmentReason[assignment.assignmentReason]) {
        statsTracker.byAssignmentReason[assignment.assignmentReason] = 0;
      }
      statsTracker.byAssignmentReason[assignment.assignmentReason]++;
    });

    // Create output structure
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceFile: 'teacher-subject-mappings.json',
        description: 'Mapping of subject codes to teacher IDs for timetable assignment',
        totalMappings: statsTracker.totalMappings,
        placeholders: statsTracker.placeholders,
        assignmentReasons: statsTracker.byAssignmentReason
      },
      subjectTeacherMap: subjectTeacherMap,
      statistics: {
        byDepartment: statsTracker.byDepartment,
        byAssignmentReason: statsTracker.byAssignmentReason
      }
    };

    // Save the mapping
    const outputPath = path.join(process.cwd(), 'data', 'subject-teacher-map.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

    // Display statistics
    console.log(`✅ Created ${statsTracker.totalMappings} subject→teacher mappings`);
    console.log(`📍 Placeholders: ${statsTracker.placeholders}`);
    console.log('');
    
    console.log('📊 Assignment Reasons:');
    Object.entries(statsTracker.byAssignmentReason).forEach(([reason, count]) => {
      console.log(`   ${reason}: ${count} assignments`);
    });
    console.log('');
    
    console.log('🏢 By Department:');
    Object.entries(statsTracker.byDepartment)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([dept, count]) => {
        console.log(`   ${dept}: ${count} subjects`);
      });
    
    console.log('');
    console.log('🔍 Sample Mappings:');
    const sampleMappings = Object.entries(subjectTeacherMap).slice(0, 10);
    sampleMappings.forEach(([subjectCode, teacherId]) => {
      const assignment = assignments.find(a => a.subjectCode === subjectCode);
      console.log(`   ${subjectCode} → ${teacherId} (${assignment?.teacherName})`);
    });
    
    if (Object.keys(subjectTeacherMap).length > 10) {
      console.log(`   ... and ${Object.keys(subjectTeacherMap).length - 10} more mappings`);
    }
    
    console.log('');
    console.log(`💾 Subject→Teacher mapping saved to: ${outputPath}`);
    console.log('🎉 Mapping creation completed successfully!');
    
    return output;
    
  } catch (error) {
    console.error('❌ Error creating subject→teacher mapping:', error.message);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  createSubjectTeacherMap();
}

module.exports = { createSubjectTeacherMap };
