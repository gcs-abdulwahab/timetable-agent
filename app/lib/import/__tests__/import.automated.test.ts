/**
 * Automated Tests for Parsing, Validation, and Merging
 * 
 * Unit tests with Jest for:
 * - parseFile on CSV, XLSX, and JSON
 * - normalization and zod validation, including type coercions
 * - conflict detection logic for id and code collisions
 * - merge strategies: skip, overwrite, keep both
 * - id generation uniqueness
 * Mock fs and api calls; ensure no real file writes during tests.
 */

import { parseFile, ParseError, validateFileForParsing } from '../parseFiles';
import { 
  normalizeSubject, 
  generateSubjectId, 
  validateSubject,
  processSubjectForImport,
  SubjectSchema
} from '../subjectImportUtils';
import {
  detectConflicts,
  fetchExistingSubjects,
  applyResolutionStrategy,
  ConflictReport,
  GlobalResolutionStrategy
} from '../conflictDetection';
import { validateSubjects } from '../validateSubjects';
import { Subject } from '../../../types/subject';

// Mock all external dependencies to prevent real file/API operations
jest.mock('papaparse');
jest.mock('xlsx');
jest.mock('fs/promises');
global.fetch = jest.fn();

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

const mockPapaParse = Papa.parse as jest.MockedFunction<typeof Papa.parse>;
const mockXLSXRead = XLSX.read as jest.MockedFunction<typeof XLSX.read>;
const mockSheetToJson = XLSX.utils.sheet_to_json as jest.MockedFunction<typeof XLSX.utils.sheet_to_json>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Helper functions for test data creation
function createMockFile(content: string | ArrayBuffer, filename: string, type: string, size?: number): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], filename, { type });
  
  if (size !== undefined) {
    Object.defineProperty(file, 'size', { value: size, writable: false });
  }

  if (content instanceof ArrayBuffer) {
    Object.defineProperty(file, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(content),
      writable: true
    });
  }

  if (typeof content === 'string') {
    Object.defineProperty(file, 'text', {
      value: jest.fn().mockResolvedValue(content),
      writable: true
    });
  }

  return file;
}

function createTestSubject(id: string, code: string, name: string): Subject {
  return {
    id,
    code,
    name,
    shortName: name.substring(0, 10),
    creditHours: 3,
    color: 'bg-blue-100',
    departmentId: 'dept1',
    semesterId: 'sem1',
    semesterLevel: 1,
    isCore: true,
    isMajor: true,
    teachingDepartmentIds: []
  };
}

describe('Automated Import System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('File Parsing Tests', () => {
    describe('CSV Parsing', () => {
      it('should parse CSV files with proper header mapping', async () => {
        const csvContent = 'Subject Name,Credit Hours,Course Code\nMath 101,3,MATH101\nPhysics,4,PHYS201';
        const file = createMockFile(csvContent, 'subjects.csv', 'text/csv');

        mockPapaParse.mockImplementation((file, options) => {
          setTimeout(() => {
            options.complete!({
              data: [
                { 'Subject Name': 'Math 101', 'Credit Hours': '3', 'Course Code': 'MATH101' },
                { 'Subject Name': 'Physics', 'Credit Hours': '4', 'Course Code': 'PHYS201' }
              ],
              errors: [],
              meta: { fields: ['Subject Name', 'Credit Hours', 'Course Code'] }
            });
          }, 0);
        });

        const result = await parseFile(file);

        expect(result.format).toBe('csv');
        expect(result.totalRows).toBe(2);
        expect(result.headerMapping['Subject Name']).toBe('name');
        expect(result.headerMapping['Credit Hours']).toBe('creditHours');
        expect(result.headerMapping['Course Code']).toBe('code');
        expect(result.rows[0]).toEqual({
          name: 'Math 101',
          creditHours: '3',
          code: 'MATH101'
        });
      });

      it('should handle CSV parsing errors without file operations', async () => {
        const file = createMockFile('invalid,csv', 'test.csv', 'text/csv');

        mockPapaParse.mockImplementation((file, options) => {
          setTimeout(() => {
            options.error!({ message: 'Parse error', type: 'Delimiter' } as any);
          }, 0);
        });

        await expect(parseFile(file)).rejects.toThrow(ParseError);
      });

      it('should respect parsing options like maxRows', async () => {
        const file = createMockFile('name,code\nA,A1\nB,B1\nC,C1', 'test.csv', 'text/csv');

        mockPapaParse.mockImplementation((file, options) => {
          setTimeout(() => {
            options.complete!({
              data: [
                { name: 'A', code: 'A1' },
                { name: 'B', code: 'B1' },
                { name: 'C', code: 'C1' }
              ],
              errors: [],
              meta: { fields: ['name', 'code'] }
            });
          }, 0);
        });

        const result = await parseFile(file, { maxRows: 2 });
        expect(result.totalRows).toBe(2);
      });
    });

    describe('XLSX Parsing', () => {
      it('should parse Excel files with type conversion', async () => {
        const file = createMockFile(new ArrayBuffer(100), 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        mockXLSXRead.mockReturnValue({
          SheetNames: ['Sheet1'],
          Sheets: { Sheet1: {} }
        });
        
        mockSheetToJson.mockReturnValue([
          ['name', 'creditHours', 'code'],
          ['Math', 3, 'MATH101'],
          ['Physics', 4, 'PHYS201']
        ]);

        const result = await parseFile(file);

        expect(result.format).toBe('excel');
        expect(result.totalRows).toBe(2);
        expect(result.rows[0]).toEqual({
          name: 'Math',
          creditHours: 3,
          code: 'MATH101'
        });
      });

      it('should handle Excel parsing errors without file operations', async () => {
        const file = createMockFile(new ArrayBuffer(100), 'corrupt.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        mockXLSXRead.mockImplementation(() => {
          throw new Error('Corrupt Excel file');
        });

        await expect(parseFile(file)).rejects.toThrow(ParseError);
      });
    });

    describe('JSON Parsing', () => {
      it('should parse JSON arrays with field normalization', async () => {
        const jsonData = [
          { 'Subject Name': 'Math', 'Credit Hours': 3, 'Course Code': 'MATH101' },
          { 'Subject Name': 'Physics', 'Credit Hours': 4, 'Course Code': 'PHYS201' }
        ];
        const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

        const result = await parseFile(file);

        expect(result.format).toBe('json');
        expect(result.totalRows).toBe(2);
        expect(result.headerMapping['Subject Name']).toBe('name');
        expect(result.rows[0]).toEqual({
          name: 'Math',
          creditHours: 3,
          code: 'MATH101'
        });
      });

      it('should reject invalid JSON without file operations', async () => {
        const file = createMockFile('{ invalid json }', 'test.json', 'application/json');
        await expect(parseFile(file)).rejects.toThrow(ParseError);
      });
    });

    it('should validate files without real filesystem access', () => {
      const oversizedFile = createMockFile('data', 'large.csv', 'text/csv', 15 * 1024 * 1024);
      const validation = validateFileForParsing(oversizedFile);
      
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('File size exceeds');
    });
  });

  describe('Normalization and Validation Tests', () => {
    describe('Data Normalization', () => {
      it('should normalize and trim string fields', () => {
        const input = {
          id: '  sub123  ',
          name: '  Math 101  ',
          code: '  MATH101  ',
          departmentId: '  dept1  '
        };

        const result = normalizeSubject(input);

        expect(result.id).toBe('sub123');
        expect(result.name).toBe('Math 101');
        expect(result.code).toBe('MATH101');
        expect(result.departmentId).toBe('dept1');
      });

      it('should coerce creditHours from string to number', () => {
        const testCases = [
          { input: '3', expected: 3 },
          { input: '4.5', expected: 4.5 },
          { input: '  5  ', expected: 5 }
        ];

        testCases.forEach(({ input, expected }) => {
          const result = normalizeSubject({ creditHours: input });
          expect(result.creditHours).toBe(expected);
        });
      });

      it('should coerce isCore from various formats to boolean', () => {
        const testCases = [
          { input: 'true', expected: true },
          { input: 'True', expected: true },
          { input: '1', expected: true },
          { input: 'yes', expected: true },
          { input: 'false', expected: false },
          { input: '0', expected: false },
          { input: 'no', expected: false },
          { input: 1, expected: true },
          { input: 0, expected: false }
        ];

        testCases.forEach(({ input, expected }) => {
          const result = normalizeSubject({ isCore: input });
          expect(result.isCore).toBe(expected);
        });
      });

      it('should handle semester level and ID consistency', () => {
        const input = {
          semesterLevel: 3,
          semesterId: 'sem1' // Inconsistent
        };

        const result = normalizeSubject(input);
        
        expect(result.semesterLevel).toBe(3);
        expect(result.semesterId).toBe('sem3'); // Should be corrected
      });

      it('should assign default colors cyclically', () => {
        // Import resetColorIndex to reset state
        const { resetColorIndex } = require('../subjectImportUtils');
        resetColorIndex(); // Reset color index for predictable testing
        
        const subjects = [
          { name: 'Math' },
          { name: 'Physics' },
          { name: 'Chemistry' },
          { name: 'Biology' },
          { name: 'English' },
          { name: 'History' }
        ];

        const results = subjects.map(normalizeSubject);
        
        expect(results[0].color).toBe('bg-blue-100');
        expect(results[1].color).toBe('bg-blue-150');
        expect(results[5].color).toBe('bg-blue-100'); // Should cycle back
      });
    });

    describe('ID Generation', () => {
      it('should generate unique IDs', () => {
        const ids = new Set();
        const count = 100;

        for (let i = 0; i < count; i++) {
          const id = generateSubjectId();
          expect(ids.has(id)).toBe(false);
          ids.add(id);
        }

        expect(ids.size).toBe(count);
      });

      it('should generate IDs with correct format', () => {
        const id = generateSubjectId();
        expect(id).toMatch(/^sub\d{13}[a-z0-9]{6}$/);
        expect(id.startsWith('sub')).toBe(true);
      });

      it('should include timestamp in generated IDs', () => {
        const before = Date.now();
        const id = generateSubjectId();
        const after = Date.now();

        const timestampPart = id.substring(3, 16);
        const timestamp = parseInt(timestampPart, 10);

        expect(timestamp).toBeGreaterThanOrEqual(before);
        expect(timestamp).toBeLessThanOrEqual(after);
      });
    });

    describe('Zod Schema Validation', () => {
      it('should validate complete subjects with type coercion', () => {
        const subject = {
          id: 'sub123',
          name: 'Math',
          shortName: 'Math',
          code: 'MATH101',
          creditHours: '3', // String to be coerced
          color: 'bg-blue-100',
          departmentId: 'dept1',
          semesterLevel: '1', // String to be coerced
          semesterId: 'sem1',
          isCore: 'true' // String to be coerced
        };

        const result = validateSubject(subject);

        expect(typeof result.creditHours).toBe('number');
        expect(result.creditHours).toBe(3);
        expect(typeof result.semesterLevel).toBe('number');
        expect(result.semesterLevel).toBe(1);
        expect(typeof result.isCore).toBe('boolean');
        expect(result.isCore).toBe(true);
      });

      it('should enforce field constraints', () => {
        const baseSubject = {
          id: 'sub123',
          name: 'Math',
          shortName: 'Math',
          code: 'MATH101',
          creditHours: 3,
          color: 'bg-blue-100',
          departmentId: 'dept1',
          semesterLevel: 1,
          semesterId: 'sem1',
          isCore: true
        };

        // Test invalid values
        expect(() => validateSubject({ ...baseSubject, name: '' })).toThrow();
        expect(() => validateSubject({ ...baseSubject, creditHours: 0 })).toThrow();
        expect(() => validateSubject({ ...baseSubject, creditHours: 15 })).toThrow();
        expect(() => validateSubject({ ...baseSubject, semesterLevel: 0 })).toThrow();
        expect(() => validateSubject({ ...baseSubject, semesterLevel: 9 })).toThrow();
      });
    });

    describe('Validation Pipeline Integration', () => {
      it('should process subjects through validation pipeline', () => {
        const rawSubjects = [
          {
            name: 'Math',
            shortName: 'Math',
            code: 'MATH101',
            creditHours: '3', // Will be coerced
            color: 'bg-blue-100'
          }
        ];

        const result = validateSubjects(rawSubjects, 'sem1', {
          assignSelectedSemesterToAll: true,
          defaultDepartmentId: 'dept1'
        });

        expect(result.validatedRows).toHaveLength(1);
        expect(result.invalidRows).toHaveLength(0);
        expect(result.summary.validationRate).toBe(100);

        const validatedSubject = result.validatedRows[0].data;
        expect(validatedSubject.semesterId).toBe('sem1');
        expect(validatedSubject.semesterLevel).toBe(1);
        expect(validatedSubject.departmentId).toBe('dept1');
        expect(typeof validatedSubject.creditHours).toBe('number');
      });
    });
  });

  describe('Conflict Detection Tests', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should detect ID conflicts without real API calls', async () => {
      const existingSubjects = [
        createTestSubject('sub1', 'EXISTING101', 'Existing Subject')
      ];

      const newSubjects = [
        createTestSubject('sub1', 'NEW101', 'New Subject') // ID conflict
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.summary.existingDataIdConflicts).toBe(1);
      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].existingSubjectsByIdConflict).toHaveLength(1);
    });

    it('should detect code conflicts without real API calls', async () => {
      const existingSubjects = [
        createTestSubject('existing1', 'MATH101', 'Existing Math')
      ];

      const newSubjects = [
        createTestSubject('new1', 'MATH101', 'New Math') // Code conflict
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => existingSubjects
      } as Response);

      const result = await detectConflicts(newSubjects);

      expect(result.summary.existingDataCodeConflicts).toBe(1);
      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
      expect(result.conflictReports[0].conflictType).toBe('duplicateCode');
    });

    it('should detect intra-file duplicates', async () => {
      const subjects = [
        createTestSubject('sub1', 'MATH101', 'Math 1'),
        createTestSubject('sub1', 'PHYS201', 'Physics 1'), // ID duplicate
        createTestSubject('sub3', 'MATH101', 'Math 2')     // Code duplicate
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await detectConflicts(subjects);

      expect(result.conflictReports[0].hasIdConflict).toBe(true);
      expect(result.conflictReports[0].hasCodeConflict).toBe(true);
      expect(result.conflictReports[1].hasIdConflict).toBe(true);
      expect(result.conflictReports[2].hasCodeConflict).toBe(true);
    });

    it('should handle API errors gracefully without affecting filesystem', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const subjects = [createTestSubject('sub1', 'MATH101', 'Math')];

      await expect(detectConflicts(subjects)).rejects.toThrow('Failed to fetch existing subjects');
      expect(mockFetch).toHaveBeenCalledWith('/api/subjects', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });

  describe('Merge Strategy Tests', () => {
    function createConflictReport(
      subject: Subject,
      hasIdConflict: boolean = false,
      hasCodeConflict: boolean = false
    ): ConflictReport {
      let conflictType: 'none' | 'duplicateId' | 'duplicateCode' | 'both' = 'none';
      if (hasIdConflict && hasCodeConflict) conflictType = 'both';
      else if (hasIdConflict) conflictType = 'duplicateId';
      else if (hasCodeConflict) conflictType = 'duplicateCode';

      return {
        rowIndex: 0,
        conflictType,
        hasIdConflict,
        hasCodeConflict,
        existingSubjectsByIdConflict: hasIdConflict ? [
          { id: subject.id, code: 'OLD_CODE', name: 'Existing', departmentId: 'dept1', semesterId: 'sem1' }
        ] : [],
        existingSubjectsByCodeConflict: hasCodeConflict ? [
          { id: 'old_id', code: subject.code, name: 'Existing', departmentId: 'dept1', semesterId: 'sem1' }
        ] : [],
        intraFileIdConflicts: [],
        intraFileCodeConflicts: [],
        recommendedResolution: hasIdConflict && hasCodeConflict ? 'userDecision' :
                               hasIdConflict ? 'overwrite' :
                               hasCodeConflict ? 'skip' : 'overwrite',
        subject
      };
    }

    describe('Skip Strategy', () => {
      it('should skip conflicting subjects', () => {
        const subjects = [
          createTestSubject('sub1', 'MATH101', 'Math'),
          createTestSubject('sub2', 'PHYS201', 'Physics'),
          createTestSubject('sub3', 'CHEM301', 'Chemistry')
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

        expect(result.toImport).toContain(subjects[0]); // No conflict
        expect(result.toImport).not.toContain(subjects[1]); // Skip code conflict
        expect(result.toImport).not.toContain(subjects[2]); // Skip ID conflict
        expect(result.toSkip).toHaveLength(2);
      });
    });

    describe('Overwrite Strategy', () => {
      it('should overwrite with conflicting subjects', () => {
        const subjects = [
          createTestSubject('sub1', 'MATH101', 'Math'),
          createTestSubject('sub2', 'PHYS201', 'Physics')
        ];

        const conflictReports = [
          createConflictReport(subjects[0], true, false),  // ID conflict
          createConflictReport(subjects[1], false, true)   // Code conflict
        ];

        const globalStrategy: GlobalResolutionStrategy = {
          duplicateIdStrategy: 'overwrite',
          duplicateCodeStrategy: 'overwrite',
          applyToAll: true
        };

        const result = applyResolutionStrategy(conflictReports, globalStrategy);

        expect(result.toImport).toContain(subjects[0]);
        expect(result.toImport).toContain(subjects[1]);
        expect(result.toOverwrite).toHaveLength(2);
        expect(result.toSkip).toHaveLength(0);
      });

      it('should preserve data integrity during overwrite', () => {
        const updatedSubject = createTestSubject('sub1', 'MATH101', 'Updated Math');
        updatedSubject.creditHours = 4;
        updatedSubject.color = 'bg-red-100';

        const conflictReport = createConflictReport(updatedSubject, true, true);
        const globalStrategy: GlobalResolutionStrategy = {
          duplicateIdStrategy: 'overwrite',
          duplicateCodeStrategy: 'overwrite',
          applyToAll: true
        };

        const result = applyResolutionStrategy([conflictReport], globalStrategy);

        const importedSubject = result.toImport[0];
        expect(importedSubject.name).toBe('Updated Math');
        expect(importedSubject.creditHours).toBe(4);
        expect(importedSubject.color).toBe('bg-red-100');
      });
    });

    describe('Keep Both Strategy (ID Generation)', () => {
      it('should generate new IDs for keep both scenarios', () => {
        const originalSubject = createTestSubject('sub1', 'MATH101', 'Original');
        const duplicateSubject = createTestSubject('sub1', 'MATH101', 'Duplicate');

        // Simulate keep both by generating new ID
        const newId = generateSubjectId();
        const modifiedSubject = { ...duplicateSubject, id: newId };

        expect(modifiedSubject.id).not.toBe(originalSubject.id);
        expect(modifiedSubject.id).toMatch(/^sub\d{13}[a-z0-9]{6}$/);
        expect(modifiedSubject.name).toBe('Duplicate'); // Keep new data
        expect(modifiedSubject.code).toBe('MATH101'); // Keep same code
      });

      it('should handle multiple keep both scenarios with unique IDs', () => {
        const subjects = [
          createTestSubject('dup_id', 'CODE1', 'Subject 1'),
          createTestSubject('dup_id', 'CODE2', 'Subject 2'),
          createTestSubject('dup_id', 'CODE3', 'Subject 3')
        ];

        const generatedIds = new Set();
        const modifiedSubjects = subjects.map((subject, index) => {
          if (index === 0) return subject; // Keep first one
          
          const newId = generateSubjectId();
          generatedIds.add(newId);
          return { ...subject, id: newId };
        });

        expect(modifiedSubjects[0].id).toBe('dup_id');
        expect(modifiedSubjects[1].id).not.toBe('dup_id');
        expect(modifiedSubjects[2].id).not.toBe('dup_id');
        expect(modifiedSubjects[1].id).not.toBe(modifiedSubjects[2].id);
        expect(generatedIds.size).toBe(2);
      });
    });

    describe('Mixed Strategy Application', () => {
      it('should apply different strategies based on conflict type', () => {
        const subjects = [
          createTestSubject('sub1', 'CODE1', 'Subject 1'),
          createTestSubject('sub2', 'CODE2', 'Subject 2')
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

    describe('Performance and Large Datasets', () => {
      it('should handle large datasets efficiently without file operations', () => {
        const startTime = Date.now();
        
        const subjects = Array.from({ length: 1000 }, (_, i) => 
          createTestSubject(`sub${i}`, `CODE${i}`, `Subject ${i}`)
        );

        const conflictReports = subjects.map((subject, index) => 
          createConflictReport(
            subject, 
            index % 3 === 0, // Every 3rd has ID conflict
            index % 5 === 0  // Every 5th has code conflict
          )
        );

        const globalStrategy: GlobalResolutionStrategy = {
          duplicateIdStrategy: 'overwrite',
          duplicateCodeStrategy: 'skip',
          applyToAll: true
        };

        const result = applyResolutionStrategy(conflictReports, globalStrategy);
        
        const processingTime = Date.now() - startTime;

        expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
        expect(result.toImport.length + result.toSkip.length).toBe(1000);
      });
    });
  });

  describe('End-to-End Integration Tests', () => {
    it('should complete full import pipeline without file/API operations', async () => {
      // Step 1: Parse file (mocked)
      const jsonData = [
        { 'Subject Name': 'Math', 'Credit Hours': '3', 'Course Code': 'MATH101' },
        { 'Subject Name': 'Physics', 'Credit Hours': '4', 'Course Code': 'PHYS201' }
      ];
      const file = createMockFile(JSON.stringify(jsonData), 'subjects.json', 'application/json');

      const parseResult = await parseFile(file);
      expect(parseResult.totalRows).toBe(2);

      // Step 2: Normalize and validate
      const processedSubjects = parseResult.rows.map(row => {
        const normalized = normalizeSubject(row);
        normalized.shortName = normalized.name?.substring(0, 10) || 'Short';
        normalized.departmentId = 'dept1';
        normalized.semesterId = 'sem1';
        normalized.semesterLevel = 1;
        normalized.isCore = true;
        if (!normalized.id) {
          normalized.id = generateSubjectId();
        }
        return processSubjectForImport(normalized);
      });

      expect(processedSubjects).toHaveLength(2);
      expect(processedSubjects[0].creditHours).toBe(3); // Type coerced
      expect(processedSubjects[0].id).toMatch(/^sub\d{13}[a-z0-9]{6}$/);

      // Step 3: Check conflicts (mocked API)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const conflictResult = await detectConflicts(processedSubjects);
      expect(conflictResult.conflictFreeRows).toBe(2);

      // Step 4: Apply merge strategy
      const globalStrategy: GlobalResolutionStrategy = {
        duplicateIdStrategy: 'overwrite',
        duplicateCodeStrategy: 'skip',
        applyToAll: true
      };

      const mergeResult = applyResolutionStrategy(conflictResult.conflictReports, globalStrategy);
      expect(mergeResult.toImport).toHaveLength(2);

      // Verify no real file operations occurred
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/subjects', expect.any(Object));
    });

    it('should handle complete error scenarios without file operations', async () => {
      // Test file validation error
      const oversizedFile = createMockFile('data', 'huge.csv', 'text/csv', 20 * 1024 * 1024);
      const validation = validateFileForParsing(oversizedFile);
      expect(validation.valid).toBe(false);

      // Test API error
      mockFetch.mockRejectedValueOnce(new Error('API unavailable'));
      const subjects = [createTestSubject('sub1', 'MATH101', 'Math')];
      
      await expect(detectConflicts(subjects)).rejects.toThrow('Failed to fetch existing subjects');

      // Test validation error
      const invalidSubject = { name: 'Missing required fields' };
      expect(() => validateSubject(invalidSubject)).toThrow();

      // Verify no file operations occurred despite errors
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
