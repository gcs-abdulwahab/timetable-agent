# File Parsing Library

This library provides comprehensive file parsing capabilities for CSV, Excel, and JSON files with automatic format detection, flexible header mapping, and robust error handling.

## Features

- **Multi-format support**: CSV, Excel (.xlsx/.xls), and JSON
- **Automatic format detection** based on MIME type and file extension
- **Flexible header mapping** with built-in aliases for common field names
- **Data normalization** with trimming and type coercion
- **Comprehensive error handling** with detailed error messages
- **Configurable options** for custom parsing behavior

## Usage

### Basic Usage

```typescript
import { parseFile } from './parseFiles';

// Parse a file (format auto-detected)
const result = await parseFile(file);

console.log(result.format);        // 'csv' | 'excel' | 'json'
console.log(result.rows);          // Parsed data rows
console.log(result.headerMapping); // Header to field mapping
console.log(result.totalRows);     // Number of rows parsed
console.log(result.warnings);      // Any warnings during parsing
```

### Advanced Usage with Options

```typescript
import { parseFile, ParseOptions } from './parseFiles';

const options: ParseOptions = {
  // Custom header mapping
  headerMapping: {
    'Student Name': 'name',
    'Credit Hrs': 'creditHours'
  },
  
  // Limit number of rows
  maxRows: 1000,
  
  // Skip empty rows (default: true)
  skipEmptyRows: true,
  
  // Trim whitespace (default: true)
  trimValues: true,
  
  // Expected headers for validation
  expectedHeaders: ['name', 'code', 'creditHours']
};

const result = await parseFile(file, options);
```

### File Validation

```typescript
import { validateFileForParsing } from './parseFiles';

const validation = validateFileForParsing(file);

if (!validation.valid) {
  console.error('File validation failed:', validation.error);
  return;
}

// Proceed with parsing
const result = await parseFile(file);
```

### Supported Formats Information

```typescript
import { getSupportedFormats } from './parseFiles';

const formats = getSupportedFormats();
console.log(formats.csv.extensions);    // ['.csv']
console.log(formats.excel.extensions);  // ['.xlsx', '.xls']
console.log(formats.json.extensions);   // ['.json']
```

## Header Mapping

The library automatically maps common header variations to canonical field names:

### Built-in Aliases

- **id**: `id`, `subject_id`, `subjectId`, `subject-id`
- **name**: `name`, `subject_name`, `subjectName`, `subject-name`, `title`
- **shortName**: `short_name`, `shortName`, `short-name`, `abbreviation`, `abbr`
- **code**: `code`, `subject_code`, `subjectCode`, `subject-code`, `course_code`, `courseCode`
- **creditHours**: `credit_hours`, `creditHours`, `credit-hours`, `credits`, `hours`, `ch`
- **color**: `color`, `subject_color`, `subjectColor`, `hex_color`, `hexColor`
- **departmentId**: `department_id`, `departmentId`, `department-id`, `dept_id`, `deptId`
- **semesterLevel**: `semester_level`, `semesterLevel`, `semester-level`, `level`, `sem_level`
- **semesterId**: `semester_id`, `semesterId`, `semester-id`, `semester`, `sem_id`, `semId`
- **isCore**: `is_core`, `isCore`, `is-core`, `core`, `is_required`, `isRequired`, `required`
- **isMajor**: `is_major`, `isMajor`, `is-major`, `major`

### Custom Mapping

You can provide custom header mappings to override the built-in aliases:

```typescript
const options = {
  headerMapping: {
    'Course Title': 'name',
    'Course Code': 'code',
    'CH': 'creditHours'
  }
};
```

## Format-Specific Behavior

### CSV Parsing
- Uses PapaParse library for robust CSV parsing
- Supports header rows
- Handles various delimiters automatically
- Trims headers and values
- Reports parsing errors as warnings when possible

### Excel Parsing
- Uses xlsx library to read .xlsx and .xls files
- Reads the first worksheet only
- Treats the first row as headers
- Converts Excel data types to JavaScript types
- Handles empty cells gracefully

### JSON Parsing
- Expects an array of objects
- Validates JSON structure
- Extracts all unique fields from objects
- Handles mixed object structures
- Provides detailed error messages for invalid JSON

## Error Handling

### ParseError Class

```typescript
try {
  const result = await parseFile(file);
} catch (error) {
  if (error instanceof ParseError) {
    console.log('Format:', error.format);
    console.log('Message:', error.message);
    console.log('Original:', error.originalError);
  }
}
```

### Common Errors

- **File is required**: No file provided
- **File is empty**: Zero-byte file
- **Unable to detect file format**: Unsupported file type
- **No headers found**: CSV/Excel file without headers
- **JSON file must contain an array**: JSON is not an array
- **JSON array must contain objects**: Array contains non-object items

## File Size Limits

- Maximum file size: **10MB**
- Files larger than the limit will be rejected during validation
- This can be checked using `validateFileForParsing()`

## Best Practices

1. **Always validate files first**:
   ```typescript
   const validation = validateFileForParsing(file);
   if (!validation.valid) {
     // Handle validation error
     return;
   }
   ```

2. **Handle parsing errors gracefully**:
   ```typescript
   try {
     const result = await parseFile(file);
     // Process result
   } catch (error) {
     // Handle parsing error
   }
   ```

3. **Check warnings for data quality issues**:
   ```typescript
   const result = await parseFile(file);
   if (result.warnings.length > 0) {
     console.warn('Parsing warnings:', result.warnings);
   }
   ```

4. **Use custom header mapping for non-standard files**:
   ```typescript
   const options = {
     headerMapping: {
       'Custom Field': 'standardField'
     }
   };
   ```

5. **Limit rows for large files**:
   ```typescript
   const options = {
     maxRows: 5000  // Prevent memory issues
   };
   ```

## Performance Limits

The library includes built-in performance limits to handle large files efficiently:

### Automatic Warnings

- **Soft Limit (5,000 rows)**: Files exceeding this limit will include a warning suggesting to split the file for better performance
- **Hard Limit (10,000 rows)**: Files exceeding this limit will include a stronger warning about potential browser slowdowns

### Display Optimization

- **Display Limit (500 rows)**: The UI will only render the first 500 rows by default for files larger than this limit
- **Export Option**: Users can export the full validation report even when only a subset is displayed

### Performance Constants

```typescript
import { PERFORMANCE_LIMITS } from './parseFiles';

console.log(PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS); // 5000
console.log(PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS);     // 500
console.log(PERFORMANCE_LIMITS.HARD_LIMIT);           // 10000
```

These limits help maintain good user experience even with very large datasets while providing warnings and alternatives for users working with large files.

## Integration with Validation

The parsed data is designed to work with the existing validation system:

```typescript
import { parseFile } from './parseFiles';
import { processSubjectsForImport } from './subjectImportUtils';

// Parse file
const parseResult = await parseFile(file);

// Process and validate using existing utilities
const validatedSubjects = processSubjectsForImport(parseResult.rows);
```

This maintains consistency with the existing import pipeline while providing flexible parsing capabilities.
