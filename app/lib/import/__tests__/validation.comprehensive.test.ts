import { z } from 'zod';
import {
  normalizeSubject,
  generateSubjectId,
  assignDefaultColor,
  resetColorIndex,
  SubjectSchema,
  validateSubject,
  validateSubjectArray,
  safeValidateSubject,
  processSubjectForImport,
  processSubjectsForImport
} from '../subjectImportUtils';
import {
  validateSubjects,
  validateSubjectsWithDetailedErrors,
  getErrorSummary,
  getFieldErrorCounts,
  filterRowsByErrorField
} from '../validateSubjects';

// Mock file system to ensure no real file operations
jest.mock('fs/promises');

describe('Normalization and Zod Validation - Comprehensive Tests', () => {
  beforeEach(() => {
    resetColorIndex(); // Reset color index for consistent testing
  });

  describe('Subject Normalization', () => {
    it('should normalize string fields by trimming whitespace', () => {
      const input = {
        id: '  sub123  ',
        name: '  Math 101  ',
        shortName: '  Math  ',
        code: '  MATH101  ',
        departmentId: '  dept1  ',
        semesterId: '  sem1  '
      };

      const result = normalizeSubject(input);

      expect(result.id).toBe('sub123');
      expect(result.name).toBe('Math 101');
      expect(result.shortName).toBe('Math');
      expect(result.code).toBe('MATH101');
      expect(result.departmentId).toBe('dept1');
      expect(result.semesterId).toBe('sem1');
    });

    it('should coerce creditHours from string to number', () => {
      const testCases = [
        { input: '3', expected: 3 },
        { input: '3.5', expected: 3.5 },
        { input: '  4  ', expected: 4 },
        { input: 'invalid', expected: 'invalid' }, // Should not coerce invalid strings
        { input: 5, expected: 5 } // Should keep existing numbers
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalizeSubject({ creditHours: input });
        expect(result.creditHours).toBe(expected);
      });
    });

    it('should coerce isCore from various types to boolean', () => {
      const testCases = [
        { input: 'true', expected: true },
        { input: 'True', expected: true },
        { input: 'TRUE', expected: true },
        { input: '1', expected: true },
        { input: 'yes', expected: true },
        { input: 'YES', expected: true },
        { input: 'false', expected: false },
        { input: 'False', expected: false },
        { input: 'FALSE', expected: false },
        { input: '0', expected: false },
        { input: 'no', expected: false },
        { input: 'NO', expected: false },
        { input: 'other', expected: false },
        { input: 1, expected: true },
        { input: 0, expected: false },
        { input: 2, expected: true },
        { input: true, expected: true },
        { input: false, expected: false }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalizeSubject({ isCore: input });
        expect(result.isCore).toBe(expected);
      });
    });

    it('should coerce semesterLevel from string to number', () => {
      const testCases = [
        { input: '1', expected: 1 },
        { input: '5', expected: 5 },
        { input: '  3  ', expected: 3 },
        { input: 'invalid', expected: 'invalid' }, // Should not coerce invalid strings
        { input: 4, expected: 4 } // Should keep existing numbers
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalizeSubject({ semesterLevel: input });
        expect(result.semesterLevel).toBe(expected);
      });
    });

    it('should infer semesterLevel from semesterId when missing', () => {
      const testCases = [
        { semesterId: 'sem1', expected: 1 },
        { semesterId: 'sem3', expected: 3 },
        { semesterId: 'sem8', expected: 8 },
        { semesterId: 'invalid', expected: undefined },
        { semesterId: 'sem0', expected: undefined }, // Out of range
        { semesterId: 'sem9', expected: undefined }  // Out of range
      ];

      testCases.forEach(({ semesterId, expected }) => {
        const result = normalizeSubject({ semesterId });
        expect(result.semesterLevel).toBe(expected);
      });
    });

    it('should ensure consistency between semesterId and semesterLevel', () => {
      const input = {
        semesterLevel: 3,
        semesterId: 'sem1' // Inconsistent
      };

      const result = normalizeSubject(input);
      
      // Should prefer semesterLevel and update semesterId
      expect(result.semesterLevel).toBe(3);
      expect(result.semesterId).toBe('sem3');
    });

    it('should assign default colors cyclically', () => {
      const subjects = [
        { name: 'Math' },
        { name: 'Physics' },
        { name: 'Chemistry' },
        { name: 'Biology' },
        { name: 'English' },
        { name: 'History' } // Should cycle back to first color
      ];

      const results = subjects.map(normalizeSubject);
      
      expect(results[0].color).toBe('bg-blue-100');
      expect(results[1].color).toBe('bg-blue-150');
      expect(results[2].color).toBe('bg-blue-200');
      expect(results[3].color).toBe('bg-blue-250');
      expect(results[4].color).toBe('bg-blue-300');
      expect(results[5].color).toBe('bg-blue-100'); // Cycled back
    });

    it('should preserve existing color if provided', () => {
      const input = { name: 'Math', color: 'bg-red-500' };
      const result = normalizeSubject(input);
      
      expect(result.color).toBe('bg-red-500');
    });

    it('should handle isMajor coercion similar to isCore', () => {
      const testCases = [
        { input: 'true', expected: true },
        { input: 'false', expected: false },
        { input: '1', expected: true },
        { input: '0', expected: false },
        { input: 1, expected: true },
        { input: 0, expected: false }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalizeSubject({ isMajor: input });
        expect(result.isMajor).toBe(expected);
      });
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const ids = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const id = generateSubjectId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toBe(iterations);
    });

    it('should generate IDs with correct format', () => {
      const id = generateSubjectId();
      
      expect(id).toMatch(/^sub\d{13}[a-z0-9]{6}$/);
      expect(id.startsWith('sub')).toBe(true);
      expect(id.length).toBe(22); // 'sub' + 13 digits + 6 chars
    });

    it('should generate IDs with timestamp component', () => {
      const beforeTime = Date.now();
      const id = generateSubjectId();
      const afterTime = Date.now();

      const timestampStr = id.substring(3, 16); // Extract timestamp part
      const timestamp = parseInt(timestampStr, 10);

      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Zod Schema Validation', () => {
    it('should validate complete valid subject', () => {
      const validSubject = {
        id: 'sub123',
        name: 'Mathematics 101',
        shortName: 'Math 101',
        code: 'MATH101',
        creditHours: 3,
        color: 'bg-blue-100',
        departmentId: 'dept1',
        semesterLevel: 1,
        semesterId: 'sem1',
        isCore: true,
        isMajor: true,
        teachingDepartmentIds: ['dept1', 'dept2']
      };

      const result = validateSubject(validSubject);
      expect(result).toEqual(expect.objectContaining(validSubject));
    });

    it('should coerce creditHours to number in validation', () => {
      const subject = {
        id: 'sub123',
        name: 'Math',
        shortName: 'Math',
        code: 'MATH101',
        creditHours: '3', // String that should be coerced
        color: 'bg-blue-100',
        departmentId: 'dept1',
        semesterLevel: '1', // String that should be coerced
        semesterId: 'sem1',
        isCore: 'true' // String that should be coerced
      };

      const result = validateSubject(subject);
      
      expect(typeof result.creditHours).toBe('number');
      expect(result.creditHours).toBe(3);
      expect(typeof result.semesterLevel).toBe('number');
      expect(result.semesterLevel).toBe(1);
      expect(typeof result.isCore).toBe('boolean');
      expect(result.isCore).toBe(true);
    });

    it('should apply default values for optional fields', () => {
      const minimalSubject = {
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

      const result = validateSubject(minimalSubject);
      
      expect(result.isMajor).toBe(true); // Default value
      expect(result.teachingDepartmentIds).toEqual([]); // Default value
    });

    it('should validate required fields', () => {
      const requiredFields = [
        'id', 'name', 'shortName', 'code', 'creditHours', 
        'color', 'departmentId', 'semesterLevel', 'semesterId', 'isCore'
      ];

      requiredFields.forEach(field => {
        const subject = {
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

        delete subject[field as keyof typeof subject];

        expect(() => validateSubject(subject)).toThrow();
      });
    });

    it('should validate field constraints', () => {
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

      // Test field length constraints
      const constraints = [
        { field: 'name', value: '', error: true }, // Empty name
        { field: 'name', value: 'a'.repeat(201), error: true }, // Too long
        { field: 'shortName', value: '', error: true }, // Empty shortName
        { field: 'shortName', value: 'a'.repeat(51), error: true }, // Too long
        { field: 'code', value: '', error: true }, // Empty code
        { field: 'code', value: 'a'.repeat(21), error: true }, // Too long
        { field: 'creditHours', value: 0, error: true }, // Too small
        { field: 'creditHours', value: 11, error: true }, // Too large
        { field: 'semesterLevel', value: 0, error: true }, // Too small
        { field: 'semesterLevel', value: 9, error: true }, // Too large
      ];

      constraints.forEach(({ field, value, error }) => {
        const testSubject = { ...baseSubject, [field]: value };
        
        if (error) {
          expect(() => validateSubject(testSubject)).toThrow();
        } else {
          expect(() => validateSubject(testSubject)).not.toThrow();
        }
      });
    });

    it('should validate color format', () => {
      const baseSubject = {
        id: 'sub123',
        name: 'Math',
        shortName: 'Math',
        code: 'MATH101',
        creditHours: 3,
        departmentId: 'dept1',
        semesterLevel: 1,
        semesterId: 'sem1',
        isCore: true
      };

      const colorTests = [
        { color: 'bg-blue-100', valid: true },
        { color: '#FF0000', valid: true },
        { color: 'red', valid: false }, // Invalid format
        { color: '', valid: false }, // Empty
        { color: 'blue-100', valid: false } // Missing 'bg-' prefix
      ];

      colorTests.forEach(({ color, valid }) => {
        const testSubject = { ...baseSubject, color };
        
        if (valid) {
          expect(() => validateSubject(testSubject)).not.toThrow();
        } else {
          expect(() => validateSubject(testSubject)).toThrow();
        }
      });
    });

    it('should validate semesterId format', () => {
      const baseSubject = {
        id: 'sub123',
        name: 'Math',
        shortName: 'Math',
        code: 'MATH101',
        creditHours: 3,
        color: 'bg-blue-100',
        departmentId: 'dept1',
        semesterLevel: 1,
        isCore: true
      };

      const semesterTests = [
        { semesterId: 'sem1', valid: true },
        { semesterId: 'sem8', valid: true },
        { semesterId: 'sem0', valid: false }, // Out of range
        { semesterId: 'sem9', valid: false }, // Out of range
        { semesterId: 'semester1', valid: false }, // Wrong format
        { semesterId: 'SEM1', valid: false }, // Wrong case
        { semesterId: '', valid: false } // Empty
      ];

      semesterTests.forEach(({ semesterId, valid }) => {
        const testSubject = { ...baseSubject, semesterId, semesterLevel: parseInt(semesterId.replace('sem', '')) || 1 };
        
        if (valid) {
          expect(() => validateSubject(testSubject)).not.toThrow();
        } else {
          expect(() => validateSubject(testSubject)).toThrow();
        }
      });
    });

    it('should enforce semesterId and semesterLevel consistency', () => {
      const baseSubject = {
        id: 'sub123',
        name: 'Math',
        shortName: 'Math',
        code: 'MATH101',
        creditHours: 3,
        color: 'bg-blue-100',
        departmentId: 'dept1',
        isCore: true
      };

      const consistencyTests = [
        { semesterLevel: 1, semesterId: 'sem1', valid: true },
        { semesterLevel: 5, semesterId: 'sem5', valid: true },
        { semesterLevel: 1, semesterId: 'sem2', valid: false }, // Inconsistent
        { semesterLevel: 3, semesterId: 'sem8', valid: false }  // Inconsistent
      ];

      consistencyTests.forEach(({ semesterLevel, semesterId, valid }) => {
        const testSubject = { ...baseSubject, semesterLevel, semesterId };
        
        if (valid) {
          expect(() => validateSubject(testSubject)).not.toThrow();
        } else {
          expect(() => validateSubject(testSubject)).toThrow();
        }
      });
    });
  });

  describe('Validation Array Functions', () => {
    it('should validate array of subjects successfully', () => {
      const subjects = [
        {
          id: 'sub1',
          name: 'Math',
          shortName: 'Math',
          code: 'MATH101',
          creditHours: 3,
          color: 'bg-blue-100',
          departmentId: 'dept1',
          semesterLevel: 1,
          semesterId: 'sem1',
          isCore: true
        },
        {
          id: 'sub2',
          name: 'Physics',
          shortName: 'Phys',
          code: 'PHYS201',
          creditHours: 4,
          color: 'bg-green-100',
          departmentId: 'dept2',
          semesterLevel: 2,
          semesterId: 'sem2',
          isCore: false
        }
      ];

      const result = validateSubjectArray(subjects);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Math');
      expect(result[1].name).toBe('Physics');
    });

    it('should handle validation errors in array', () => {
      const subjects = [
        {
          id: 'sub1',
          name: 'Math',
          shortName: 'Math',
          code: 'MATH101',
          creditHours: 3,
          color: 'bg-blue-100',
          departmentId: 'dept1',
          semesterLevel: 1,
          semesterId: 'sem1',
          isCore: true
        },
        {
          // Missing required fields
          name: 'Invalid'
        }
      ];

      expect(() => validateSubjectArray(subjects)).toThrow();
    });

    it('should provide detailed error messages for array validation', () => {
      const subjects = [
        { name: 'Valid but incomplete' }, // Missing many fields
        { id: '', name: 'Math' } // Invalid fields
      ];

      try {
        validateSubjectArray(subjects);
        fail('Expected validation to throw');
      } catch (error) {
        expect(error.message).toContain('Subject 1:');
        expect(error.message).toContain('Subject 2:');
      }
    });
  });

  describe('Safe Validation', () => {
    it('should return success for valid subject', () => {
      const validSubject = {
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

      const result = safeValidateSubject(validSubject);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Math');
      }
    });

    it('should return error for invalid subject', () => {
      const invalidSubject = {
        name: 'Math' // Missing required fields
      };

      const result = safeValidateSubject(invalidSubject);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('validation failed');
      }
    });
  });

  describe('Subject Processing Pipeline', () => {
    it('should process subject with normalization and validation', () => {
      const rawSubject = {
        name: '  Math 101  ', // Will be trimmed
        shortName: '  Math  ',
        code: '  MATH101  ',
        creditHours: '3', // Will be coerced to number
        color: 'bg-blue-100',
        departmentId: '  dept1  ',
        semesterLevel: '1', // Will be coerced
        semesterId: 'sem1',
        isCore: 'true' // Will be coerced to boolean
      };

      const result = processSubjectForImport(rawSubject);

      expect(result.name).toBe('Math 101');
      expect(result.shortName).toBe('Math');
      expect(result.code).toBe('MATH101');
      expect(result.creditHours).toBe(3);
      expect(result.departmentId).toBe('dept1');
      expect(result.semesterLevel).toBe(1);
      expect(result.isCore).toBe(true);
    });

    it('should generate ID if missing during processing', () => {
      const rawSubject = {
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

      const result = processSubjectForImport(rawSubject);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^sub\d{13}[a-z0-9]{6}$/);
    });

    it('should process multiple subjects', () => {
      const rawSubjects = [
        {
          name: 'Math',
          shortName: 'Math',
          code: 'MATH101',
          creditHours: '3',
          color: 'bg-blue-100',
          departmentId: 'dept1',
          semesterLevel: '1',
          semesterId: 'sem1',
          isCore: 'true'
        },
        {
          name: 'Physics',
          shortName: 'Phys',
          code: 'PHYS201',
          creditHours: '4',
          color: 'bg-green-100',
          departmentId: 'dept2',
          semesterLevel: '2',
          semesterId: 'sem2',
          isCore: 'false'
        }
      ];

      const results = processSubjectsForImport(rawSubjects);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Math');
      expect(results[0].creditHours).toBe(3); // Coerced to number
      expect(results[1].name).toBe('Physics');
      expect(results[1].creditHours).toBe(4); // Coerced to number
    });
  });

  describe('Validation Pipeline Integration', () => {
    it('should validate subjects with options', () => {
      const rawSubjects = [
        {
          name: 'Math',
          shortName: 'Math',
          code: 'MATH101',
          creditHours: '3',
          color: 'bg-blue-100'
        }
      ];

      const result = validateSubjects(rawSubjects, 'sem1', {
        assignSelectedSemesterToAll: true,
        defaultDepartmentId: 'default-dept'
      });

      expect(result.validatedRows).toHaveLength(1);
      expect(result.invalidRows).toHaveLength(0);
      expect(result.summary.validationRate).toBe(100);

      const validatedSubject = result.validatedRows[0].data;
      expect(validatedSubject.semesterId).toBe('sem1');
      expect(validatedSubject.semesterLevel).toBe(1);
      expect(validatedSubject.departmentId).toBe('default-dept');
    });

    it('should handle validation errors gracefully', () => {
      const rawSubjects = [
        {
          name: 'Valid Subject',
          shortName: 'Valid',
          code: 'VALID101',
          creditHours: 3,
          color: 'bg-blue-100',
          departmentId: 'dept1'
        },
        {
          name: '', // Invalid - empty name
          code: 'INVALID'
        }
      ];

      const result = validateSubjects(rawSubjects, 'sem1');

      expect(result.validatedRows).toHaveLength(1);
      expect(result.invalidRows).toHaveLength(1);
      expect(result.summary.validationRate).toBe(50);

      const errorSummary = getErrorSummary(result.invalidRows);
      expect(errorSummary).toHaveLength(1);
      expect(errorSummary[0]).toContain('Row 2');
    });

    it('should provide field error counts', () => {
      const rawSubjects = [
        { name: '', code: '' }, // Multiple field errors
        { name: 'Valid', code: '' } // Single field error
      ];

      const result = validateSubjects(rawSubjects, 'sem1');
      const fieldErrors = getFieldErrorCounts(result.invalidRows);

      expect(fieldErrors).toHaveProperty('name');
      expect(fieldErrors).toHaveProperty('shortName'); // Required but missing
      expect(fieldErrors).toHaveProperty('code');
      expect(fieldErrors.name).toBeGreaterThan(0);
    });

    it('should filter rows by error field', () => {
      const rawSubjects = [
        { name: '', code: 'VALID101' }, // Name error
        { name: 'Valid', code: '' }, // Code error  
        { name: '', code: '' } // Both errors
      ];

      const result = validateSubjects(rawSubjects, 'sem1');
      const nameErrors = filterRowsByErrorField(result.invalidRows, 'name');
      const codeErrors = filterRowsByErrorField(result.invalidRows, 'shortName'); // Will have shortName errors

      expect(nameErrors.length).toBeGreaterThan(0);
      expect(codeErrors.length).toBeGreaterThan(0);
    });
  });
});
