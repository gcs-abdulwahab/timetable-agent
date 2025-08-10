const fs = require('fs');
const path = require('path');

class TeacherAssignmentSystem {
  constructor() {
    this.teachers = [];
    this.subjects = [];
    this.departments = [];
    this.existingAllocations = [];
    this.teacherLoads = new Map();
    this.subjectTeacherMap = new Map();
    this.loadData();
  }

  loadData() {
    try {
      // Function to remove BOM if present
      const removeBOM = (content) => {
        if (content.charCodeAt(0) === 0xFEFF) {
          return content.slice(1);
        }
        return content;
      };
      
      // Load teachers
      const teachersPath = path.join(process.cwd(), 'data', 'teachers.json');
      const teachersContent = removeBOM(fs.readFileSync(teachersPath, 'utf8'));
      this.teachers = JSON.parse(teachersContent);
      
      // Load subjects
      const subjectsPath = path.join(process.cwd(), 'data', 'subjects.json');
      const subjectsContent = removeBOM(fs.readFileSync(subjectsPath, 'utf8'));
      this.subjects = JSON.parse(subjectsContent);
      
      // Load departments
      const departmentsPath = path.join(process.cwd(), 'data', 'departments.json');
      const departmentsContent = removeBOM(fs.readFileSync(departmentsPath, 'utf8'));
      this.departments = JSON.parse(departmentsContent);
      
      // Load existing allocations
      const allocationsPath = path.join(process.cwd(), 'data', 'allocations.json');
      if (fs.existsSync(allocationsPath)) {
        this.existingAllocations = JSON.parse(fs.readFileSync(allocationsPath, 'utf8'));
      }
      
      console.log(`Loaded ${this.teachers.length} teachers, ${this.subjects.length} subjects, ${this.existingAllocations.length} existing allocations`);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Calculate current teacher loads based on existing allocations
   */
  calculateTeacherLoads() {
    this.teacherLoads.clear();
    
    // Initialize all teachers with empty loads
    this.teachers.forEach(teacher => {
      this.teacherLoads.set(teacher.id, {
        teacherId: teacher.id,
        totalAssignments: 0,
        subjectAssignments: [],
        dayPeriodSlots: {}
      });
    });

    // Process existing allocations
    this.existingAllocations.forEach(allocation => {
      const load = this.teacherLoads.get(allocation.teacherId);
      if (load) {
        load.totalAssignments++;
        
        // Track unique subjects
        if (!load.subjectAssignments.includes(allocation.subjectId)) {
          load.subjectAssignments.push(allocation.subjectId);
        }
        
        // Track day-period slots for conflict detection
        if (!load.dayPeriodSlots[allocation.day]) {
          load.dayPeriodSlots[allocation.day] = [];
        }
        
        // Extract period number from timeslot
        const period = this.extractPeriodFromTimeSlot(allocation.timeSlotId);
        if (period && !load.dayPeriodSlots[allocation.day].includes(period)) {
          load.dayPeriodSlots[allocation.day].push(period);
        }
      }
    });

    console.log('Teacher loads calculated:', Array.from(this.teacherLoads.entries()).map(([id, load]) => 
      `${id}: ${load.totalAssignments} assignments, ${load.subjectAssignments.length} unique subjects`
    ));
  }

  /**
   * Extract period number from timeSlotId (assuming format like "ts1", "ts2", etc.)
   */
  extractPeriodFromTimeSlot(timeSlotId) {
    const match = timeSlotId.match(/ts(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Check if a teacher can be assigned to a subject considering constraints
   */
  canAssignTeacher(teacherId, subjectId, constraints) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    const subject = this.subjects.find(s => s.id === subjectId);
    const load = this.teacherLoads.get(teacherId);
    
    if (!teacher || !subject || !load) return false;

    // Check if teacher already assigned to maximum subjects
    if (load.subjectAssignments.length >= constraints.maxTotalSubjects) {
      return false;
    }

    // Check if subject is already assigned to this teacher
    if (load.subjectAssignments.includes(subjectId)) {
      return true; // Already assigned, no conflict
    }

    return true;
  }

  /**
   * Find the best teacher for a subject based on expertise and load balancing
   */
  findBestTeacher(subject, constraints) {
    const departmentTeachers = this.teachers.filter(t => 
      t.departmentId === subject.departmentId && t.id !== 'unassigned'
    );

    // If teaching department is specified, check those departments too
    const teachingDeptTeachers = subject.teachingDepartmentIds 
      ? this.teachers.filter(t => 
          subject.teachingDepartmentIds.includes(t.departmentId) && t.id !== 'unassigned'
        )
      : [];

    const availableTeachers = [...departmentTeachers, ...teachingDeptTeachers]
      .filter((teacher, index, self) => 
        self.findIndex(t => t.id === teacher.id) === index // Remove duplicates
      );

    if (availableTeachers.length === 0) {
      return this.createPlaceholderMapping(subject);
    }

    // Score teachers based on various factors
    const scoredTeachers = availableTeachers.map(teacher => {
      const load = this.teacherLoads.get(teacher.id);
      let score = 0;

      // Prefer teachers from the same department
      if (teacher.departmentId === subject.departmentId) {
        score += 100;
      }

      // Prefer teachers with lower current load (load balancing)
      score += Math.max(0, 50 - (load.totalAssignments * 10));

      // Prefer teachers with fewer unique subjects (specialization)
      score += Math.max(0, 30 - (load.subjectAssignments.length * 5));

      // Prefer senior faculty (if designation indicates seniority)
      if (teacher.designation && teacher.designation.includes('Professor')) {
        score += 20;
      } else if (teacher.designation && teacher.designation.includes('HOD')) {
        score += 10;
      }

      return { teacher, score, load };
    });

    // Sort by score (highest first) and pick the best available teacher
    scoredTeachers.sort((a, b) => b.score - a.score);
    
    for (const { teacher, load } of scoredTeachers) {
      if (this.canAssignTeacher(teacher.id, subject.id, constraints)) {
        return {
          subjectCode: subject.code,
          subjectId: subject.id,
          teacherId: teacher.id,
          teacherName: teacher.name,
          departmentId: teacher.departmentId,
          isPlaceholder: false,
          assignmentReason: teacher.departmentId === subject.departmentId ? 'department_match' : 'load_balancing'
        };
      }
    }

    // If no teacher is available, create a placeholder
    return this.createPlaceholderMapping(subject);
  }

  /**
   * Create a placeholder teacher assignment
   */
  createPlaceholderMapping(subject) {
    const department = this.departments.find(d => d.id === subject.departmentId);
    const departmentName = department ? department.shortName : 'Unknown';
    
    return {
      subjectCode: subject.code,
      subjectId: subject.id,
      teacherId: 'unassigned',
      teacherName: `TBA - ${departmentName}`,
      departmentId: subject.departmentId,
      isPlaceholder: true,
      assignmentReason: 'placeholder'
    };
  }

  /**
   * Main assignment process
   */
  assignTeachersToSubjects(constraints = {
    maxPeriodsPerDay: 6,
    maxTotalSubjects: 8,
    preferSameDepartment: true,
    allowCrossDepartmentAssignment: true
  }) {
    
    console.log('Starting teacher assignment process...');
    
    // Calculate current loads
    this.calculateTeacherLoads();
    
    // Process existing allocations first
    this.existingAllocations.forEach(allocation => {
      const subject = this.subjects.find(s => s.id === allocation.subjectId);
      const teacher = this.teachers.find(t => t.id === allocation.teacherId);
      
      if (subject && teacher) {
        this.subjectTeacherMap.set(allocation.subjectId, {
          subjectCode: subject.code,
          subjectId: subject.id,
          teacherId: teacher.id,
          teacherName: teacher.name,
          departmentId: teacher.departmentId,
          isPlaceholder: teacher.id === 'unassigned',
          assignmentReason: 'existing_mapping'
        });
      }
    });

    console.log(`Processed ${this.subjectTeacherMap.size} existing assignments`);

    // Assign teachers to remaining subjects
    let newAssignments = 0;
    this.subjects.forEach(subject => {
      if (!this.subjectTeacherMap.has(subject.id)) {
        const mapping = this.findBestTeacher(subject, constraints);
        this.subjectTeacherMap.set(subject.id, mapping);
        
        // Update teacher load
        if (!mapping.isPlaceholder) {
          const load = this.teacherLoads.get(mapping.teacherId);
          if (load && !load.subjectAssignments.includes(subject.id)) {
            load.subjectAssignments.push(subject.id);
            load.totalAssignments++;
          }
        }
        newAssignments++;
      }
    });

    console.log(`Made ${newAssignments} new teacher assignments`);

    const result = Array.from(this.subjectTeacherMap.values());
    console.log(`Total assignments: ${result.length}, Placeholders: ${result.filter(r => r.isPlaceholder).length}`);
    
    return result;
  }

  /**
   * Get current teacher workload summary
   */
  getTeacherWorkloadSummary() {
    const summary = {};
    
    this.teacherLoads.forEach((load, teacherId) => {
      const teacher = this.teachers.find(t => t.id === teacherId);
      if (teacher && teacher.id !== 'unassigned') {
        summary[teacherId] = {
          name: teacher.name,
          department: teacher.departmentId,
          load: load.totalAssignments,
          subjects: load.subjectAssignments.map(subjectId => {
            const subject = this.subjects.find(s => s.id === subjectId);
            return subject ? subject.code : subjectId;
          })
        };
      }
    });
    
    return summary;
  }

  /**
   * Check for assignment conflicts
   */
  validateAssignments() {
    const conflicts = [];
    
    // Check for over-assignment
    this.teacherLoads.forEach((load, teacherId) => {
      const teacher = this.teachers.find(t => t.id === teacherId);
      if (teacher && teacher.id !== 'unassigned') {
        if (load.subjectAssignments.length > 8) {
          conflicts.push(`${teacher.name} is assigned to ${load.subjectAssignments.length} subjects (exceeds maximum of 8)`);
        }
      }
    });

    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  }

  /**
   * Save assignment mappings to JSON file
   */
  saveAssignments(filePath) {
    const outputPath = filePath || path.join(process.cwd(), 'data', 'teacher-subject-mappings.json');
    const assignments = Array.from(this.subjectTeacherMap.values());
    
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalAssignments: assignments.length,
        placeholderCount: assignments.filter(a => a.isPlaceholder).length,
        teacherCount: new Set(assignments.map(a => a.teacherId)).size
      },
      assignments: assignments,
      workloadSummary: this.getTeacherWorkloadSummary(),
      validation: this.validateAssignments()
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Teacher-subject mappings saved to: ${outputPath}`);
  }
}

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

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { TeacherAssignmentSystem, main };
