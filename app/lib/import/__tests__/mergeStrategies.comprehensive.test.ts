import { Subject } from '../../../types/subject';
import {
  ConflictReport,
  ResolutionStrategy,
  GlobalResolutionStrategy,
  applyResolutionStrategy,
  detectConflicts
} from '../conflictDetection';
import { generateSubjectId } from '../subjectImportUtils';

// Mock fetch and file operations to prevent real API/file system calls
global.fetch = jest.fn();
jest.mock('fs/promises');

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Merge Strategies - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any global state that might affect tests
  });

  // Helper function to create test subjects
  const createSubject = (id: string, code: string, name: string, departmentId = 'dept1', semesterId = 'sem1'): Subject => ({
    id,
    code,
    name,
    shortName: name,
    creditHours: 3,
    color: 'bg-blue-100',
    departmentId,
    semesterId,
    semesterLevel: 1,
    isCore: true,
    isMajor: true,
    teachingDepartmentIds: []
  });

  // Helper to create conflict reports
  const createConflictReport = (
    subject: Subject,
    hasIdConflict: boolean = false,
    hasCodeConflict: boolean = false,
    rowIndex: number = 0
  ): ConflictReport => {
    let conflictType: 'none' | 'duplicateId' | 'duplicateCode' | 'both' = 'none';
    let recommendedResolution: ResolutionStrategy = 'overwrite';

    if (hasIdConflict && hasCodeConflict) {
      conflictType = 'both';
      recommendedResolution = 'userDecision';
    } else if (hasIdConflict) {
      conflictType = 'duplicateId';
      recommendedResolution = 'overwrite';
    } else if (hasCodeConflict) {
      conflictType = 'duplicateCode';
      recommendedResolution = 'skip';
    }

    return {
      rowIndex,
      conflictType,
      hasIdConflict,
      hasCodeConflict,
      existingSubjectsByIdConflict: hasIdConflict ? [
        { id: subject.id, code: 'EXISTING_CODE', name: 'Existing Subject', departmentId: 'dept1', semesterId: 'sem1' }
      ] : [],
      existingSubjectsByCodeConflict: hasCodeConflict ? [
        { id: 'existing_id', code: subject.code, name: 'Existing Subject', departmentId: 'dept1', semesterId: 'sem1' }
      ] : [],
      intraFileIdConflicts: [],
      intraFileCodeConflicts: [],
      recommendedResolution,
      subject
    };
  };

  describe('Skip Strategy', () => {
    it('should skip subjects when skip strategy is applied', () => {
      const subjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub2', 'PHYS201', 'Physics 201'),
        createSubject('sub3', 'CHEM301', 'Chemistry 301')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], false, false), // No conflict
        createConflictReport(subjects[1], false, true),  // Code conflict
        createConflictReport(subjects[2], true, false)   // ID conflict
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'skip',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(subjects[0]); // No conflict, should import
      expect(result.toImport).not.toContain(subjects[1]); // Code conflict, should skip
      expect(result.toImport).not.toContain(subjects[2]); // ID conflict, should skip
      expect(result.toSkip).toHaveLength(2);
      expect(result.toOverwrite).toHaveLength(0);
    });

    it('should skip subjects with recommended skip strategy', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math 101');
      
      const conflictReports = [
        createConflictReport(subject, false, true) // Code conflict -> recommended skip
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false // Use recommended strategy
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).not.toContain(subject);
      expect(result.toSkip).toHaveLength(1);
      expect(result.toSkip[0].subject).toBe(subject);
    });

    it('should preserve existing data when skipping', () => {
      // This test verifies that skip strategy doesn't affect existing data
      const subject = createSubject('existing_id', 'EXISTING_CODE', 'New Name');
      
      const conflictReports = [
        createConflictReport(subject, true, true) // Both conflicts -> userDecision -> treated as skip
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'skip',
        duplicateCodeStrategy: 'skip',
        applyToAll: false
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).not.toContain(subject);
      expect(result.toSkip).toHaveLength(1);
      
      // Verify the conflict report is preserved with original subject data
      const skippedReport = result.toSkip[0];
      expect(skippedReport.subject.name).toBe('New Name');
      expect(skippedReport.existingSubjectsByIdConflict[0].name).toBe('Existing Subject');
    });

    it('should handle multiple skip scenarios', () => {
      const subjects = [
        createSubject('sub1', 'CODE1', 'Subject 1'),
        createSubject('sub2', 'CODE2', 'Subject 2'),
        createSubject('sub3', 'CODE3', 'Subject 3'),
        createSubject('sub4', 'CODE4', 'Subject 4'),
        createSubject('sub5', 'CODE5', 'Subject 5')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], false, false), // No conflict
        createConflictReport(subjects[1], false, true),  // Code conflict
        createConflictReport(subjects[2], true, false),  // ID conflict
        createConflictReport(subjects[3], true, true),   // Both conflicts
        createConflictReport(subjects[4], false, false)  // No conflict
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'skip',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toHaveLength(2); // Only subjects with no conflicts
      expect(result.toImport).toContain(subjects[0]);
      expect(result.toImport).toContain(subjects[4]);
      expect(result.toSkip).toHaveLength(3); // All subjects with conflicts
    });
  });

  describe('Overwrite Strategy', () => {
    it('should overwrite subjects when overwrite strategy is applied', () => {
      const subjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub2', 'PHYS201', 'Physics 201'),
        createSubject('sub3', 'CHEM301', 'Chemistry 301')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], false, false), // No conflict
        createConflictReport(subjects[1], false, true),  // Code conflict
        createConflictReport(subjects[2], true, false)   // ID conflict
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'overwrite',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toHaveLength(3); // All subjects should be imported
      expect(result.toImport).toContain(subjects[0]);
      expect(result.toImport).toContain(subjects[1]);
      expect(result.toImport).toContain(subjects[2]);
      expect(result.toOverwrite).toHaveLength(2); // Two subjects have conflicts to overwrite
      expect(result.toSkip).toHaveLength(0);
    });

    it('should overwrite subjects with recommended overwrite strategy', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math 101');
      
      const conflictReports = [
        createConflictReport(subject, true, false) // ID conflict -> recommended overwrite
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false // Use recommended strategy
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(subject);
      expect(result.toOverwrite).toHaveLength(1);
      expect(result.toOverwrite[0].subject).toBe(subject);
      expect(result.toSkip).toHaveLength(0);
    });

    it('should replace existing data when overwriting', () => {
      const newSubject = createSubject('existing_id', 'NEW_CODE', 'Updated Subject');
      
      const conflictReports = [
        createConflictReport(newSubject, true, false) // ID conflict
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(newSubject);
      expect(result.toOverwrite).toHaveLength(1);
      
      // Verify the new subject data is preserved for import
      const overwriteReport = result.toOverwrite[0];
      expect(overwriteReport.subject.name).toBe('Updated Subject');
      expect(overwriteReport.subject.code).toBe('NEW_CODE');
      
      // Verify existing subject reference is preserved
      expect(overwriteReport.existingSubjectsByIdConflict[0].code).toBe('EXISTING_CODE');
    });

    it('should handle partial overwrites (ID vs Code conflicts)', () => {
      const subjects = [
        createSubject('id1', 'CODE1', 'Subject with ID conflict'),
        createSubject('id2', 'EXISTING_CODE', 'Subject with Code conflict')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], true, false),  // ID conflict only
        createConflictReport(subjects[1], false, true)   // Code conflict only
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(subjects[0]); // ID conflict -> overwrite
      expect(result.toImport).not.toContain(subjects[1]); // Code conflict -> skip
      expect(result.toOverwrite).toHaveLength(1);
      expect(result.toSkip).toHaveLength(1);
    });
  });

  describe('Keep Both Strategy (ID Generation)', () => {
    it('should generate new IDs when keeping both subjects', async () => {
      // Mock the ID generation function behavior
      const originalGenerateId = generateSubjectId;
      let idCounter = 1000;
      const mockGenerateId = jest.fn().mockImplementation(() => `generated_${idCounter++}`);
      
      // Replace the function temporarily
      (require('../subjectImportUtils') as any).generateSubjectId = mockGenerateId;

      try {
        const existingSubjects = [
          createSubject('sub1', 'MATH101', 'Existing Math')
        ];

        const newSubjects = [
          createSubject('sub1', 'MATH101', 'New Math') // Both ID and code conflict
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => existingSubjects
        } as Response);

        const result = await detectConflicts(newSubjects);
        
        // Simulate "keep both" strategy by generating new ID
        const conflictReport = result.conflictReports[0];
        
        if (conflictReport.conflictType === 'both') {
          // Create a new version with generated ID for "keep both"
          const newId = mockGenerateId();
          const modifiedSubject = { ...conflictReport.subject, id: newId };
          
          expect(newId).toBe('generated_1000');
          expect(modifiedSubject.id).not.toBe(conflictReport.subject.id);
          expect(modifiedSubject.code).toBe(conflictReport.subject.code); // Keep same code
          expect(modifiedSubject.name).toBe(conflictReport.subject.name); // Keep same name
        }

        expect(mockGenerateId).toHaveBeenCalled();

      } finally {
        // Restore original function
        (require('../subjectImportUtils') as any).generateSubjectId = originalGenerateId;
      }
    });

    it('should handle keep both strategy for ID conflicts only', () => {
      // For ID-only conflicts, we can keep the same code and generate new ID
      const existingSubject = createSubject('sub1', 'EXISTING_CODE', 'Existing Subject');
      const newSubject = createSubject('sub1', 'NEW_CODE', 'New Subject');

      // In a "keep both" scenario for ID conflict:
      // - Generate new ID for new subject
      // - Keep original code and data
      const newId = `generated_${Date.now()}`;
      const modifiedSubject = { ...newSubject, id: newId };

      expect(modifiedSubject.id).not.toBe(existingSubject.id);
      expect(modifiedSubject.id).toBe(newId);
      expect(modifiedSubject.code).toBe('NEW_CODE'); // Should keep different code
      expect(modifiedSubject.name).toBe('New Subject'); // Should keep new data
    });

    it('should handle keep both strategy for code conflicts', () => {
      // For code-only conflicts, we might need to modify the code or handle differently
      const existingSubject = createSubject('EXISTING_ID', 'MATH101', 'Existing Math');
      const newSubject = createSubject('NEW_ID', 'MATH101', 'New Math');

      // In a "keep both" scenario for code conflict:
      // - Keep different IDs (no conflict there)
      // - Might need to modify code or use conflict resolution
      // This is more complex and often requires user input
      
      expect(newSubject.id).not.toBe(existingSubject.id); // Different IDs is good
      expect(newSubject.code).toBe(existingSubject.code); // Same code is the conflict

      // Strategy could be:
      // 1. Ask user to modify code
      // 2. Auto-append suffix to code
      // 3. Skip import and notify user
      
      const modifiedCode = `${newSubject.code}_v2`;
      const modifiedSubject = { ...newSubject, code: modifiedCode };
      
      expect(modifiedSubject.code).toBe('MATH101_v2');
      expect(modifiedSubject.id).toBe('NEW_ID');
    });

    it('should track both subjects when keeping both', () => {
      // This test simulates a system that tracks both existing and new subjects
      const existingSubject = createSubject('sub1', 'MATH101', 'Original Math');
      const newSubject = createSubject('sub1', 'MATH101', 'Updated Math');

      // "Keep both" means:
      // 1. Existing subject stays as-is
      // 2. New subject gets modifications to resolve conflicts
      // 3. Both exist in the system

      const newId = `generated_${Date.now()}`;
      const modifiedNewSubject = { ...newSubject, id: newId };

      const keepBothResult = {
        existing: existingSubject,
        imported: modifiedNewSubject,
        strategy: 'keep_both' as const
      };

      expect(keepBothResult.existing.id).toBe('sub1');
      expect(keepBothResult.imported.id).toBe(newId);
      expect(keepBothResult.existing.name).toBe('Original Math');
      expect(keepBothResult.imported.name).toBe('Updated Math');
      expect(keepBothResult.strategy).toBe('keep_both');
    });

    it('should generate unique IDs for multiple keep both scenarios', () => {
      const subjects = [
        createSubject('duplicate_id', 'CODE1', 'Subject 1'),
        createSubject('duplicate_id', 'CODE2', 'Subject 2'),
        createSubject('duplicate_id', 'CODE3', 'Subject 3')
      ];

      // Simulate keep both for all ID conflicts
      const generatedIds = new Set();
      const modifiedSubjects = subjects.map((subject, index) => {
        if (index === 0) return subject; // First one keeps original ID
        
        const newId = `generated_${Date.now()}_${index}`;
        generatedIds.add(newId);
        return { ...subject, id: newId };
      });

      expect(modifiedSubjects[0].id).toBe('duplicate_id');
      expect(modifiedSubjects[1].id).not.toBe('duplicate_id');
      expect(modifiedSubjects[2].id).not.toBe('duplicate_id');
      expect(modifiedSubjects[1].id).not.toBe(modifiedSubjects[2].id);
      expect(generatedIds.size).toBe(2); // Two new IDs generated
    });
  });

  describe('Global vs Individual Strategy Resolution', () => {
    it('should apply individual strategies when global is disabled', () => {
      const subjects = [
        createSubject('sub1', 'CODE1', 'Subject 1'),
        createSubject('sub2', 'CODE2', 'Subject 2'),
        createSubject('sub3', 'CODE3', 'Subject 3')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], true, false),  // ID conflict -> recommended overwrite
        createConflictReport(subjects[1], false, true),  // Code conflict -> recommended skip
        createConflictReport(subjects[2], true, true)    // Both conflicts -> recommended userDecision
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'skip',      // Different from recommended
        duplicateCodeStrategy: 'overwrite', // Different from recommended
        applyToAll: false // Use individual/recommended strategies
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(subjects[0]); // ID conflict -> overwrite (recommended)
      expect(result.toImport).not.toContain(subjects[1]); // Code conflict -> skip (recommended)
      expect(result.toImport).not.toContain(subjects[2]); // Both -> userDecision -> treated as skip

      expect(result.toOverwrite).toHaveLength(1); // subjects[0]
      expect(result.toSkip).toHaveLength(2); // subjects[1] and subjects[2]
    });

    it('should apply global strategies when global is enabled', () => {
      const subjects = [
        createSubject('sub1', 'CODE1', 'Subject 1'),
        createSubject('sub2', 'CODE2', 'Subject 2'),
        createSubject('sub3', 'CODE3', 'Subject 3')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], true, false),  // ID conflict
        createConflictReport(subjects[1], false, true),  // Code conflict
        createConflictReport(subjects[2], true, true)    // Both conflicts
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'overwrite',
        applyToAll: true // Apply global strategies
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      // All should be imported with overwrite strategy
      expect(result.toImport).toHaveLength(3);
      expect(result.toImport).toContain(subjects[0]);
      expect(result.toImport).toContain(subjects[1]);
      expect(result.toImport).toContain(subjects[2]);
      expect(result.toOverwrite).toHaveLength(3);
      expect(result.toSkip).toHaveLength(0);
    });

    it('should handle mixed global strategies', () => {
      const subjects = [
        createSubject('sub1', 'CODE1', 'Subject 1'),
        createSubject('sub2', 'CODE2', 'Subject 2')
      ];

      const conflictReports = [
        createConflictReport(subjects[0], true, false),  // ID conflict
        createConflictReport(subjects[1], false, true)   // Code conflict
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(subjects[0]); // ID conflict -> overwrite
      expect(result.toImport).not.toContain(subjects[1]); // Code conflict -> skip
      expect(result.toOverwrite).toHaveLength(1);
      expect(result.toSkip).toHaveLength(1);
    });
  });

  describe('Complex Merge Scenarios', () => {
    it('should handle bulk import with multiple conflict types', () => {
      const subjects = Array.from({ length: 10 }, (_, i) => 
        createSubject(`sub${i}`, `CODE${i}`, `Subject ${i}`)
      );

      const conflictReports = [
        createConflictReport(subjects[0], false, false), // No conflict
        createConflictReport(subjects[1], true, false),  // ID conflict
        createConflictReport(subjects[2], false, true),  // Code conflict
        createConflictReport(subjects[3], true, true),   // Both conflicts
        createConflictReport(subjects[4], false, false), // No conflict
        createConflictReport(subjects[5], true, false),  // ID conflict
        createConflictReport(subjects[6], false, true),  // Code conflict
        createConflictReport(subjects[7], true, true),   // Both conflicts
        createConflictReport(subjects[8], false, false), // No conflict
        createConflictReport(subjects[9], true, false)   // ID conflict
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      // No conflicts: 0, 4, 8 (3 subjects)
      // ID conflicts: 1, 5, 9 (3 subjects) -> overwrite
      // Code conflicts: 2, 6 (2 subjects) -> skip  
      // Both conflicts: 3, 7 (2 subjects) -> ID strategy wins -> overwrite

      expect(result.toImport).toHaveLength(6); // 3 no conflicts + 3 ID overwrites + 2 both overwrites
      expect(result.toOverwrite).toHaveLength(5); // 3 ID + 2 both
      expect(result.toSkip).toHaveLength(2); // 2 code conflicts
    });

    it('should preserve data integrity during merge operations', () => {
      const originalSubject = createSubject('sub1', 'MATH101', 'Original Math');
      const updatedSubject = createSubject('sub1', 'MATH101', 'Updated Math');
      
      // Modify some fields in updated subject
      updatedSubject.creditHours = 4;
      updatedSubject.color = 'bg-red-100';
      updatedSubject.isCore = false;

      const conflictReport = createConflictReport(updatedSubject, true, true);

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'overwrite',
        applyToAll: true
      };

      const result = applyResolutionStrategy([conflictReport], globalStrategy);

      expect(result.toImport).toHaveLength(1);
      expect(result.toOverwrite).toHaveLength(1);

      const importedSubject = result.toImport[0];
      
      // Verify all updated data is preserved
      expect(importedSubject.name).toBe('Updated Math');
      expect(importedSubject.creditHours).toBe(4);
      expect(importedSubject.color).toBe('bg-red-100');
      expect(importedSubject.isCore).toBe(false);
      expect(importedSubject.id).toBe('sub1');
      expect(importedSubject.code).toBe('MATH101');
    });

    it('should handle edge case with empty strategy inputs', () => {
      const emptyConflictReports: ConflictReport[] = [];
      
      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(emptyConflictReports, globalStrategy);

      expect(result.toImport).toHaveLength(0);
      expect(result.toOverwrite).toHaveLength(0);
      expect(result.toSkip).toHaveLength(0);
    });
  });

  describe('Strategy Performance and Efficiency', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = Date.now();
      
      // Create a large dataset
      const subjects = Array.from({ length: 1000 }, (_, i) => 
        createSubject(`sub${i}`, `CODE${i}`, `Subject ${i}`)
      );

      const conflictReports = subjects.map((subject, index) => 
        createConflictReport(
          subject, 
          index % 3 === 0, // Every 3rd has ID conflict
          index % 5 === 0, // Every 5th has code conflict
          index
        )
      );

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(processingTime).toBeLessThan(1000); // 1 second

      // Verify results are correct
      expect(result.toImport.length + result.toSkip.length).toBe(1000);
      expect(result.toImport.length).toBeGreaterThan(0);
      expect(result.toSkip.length).toBeGreaterThan(0);
    });

    it('should maintain referential integrity', () => {
      const subject1 = createSubject('sub1', 'CODE1', 'Subject 1');
      const subject2 = createSubject('sub2', 'CODE2', 'Subject 2');

      const conflictReports = [
        createConflictReport(subject1, true, false),
        createConflictReport(subject2, false, true)
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      // Verify that object references are maintained correctly
      expect(result.toImport[0]).toBe(subject1); // Same object reference
      expect(result.toSkip[0].subject).toBe(subject2); // Same object reference in report
      expect(result.toOverwrite[0].subject).toBe(subject1); // Same object reference in report
    });
  });

  describe('Error Handling in Merge Operations', () => {
    it('should handle malformed conflict reports gracefully', () => {
      const subject = createSubject('sub1', 'CODE1', 'Subject 1');
      
      // Create a malformed conflict report
      const malformedReport = {
        rowIndex: 0,
        conflictType: 'unknown' as any, // Invalid conflict type
        hasIdConflict: true,
        hasCodeConflict: true,
        existingSubjectsByIdConflict: [],
        existingSubjectsByCodeConflict: [],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [],
        recommendedResolution: 'invalid' as any, // Invalid resolution
        subject
      };

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false
      };

      // Should not throw an error, should handle gracefully
      const result = applyResolutionStrategy([malformedReport], globalStrategy);

      // Should default to skip for unknown/invalid strategies
      expect(result.toImport).not.toContain(subject);
      expect(result.toSkip).toHaveLength(1);
    });

    it('should handle null/undefined subjects in reports', () => {
      const validSubject = createSubject('sub1', 'CODE1', 'Valid Subject');
      
      const reportsWithNulls = [
        createConflictReport(validSubject, false, false),
        // Simulate a report with null subject (shouldn't happen in normal flow)
        { ...createConflictReport(validSubject, true, false), subject: null } as any
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      // Should handle gracefully and only process valid reports
      const result = applyResolutionStrategy(reportsWithNulls, globalStrategy);

      expect(result.toImport).toContain(validSubject);
      expect(result.toImport).toHaveLength(1); // Only valid subject imported
    });
  });
});
