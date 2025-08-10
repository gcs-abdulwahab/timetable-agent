import { parseFile, ParseError, validateFileForParsing, getSupportedFormats, ParseResult } from '../parseFiles';

// Mock external dependencies - no real file operations
jest.mock('papaparse');
jest.mock('xlsx'); 
jest.mock('fs/promises');

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

const mockPapaParse = Papa.parse as jest.MockedFunction<typeof Papa.parse>;
const mockXLSXRead = XLSX.read as jest.MockedFunction<typeof XLSX.read>;
const mockSheetToJson = XLSX.utils.sheet_to_json as jest.MockedFunction<typeof XLSX.utils.sheet_to_json>;

// Helper to create mock File objects
function createMockFile(content: string | ArrayBuffer, filename: string, type: string, size?: number): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], filename, { type });
  
  // Override size if provided
  if (size !== undefined) {
    Object.defineProperty(file, 'size', { value: size, writable: false });
  }

  // Mock file reading methods
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

describe('parseFile - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CSV Parsing', () => {
    it('should parse CSV with proper header mapping and normalization', async () => {
      const csvContent = 'Subject Name,Credit Hours,Course Code,Department\nMath 101,3,MATH101,CS\nPhysics 201,4,PHYS201,PHYS';
      const file = createMockFile(csvContent, 'subjects.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.complete!({
            data: [
              { 'Subject Name': 'Math 101', 'Credit Hours': '3', 'Course Code': 'MATH101', 'Department': 'CS' },
              { 'Subject Name': 'Physics 201', 'Credit Hours': '4', 'Course Code': 'PHYS201', 'Department': 'PHYS' }
            ],
            errors: [],
            meta: { fields: ['Subject Name', 'Credit Hours', 'Course Code', 'Department'] }
          });
        }, 0);
      });

      const result = await parseFile(file);

      expect(result.format).toBe('csv');
      expect(result.totalRows).toBe(2);
      expect(result.headerMapping).toEqual({
        'Subject Name': 'name',
        'Credit Hours': 'creditHours', 
        'Course Code': 'code',
        'Department': 'Department'
      });
      expect(result.rows[0]).toEqual({
        name: 'Math 101',
        creditHours: '3',
        code: 'MATH101',
        Department: 'CS'
      });
    });

    it('should handle CSV parsing errors gracefully', async () => {
      const file = createMockFile('invalid,csv,data\n"unclosed', 'test.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.error!({ message: 'Delimiter error', type: 'Delimiter' } as any);
        }, 0);
      });

      await expect(parseFile(file)).rejects.toThrow(ParseError);
      await expect(parseFile(file)).rejects.toThrow('CSV parsing failed');
    });

    it('should handle CSV with warnings but continue parsing', async () => {
      const file = createMockFile('name,code\nMath,MATH101\n,INVALID', 'test.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.complete!({
            data: [
              { name: 'Math', code: 'MATH101' },
              { name: '', code: 'INVALID' }
            ],
            errors: [
              { row: 2, type: 'FieldMismatch', message: 'Too few fields in row' }
            ],
            meta: { fields: ['name', 'code'] }
          });
        }, 0);
      });

      const result = await parseFile(file);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Row 2');
    });

    it('should respect maxRows option for CSV', async () => {
      const file = createMockFile('name,code\nMath,M1\nPhys,P1\nChem,C1', 'test.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.complete!({
            data: [
              { name: 'Math', code: 'M1' },
              { name: 'Phys', code: 'P1' },
              { name: 'Chem', code: 'C1' }
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

  describe('Excel Parsing', () => {
    it('should parse Excel with header mapping and type conversion', async () => {
      const file = createMockFile(new ArrayBuffer(100), 'subjects.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      mockXLSXRead.mockReturnValue(mockWorkbook);
      mockSheetToJson.mockReturnValue([
        ['Subject Name', 'Credit Hours', 'Course Code', 'Is Core'],
        ['Math 101', 3, 'MATH101', 'Yes'],
        ['Physics 201', 4, 'PHYS201', 'No']
      ]);

      const result = await parseFile(file);

      expect(result.format).toBe('excel');
      expect(result.totalRows).toBe(2);
      expect(result.rows[0]).toEqual({
        name: 'Math 101',
        creditHours: 3,
        code: 'MATH101',
        isCore: 'Yes'
      });
    });

    it('should handle Excel files with no worksheets', async () => {
      const file = createMockFile(new ArrayBuffer(100), 'empty.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSXRead.mockReturnValue({
        SheetNames: [],
        Sheets: {}
      });

      await expect(parseFile(file)).rejects.toThrow('No worksheets found in Excel file');
    });

    it('should handle Excel with empty headers', async () => {
      const file = createMockFile(new ArrayBuffer(100), 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSXRead.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} }
      });

      mockSheetToJson.mockReturnValue([
        [], // Empty header row
        ['Data1', 'Data2']
      ]);

      await expect(parseFile(file)).rejects.toThrow('No headers found in Excel file');
    });

    it('should handle Excel parsing errors', async () => {
      const file = createMockFile(new ArrayBuffer(100), 'corrupt.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSXRead.mockImplementation(() => {
        throw new Error('Invalid Excel file format');
      });

      await expect(parseFile(file)).rejects.toThrow(ParseError);
    });

    it('should skip empty rows in Excel by default', async () => {
      const file = createMockFile(new ArrayBuffer(100), 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSXRead.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} }
      });

      mockSheetToJson.mockReturnValue([
        ['name', 'code'],
        ['Math', 'MATH101'],
        [], // Empty row
        ['Physics', 'PHYS201']
      ]);

      const result = await parseFile(file);
      expect(result.totalRows).toBe(2);
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON array with proper normalization', async () => {
      const jsonData = [
        { 'Subject Name': 'Math 101', 'Credit Hours': 3, 'Course Code': 'MATH101', 'isCore': true },
        { 'Subject Name': 'Physics 201', 'Credit Hours': 4, 'Course Code': 'PHYS201', 'isCore': false }
      ];
      const file = createMockFile(JSON.stringify(jsonData), 'subjects.json', 'application/json');

      const result = await parseFile(file);

      expect(result.format).toBe('json');
      expect(result.totalRows).toBe(2);
      expect(result.headerMapping).toEqual({
        'Subject Name': 'name',
        'Credit Hours': 'creditHours',
        'Course Code': 'code',
        'isCore': 'isCore'
      });
      expect(result.rows[0]).toEqual({
        name: 'Math 101',
        creditHours: 3,
        code: 'MATH101',
        isCore: true
      });
    });

    it('should reject non-array JSON', async () => {
      const jsonData = { name: 'Single Object' };
      const file = createMockFile(JSON.stringify(jsonData), 'invalid.json', 'application/json');

      await expect(parseFile(file)).rejects.toThrow('JSON file must contain an array of objects');
    });

    it('should reject array of non-objects', async () => {
      const jsonData = ['string1', 'string2'];
      const file = createMockFile(JSON.stringify(jsonData), 'invalid.json', 'application/json');

      await expect(parseFile(file)).rejects.toThrow('JSON array must contain objects');
    });

    it('should handle invalid JSON syntax', async () => {
      const file = createMockFile('{ invalid json }', 'invalid.json', 'application/json');

      await expect(parseFile(file)).rejects.toThrow(ParseError);
    });

    it('should handle empty JSON array', async () => {
      const file = createMockFile('[]', 'empty.json', 'application/json');

      const result = await parseFile(file);
      expect(result.totalRows).toBe(0);
      expect(result.rows).toHaveLength(0);
      expect(result.warnings).toContain('JSON file is empty');
    });

    it('should handle mixed object structures in JSON', async () => {
      const jsonData = [
        { name: 'Math', code: 'MATH101', creditHours: 3 },
        { name: 'Physics', code: 'PHYS201', department: 'PHYS' }, // Different fields
        { name: 'Chemistry', code: 'CHEM301', creditHours: 4, isCore: true }
      ];
      const file = createMockFile(JSON.stringify(jsonData), 'mixed.json', 'application/json');

      const result = await parseFile(file);
      expect(result.totalRows).toBe(3);
      expect(Object.keys(result.headerMapping)).toEqual(
        expect.arrayContaining(['name', 'code', 'creditHours', 'department', 'isCore'])
      );
    });
  });

  describe('Format Detection', () => {
    it('should detect format by MIME type first', async () => {
      const tests = [
        { content: 'name,code', filename: 'test.txt', type: 'text/csv', expectedFormat: 'csv' },
        { content: new ArrayBuffer(100), filename: 'test.dat', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', expectedFormat: 'excel' },
        { content: '[]', filename: 'test.txt', type: 'application/json', expectedFormat: 'json' }
      ];

      for (const test of tests) {
        const file = createMockFile(test.content, test.filename, test.type);
        
        if (test.expectedFormat === 'csv') {
          mockPapaParse.mockImplementation((file, options) => {
            setTimeout(() => options.complete!({ data: [], errors: [], meta: { fields: ['name', 'code'] } }), 0);
          });
        } else if (test.expectedFormat === 'excel') {
          mockXLSXRead.mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
          mockSheetToJson.mockReturnValue([['name'], ['Test']]);
        }

        const result = await parseFile(file);
        expect(result.format).toBe(test.expectedFormat);
      }
    });

    it('should fallback to extension detection', async () => {
      const file = createMockFile('name,code', 'test.csv', 'text/plain');
      
      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => options.complete!({ data: [], errors: [], meta: { fields: ['name', 'code'] } }), 0);
      });

      const result = await parseFile(file);
      expect(result.format).toBe('csv');
    });

    it('should throw error for unsupported formats', async () => {
      const file = createMockFile('data', 'test.pdf', 'application/pdf');
      await expect(parseFile(file)).rejects.toThrow('Unable to detect file format');
    });
  });

  describe('File Validation', () => {
    it('should validate file size limits', () => {
      const file = createMockFile('data', 'test.csv', 'text/csv', 11 * 1024 * 1024); // 11MB
      const validation = validateFileForParsing(file);
      
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('File size exceeds 10MB limit');
    });

    it('should reject null/undefined files', () => {
      const validation = validateFileForParsing(null as any);
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('No file provided');
    });

    it('should reject empty files', () => {
      const file = createMockFile('', 'empty.csv', 'text/csv', 0);
      const validation = validateFileForParsing(file);
      
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('File is empty');
    });

    it('should validate supported file formats', () => {
      const file = createMockFile('data', 'test.csv', 'text/csv');
      const validation = validateFileForParsing(file);
      
      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('Parsing Options', () => {
    it('should apply custom header mapping', async () => {
      const jsonData = [{ 'Custom Name': 'Math', 'Custom Code': 'MATH101' }];
      const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file, {
        headerMapping: {
          'Custom Name': 'subjectName',
          'Custom Code': 'subjectCode'
        }
      });

      expect(result.headerMapping).toEqual({
        'Custom Name': 'subjectName',
        'Custom Code': 'subjectCode'
      });
      expect(result.rows[0]).toEqual({
        subjectName: 'Math',
        subjectCode: 'MATH101'
      });
    });

    it('should trim values when trimValues is true', async () => {
      const jsonData = [{ name: '  Math 101  ', code: '  MATH101  ' }];
      const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file, { trimValues: true });
      
      expect(result.rows[0].name).toBe('Math 101');
      expect(result.rows[0].code).toBe('MATH101');
    });

    it('should not trim values when trimValues is false', async () => {
      const jsonData = [{ name: '  Math 101  ', code: '  MATH101  ' }];
      const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file, { trimValues: false });
      
      expect(result.rows[0].name).toBe('  Math 101  ');
      expect(result.rows[0].code).toBe('  MATH101  ');
    });

    it('should handle skipEmptyRows option', async () => {
      const jsonData = [
        { name: 'Math' },
        {}, // Empty object
        { name: 'Physics' }
      ];
      const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const resultSkip = await parseFile(file, { skipEmptyRows: true });
      expect(resultSkip.totalRows).toBe(2);

      const resultKeep = await parseFile(file, { skipEmptyRows: false });
      expect(resultKeep.totalRows).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should throw ParseError with proper format information', async () => {
      const file = createMockFile('', 'test.csv', 'text/csv', 0); // Empty file
      
      await expect(parseFile(file)).rejects.toThrow(ParseError);
      await expect(parseFile(file)).rejects.toThrow('File is empty');
    });

    it('should handle unexpected errors during parsing', async () => {
      const file = createMockFile('[]', 'test.json', 'application/json');
      
      // Mock JSON.parse to throw an error
      const originalParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      try {
        await expect(parseFile(file)).rejects.toThrow(ParseError);
      } finally {
        JSON.parse = originalParse;
      }
    });
  });

  describe('getSupportedFormats', () => {
    it('should return all supported formats with correct metadata', () => {
      const formats = getSupportedFormats();

      expect(formats).toHaveProperty('csv');
      expect(formats).toHaveProperty('excel');  
      expect(formats).toHaveProperty('json');

      expect(formats.csv.extensions).toEqual(['.csv']);
      expect(formats.csv.mimeTypes).toContain('text/csv');

      expect(formats.excel.extensions).toEqual(['.xlsx', '.xls']);
      expect(formats.excel.mimeTypes).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      expect(formats.json.extensions).toEqual(['.json']);
      expect(formats.json.mimeTypes).toContain('application/json');
    });
  });
});
