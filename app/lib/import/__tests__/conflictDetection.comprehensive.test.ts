import { Subject } from '../../../types/subject';
import {
  detectConflicts,
  fetchExistingSubjects,
  applyResolutionStrategy,
  formatConflictReport,
  ConflictType,
  ResolutionStrategy,
  ConflictDetectionResult,
  ConflictReport,
  GlobalResolutionStrategy
} from '../conflictDetection';

// Mock fetch to prevent real API calls
global.fetch = jest.fn();

// Mock API responses
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Conflict Detection - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('fetchExistingSubjects', () => {
    it('should fetch existing subjects successfully', async () => {
      const mockSubjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub2', 'PHYS201', 'Physics 201')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubjects
      } as Response);

      const result = await fetchExistingSubjects();
      
      expect(result).toEqual(mockSubjects);
      expect(mockFetch).toHaveBeenCalledWith('/api/subjects', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(fetchExistingSubjects()).rejects.toThrow('Failed to fetch existing subjects: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchExistingSubjects()).rejects.toThrow('Failed to fetch existing subjects: Network error');
    });

    it('should handle non-array responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Invalid response' })
      } as Response);

      const result = await fetchExistingSubjects();
      expect(result).toEqual([]); // Should return empty array for non-array responses
    });
  });

  describe('ID Conflict Detection', () => {
    it('should detect intra-file ID duplicates', async () => {
      const subjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub1', 'PHYS201', 'Physics 201'), // Duplicate ID
        createSubject('sub2', 'CHEM301', 'Chemistry 301')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.summary.intraFileIdDuplicates).toBe(1); // One duplicate pair
      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[1].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].intraFileIdConflicts).toContain(1);
      expect(result.conflictReports[1].intraFileIdConflicts).toContain(0);
    });

    it('should detect conflicts with existing subjects by ID', async () => {
      const existingSubjects = [
        createSubject('sub1', 'EXISTING101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('sub1', 'NEW101', 'New Subject'), // ID conflicts with existing
        createSubject('sub2', 'NEW201', 'Another New Subject')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.summary.existingDataIdConflicts).toBe(1);
      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].existingSubjectsByIdConflict).toHaveLength(1);
      expect(result.conflictReports[0].existingSubjectsByIdConflict[0].name).toBe('Existing Subject');
      expect(result.conflictReports[1].hasIdConflict).toBe(false);
    });

    it('should handle case-insensitive ID matching', async () => {
      const existingSubjects = [
        createSubject('SUB1', 'EXISTING101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('sub1', 'NEW101', 'New Subject') // Different case but same ID
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].existingSubjectsByIdConflict).toHaveLength(1);
    });

    it('should handle ID trimming', async () => {
      const subjects = [
        createSubject('  sub1  ', 'MATH101', 'Math 101'),
        createSubject('sub1', 'PHYS201', 'Physics 201') // Should conflict after trimming
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[1].hasIdConflict).toBe(true);
    });
  });

  describe('Code Conflict Detection', () => {
    it('should detect intra-file code duplicates', async () => {
      const subjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub2', 'MATH101', 'Advanced Math'), // Duplicate code
        createSubject('sub3', 'PHYS201', 'Physics 201')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.summary.intraFileCodeDuplicates).toBe(1);
      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
      expect(result.conflictReports[1].hasCodeConflict).toBe(true);
      expect(result.conflictReports[0].intraFileCodeConflicts).toContain(1);
      expect(result.conflictReports[1].intraFileCodeConflicts).toContain(0);
    });

    it('should detect conflicts with existing subjects by code', async () => {
      const existingSubjects = [
        createSubject('existing1', 'MATH101', 'Existing Math')
      ];

      const newSubjects = [
        createSubject('sub1', 'MATH101', 'New Math'), // Code conflicts with existing
        createSubject('sub2', 'PHYS201', 'New Physics')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.summary.existingDataCodeConflicts).toBe(1);
      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
      expect(result.conflictReports[0].existingSubjectsByCodeConflict).toHaveLength(1);
      expect(result.conflictReports[0].existingSubjectsByCodeConflict[0].name).toBe('Existing Math');
      expect(result.conflictReports[1].hasCodeConflict).toBe(false);
    });

    it('should handle case-insensitive code matching', async () => {
      const existingSubjects = [
        createSubject('existing1', 'MATH101', 'Existing Math')
      ];

      const newSubjects = [
        createSubject('sub1', 'math101', 'New Math') // Different case but same code
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
    });

    it('should handle code trimming', async () => {
      const subjects = [
        createSubject('sub1', '  MATH101  ', 'Math 101'),
        createSubject('sub2', 'MATH101', 'Advanced Math') // Should conflict after trimming
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
      expect(result.conflictReports[1].hasCodeConflict).toBe(true);
    });
  });

  describe('Conflict Type Determination', () => {
    it('should determine conflict type as "none" for no conflicts', async () => {
      const subjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub2', 'PHYS201', 'Physics 201')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.conflictReports[0].conflictType).toBe('none');
      expect(result.conflictReports[1].conflictType).toBe('none');
    });

    it('should determine conflict type as "duplicateId" for ID-only conflicts', async () => {
      const existingSubjects = [
        createSubject('sub1', 'EXISTING101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('sub1', 'NEW101', 'New Subject') // ID conflict only
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].conflictType).toBe('duplicateId');
    });

    it('should determine conflict type as "duplicateCode" for code-only conflicts', async () => {
      const existingSubjects = [
        createSubject('existing1', 'MATH101', 'Existing Math')
      ];

      const newSubjects = [
        createSubject('sub1', 'MATH101', 'New Math') // Code conflict only
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].conflictType).toBe('duplicateCode');
    });

    it('should determine conflict type as "both" for ID and code conflicts', async () => {
      const existingSubjects = [
        createSubject('sub1', 'MATH101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('sub1', 'MATH101', 'New Subject') // Both ID and code conflict
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].conflictType).toBe('both');
      expect(result.summary.bothConflicts).toBe(1);
    });
  });

  describe('Recommended Resolution Strategy', () => {
    it('should recommend "overwrite" for ID conflicts', async () => {
      const existingSubjects = [
        createSubject('sub1', 'EXISTING101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('sub1', 'NEW101', 'New Subject')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].recommendedResolution).toBe('overwrite');
    });

    it('should recommend "skip" for code conflicts', async () => {
      const existingSubjects = [
        createSubject('existing1', 'MATH101', 'Existing Math')
      ];

      const newSubjects = [
        createSubject('sub1', 'MATH101', 'New Math')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].recommendedResolution).toBe('skip');
    });

    it('should recommend "userDecision" for both ID and code conflicts', async () => {
      const existingSubjects = [
        createSubject('sub1', 'MATH101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('sub1', 'MATH101', 'New Subject')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.conflictReports[0].recommendedResolution).toBe('userDecision');
    });
  });

  describe('Resolution Strategy Application', () => {
    const createConflictReport = (
      subject: Subject, 
      conflictType: ConflictType, 
      hasId: boolean, 
      hasCode: boolean,
      recommendedResolution: ResolutionStrategy
    ): ConflictReport => ({
      rowIndex: 0,
      conflictType,
      hasIdConflict: hasId,
      hasCodeConflict: hasCode,
      existingSubjectsByIdConflict: [],
      existingSubjectsByCodeConflict: [],
      intraFileIdConflicts: [],
      intraFileCodeConflicts: [],
      recommendedResolution,
      subject
    });

    it('should apply "overwrite" strategy', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math');
      const conflictReports = [
        createConflictReport(subject, 'duplicateId', true, false, 'overwrite')
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).toContain(subject);
      expect(result.toOverwrite).toHaveLength(1);
      expect(result.toSkip).toHaveLength(0);
    });

    it('should apply "skip" strategy', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math');
      const conflictReports = [
        createConflictReport(subject, 'duplicateCode', false, true, 'skip')
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).not.toContain(subject);
      expect(result.toSkip).toHaveLength(1);
      expect(result.toOverwrite).toHaveLength(0);
    });

    it('should apply global strategy when enabled', () => {
      const subject1 = createSubject('sub1', 'MATH101', 'Math');
      const subject2 = createSubject('sub2', 'PHYS201', 'Physics');
      
      const conflictReports = [
        createConflictReport(subject1, 'duplicateId', true, false, 'skip'), // Would normally skip
        createConflictReport(subject2, 'duplicateCode', false, true, 'overwrite') // Would normally overwrite
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true // Global strategy enabled
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      // Should apply global strategy instead of recommended
      expect(result.toImport).toContain(subject1); // ID conflict -> overwrite (global)
      expect(result.toImport).not.toContain(subject2); // Code conflict -> skip (global)
      expect(result.toSkip).toHaveLength(1);
      expect(result.toOverwrite).toHaveLength(1);
    });

    it('should handle "userDecision" and "rename" as skip for now', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math');
      const conflictReports = [
        createConflictReport(subject, 'both', true, true, 'userDecision')
      ];

      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: false
      };

      const result = applyResolutionStrategy(conflictReports, globalStrategy);

      expect(result.toImport).not.toContain(subject);
      expect(result.toSkip).toHaveLength(1);
      expect(result.toOverwrite).toHaveLength(0);
    });
  });

  describe('Conflict Summary Statistics', () => {
    it('should calculate accurate summary statistics', async () => {
      const existingSubjects = [
        createSubject('existing1', 'EXISTING101', 'Existing 1'),
        createSubject('existing2', 'EXISTING201', 'Existing 2')
      ];

      const newSubjects = [
        createSubject('sub1', 'MATH101', 'Math 101'), // No conflicts
        createSubject('existing1', 'NEW101', 'New Subject'), // ID conflict
        createSubject('sub3', 'EXISTING201', 'Another Subject'), // Code conflict
        createSubject('existing2', 'EXISTING201', 'Both Conflicts'), // Both conflicts
        createSubject('sub5', 'DUPLICATE', 'First'),
        createSubject('sub6', 'DUPLICATE', 'Second') // Intra-file code duplicate
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.totalRows).toBe(6);
      expect(result.conflictFreeRows).toBe(1); // Only sub1 has no conflicts
      expect(result.conflictingRows).toBe(5);
      expect(result.summary.idConflicts).toBe(2); // existing1 and existing2
      expect(result.summary.codeConflicts).toBe(4); // existing2, both conflicts, and duplicate pair
      expect(result.summary.bothConflicts).toBe(1); // existing2 with EXISTING201
      expect(result.summary.existingDataIdConflicts).toBe(2);
      expect(result.summary.existingDataCodeConflicts).toBe(2);
      expect(result.summary.intraFileCodeDuplicates).toBe(1); // One duplicate pair
    });
  });

  describe('Complex Conflict Scenarios', () => {
    it('should handle multiple conflicts in one subject', async () => {
      const existingSubjects = [
        createSubject('existing1', 'MATH101', 'Existing Math'),
        createSubject('existing2', 'PHYS201', 'Existing Physics')
      ];

      const newSubjects = [
        createSubject('existing1', 'PHYS201', 'New Subject') // Conflicts with both existing subjects
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      const report = result.conflictReports[0];
      expect(report.hasIdConflict).toBe(true);
      expect(report.hasCodeConflict).toBe(true);
      expect(report.conflictType).toBe('both');
      expect(report.existingSubjectsByIdConflict).toHaveLength(1);
      expect(report.existingSubjectsByCodeConflict).toHaveLength(1);
    });

    it('should handle circular conflicts between multiple subjects', async () => {
      const subjects = [
        createSubject('sub1', 'CODE_A', 'Subject 1'),
        createSubject('sub2', 'CODE_B', 'Subject 2'),
        createSubject('sub1', 'CODE_C', 'Subject 3'), // ID conflicts with first
        createSubject('sub4', 'CODE_A', 'Subject 4')  // Code conflicts with first
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      // Check that conflicts are detected correctly
      expect(result.conflictReports[0].hasIdConflict).toBe(true); // sub1 duplicate
      expect(result.conflictReports[0].hasCodeConflict).toBe(true); // CODE_A duplicate
      expect(result.conflictReports[2].hasIdConflict).toBe(true); // sub1 duplicate
      expect(result.conflictReports[3].hasCodeConflict).toBe(true); // CODE_A duplicate
    });
  });

  describe('formatConflictReport', () => {
    it('should format conflict-free report', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math 101');
      const report: ConflictReport = {
        rowIndex: 0,
        conflictType: 'none',
        hasIdConflict: false,
        hasCodeConflict: false,
        existingSubjectsByIdConflict: [],
        existingSubjectsByCodeConflict: [],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [],
        recommendedResolution: 'overwrite',
        subject
      };

      const formatted = formatConflictReport(report);

      expect(formatted).toContain('Row 1: Math 101 (MATH101)');
      expect(formatted).toContain('✓ No conflicts detected');
    });

    it('should format ID conflict report', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math 101');
      const existingRef = {
        id: 'sub1',
        code: 'EXISTING101',
        name: 'Existing Subject',
        departmentId: 'dept1',
        semesterId: 'sem1'
      };

      const report: ConflictReport = {
        rowIndex: 1,
        conflictType: 'duplicateId',
        hasIdConflict: true,
        hasCodeConflict: false,
        existingSubjectsByIdConflict: [existingRef],
        existingSubjectsByCodeConflict: [],
        intraFileIdConflicts: [3], // Conflicts with row 4
        intraFileCodeConflicts: [],
        recommendedResolution: 'overwrite',
        subject
      };

      const formatted = formatConflictReport(report);

      expect(formatted).toContain('Row 2: Math 101 (MATH101)');
      expect(formatted).toContain('⚠ Duplicate ID within file (rows: 4)');
      expect(formatted).toContain('⚠ ID conflicts with existing: Existing Subject (EXISTING101)');
      expect(formatted).toContain('→ Recommended action: overwrite');
    });

    it('should format code conflict report', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math 101');
      const existingRef = {
        id: 'existing1',
        code: 'MATH101',
        name: 'Existing Math',
        departmentId: 'dept1',
        semesterId: 'sem1'
      };

      const report: ConflictReport = {
        rowIndex: 2,
        conflictType: 'duplicateCode',
        hasIdConflict: false,
        hasCodeConflict: true,
        existingSubjectsByIdConflict: [],
        existingSubjectsByCodeConflict: [existingRef],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [5], // Conflicts with row 6
        recommendedResolution: 'skip',
        subject
      };

      const formatted = formatConflictReport(report);

      expect(formatted).toContain('Row 3: Math 101 (MATH101)');
      expect(formatted).toContain('⚠ Duplicate code within file (rows: 6)');
      expect(formatted).toContain('⚠ Code conflicts with existing: Existing Math (MATH101)');
      expect(formatted).toContain('→ Recommended action: skip');
    });

    it('should format both conflicts report', () => {
      const subject = createSubject('sub1', 'MATH101', 'Math 101');
      
      const report: ConflictReport = {
        rowIndex: 0,
        conflictType: 'both',
        hasIdConflict: true,
        hasCodeConflict: true,
        existingSubjectsByIdConflict: [{
          id: 'sub1',
          code: 'OLD101',
          name: 'Old Subject',
          departmentId: 'dept1',
          semesterId: 'sem1'
        }],
        existingSubjectsByCodeConflict: [{
          id: 'old1',
          code: 'MATH101',
          name: 'Old Math',
          departmentId: 'dept1',
          semesterId: 'sem1'
        }],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [],
        recommendedResolution: 'userDecision',
        subject
      };

      const formatted = formatConflictReport(report);

      expect(formatted).toContain('⚠ ID conflicts with existing: Old Subject (OLD101)');
      expect(formatted).toContain('⚠ Code conflicts with existing: Old Math (MATH101)');
      expect(formatted).toContain('→ Recommended action: userDecision');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty subject arrays', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts([]);

      expect(result.totalRows).toBe(0);
      expect(result.conflictingRows).toBe(0);
      expect(result.conflictFreeRows).toBe(0);
      expect(result.conflictReports).toHaveLength(0);
    });

    it('should handle subjects with empty/null IDs and codes', async () => {
      const subjects = [
        createSubject('', 'MATH101', 'Math with empty ID'),
        createSubject('sub1', '', 'Subject with empty code')
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      // Should handle gracefully without crashing
      expect(result.conflictReports).toHaveLength(2);
    });

    it('should pass existing subjects directly when provided', async () => {
      const existingSubjects = [
        createSubject('existing1', 'EXISTING101', 'Existing Subject')
      ];

      const newSubjects = [
        createSubject('existing1', 'NEW101', 'New Subject')
      ];

      // Should not call fetch when existing subjects are provided
      const result = await detectConflicts(newSubjects, existingSubjects);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.conflictReports[0].hasIdConflict).toBe(true);
    });

    it('should handle subjects with identical content but different objects', async () => {
      const subjects = [
        createSubject('sub1', 'MATH101', 'Math 101'),
        createSubject('sub1', 'MATH101', 'Math 101') // Identical content
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
      expect(result.conflictReports[0].conflictType).toBe('both');
    });
  });
});
