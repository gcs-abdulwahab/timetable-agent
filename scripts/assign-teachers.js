const { TeacherAssignmentSystem } = require('../app/lib/teacherAssignment');

async function main() {
  try {
    console.log('🎯 Starting teacher assignment process...');
    console.log('=====================================');
    
    const assignmentSystem = new TeacherAssignmentSystem();
    
    // Configure assignment constraints
    const constraints = {
      maxPeriodsPerDay: 6,
      maxTotalSubjects: 8,
      preferSameDepartment: true,
      allowCrossDepartmentAssignment: true
    };
    
    console.log('Assignment constraints:', constraints);
    console.log('');
    
    // Run the assignment
    const assignments = assignmentSystem.assignTeachersToSubjects(constraints);
    
    console.log('');
    console.log('📊 Assignment Summary:');
    console.log('======================');
    
    const stats = {
      total: assignments.length,
      assigned: assignments.filter(a => !a.isPlaceholder).length,
      placeholders: assignments.filter(a => a.isPlaceholder).length,
      departments: new Set(assignments.map(a => a.departmentId)).size,
      teachers: new Set(assignments.filter(a => !a.isPlaceholder).map(a => a.teacherId)).size
    };
    
    console.log(`Total subjects: ${stats.total}`);
    console.log(`Successfully assigned: ${stats.assigned}`);
    console.log(`Placeholders needed: ${stats.placeholders}`);
    console.log(`Departments involved: ${stats.departments}`);
    console.log(`Teachers assigned: ${stats.teachers}`);
    
    // Show workload summary
    console.log('');
    console.log('👥 Teacher Workload Summary:');
    console.log('============================');
    
    const workloadSummary = assignmentSystem.getTeacherWorkloadSummary();
    const sortedTeachers = Object.entries(workloadSummary)
      .sort((a, b) => b[1].load - a[1].load)
      .slice(0, 10); // Show top 10 most loaded teachers
    
    console.log('Top 10 most loaded teachers:');
    sortedTeachers.forEach(([teacherId, info], index) => {
      console.log(`${index + 1}. ${info.name} (${info.department}): ${info.load} assignments, ${info.subjects.length} unique subjects`);
      if (info.subjects.length > 0) {
        console.log(`   Subjects: ${info.subjects.join(', ')}`);
      }
    });
    
    // Validate assignments
    console.log('');
    console.log('✅ Validation Results:');
    console.log('======================');
    
    const validation = assignmentSystem.validateAssignments();
    if (validation.isValid) {
      console.log('✅ All assignments are valid!');
    } else {
      console.log('❌ Found assignment conflicts:');
      validation.conflicts.forEach(conflict => {
        console.log(`   - ${conflict}`);
      });
    }
    
    // Show some sample assignments
    console.log('');
    console.log('📋 Sample Assignments:');
    console.log('======================');
    
    const sampleAssignments = assignments
      .filter(a => !a.isPlaceholder)
      .slice(0, 10);
    
    sampleAssignments.forEach(assignment => {
      console.log(`${assignment.subjectCode} → ${assignment.teacherName} (${assignment.assignmentReason})`);
    });
    
    if (assignments.filter(a => a.isPlaceholder).length > 0) {
      console.log('');
      console.log('🔄 Placeholder Assignments:');
      console.log('===========================');
      
      const placeholders = assignments.filter(a => a.isPlaceholder).slice(0, 10);
      placeholders.forEach(assignment => {
        console.log(`${assignment.subjectCode} → ${assignment.teacherName}`);
      });
      
      if (assignments.filter(a => a.isPlaceholder).length > 10) {
        console.log(`... and ${assignments.filter(a => a.isPlaceholder).length - 10} more placeholders`);
      }
    }
    
    // Save the results
    assignmentSystem.saveAssignments();
    
    console.log('');
    console.log('💾 Results saved to: data/teacher-subject-mappings.json');
    console.log('🎉 Teacher assignment process completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during teacher assignment:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
