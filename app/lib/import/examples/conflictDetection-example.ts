import { Subject } from '../../../types/subject';
import {
  detectConflicts,
  fetchExistingSubjects,
  applyResolutionStrategy,
  formatConflictReport,
  ConflictDetectionResult,
  GlobalResolutionStrategy,
} from '../conflictDetection';

/**
 * Example usage of the conflict detection system
 * This demonstrates a complete workflow for detecting and handling conflicts
 * when importing subjects
 */

// Example: Create sample data that would come from parsing an import file
const sampleImportData: Subject[] = [
  {
    id: 'sub1001',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    shortName: 'Intro CS',
    creditHours: 3,
    color: '#3b82f6',
    departmentId: 'dept-cs',
    semesterLevel: 1,
    isCore: true,
    semesterId: 'sem1',
    isMajor: true,
    teachingDepartmentIds: ['dept-cs'],
  },
  {
    id: 'sub1001', // Duplicate ID within file
    code: 'MATH101',
    name: 'Calculus I',
    shortName: 'Calc I',
    creditHours: 4,
    color: '#ef4444',
    departmentId: 'dept-math',
    semesterLevel: 1,
    isCore: true,
    semesterId: 'sem1',
    isMajor: true,
    teachingDepartmentIds: ['dept-math'],
  },
  {
    id: 'sub1003',
    code: 'CS101', // Duplicate code within file
    name: 'Advanced Programming',
    shortName: 'Adv Prog',
    creditHours: 3,
    color: '#8b5cf6',
    departmentId: 'dept-cs',
    semesterLevel: 2,
    isCore: false,
    semesterId: 'sem2',
    isMajor: true,
    teachingDepartmentIds: ['dept-cs'],
  },
  {
    id: 'existing-subject-1', // Will conflict with existing data
    code: 'PHY101',
    name: 'Physics Fundamentals',
    shortName: 'Physics',
    creditHours: 3,
    color: '#10b981',
    departmentId: 'dept-physics',
    semesterLevel: 1,
    isCore: true,
    semesterId: 'sem1',
    isMajor: true,
    teachingDepartmentIds: ['dept-physics'],
  },
  {
    id: 'sub1005',
    code: 'existing-code-1', // Will conflict with existing data by code
    name: 'Database Systems',
    shortName: 'Database',
    creditHours: 3,
    color: '#f59e0b',
    departmentId: 'dept-cs',
    semesterLevel: 3,
    isCore: true,
    semesterId: 'sem3',
    isMajor: true,
    teachingDepartmentIds: ['dept-cs'],
  },
  {
    id: 'sub1006',
    code: 'ENG101',
    name: 'English Composition',
    shortName: 'English',
    creditHours: 3,
    color: '#6366f1',
    departmentId: 'dept-english',
    semesterLevel: 1,
    isCore: true,
    semesterId: 'sem1',
    isMajor: false,
    teachingDepartmentIds: ['dept-english'],
  },
];

// Example: Sample existing data that would be fetched from the database
const sampleExistingSubjects: Subject[] = [
  {
    id: 'existing-subject-1',
    code: 'existing-code-old',
    name: 'Old Subject Name',
    shortName: 'Old Sub',
    creditHours: 2,
    color: '#64748b',
    departmentId: 'dept-old',
    semesterLevel: 2,
    isCore: false,
    semesterId: 'sem2',
    isMajor: true,
    teachingDepartmentIds: ['dept-old'],
  },
  {
    id: 'existing-subject-2',
    code: 'existing-code-1',
    name: 'Existing Course with Same Code',
    shortName: 'Existing',
    creditHours: 4,
    color: '#dc2626',
    departmentId: 'dept-existing',
    semesterLevel: 1,
    isCore: true,
    semesterId: 'sem1',
    isMajor: true,
    teachingDepartmentIds: ['dept-existing'],
  },
];

/**
 * Example function to demonstrate the complete conflict detection workflow
 */
export async function demonstrateConflictDetection(): Promise<void> {
  console.log('=== Subject Import Conflict Detection Demo ===\n');

  try {
    // Step 1: Detect conflicts
    console.log('🔍 Detecting conflicts...');
    const conflictResult: ConflictDetectionResult = await detectConflicts(
      sampleImportData,
      sampleExistingSubjects // In real usage, this would be fetched automatically
    );

    console.log(`\n📊 Conflict Detection Summary:`);
    console.log(`Total rows to import: ${conflictResult.totalRows}`);
    console.log(`Rows with conflicts: ${conflictResult.conflictingRows}`);
    console.log(`Conflict-free rows: ${conflictResult.conflictFreeRows}`);
    
    console.log(`\n📈 Detailed Statistics:`);
    console.log(`• ID conflicts: ${conflictResult.summary.idConflicts}`);
    console.log(`• Code conflicts: ${conflictResult.summary.codeConflicts}`);
    console.log(`• Both conflicts: ${conflictResult.summary.bothConflicts}`);
    console.log(`• Intra-file ID duplicates: ${conflictResult.summary.intraFileIdDuplicates}`);
    console.log(`• Intra-file code duplicates: ${conflictResult.summary.intraFileCodeDuplicates}`);
    console.log(`• Existing data ID conflicts: ${conflictResult.summary.existingDataIdConflicts}`);
    console.log(`• Existing data code conflicts: ${conflictResult.summary.existingDataCodeConflicts}`);

    // Step 2: Display detailed conflict reports
    console.log(`\n📋 Detailed Conflict Reports:`);
    console.log('=' .repeat(50));
    
    conflictResult.conflictReports.forEach((report, index) => {
      const formatted = formatConflictReport(report);
      console.log(`\n${formatted}`);
    });

    // Step 3: Demonstrate resolution strategies
    console.log(`\n\n⚙️ Applying Resolution Strategies:`);
    console.log('=' .repeat(50));

    // Apply default resolution strategy
    console.log(`\n1. Using Default Resolution Strategy:`);
    const defaultResolution = applyResolutionStrategy(
      conflictResult.conflictReports,
      conflictResult.globalStrategy
    );

    console.log(`   → ${defaultResolution.toImport.length} subjects will be imported`);
    console.log(`   → ${defaultResolution.toSkip.length} subjects will be skipped`);
    console.log(`   → ${defaultResolution.toOverwrite.length} subjects will overwrite existing data`);

    // Apply custom global resolution strategy
    console.log(`\n2. Using Custom Global Resolution Strategy (skip all conflicts):`);
    const customGlobalStrategy: GlobalResolutionStrategy = {
      duplicateIdStrategy: 'skip',
      duplicateCodeStrategy: 'skip',
      applyToAll: true,
    };

    const customResolution = applyResolutionStrategy(
      conflictResult.conflictReports,
      customGlobalStrategy
    );

    console.log(`   → ${customResolution.toImport.length} subjects will be imported`);
    console.log(`   → ${customResolution.toSkip.length} subjects will be skipped`);
    console.log(`   → ${customResolution.toOverwrite.length} subjects will overwrite existing data`);

    // Apply another custom global resolution strategy
    console.log(`\n3. Using Aggressive Resolution Strategy (overwrite all conflicts):`);
    const aggressiveStrategy: GlobalResolutionStrategy = {
      duplicateIdStrategy: 'overwrite',
      duplicateCodeStrategy: 'overwrite',
      applyToAll: true,
    };

    const aggressiveResolution = applyResolutionStrategy(
      conflictResult.conflictReports,
      aggressiveStrategy
    );

    console.log(`   → ${aggressiveResolution.toImport.length} subjects will be imported`);
    console.log(`   → ${aggressiveResolution.toSkip.length} subjects will be skipped`);
    console.log(`   → ${aggressiveResolution.toOverwrite.length} subjects will overwrite existing data`);

    // Step 4: Show details of what would be imported/skipped
    console.log(`\n\n📦 Import Details (using default strategy):`);
    console.log('=' .repeat(50));

    console.log(`\n✅ Subjects to Import (${defaultResolution.toImport.length}):`);
    defaultResolution.toImport.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.name} (${subject.code}) - ID: ${subject.id}`);
    });

    console.log(`\n⏭️ Subjects to Skip (${defaultResolution.toSkip.length}):`);
    defaultResolution.toSkip.forEach((report, index) => {
      console.log(`   ${index + 1}. ${report.subject.name} (${report.subject.code}) - Reason: ${report.conflictType}`);
    });

    console.log(`\n🔄 Subjects that will Overwrite Existing (${defaultResolution.toOverwrite.length}):`);
    defaultResolution.toOverwrite.forEach((report, index) => {
      console.log(`   ${index + 1}. ${report.subject.name} (${report.subject.code}) - ID: ${report.subject.id}`);
      if (report.existingSubjectsByIdConflict.length > 0) {
        report.existingSubjectsByIdConflict.forEach(existing => {
          console.log(`      → Will overwrite: ${existing.name} (${existing.code})`);
        });
      }
      if (report.existingSubjectsByCodeConflict.length > 0) {
        report.existingSubjectsByCodeConflict.forEach(existing => {
          console.log(`      → Code conflicts with: ${existing.name} (${existing.code})`);
        });
      }
    });

    console.log(`\n✅ Demo completed successfully!`);

  } catch (error) {
    console.error('❌ Error during conflict detection demo:', error);
    throw error;
  }
}

/**
 * Example of how to use conflict detection in a real import workflow
 */
export async function realWorldImportExample(subjectsToImport: Subject[]): Promise<{
  toImport: Subject[];
  skipped: { subject: Subject; reason: string }[];
  conflicts: number;
}> {
  try {
    // Step 1: Fetch existing subjects from API
    const existingSubjects = await fetchExistingSubjects();

    // Step 2: Detect conflicts
    const conflictResult = await detectConflicts(subjectsToImport, existingSubjects);

    // Step 3: Configure resolution strategy based on business rules
    const strategy: GlobalResolutionStrategy = {
      duplicateIdStrategy: 'overwrite', // Business rule: newer data overwrites by ID
      duplicateCodeStrategy: 'skip',     // Business rule: preserve existing courses with same code
      applyToAll: true,                  // Apply globally for consistency
    };

    // Step 4: Apply resolution
    const resolution = applyResolutionStrategy(conflictResult.conflictReports, strategy);

    // Step 5: Prepare results for the UI or next processing step
    const skipped = resolution.toSkip.map(report => ({
      subject: report.subject,
      reason: `${report.conflictType} conflict - ${formatConflictReport(report)}`,
    }));

    return {
      toImport: resolution.toImport,
      skipped,
      conflicts: conflictResult.conflictingRows,
    };

  } catch (error) {
    console.error('Import workflow failed:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to generate a conflict summary for UI display
 */
export function generateConflictSummary(result: ConflictDetectionResult): {
  message: string;
  severity: 'none' | 'warning' | 'error';
  details: string[];
} {
  if (result.conflictingRows === 0) {
    return {
      message: `All ${result.totalRows} subjects are ready to import with no conflicts.`,
      severity: 'none',
      details: [],
    };
  }

  const details: string[] = [];
  
  if (result.summary.intraFileIdDuplicates > 0) {
    details.push(`${result.summary.intraFileIdDuplicates} duplicate IDs within the import file`);
  }
  
  if (result.summary.intraFileCodeDuplicates > 0) {
    details.push(`${result.summary.intraFileCodeDuplicates} duplicate codes within the import file`);
  }
  
  if (result.summary.existingDataIdConflicts > 0) {
    details.push(`${result.summary.existingDataIdConflicts} subjects conflict with existing IDs`);
  }
  
  if (result.summary.existingDataCodeConflicts > 0) {
    details.push(`${result.summary.existingDataCodeConflicts} subjects conflict with existing codes`);
  }

  const severity = result.summary.bothConflicts > 0 ? 'error' : 'warning';
  const message = `Found conflicts in ${result.conflictingRows} of ${result.totalRows} subjects. Review and resolve before importing.`;

  return { message, severity, details };
}

// Export the demo function and examples
export { sampleImportData, sampleExistingSubjects };
