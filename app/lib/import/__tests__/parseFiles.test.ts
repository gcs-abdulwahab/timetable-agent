import { parseFile, ParseError, validateFileForParsing, getSupportedFormats } from '../parseFiles';

// Mock PapaParse
jest.mock('papaparse', () => ({
  parse: jest.fn()
}));

// Mock xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}));

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

const mockPapaParse = Papa.parse as jest.MockedFunction<typeof Papa.parse>;
const mockXLSXRead = XLSX.read as jest.MockedFunction<typeof XLSX.read>;
const mockSheetToJson = XLSX.utils.sheet_to_json as jest.MockedFunction<typeof XLSX.utils.sheet_to_json>;

// Helper to create mock File with required methods
function createMockFile(content: string | ArrayBuffer, filename: string, type: string): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], filename, { type });

  // Mock arrayBuffer method for Excel files
  if (content instanceof ArrayBuffer) {
    Object.defineProperty(file, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(content),
      writable: true
    });
  }

  // Mock text method for JSON files
  if (typeof content === 'string') {
    Object.defineProperty(file, 'text', {
      value: jest.fn().mockResolvedValue(content),
      writable: true
    });
  }

  return file;
}

describe('parseFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CSV parsing', () => {
    it('should parse CSV file with header mapping', async () => {
const csvContent = 'name,credit_hours,code\nMath 101,3,MATH101';
      const file = createMockFile(csvContent, 'test.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        // Simulate PapaParse behavior
        setTimeout(() => {
          options.complete!({
            data: [{ name: 'Math 101', credit_hours: '3', code: 'MATH101' }],
            errors: [],
            meta: { fields: ['name', 'credit_hours', 'code'] }
          });
        }, 0);
      });

      const result = await parseFile(file);

      expect(result.format).toBe('csv');
      expect(result.totalRows).toBe(1);
      expect(result.headerMapping).toEqual({
        'name': 'name',
        'credit_hours': 'creditHours',
        'code': 'code'
      });
      expect(result.rows[0]).toEqual({
        name: 'Math 101',
        creditHours: '3',
        code: 'MATH101'
      });
    });

    it('should handle CSV parsing errors', async () => {
const file = createMockFile('invalid,csv', 'test.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.error!({ message: 'Parse error', type: 'Delimiter' } as any);
        }, 0);
      });

      await expect(parseFile(file)).rejects.toThrow(ParseError);
    });

    it('should handle CSV with no headers', async () => {
const file = createMockFile('', 'test.csv', 'text/csv');

      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.complete!({
            data: [],
            errors: [],
            meta: { fields: [] }
          });
        }, 0);
      });

await expect(parseFile(file)).rejects.toThrow('File is empty');
    });
  });

  describe('Excel parsing', () => {
    it('should parse Excel file with header mapping', async () => {
const file = createMockFile(new ArrayBuffer(8), 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      mockXLSXRead.mockReturnValue(mockWorkbook);
      mockSheetToJson.mockReturnValue([
        ['name', 'credit_hours', 'code'],
        ['Math 101', 3, 'MATH101']
      ]);

      const result = await parseFile(file);

      expect(result.format).toBe('excel');
      expect(result.totalRows).toBe(1);
      expect(result.headerMapping).toEqual({
        'name': 'name',
        'credit_hours': 'creditHours',
        'code': 'code'
      });
      expect(result.rows[0]).toEqual({
        name: 'Math 101',
        creditHours: 3,
        code: 'MATH101'
      });
    });

    it('should handle Excel with no worksheets', async () => {
const file = createMockFile(new ArrayBuffer(8), 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSXRead.mockReturnValue({
        SheetNames: [],
        Sheets: {}
      });

      await expect(parseFile(file)).rejects.toThrow('No worksheets found in Excel file');
    });
  });

  describe('JSON parsing', () => {
    it('should parse JSON array with header mapping', async () => {
      const jsonData = [
        { name: 'Math 101', credit_hours: 3, code: 'MATH101' }
      ];
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file);

      expect(result.format).toBe('json');
      expect(result.totalRows).toBe(1);
      expect(result.headerMapping).toEqual({
        'name': 'name',
        'credit_hours': 'creditHours',
        'code': 'code'
      });
      expect(result.rows[0]).toEqual({
        name: 'Math 101',
        creditHours: 3,
        code: 'MATH101'
      });
    });

    it('should reject non-array JSON', async () => {
      const jsonData = { name: 'Math 101' };
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      await expect(parseFile(file)).rejects.toThrow('JSON file must contain an array of objects');
    });

    it('should reject array of non-objects', async () => {
      const jsonData = ['Math 101', 'Physics 201'];
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      await expect(parseFile(file)).rejects.toThrow('JSON array must contain objects');
    });

    it('should handle invalid JSON', async () => {
const file = createMockFile('invalid json', 'test.json', 'application/json');

      await expect(parseFile(file)).rejects.toThrow(ParseError);
    });
  });

  describe('Format detection', () => {
    it('should detect CSV by MIME type', async () => {
const file = createMockFile('name,code', 'test.csv', 'text/csv');
      
      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.complete!({
            data: [],
            errors: [],
            meta: { fields: ['name', 'code'] }
          });
        }, 0);
      });

      const result = await parseFile(file);
      expect(result.format).toBe('csv');
    });

    it('should detect Excel by MIME type', async () => {
const file = createMockFile(new ArrayBuffer(8), 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSXRead.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} }
      });
      mockSheetToJson.mockReturnValue([['name'], ['Test']]);

      const result = await parseFile(file);
      expect(result.format).toBe('excel');
    });

    it('should detect JSON by MIME type', async () => {
const file = createMockFile('[]', 'test.json', 'application/json');

      const result = await parseFile(file);
      expect(result.format).toBe('json');
    });

    it('should fallback to extension detection', async () => {
const file = createMockFile('name,code', 'test.csv', 'text/plain');
      
      mockPapaParse.mockImplementation((file, options) => {
        setTimeout(() => {
          options.complete!({
            data: [],
            errors: [],
            meta: { fields: ['name', 'code'] }
          });
        }, 0);
      });

      const result = await parseFile(file);
      expect(result.format).toBe('csv');
    });

    it('should throw error for unsupported format', async () => {
      const file = createMockFile('data', 'test.pdf', 'application/pdf');
      
      await expect(parseFile(file)).rejects.toThrow('Unable to detect file format');
    });
  });

  describe('Custom options', () => {
    it('should respect maxRows option', async () => {
      const jsonData = [
        { name: 'Math 101' },
        { name: 'Physics 201' },
        { name: 'Chemistry 301' }
      ];
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file, { maxRows: 2 });
      
      expect(result.totalRows).toBe(2);
      expect(result.rows).toHaveLength(2);
    });

    it('should respect custom header mapping', async () => {
      const jsonData = [{ custom_name: 'Math 101' }];
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file, {
        headerMapping: { custom_name: 'name' }
      });

      expect(result.headerMapping).toEqual({
        'custom_name': 'name'
      });
      expect(result.rows[0]).toEqual({
        name: 'Math 101'
      });
    });

    it('should handle trimValues option', async () => {
      const jsonData = [{ name: '  Math 101  ' }];
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file, { trimValues: true });
      
      expect(result.rows[0].name).toBe('Math 101');
    });

    it('should skip empty rows by default', async () => {
      const jsonData = [
        { name: 'Math 101' },
        {},
        { name: 'Physics 201' }
      ];
const file = createMockFile(JSON.stringify(jsonData), 'test.json', 'application/json');

      const result = await parseFile(file);
      
      expect(result.totalRows).toBe(2);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe('File validation', () => {
    it('should validate supported file', () => {
const file = createMockFile('data', 'test.csv', 'text/csv');
      const validation = validateFileForParsing(file);

      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should reject empty file', () => {
const file = createMockFile('', 'test.csv', 'text/csv');
      const validation = validateFileForParsing(file);

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('File is empty');
    });

    it('should reject too large file', () => {
      // Create a mock large file
      const largeSize = 11 * 1024 * 1024; // 11MB
      const file = { 
        name: 'test.csv', 
        type: 'text/csv', 
        size: largeSize 
      } as File;
      
      const validation = validateFileForParsing(file);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('File size exceeds');
    });

    it('should reject unsupported file format', () => {
      const file = createMockFile('data', 'test.pdf', 'application/pdf');
      const validation = validateFileForParsing(file);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Unable to detect file format');
    });
  });

  describe('getSupportedFormats', () => {
    it('should return supported formats', () => {
      const formats = getSupportedFormats();

      expect(formats).toHaveProperty('csv');
      expect(formats).toHaveProperty('excel');
      expect(formats).toHaveProperty('json');
      
      expect(formats.csv.extensions).toContain('.csv');
      expect(formats.excel.extensions).toContain('.xlsx');
      expect(formats.json.extensions).toContain('.json');
    });
  });

  describe('Performance warnings', () => {
    it('should add warning for files exceeding recommended limit', async () => {
      // Create a JSON file with many rows
      const largeData = Array(6000).fill(0).map((_, i) => ({ name: `Subject ${i}`, code: `S${i}` }));
      const file = createMockFile(JSON.stringify(largeData), 'large.json', 'application/json');

      const result = await parseFile(file);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Large file detected');
      expect(result.warnings[0]).toContain('5000 rows');
      expect(result.warnings[0]).toContain('consider splitting');
    });

    it('should add hard limit warning for extremely large files', async () => {
      // Create a JSON file exceeding hard limit
      const extremeData = Array(12000).fill(0).map((_, i) => ({ name: `Subject ${i}`, code: `S${i}` }));
      const file = createMockFile(JSON.stringify(extremeData), 'extreme.json', 'application/json');

      const result = await parseFile(file);
      
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1]).toContain('File too large');
      expect(result.warnings[1]).toContain('10000 rows');
      expect(result.warnings[1]).toContain('split your file');
    });

    it('should not add warnings for files within limits', async () => {
      const smallData = Array(1000).fill(0).map((_, i) => ({ name: `Subject ${i}`, code: `S${i}` }));
      const file = createMockFile(JSON.stringify(smallData), 'small.json', 'application/json');

      const result = await parseFile(file);
      
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('should throw ParseError for null file', async () => {
await expect(parseFile(null as any)).rejects.toThrow('File is required');
    });

    it('should throw ParseError for empty file', async () => {
const file = createMockFile('', 'test.csv', 'text/csv');
      await expect(parseFile(file)).rejects.toThrow('File is empty');
    });
  });
});
