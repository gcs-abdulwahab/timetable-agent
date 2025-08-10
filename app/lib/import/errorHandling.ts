import { z } from 'zod';

/**
 * Error severity levels for prioritization
 */
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error', 
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  FILE_ACCESS = 'file_access',
  FORMAT = 'format',
  VALIDATION = 'validation',
  NETWORK = 'network',
  CONFLICT = 'conflict',
  SYSTEM = 'system'
}

/**
 * Detailed error information with context
 */
export interface DetailedError {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  field?: string;
  row?: number;
  message: string;
  details?: string;
  suggestion?: string;
  value?: any;
  timestamp: Date;
  retryable: boolean;
}

/**
 * Field-specific validation result
 */
export interface FieldValidationResult {
  field: string;
  isValid: boolean;
  value: any;
  errors: DetailedError[];
  warnings: DetailedError[];
  suggestions: string[];
}

/**
 * Row-level validation result
 */
export interface RowValidationResult {
  rowIndex: number;
  isValid: boolean;
  originalData: Record<string, any>;
  validatedData?: Record<string, any>;
  fieldResults: FieldValidationResult[];
  overallErrors: DetailedError[];
}

/**
 * Complete validation summary with aggregated statistics
 */
export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rowsWithWarnings: number;
  fatalErrors: DetailedError[];
  fieldErrorCounts: Record<string, number>;
  validationRate: number;
  canProceed: boolean;
  recommendedActions: string[];
}

/**
 * Server error response structure
 */
export interface ServerErrorResponse {
  error: string;
  details?: string;
  status: number;
  code?: string;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fatal error conditions that prevent import processing
 */
export const FATAL_ERROR_CONDITIONS = {
  UNREADABLE_FILE: (fileName: string): DetailedError => ({
    id: generateErrorId(),
    severity: ErrorSeverity.FATAL,
    category: ErrorCategory.FILE_ACCESS,
    message: `File "${fileName}" cannot be read`,
    details: 'The selected file is corrupted, locked, or in an unsupported format.',
    suggestion: 'Please verify the file is valid and try selecting it again.',
    timestamp: new Date(),
    retryable: false
  }),

  UNSUPPORTED_FORMAT: (format: string, fileName: string): DetailedError => ({
    id: generateErrorId(),
    severity: ErrorSeverity.FATAL,
    category: ErrorCategory.FORMAT,
    message: `Unsupported file format: ${format}`,
    details: `File "${fileName}" is not in a supported format.`,
    suggestion: 'Please provide a file in CSV, Excel (.xlsx), or JSON format.',
    timestamp: new Date(),
    retryable: false
  }),

  EMPTY_DATASET: (): DetailedError => ({
    id: generateErrorId(),
    severity: ErrorSeverity.FATAL,
    category: ErrorCategory.VALIDATION,
    message: 'No valid data found',
    details: 'The file contains no parseable data rows or all rows are empty.',
    suggestion: 'Please provide a file with valid subject data.',
    timestamp: new Date(),
    retryable: false
  }),

  MISSING_HEADERS: (missingHeaders: string[]): DetailedError => ({
    id: generateErrorId(),
    severity: ErrorSeverity.FATAL,
    category: ErrorCategory.FORMAT,
    message: 'Required columns are missing',
    details: `Missing required columns: ${missingHeaders.join(', ')}`,
    suggestion: 'Please ensure your file contains all required columns with proper headers.',
    timestamp: new Date(),
    retryable: false
  }),

  SYSTEM_ERROR: (error: Error): DetailedError => ({
    id: generateErrorId(),
    severity: ErrorSeverity.FATAL,
    category: ErrorCategory.SYSTEM,
    message: 'System error occurred',
    details: error.message,
    suggestion: 'Please try again. If the problem persists, contact support.',
    timestamp: new Date(),
    retryable: true
  })
};

/**
 * Field-level validation with early feedback
 */
export class FieldValidator {
  private static readonly REQUIRED_FIELDS = ['name', 'code', 'creditHours', 'departmentId'];
  private static readonly NUMERIC_FIELDS = ['creditHours', 'semesterLevel'];
  private static readonly BOOLEAN_FIELDS = ['isCore', 'isMajor'];

  static validateField(field: string, value: any, row: number): FieldValidationResult {
    const errors: DetailedError[] = [];
    const warnings: DetailedError[] = [];
    const suggestions: string[] = [];

    // Check if required field is missing or empty
    if (this.REQUIRED_FIELDS.includes(field)) {
      if (value === undefined || value === null || String(value).trim() === '') {
        errors.push({
          id: generateErrorId(),
          severity: ErrorSeverity.ERROR,
          category: ErrorCategory.VALIDATION,
          field,
          row,
          message: `${field} is required`,
          details: `Row ${row + 1}: Missing required field "${field}"`,
          suggestion: `Provide a valid value for ${field}`,
          value,
          timestamp: new Date(),
          retryable: false
        });
      }
    }

    // Type-specific validations
    switch (field) {
      case 'name':
        if (value && String(value).length > 100) {
          warnings.push({
            id: generateErrorId(),
            severity: ErrorSeverity.WARNING,
            category: ErrorCategory.VALIDATION,
            field,
            row,
            message: 'Subject name is very long',
            details: `Name exceeds 100 characters (${String(value).length} chars)`,
            suggestion: 'Consider shortening the subject name',
            value,
            timestamp: new Date(),
            retryable: false
          });
        }
        break;

      case 'code':
        if (value) {
          const codeStr = String(value).trim();
          if (!/^[A-Z]{2,4}-\d{3}$/.test(codeStr)) {
            errors.push({
              id: generateErrorId(),
              severity: ErrorSeverity.ERROR,
              category: ErrorCategory.VALIDATION,
              field,
              row,
              message: 'Invalid subject code format',
              details: `"${codeStr}" should follow format like "CS-101", "MATH-201"`,
              suggestion: 'Use format: 2-4 uppercase letters, hyphen, 3 digits',
              value,
              timestamp: new Date(),
              retryable: false
            });
          }
        }
        break;

      case 'creditHours':
        if (value !== undefined && value !== null) {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({
              id: generateErrorId(),
              severity: ErrorSeverity.ERROR,
              category: ErrorCategory.VALIDATION,
              field,
              row,
              message: 'Credit hours must be a number',
              details: `"${value}" is not a valid number`,
              suggestion: 'Provide a numeric value between 1-10',
              value,
              timestamp: new Date(),
              retryable: false
            });
          } else if (num < 1 || num > 10) {
            errors.push({
              id: generateErrorId(),
              severity: ErrorSeverity.ERROR,
              category: ErrorCategory.VALIDATION,
              field,
              row,
              message: 'Invalid credit hours',
              details: `Credit hours must be between 1-10, got ${num}`,
              suggestion: 'Provide a value between 1 and 10',
              value,
              timestamp: new Date(),
              retryable: false
            });
          }
        }
        break;

      case 'semesterLevel':
        if (value !== undefined && value !== null) {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({
              id: generateErrorId(),
              severity: ErrorSeverity.ERROR,
              category: ErrorCategory.VALIDATION,
              field,
              row,
              message: 'Semester level must be a number',
              details: `"${value}" is not a valid number`,
              suggestion: 'Provide a numeric value between 1-8',
              value,
              timestamp: new Date(),
              retryable: false
            });
          } else if (num < 1 || num > 8) {
            errors.push({
              id: generateErrorId(),
              severity: ErrorSeverity.ERROR,
              category: ErrorCategory.VALIDATION,
              field,
              row,
              message: 'Invalid semester level',
              details: `Semester level must be between 1-8, got ${num}`,
              suggestion: 'Provide a value between 1 and 8',
              value,
              timestamp: new Date(),
              retryable: false
            });
          }
        }
        break;

      case 'color':
        if (value) {
          const colorStr = String(value).trim();
          if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorStr)) {
            errors.push({
              id: generateErrorId(),
              severity: ErrorSeverity.ERROR,
              category: ErrorCategory.VALIDATION,
              field,
              row,
              message: 'Invalid color format',
              details: `"${colorStr}" is not a valid hex color`,
              suggestion: 'Use hex color format like #FF0000 or #F00',
              value,
              timestamp: new Date(),
              retryable: false
            });
          }
        } else {
          suggestions.push('Color will be auto-assigned if not provided');
        }
        break;

      case 'departmentId':
        if (value && !String(value).match(/^d\d+$/)) {
          warnings.push({
            id: generateErrorId(),
            severity: ErrorSeverity.WARNING,
            category: ErrorCategory.VALIDATION,
            field,
            row,
            message: 'Department ID format may be incorrect',
            details: `"${value}" doesn't match expected format (e.g., d1, d2)`,
            suggestion: 'Verify department ID is correct',
            value,
            timestamp: new Date(),
            retryable: false
          });
        }
        break;
    }

    return {
      field,
      isValid: errors.length === 0,
      value,
      errors,
      warnings,
      suggestions
    };
  }
}

/**
 * Aggregate validation results and generate summary
 */
export function aggregateValidationResults(rowResults: RowValidationResult[]): ValidationSummary {
  const totalRows = rowResults.length;
  const validRows = rowResults.filter(r => r.isValid).length;
  const invalidRows = totalRows - validRows;
  const rowsWithWarnings = rowResults.filter(r => 
    r.fieldResults.some(f => f.warnings.length > 0)
  ).length;

  // Collect all fatal errors
  const fatalErrors: DetailedError[] = [];
  const fieldErrorCounts: Record<string, number> = {};

  rowResults.forEach(rowResult => {
    // Collect fatal errors from overall errors
    fatalErrors.push(...rowResult.overallErrors.filter(e => e.severity === ErrorSeverity.FATAL));
    
    // Count field-specific errors
    rowResult.fieldResults.forEach(fieldResult => {
      fieldResult.errors.forEach(error => {
        const key = error.field || 'unknown';
        fieldErrorCounts[key] = (fieldErrorCounts[key] || 0) + 1;
      });
    });
  });

  const validationRate = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0;
  const canProceed = fatalErrors.length === 0 && validRows > 0;

  // Generate recommended actions
  const recommendedActions: string[] = [];
  if (fatalErrors.length > 0) {
    recommendedActions.push('Fix fatal errors before proceeding');
  }
  if (invalidRows > 0) {
    recommendedActions.push(`Review and fix ${invalidRows} invalid rows`);
  }
  if (rowsWithWarnings > 0) {
    recommendedActions.push(`Check ${rowsWithWarnings} rows with warnings`);
  }
  if (canProceed && validRows > 0) {
    recommendedActions.push(`Ready to import ${validRows} valid subjects`);
  }

  return {
    totalRows,
    validRows,
    invalidRows,
    rowsWithWarnings,
    fatalErrors,
    fieldErrorCounts,
    validationRate,
    canProceed,
    recommendedActions
  };
}

/**
 * Handle server errors with retry logic
 */
export function handleServerError(error: any, context?: string): ServerErrorResponse {
  const timestamp = new Date();
  
  // Handle specific error types
  if (error?.response) {
    // HTTP error response
    return {
      error: error.response.data?.error || 'Server request failed',
      details: error.response.data?.details || error.message,
      status: error.response.status || 500,
      code: error.response.data?.code,
      retryable: [408, 429, 500, 502, 503, 504].includes(error.response.status),
      timestamp
    };
  }

  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    // Network connectivity error
    return {
      error: 'Network connection failed',
      details: 'Unable to connect to the server. Please check your internet connection.',
      status: 0,
      retryable: true,
      timestamp
    };
  }

  if (error?.name === 'AbortError') {
    // Request timeout
    return {
      error: 'Request timed out',
      details: 'The server took too long to respond.',
      status: 408,
      retryable: true,
      timestamp
    };
  }

  // Generic error
  return {
    error: context ? `${context}: ${error.message}` : error.message || 'Unknown server error',
    details: error.stack || 'No additional details available',
    status: 500,
    retryable: true,
    timestamp
  };
}

/**
 * Export invalid rows for offline correction
 */
export function exportInvalidRows(
  invalidRows: RowValidationResult[], 
  format: 'csv' | 'json' = 'csv'
): { content: string; filename: string; mimeType: string } {
  const timestamp = new Date().toISOString().split('T')[0];
  const exportData = invalidRows.map(row => {
    const errors = row.fieldResults
      .filter(f => f.errors.length > 0)
      .map(f => f.errors.map(e => `${f.field}: ${e.message}`).join('; '))
      .join(' | ');

    return {
      rowNumber: row.rowIndex + 1,
      errors,
      originalData: JSON.stringify(row.originalData),
      ...row.originalData
    };
  });

  if (format === 'json') {
    return {
      content: JSON.stringify(exportData, null, 2),
      filename: `invalid_rows_${timestamp}.json`,
      mimeType: 'application/json'
    };
  }

  // CSV format
  if (exportData.length === 0) {
    return {
      content: 'No invalid rows to export',
      filename: `invalid_rows_${timestamp}.csv`,
      mimeType: 'text/csv'
    };
  }

  const headers = Object.keys(exportData[0]);
  const csvContent = [
    headers.join(','),
    ...exportData.map(row => 
      headers.map(header => {
        const value = (row as any)[header];
        // Escape CSV values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value || '');
      }).join(',')
    )
  ].join('\n');

  return {
    content: csvContent,
    filename: `invalid_rows_${timestamp}.csv`,
    mimeType: 'text/csv'
  };
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  FILE_READ_FAILED: 'Unable to read the selected file. Please verify the file is not corrupted or locked.',
  UNSUPPORTED_FORMAT: 'File format not supported. Please provide a CSV, Excel, or JSON file.',
  EMPTY_FILE: 'The selected file appears to be empty. Please provide a file with data.',
  NETWORK_ERROR: 'Connection failed. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again in a few moments.',
  VALIDATION_FAILED: 'Some data validation errors were found. Please review and fix the highlighted issues.',
  IMPORT_CANCELLED: 'Import process was cancelled by user.',
  PARTIAL_SUCCESS: 'Import completed with some warnings. Please review the results.'
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(
  error: DetailedError | ServerErrorResponse | ErrorMessageKey,
  includeDetails: boolean = false
): string {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  if ('severity' in error) {
    // DetailedError
    let message = error.message;
    if (includeDetails && error.suggestion) {
      message += ` ${error.suggestion}`;
    }
    return message;
  }

  if ('status' in error) {
    // ServerErrorResponse
    let message = error.error;
    if (includeDetails && error.details) {
      message += ` Details: ${error.details}`;
    }
    return message;
  }

  return 'An unexpected error occurred.';
}
