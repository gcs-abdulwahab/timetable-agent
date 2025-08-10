import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Supported file formats for parsing
 */
export type FileFormat = 'csv' | 'excel' | 'json';

/**
 * Parsing options interface
 */
export interface ParseOptions {
  /** Expected headers/fields for validation */
  expectedHeaders?: string[];
  /** Custom header mapping (file header -> canonical field name) */
  headerMapping?: Record<string, string>;
  /** Skip empty rows */
  skipEmptyRows?: boolean;
  /** Trim whitespace from values */
  trimValues?: boolean;
  /** Maximum number of rows to parse (0 = unlimited) */
  maxRows?: number;
}

/**
 * Result of file parsing
 */
export interface ParseResult {
  /** Parsed rows with normalized field names */
  rows: Record<string, any>[];
  /** Map of original header names to canonical field names */
  headerMapping: Record<string, string>;
  /** Detected file format */
  format: FileFormat;
  /** Total number of rows parsed */
  totalRows: number;
  /** Any warnings during parsing */
  warnings: string[];
}

/**
 * Parse error with details
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly format: FileFormat,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Common header aliases for flexible parsing
 */
const COMMON_HEADER_ALIASES: Record<string, string[]> = {
  // Subject fields
  id: ['id', 'subject_id', 'subjectId', 'subject-id'],
  name: ['name', 'subject_name', 'subjectName', 'subject-name', 'title'],
  shortName: ['short_name', 'shortName', 'short-name', 'abbreviation', 'abbr'],
  code: ['code', 'subject_code', 'subjectCode', 'subject-code', 'course_code', 'courseCode'],
  creditHours: ['credit_hours', 'creditHours', 'credit-hours', 'credits', 'hours', 'ch'],
  color: ['color', 'subject_color', 'subjectColor', 'hex_color', 'hexColor'],
  departmentId: ['department_id', 'departmentId', 'department-id', 'dept_id', 'deptId'],
  semesterLevel: ['semester_level', 'semesterLevel', 'semester-level', 'level', 'sem_level'],
  semesterId: ['semester_id', 'semesterId', 'semester-id', 'semester', 'sem_id', 'semId'],
  isCore: ['is_core', 'isCore', 'is-core', 'core', 'is_required', 'isRequired', 'required'],
  isMajor: ['is_major', 'isMajor', 'is-major', 'major'],
  teachingDepartmentIds: ['teaching_department_ids', 'teachingDepartmentIds', 'teaching-department-ids', 'teaching_depts', 'teachingDepts'],
  
  // Common generic aliases
  description: ['description', 'desc', 'details'],
  notes: ['notes', 'note', 'comments', 'comment'],
  status: ['status', 'state', 'active', 'enabled']
};

/**
 * Detect file format based on file type and extension
 */
function detectFileFormat(file: File): FileFormat {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // Check MIME type first
  if (fileType.includes('csv') || fileType === 'text/csv') {
    return 'csv';
  }
  if (fileType.includes('sheet') || fileType.includes('excel') || 
      fileType === 'application/vnd.ms-excel' || 
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'excel';
  }
  if (fileType.includes('json') || fileType === 'application/json') {
    return 'json';
  }

  // Fallback to file extension
  if (fileName.endsWith('.csv')) {
    return 'csv';
  }
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return 'excel';
  }
  if (fileName.endsWith('.json')) {
    return 'json';
  }

  // Default to CSV for text files
  if (fileType.includes('text') || fileType === 'text/plain') {
    return 'csv';
  }

  throw new ParseError('Unable to detect file format. Supported formats: CSV, Excel (.xlsx/.xls), JSON', 'csv');
}

/**
 * Normalize header name by removing special characters and converting to camelCase
 */
function normalizeHeaderName(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Create header mapping from raw headers to canonical field names
 */
function createHeaderMapping(
  rawHeaders: string[], 
  customMapping: Record<string, string> = {}
): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  for (const rawHeader of rawHeaders) {
    const trimmedHeader = rawHeader.trim();
    const normalizedHeader = normalizeHeaderName(trimmedHeader);
    
    // Check custom mapping first
    if (customMapping[trimmedHeader]) {
      mapping[trimmedHeader] = customMapping[trimmedHeader];
      continue;
    }
    
    if (customMapping[normalizedHeader]) {
      mapping[trimmedHeader] = customMapping[normalizedHeader];
      continue;
    }
    
    // Check common aliases
    let canonicalField = trimmedHeader;
    for (const [canonical, aliases] of Object.entries(COMMON_HEADER_ALIASES)) {
      if (aliases.includes(trimmedHeader.toLowerCase()) || 
          aliases.includes(normalizedHeader)) {
        canonicalField = canonical;
        break;
      }
    }
    
    mapping[trimmedHeader] = canonicalField;
  }
  
  return mapping;
}

/**
 * Apply header mapping and normalize row data
 */
function normalizeRow(
  rawRow: Record<string, any>, 
  headerMapping: Record<string, string>,
  trimValues: boolean = true
): Record<string, any> {
  const normalizedRow: Record<string, any> = {};
  
  for (const [rawHeader, value] of Object.entries(rawRow)) {
    const canonicalField = headerMapping[rawHeader] || rawHeader;
    let normalizedValue = value;
    
    // Trim string values if requested
    if (trimValues && typeof normalizedValue === 'string') {
      normalizedValue = normalizedValue.trim();
    }
    
    // Skip empty values
    if (normalizedValue === '' || normalizedValue === null || normalizedValue === undefined) {
      continue;
    }
    
    normalizedRow[canonicalField] = normalizedValue;
  }
  
  return normalizedRow;
}

/**
 * Parse CSV file using PapaParse
 */
async function parseCSV(file: File, options: ParseOptions): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const warnings: string[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: options.skipEmptyRows !== false,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
            if (criticalErrors.length > 0) {
              throw new ParseError(
                `CSV parsing failed: ${criticalErrors.map(e => e.message).join(', ')}`,
                'csv'
              );
            }
            
            // Add non-critical errors as warnings
            warnings.push(...results.errors.map(error => `Row ${error.row}: ${error.message}`));
          }
          
          const rawHeaders = results.meta.fields || [];
          if (rawHeaders.length === 0) {
            throw new ParseError('No headers found in CSV file', 'csv');
          }
          
          const headerMapping = createHeaderMapping(rawHeaders, options.headerMapping);
          let rows = results.data as Record<string, any>[];
          
          // Normalize rows
          rows = rows.map(row => normalizeRow(row, headerMapping, options.trimValues));
          
          // Apply max rows limit
          if (options.maxRows && options.maxRows > 0) {
            rows = rows.slice(0, options.maxRows);
          }
          
          resolve({
            rows,
            headerMapping,
            format: 'csv',
            totalRows: rows.length,
            warnings
          });
        } catch (error) {
          reject(error instanceof ParseError ? error : new ParseError(
            `CSV parsing error: ${error instanceof Error ? error.message : String(error)}`,
            'csv',
            error instanceof Error ? error : undefined
          ));
        }
      },
      error: (error) => {
        reject(new ParseError(`CSV parsing failed: ${error.message}`, 'csv', error));
      }
    });
  });
}

/**
 * Parse Excel file using xlsx
 */
async function parseExcel(file: File, options: ParseOptions): Promise<ParseResult> {
  try {
    const warnings: string[] = [];
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first worksheet
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      throw new ParseError('No worksheets found in Excel file', 'excel');
    }
    
    const worksheet = workbook.Sheets[sheetNames[0]];
    if (!worksheet) {
      throw new ParseError(`Unable to read worksheet: ${sheetNames[0]}`, 'excel');
    }
    
    // Convert sheet to JSON with header row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: options.skipEmptyRows === false
    }) as any[][];
    
    if (rawData.length === 0) {
      throw new ParseError('Excel file is empty', 'excel');
    }
    
    // First row should be headers
    const rawHeaders = rawData[0]?.map(h => String(h).trim()).filter(h => h) || [];
    if (rawHeaders.length === 0) {
      throw new ParseError('No headers found in Excel file', 'excel');
    }
    
    // Convert remaining rows to objects
    const headerMapping = createHeaderMapping(rawHeaders, options.headerMapping);
    let rows: Record<string, any>[] = [];
    
    for (let i = 1; i < rawData.length; i++) {
      const rowData = rawData[i] || [];
      const rowObject: Record<string, any> = {};
      
      // Map each column to its header
      for (let j = 0; j < rawHeaders.length; j++) {
        const header = rawHeaders[j];
        const value = rowData[j];
        if (value !== undefined && value !== '') {
          rowObject[header] = value;
        }
      }
      
      // Skip completely empty rows
      if (Object.keys(rowObject).length === 0 && options.skipEmptyRows !== false) {
        continue;
      }
      
      const normalizedRow = normalizeRow(rowObject, headerMapping, options.trimValues);
      rows.push(normalizedRow);
    }
    
    // Apply max rows limit
    if (options.maxRows && options.maxRows > 0) {
      rows = rows.slice(0, options.maxRows);
    }
    
    return {
      rows,
      headerMapping,
      format: 'excel',
      totalRows: rows.length,
      warnings
    };
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    
    throw new ParseError(
      `Excel parsing error: ${error instanceof Error ? error.message : String(error)}`,
      'excel',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Parse JSON file
 */
async function parseJSON(file: File, options: ParseOptions): Promise<ParseResult> {
  try {
    const warnings: string[] = [];
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate that it's an array
    if (!Array.isArray(data)) {
      throw new ParseError('JSON file must contain an array of objects', 'json');
    }
    
    if (data.length === 0) {
      return {
        rows: [],
        headerMapping: {},
        format: 'json',
        totalRows: 0,
        warnings: ['JSON file is empty']
      };
    }
    
    // Validate that array contains objects
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null || Array.isArray(firstItem)) {
      throw new ParseError('JSON array must contain objects', 'json');
    }
    
    // Extract headers from all objects to get complete field set
    const allHeaders = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allHeaders.add(key));
      }
    });
    
    const rawHeaders = Array.from(allHeaders);
    const headerMapping = createHeaderMapping(rawHeaders, options.headerMapping);
    
    // Normalize rows
    let rows = data.map((item, index) => {
      if (typeof item !== 'object' || item === null) {
        warnings.push(`Row ${index + 1}: Expected object, got ${typeof item}`);
        return {};
      }
      return normalizeRow(item, headerMapping, options.trimValues);
    });
    
    // Filter out completely empty rows if requested
    if (options.skipEmptyRows !== false) {
      rows = rows.filter(row => Object.keys(row).length > 0);
    }
    
    // Apply max rows limit
    if (options.maxRows && options.maxRows > 0) {
      rows = rows.slice(0, options.maxRows);
    }
    
    return {
      rows,
      headerMapping,
      format: 'json',
      totalRows: rows.length,
      warnings
    };
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      throw new ParseError(`Invalid JSON format: ${error.message}`, 'json', error);
    }
    
    throw new ParseError(
      `JSON parsing error: ${error instanceof Error ? error.message : String(error)}`,
      'json',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Add performance warnings based on row count
 */
function addPerformanceWarnings(result: ParseResult): ParseResult {
  const warnings = [...result.warnings];
  const rowCount = result.totalRows;
  
  // Soft limit warning at 5k rows
  if (rowCount > PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS) {
    warnings.push(
      `⚠️ Large file detected: ${rowCount} rows exceed the recommended limit of ${PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS} rows. ` +
      'For better performance, consider splitting your file into smaller chunks. ' +
      'Very large files may cause browser slowdowns during import processing.'
    );
  }
  
  // Hard limit warning
  if (rowCount > PERFORMANCE_LIMITS.HARD_LIMIT) {
    warnings.push(
      `🚨 File too large: ${rowCount} rows exceed the maximum limit of ${PERFORMANCE_LIMITS.HARD_LIMIT} rows. ` +
      'Please split your file into smaller chunks before importing. ' +
      'Files this large cannot be processed efficiently in the browser.'
    );
  }
  
  return {
    ...result,
    warnings
  };
}

/**
 * Performance limits for import processing
 */
export const PERFORMANCE_LIMITS = {
  RECOMMENDED_MAX_ROWS: 5000,
  DISPLAY_MAX_ROWS: 500,
  WARNING_THRESHOLD: 5000,
  HARD_LIMIT: 10000
} as const;

/**
 * Parse file based on detected format
 * 
 * @param file - File to parse
 * @param options - Parsing options
 * @returns Promise with parse results
 */

export async function parseFile(file: File, options: ParseOptions = {}): Promise<ParseResult> {
  if (!file) {
    throw new ParseError('File is required', 'csv');
  }
  
  if (file.size === 0) {
    throw new ParseError('File is empty', 'csv');
  }
  
  const format = detectFileFormat(file);
  
  // Set default options
  const defaultOptions: ParseOptions = {
    skipEmptyRows: true,
    trimValues: true,
    maxRows: 0,
    ...options
  };
  
  let result: ParseResult;
  switch (format) {
    case 'csv':
      result = await parseCSV(file, defaultOptions);
      break;
    
    case 'excel':
      result = await parseExcel(file, defaultOptions);
      break;
    
    case 'json':
      result = await parseJSON(file, defaultOptions);
      break;
    
    default:
      throw new ParseError(`Unsupported file format: ${format}`, format);
  }
  
  // Add performance warnings based on row count
  result = addPerformanceWarnings(result);
  
  return result;
}

/**
 * Validate file before parsing
 */
export function validateFileForParsing(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }
  
  try {
    detectFileFormat(file);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown file format error' 
    };
  }
}

/**
 * Get supported file extensions and MIME types
 */
export function getSupportedFormats(): Record<FileFormat, { extensions: string[]; mimeTypes: string[] }> {
  return {
    csv: {
      extensions: ['.csv'],
      mimeTypes: ['text/csv', 'application/csv']
    },
    excel: {
      extensions: ['.xlsx', '.xls'],
      mimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
    },
    json: {
      extensions: ['.json'],
      mimeTypes: ['application/json']
    }
  };
}
