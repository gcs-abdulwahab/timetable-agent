import { z } from 'zod';
import { 
  normalizeSubject, 
  generateSubjectId, 
  assignDefaultColor, 
  SubjectSchema,
  SubjectOutput 
} from './subjectImportUtils';
import {
  DetailedError,
  RowValidationResult,
  FieldValidationResult,
  ValidationSummary,
  FieldValidator,
  aggregateValidationResults,
  FATAL_ERROR_CONDITIONS,
  ErrorSeverity,
  ErrorCategory
} from './errorHandling';

/**
 * Options for subject validation
 */
export interface ValidateSubjectsOptions {
  /** Assign the selected semester ID to all subjects */
  assignSelectedSemesterToAll?: boolean;
  /** Default department ID to use when missing */
  defaultDepartmentId?: string;
}

/**
 * Details of a validation error for a specific field
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Result for a single validated row
 */
export interface ValidatedRow {
  rowIndex: number;
  data: SubjectOutput;
}

/**
 * Result for a single invalid row
 */
export interface InvalidRow {
  rowIndex: number;
  errors: ValidationError[];
  originalData: Record<string, any>;
}

/**
 * Summary statistics for validation results
 */
export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  validationRate: number; // percentage of valid rows
}

/**
 * Complete result of subject validation pipeline
 */
export interface ValidationResult {
  validatedRows: ValidatedRow[];
  invalidRows: InvalidRow[];
  summary: ValidationSummary;
}

/**
 * Extract detailed error information from Zod validation error
 */
function extractValidationErrors(error: z.ZodError, originalData: Record<string, any>): ValidationError[] {
  // Safely handle case where error.errors might be undefined
  const errors = error.errors || [];
  return errors.map(err => ({
    field: err.path?.join?.('.') || 'unknown',
    message: err.message || 'Unknown validation error',
    value: err.path?.reduce?.((obj, key) => obj?.[key], originalData)
  }));
}

/**
 * Process a single row through the normalization and validation pipeline
 */
function processSubjectRow(
  row: Record<string, any>, 
  selectedSemesterId: string,
  options: ValidateSubjectsOptions
): { success: true; data: SubjectOutput } | { success: false; errors: ValidationError[] } {
  try {
    // Step 1: Apply normalization
    let normalized = normalizeSubject(row);
    
    // Step 2: Fill missing ID using generateSubjectId
    if (!normalized.id || (typeof normalized.id === 'string' && normalized.id.trim() === '')) {
      normalized.id = generateSubjectId();
    }
    
    // Step 3: Fill missing color using assignDefaultColor (already handled in normalizeSubject)
    // The normalizeSubject function already calls assignDefaultColor, so no additional action needed
    
    // Step 4: Assign semesterId based on options
    if (options.assignSelectedSemesterToAll) {
      normalized.semesterId = selectedSemesterId;
      
      // Extract semester level from the assigned semester ID
      const semesterLevelMatch = selectedSemesterId.match(/sem(\d+)/);
      if (semesterLevelMatch) {
        const level = parseInt(semesterLevelMatch[1], 10);
        if (level >= 1 && level <= 8) {
          normalized.semesterLevel = level;
        }
      }
    } else if (!normalized.semesterId) {
      // If no semester ID is provided and not assigning to all, use the selected one as default
      normalized.semesterId = selectedSemesterId;
      
      // Infer semester level from the default semester ID
      const semesterLevelMatch = selectedSemesterId.match(/sem(\d+)/);
      if (semesterLevelMatch && !normalized.semesterLevel) {
        const level = parseInt(semesterLevelMatch[1], 10);
        if (level >= 1 && level <= 8) {
          normalized.semesterLevel = level;
        }
      }
    }
    
    // Step 5: Apply default department ID if missing
    if (options.defaultDepartmentId && (!normalized.departmentId || normalized.departmentId.trim() === '')) {
      normalized.departmentId = options.defaultDepartmentId;
    }
    
    // Step 6: Validate using Zod schema
    const validated = SubjectSchema.parse(normalized);
    
    return { success: true, data: validated };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: extractValidationErrors(error, row) 
      };
    }
    
    // Handle unexpected errors
    return { 
      success: false, 
      errors: [{ 
        field: 'unknown', 
        message: error instanceof Error ? error.message : 'Unknown validation error',
        value: undefined 
      }] 
    };
  }
}

/**
 * Main validation pipeline function
 * 
 * Accepts parsed rows, selectedSemesterId, and options for validation processing.
 * For each row, applies normalizeSubject, fills missing fields, and validates using Zod.
 * Collects per-row errors with row index and field-level messages.
 * Outputs validatedRows, invalidRows with reasons, and summary counts.
 * 
 * @param parsedRows - Array of parsed subject data rows
 * @param selectedSemesterId - Semester ID to assign (e.g., 'sem1', 'sem2', etc.)
 * @param options - Validation options
 * @returns ValidationResult with valid/invalid rows and summary statistics
 */
export function validateSubjects(
  parsedRows: Record<string, any>[],
  selectedSemesterId: string,
  options: ValidateSubjectsOptions = {}
): ValidationResult {
  if (!Array.isArray(parsedRows)) {
    throw new Error('parsedRows must be an array');
  }
  
  if (!selectedSemesterId || typeof selectedSemesterId !== 'string') {
    throw new Error('selectedSemesterId must be a non-empty string');
  }
  
  // Validate selectedSemesterId format
  if (!selectedSemesterId.match(/^sem[1-8]$/)) {
    throw new Error('selectedSemesterId must be in format "sem1", "sem2", ..., "sem8"');
  }
  
  const validatedRows: ValidatedRow[] = [];
  const invalidRows: InvalidRow[] = [];
  
  // Process each row through the pipeline
  parsedRows.forEach((row, index) => {
    const result = processSubjectRow(row, selectedSemesterId, options);
    
    if (result.success) {
      validatedRows.push({
        rowIndex: index,
        data: result.data
      });
    } else {
      invalidRows.push({
        rowIndex: index,
        errors: result.errors,
        originalData: row
      });
    }
  });
  
  // Calculate summary statistics
  const totalRows = parsedRows.length;
  const validRows = validatedRows.length;
  const invalidRows_count = invalidRows.length;
  const validationRate = totalRows > 0 ? Math.round((validRows / totalRows) * 100 * 100) / 100 : 0;
  
  const summary: ValidationSummary = {
    totalRows,
    validRows,
    invalidRows: invalidRows_count,
    validationRate
  };
  
  return {
    validatedRows,
    invalidRows,
    summary
  };
}

/**
 * Utility function to get a formatted error summary for display
 */
export function getErrorSummary(invalidRows: InvalidRow[]): string[] {
  return invalidRows.map(row => {
    const errorMessages = row.errors.map(err => 
      `${err.field}: ${err.message}`
    ).join(', ');
    return `Row ${row.rowIndex + 1}: ${errorMessages}`;
  });
}

/**
 * Utility function to get field-specific error counts
 */
export function getFieldErrorCounts(invalidRows: InvalidRow[]): Record<string, number> {
  const fieldCounts: Record<string, number> = {};
  
  invalidRows.forEach(row => {
    row.errors.forEach(error => {
      fieldCounts[error.field] = (fieldCounts[error.field] || 0) + 1;
    });
  });
  
  return fieldCounts;
}

/**
 * Utility function to filter rows by specific error types
 */
export function filterRowsByErrorField(invalidRows: InvalidRow[], field: string): InvalidRow[] {
  return invalidRows.filter(row => 
    row.errors.some(error => error.field === field)
  );
}

/**
 * Enhanced validation function with detailed error handling
 * 
 * Provides field-level validation, early feedback, and comprehensive error reporting
 * using the new error handling system.
 */
export function validateSubjectsWithDetailedErrors(
  parsedRows: Record<string, any>[],
  selectedSemesterId: string,
  options: ValidateSubjectsOptions = {}
): {
  validatedRows: ValidatedRow[];
  invalidRows: RowValidationResult[];
  summary: ValidationSummary;
  fieldErrorCounts: Record<string, number>;
} {
  // Input validation
  if (!Array.isArray(parsedRows)) {
    throw FATAL_ERROR_CONDITIONS.SYSTEM_ERROR(new Error('parsedRows must be an array'));
  }
  
  if (parsedRows.length === 0) {
    throw FATAL_ERROR_CONDITIONS.EMPTY_DATASET();
  }
  
  if (!selectedSemesterId || typeof selectedSemesterId !== 'string') {
    throw FATAL_ERROR_CONDITIONS.SYSTEM_ERROR(new Error('selectedSemesterId must be a non-empty string'));
  }
  
  if (!selectedSemesterId.match(/^sem[1-8]$/)) {
    throw FATAL_ERROR_CONDITIONS.SYSTEM_ERROR(new Error('selectedSemesterId must be in format "sem1", "sem2", ..., "sem8"'));
  }

  const validatedRows: ValidatedRow[] = [];
  const invalidRowResults: RowValidationResult[] = [];
  const requiredFields = ['name', 'code', 'creditHours', 'departmentId'];

  // Process each row with detailed field validation
  parsedRows.forEach((row, rowIndex) => {
    const fieldResults: FieldValidationResult[] = [];
    const overallErrors: DetailedError[] = [];
    let hasErrors = false;

    // Get all possible fields from the row and expected fields
    const allFields = new Set([
      ...Object.keys(row),
      ...requiredFields,
      'shortName', 'color', 'semesterLevel', 'isCore', 'semesterId'
    ]);

    // Validate each field individually
    for (const field of allFields) {
      const fieldResult = FieldValidator.validateField(field, row[field], rowIndex);
      fieldResults.push(fieldResult);
      
      if (!fieldResult.isValid) {
        hasErrors = true;
      }
    }

    // Try to process the row through the standard validation pipeline
    let validatedData: SubjectOutput | undefined;
    try {
      const result = processSubjectRow(row, selectedSemesterId, options);
      if (result.success) {
        validatedData = result.data;
        
        // If standard validation passes but we have field-level warnings/errors,
        // still mark as valid but include warnings
        if (!hasErrors) {
          validatedRows.push({
            rowIndex,
            data: result.data
          });
        }
      } else {
        hasErrors = true;
        // Convert legacy errors to detailed errors
        result.errors.forEach(legacyError => {
          overallErrors.push({
            id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            severity: ErrorSeverity.ERROR,
            category: ErrorCategory.VALIDATION,
            field: legacyError.field,
            row: rowIndex,
            message: legacyError.message,
            value: legacyError.value,
            timestamp: new Date(),
            retryable: false
          });
        });
      }
    } catch (error) {
      hasErrors = true;
      overallErrors.push({
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.SYSTEM,
        row: rowIndex,
        message: error instanceof Error ? error.message : 'Unexpected validation error',
        timestamp: new Date(),
        retryable: false
      });
    }

    // Create row validation result
    const rowResult: RowValidationResult = {
      rowIndex,
      isValid: !hasErrors,
      originalData: row,
      validatedData,
      fieldResults,
      overallErrors
    };

    if (hasErrors) {
      invalidRowResults.push(rowResult);
    }
  });

  // Generate comprehensive summary
  const enhancedSummary = aggregateValidationResults([
    ...validatedRows.map(vr => ({
      rowIndex: vr.rowIndex,
      isValid: true,
      originalData: {},
      validatedData: vr.data,
      fieldResults: [],
      overallErrors: []
    })),
    ...invalidRowResults
  ]);

  // Calculate field error counts
  const fieldErrorCounts: Record<string, number> = {};
  invalidRowResults.forEach(row => {
    row.fieldResults.forEach(field => {
      field.errors.forEach(error => {
        const key = error.field || 'unknown';
        fieldErrorCounts[key] = (fieldErrorCounts[key] || 0) + 1;
      });
    });
  });

  return {
    validatedRows,
    invalidRows: invalidRowResults,
    summary: enhancedSummary,
    fieldErrorCounts
  };
}

/**
 * Type exports for external use
 */
export type { ValidateSubjectsOptions, ValidationError, ValidatedRow, InvalidRow, ValidationSummary, ValidationResult };
