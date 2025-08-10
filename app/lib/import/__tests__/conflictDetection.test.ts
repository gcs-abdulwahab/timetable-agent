import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Subject } from '../../../types/subject';
import {
  detectConflicts,
  fetchExistingSubjects,
  applyResolutionStrategy,
  formatConflictReport,
  ConflictType,
  ResolutionStrategy,
  ConflictDetectionResult,
  GlobalResolutionStrategy,
} from '../conflictDetection';

// Mock the fetch function
global.fetch = jest.fn();

// Sample test data
const createTestSubject = (
  id: string,
  code: string,
  name: string,
  departmentId: string = 'dept1',
  semesterId: string = 'sem1'
): Subject => ({
  id,
  code,
  name,
  shortName: name.substring(0, 10),
  creditHours: 3,
  color: '#3b82f6',
  departmentId,
  semesterLevel: 1,
  isCore: true,
  semesterId,
  isMajor: true,
  teachingDepartmentIds: [departmentId],
});

describe('conflictDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchExistingSubjects', () => {
    it('should fetch existing subjects successfully', async () => {
      const mockSubjects = [
        createTestSubject('sub1', 'CS101', 'Computer Science 101'),
        createTestSubject('sub2', 'MATH101', 'Mathematics 101'),
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubjects,
      });

      const result = await fetchExistingSubjects();
      
      expect(fetch).toHaveBeenCalledWith('/api/subjects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockSubjects);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(fetchExistingSubjects()).rejects.toThrow(
        'Failed to fetch existing subjects: 500 Internal Server Error'
      );
    });

    it('should return empty array for non-array response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const result = await fetchExistingSubjects();
      expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchExistingSubjects()).rejects.toThrow(
        'Failed to fetch existing subjects: Network error'
      );
    });
  });

  describe('detectConflicts', () => {
    const existingSubjects: Subject[] = [
      createTestSubject('existing1', 'CS101', 'Existing CS'),
      createTestSubject('existing2', 'MATH101', 'Existing Math'),
    ];

    describe('intra-file duplicate detection', () => {
      it('should detect duplicate IDs within the import file', async () => {
        const subjectsToImport = [
          createTestSubject('dup1', 'CS201', 'Subject A'),
          createTestSubject('dup1', 'CS202', 'Subject B'), // Duplicate ID
          createTestSubject('unique1', 'CS203', 'Subject C'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].hasIdConflict).toBe(true);
        expect(result.conflictReports[0].intraFileIdConflicts).toContain(1);
        expect(result.conflictReports[1].hasIdConflict).toBe(true);
        expect(result.conflictReports[1].intraFileIdConflicts).toContain(0);
        expect(result.conflictReports[2].hasIdConflict).toBe(false);
        
        expect(result.summary.intraFileIdDuplicates).toBe(2); // 2 subjects with 1 duplicate ID
      });

      it('should detect duplicate codes within the import file', async () => {
        const subjectsToImport = [
          createTestSubject('sub1', 'DUPCODE', 'Subject A'),
          createTestSubject('sub2', 'DUPCODE', 'Subject B'), // Duplicate code
          createTestSubject('sub3', 'UNIQUE', 'Subject C'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].hasCodeConflict).toBe(true);
        expect(result.conflictReports[0].intraFileCodeConflicts).toContain(1);
        expect(result.conflictReports[1].hasCodeConflict).toBe(true);
        expect(result.conflictReports[1].intraFileCodeConflicts).toContain(0);
        expect(result.conflictReports[2].hasCodeConflict).toBe(false);
        
        expect(result.summary.intraFileCodeDuplicates).toBe(2); // 2 subjects with 1 duplicate code
      });

      it('should detect multiple duplicates correctly', async () => {
        const subjectsToImport = [
          createTestSubject('sub1', 'CODE1', 'Subject A'),
          createTestSubject('sub1', 'CODE1', 'Subject B'), // Same ID and code
          createTestSubject('sub1', 'CODE2', 'Subject C'), // Same ID, different code
          createTestSubject('sub2', 'CODE1', 'Subject D'), // Different ID, same code
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        // All subjects should have conflicts
        expect(result.conflictingRows).toBe(4);
        expect(result.conflictFreeRows).toBe(0);
        
        // Check specific conflict types
        expect(result.conflictReports[0].conflictType).toBe('both');
        expect(result.conflictReports[1].conflictType).toBe('both');
        expect(result.conflictReports[2].conflictType).toBe('duplicateId');
        expect(result.conflictReports[3].conflictType).toBe('duplicateCode');
      });
    });

    describe('existing data conflict detection', () => {
      it('should detect conflicts with existing subject IDs', async () => {
        const subjectsToImport = [
          createTestSubject('existing1', 'NEW101', 'New Subject'), // Conflicts with existing ID
          createTestSubject('new1', 'NEW102', 'Another New Subject'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].hasIdConflict).toBe(true);
        expect(result.conflictReports[0].existingSubjectsByIdConflict).toHaveLength(1);
        expect(result.conflictReports[0].existingSubjectsByIdConflict[0].id).toBe('existing1');
        
        expect(result.conflictReports[1].hasIdConflict).toBe(false);
        expect(result.summary.existingDataIdConflicts).toBe(1);
      });

      it('should detect conflicts with existing subject codes', async () => {
        const subjectsToImport = [
          createTestSubject('new1', 'CS101', 'New CS Course'), // Conflicts with existing code
          createTestSubject('new2', 'NEW102', 'Another New Subject'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].hasCodeConflict).toBe(true);
        expect(result.conflictReports[0].existingSubjectsByCodeConflict).toHaveLength(1);
        expect(result.conflictReports[0].existingSubjectsByCodeConflict[0].code).toBe('CS101');
        
        expect(result.conflictReports[1].hasCodeConflict).toBe(false);
        expect(result.summary.existingDataCodeConflicts).toBe(1);
      });

      it('should handle case-insensitive conflicts', async () => {
        const subjectsToImport = [
          createTestSubject('EXISTING1', 'cs101', 'Case Insensitive Test'), // Different case
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].hasIdConflict).toBe(true);
        expect(result.conflictReports[0].hasCodeConflict).toBe(true);
        expect(result.conflictReports[0].conflictType).toBe('both');
      });
    });

    describe('conflict type determination', () => {
      it('should correctly determine conflict types', async () => {
        const subjectsToImport = [
          createTestSubject('new1', 'NEW101', 'No Conflict'),
          createTestSubject('existing1', 'NEW102', 'ID Conflict Only'),
          createTestSubject('new2', 'CS101', 'Code Conflict Only'),
          createTestSubject('existing2', 'MATH101', 'Both Conflicts'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].conflictType).toBe('none');
        expect(result.conflictReports[1].conflictType).toBe('duplicateId');
        expect(result.conflictReports[2].conflictType).toBe('duplicateCode');
        expect(result.conflictReports[3].conflictType).toBe('both');
      });
    });

    describe('recommended resolution strategies', () => {
      it('should provide correct default resolution strategies', async () => {
        const subjectsToImport = [
          createTestSubject('new1', 'NEW101', 'No Conflict'),
          createTestSubject('existing1', 'NEW102', 'ID Conflict'),
          createTestSubject('new2', 'CS101', 'Code Conflict'),
          createTestSubject('existing2', 'MATH101', 'Both Conflicts'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.conflictReports[0].recommendedResolution).toBe('overwrite'); // no conflict
        expect(result.conflictReports[1].recommendedResolution).toBe('overwrite'); // ID conflict
        expect(result.conflictReports[2].recommendedResolution).toBe('skip'); // code conflict
        expect(result.conflictReports[3].recommendedResolution).toBe('userDecision'); // both conflicts
      });
    });

    describe('summary statistics', () => {
      it('should calculate correct summary statistics', async () => {
        const subjectsToImport = [
          createTestSubject('dup1', 'DUPCODE', 'Intra-file conflicts'),
          createTestSubject('dup1', 'DUPCODE', 'Intra-file conflicts'),
          createTestSubject('existing1', 'NEW102', 'Existing ID conflict'),
          createTestSubject('new2', 'CS101', 'Existing code conflict'),
          createTestSubject('new3', 'NEW103', 'No conflicts'),
        ];

        const result = await detectConflicts(subjectsToImport, existingSubjects);

        expect(result.totalRows).toBe(5);
        expect(result.conflictingRows).toBe(4);
        expect(result.conflictFreeRows).toBe(1);
        expect(result.summary.idConflicts).toBe(3); // 2 intra-file + 1 existing
        expect(result.summary.codeConflicts).toBe(3); // 2 intra-file + 1 existing
        expect(result.summary.bothConflicts).toBe(2); // intra-file duplicates have both
        expect(result.summary.existingDataIdConflicts).toBe(1);
        expect(result.summary.existingDataCodeConflicts).toBe(1);
      });
    });
  });

  describe('applyResolutionStrategy', () => {
    const createConflictReport = (
      rowIndex: number,
      subject: Subject,
      conflictType: ConflictType,
      hasIdConflict: boolean,
      hasCodeConflict: boolean,
      recommendedResolution: ResolutionStrategy
    ) => ({
      rowIndex,
      subject,
      conflictType,
      hasIdConflict,
      hasCodeConflict,
      existingSubjectsByIdConflict: [],
      existingSubjectsByCodeConflict: [],
      intraFileIdConflicts: [],
      intraFileCodeConflicts: [],
      recommendedResolution,
    });

    it('should apply default resolution strategies', () => {
      const subjects = [
        createTestSubject('sub1', 'CODE1', 'Subject 1'),
        createTestSubject('sub2', 'CODE2', 'Subject 2'),
        createTestSubject('sub3', 'CODE3', 'Subject 3'),
      ];

      const conflictReports = [
        createConflictReport(0, subjects[0], 'none', false, false, 'overwrite'),
        createConflictReport(1, subjects[1], 'duplicateId', true, false, 'overwrite'),
        createConflictReport(2, subjects[2], 'duplicateCode', false, true, 'skip'),
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false,
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toHaveLength(2);
      expect(result.toImport).toContain(subjects[0]);
      expect(result.toImport).toContain(subjects[1]);
      expect(result.toSkip).toHaveLength(1);
      expect(result.toSkip[0].subject).toBe(subjects[2]);
      expect(result.toOverwrite).toHaveLength(2);
    });

    it('should apply global strategy when applyToAll is true', () => {
      const subjects = [
        createTestSubject('sub1', 'CODE1', 'Subject 1'),
        createTestSubject('sub2', 'CODE2', 'Subject 2'),
      ];

      const conflictReports = [
        createConflictReport(0, subjects[0], 'duplicateId', true, false, 'overwrite'),
        createConflictReport(1, subjects[1], 'duplicateCode', false, true, 'skip'),
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'skip',
        duplicateCodeStrategy: 'overwrite',
        applyToAll: true,
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toHaveLength(1);
      expect(result.toImport).toContain(subjects[1]); // code conflict gets overwritten
      expect(result.toSkip).toHaveLength(1);
      expect(result.toSkip[0].subject).toBe(subjects[0]); // ID conflict gets skipped
    });

    it('should handle userDecision and rename strategies', () => {
      const subject = createTestSubject('sub1', 'CODE1', 'Subject 1');

      const conflictReports = [
        createConflictReport(0, subject, 'both', true, true, 'userDecision'),
        createConflictReport(1, subject, 'duplicateId', true, false, 'rename'),
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false,
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toHaveLength(0);
      expect(result.toSkip).toHaveLength(2); // Both treated as skip for now
    });
  });

  describe('formatConflictReport', () => {
    it('should format conflict-free report correctly', () => {
      const subject = createTestSubject('sub1', 'CS101', 'Computer Science');
      const report = {
        rowIndex: 0,
        subject,
        conflictType: 'none' as ConflictType,
        hasIdConflict: false,
        hasCodeConflict: false,
        existingSubjectsByIdConflict: [],
        existingSubjectsByCodeConflict: [],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [],
        recommendedResolution: 'overwrite' as ResolutionStrategy,
      };

      const formatted = formatConflictReport(report);
      
      expect(formatted).toContain('Row 1: Computer Science (CS101)');
      expect(formatted).toContain('✓ No conflicts detected');
    });

    it('should format ID conflicts correctly', () => {
      const subject = createTestSubject('sub1', 'CS101', 'Computer Science');
      const report = {
        rowIndex: 2,
        subject,
        conflictType: 'duplicateId' as ConflictType,
        hasIdConflict: true,
        hasCodeConflict: false,
        existingSubjectsByIdConflict: [
          { id: 'sub1', code: 'OLD101', name: 'Old Course', departmentId: 'dept1', semesterId: 'sem1' }
        ],
        existingSubjectsByCodeConflict: [],
        intraFileIdConflicts: [1, 4],
        intraFileCodeConflicts: [],
        recommendedResolution: 'overwrite' as ResolutionStrategy,
      };

      const formatted = formatConflictReport(report);
      
      expect(formatted).toContain('Row 3: Computer Science (CS101)');
      expect(formatted).toContain('⚠ Duplicate ID within file (rows: 2, 5)');
      expect(formatted).toContain('⚠ ID conflicts with existing: Old Course (OLD101)');
      expect(formatted).toContain('→ Recommended action: overwrite');
    });

    it('should format code conflicts correctly', () => {
      const subject = createTestSubject('sub1', 'CS101', 'Computer Science');
      const report = {
        rowIndex: 1,
        subject,
        conflictType: 'duplicateCode' as ConflictType,
        hasIdConflict: false,
        hasCodeConflict: true,
        existingSubjectsByIdConflict: [],
        existingSubjectsByCodeConflict: [
          { id: 'old1', code: 'CS101', name: 'Old CS Course', departmentId: 'dept1', semesterId: 'sem1' }
        ],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [3],
        recommendedResolution: 'skip' as ResolutionStrategy,
      };

      const formatted = formatConflictReport(report);
      
      expect(formatted).toContain('Row 2: Computer Science (CS101)');
      expect(formatted).toContain('⚠ Duplicate code within file (rows: 4)');
      expect(formatted).toContain('⚠ Code conflicts with existing: Old CS Course (CS101)');
      expect(formatted).toContain('→ Recommended action: skip');
    });

    it('should format both conflicts correctly', () => {
      const subject = createTestSubject('sub1', 'CS101', 'Computer Science');
      const report = {
        rowIndex: 0,
        subject,
        conflictType: 'both' as ConflictType,
        hasIdConflict: true,
        hasCodeConflict: true,
        existingSubjectsByIdConflict: [
          { id: 'sub1', code: 'OLD101', name: 'Old ID Match', departmentId: 'dept1', semesterId: 'sem1' }
        ],
        existingSubjectsByCodeConflict: [
          { id: 'old1', code: 'CS101', name: 'Old Code Match', departmentId: 'dept1', semesterId: 'sem1' }
        ],
        intraFileIdConflicts: [2],
        intraFileCodeConflicts: [3],
        recommendedResolution: 'userDecision' as ResolutionStrategy,
      };

      const formatted = formatConflictReport(report);
      
      expect(formatted).toContain('Row 1: Computer Science (CS101)');
      expect(formatted).toContain('⚠ Duplicate ID within file (rows: 3)');
      expect(formatted).toContain('⚠ ID conflicts with existing: Old ID Match (OLD101)');
      expect(formatted).toContain('⚠ Duplicate code within file (rows: 4)');
      expect(formatted).toContain('⚠ Code conflicts with existing: Old Code Match (CS101)');
      expect(formatted).toContain('→ Recommended action: userDecision');
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays', async () => {
      const result = await detectConflicts([], []);
      
      expect(result.totalRows).toBe(0);
      expect(result.conflictingRows).toBe(0);
      expect(result.conflictFreeRows).toBe(0);
      expect(result.conflictReports).toHaveLength(0);
    });

    it('should handle whitespace and case variations', async () => {
      const existingSubjects = [
        createTestSubject('  existing1  ', '  CS101  ', 'Existing Course'),
      ];

      const subjectsToImport = [
        createTestSubject('EXISTING1', 'cs101', 'New Course'), // Different case and whitespace
      ];

      const result = await detectConflicts(subjectsToImport, existingSubjects);
      
      expect(result.conflictReports[0].conflictType).toBe('both');
      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
    });

    it('should handle subjects with identical data', async () => {
      const subject1 = createTestSubject('sub1', 'CS101', 'Computer Science');
      const subject2 = createTestSubject('sub1', 'CS101', 'Computer Science');

      const result = await detectConflicts([subject1, subject2], []);
      
      expect(result.conflictReports[0].conflictType).toBe('both');
      expect(result.conflictReports[1].conflictType).toBe('both');
      expect(result.summary.intraFileIdDuplicates).toBe(2);
      expect(result.summary.intraFileCodeDuplicates).toBe(2);
    });
  });
});
