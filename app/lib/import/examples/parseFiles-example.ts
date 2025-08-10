/**
 * Example usage of the parseFiles functionality
 */

import { parseFile, validateFileForParsing, ParseError, getSupportedFormats, PERFORMANCE_LIMITS } from '../parseFiles';

// Example 1: Basic file parsing
export async function basicParsingExample(file: File) {
  try {
    // First, validate the file
    const validation = validateFileForParsing(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return null;
    }

    // Parse the file
    const result = await parseFile(file);
    
    console.log(`Parsed ${result.totalRows} rows from ${result.format} file`);
    console.log('Header mapping:', result.headerMapping);
    
    if (result.warnings.length > 0) {
      console.warn('Parsing warnings:', result.warnings);
    }
    
    return result;
  } catch (error) {
    if (error instanceof ParseError) {
      console.error(`${error.format} parsing failed:`, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

// Example 2: Advanced parsing with custom options
export async function advancedParsingExample(file: File) {
  const options = {
    // Custom header mapping for non-standard headers
    headerMapping: {
      'Course Name': 'name',
      'Course Code': 'code',
      'Credit Hours': 'creditHours',
      'Department': 'departmentId',
      'Semester': 'semesterId',
      'Required Course': 'isCore'
    },
    
    // Limit to first 1000 rows for large files
    maxRows: 1000,
    
    // Skip completely empty rows
    skipEmptyRows: true,
    
    // Trim whitespace from all values
    trimValues: true
  };

  try {
    const result = await parseFile(file, options);
    
    console.log(`Processed ${result.totalRows} rows with custom mapping`);
    console.log('Used header mapping:', result.headerMapping);
    
    // Process the parsed data
    const processedData = result.rows.map(row => ({
      ...row,
      // Convert string booleans to actual booleans
      isCore: typeof row.isCore === 'string' 
        ? ['true', '1', 'yes', 'required'].includes(row.isCore.toLowerCase())
        : Boolean(row.isCore),
      
      // Ensure credit hours is a number
      creditHours: typeof row.creditHours === 'string' 
        ? parseFloat(row.creditHours) 
        : row.creditHours
    }));
    
    return processedData;
  } catch (error) {
    console.error('Advanced parsing failed:', error);
    return null;
  }
}

// Example 3: Working with different file formats
export async function formatSpecificExample() {
  const formats = getSupportedFormats();
  
  console.log('Supported formats:');
  Object.entries(formats).forEach(([format, info]) => {
    console.log(`- ${format}: ${info.extensions.join(', ')} (${info.mimeTypes.join(', ')})`);
  });

  // Example file processing based on format
  async function processFileByFormat(file: File) {
    const result = await parseFile(file);
    
    switch (result.format) {
      case 'csv':
        console.log('Processing CSV file with PapaParse');
        // CSV-specific processing
        break;
        
      case 'excel':
        console.log('Processing Excel file with xlsx');
        // Excel-specific processing
        break;
        
      case 'json':
        console.log('Processing JSON file');
        // JSON-specific processing
        break;
    }
    
    return result;
  }
  
  return processFileByFormat;
}

// Example 4: Error handling and validation
export async function errorHandlingExample(file: File) {
  // Step 1: Pre-validation
  const validation = validateFileForParsing(file);
  if (!validation.valid) {
    switch (validation.error) {
      case 'File is empty':
        console.error('Please select a non-empty file');
        break;
      case 'File size exceeds 10MB limit':
        console.error('File is too large. Please use a smaller file.');
        break;
      default:
        if (validation.error?.includes('Unable to detect file format')) {
          console.error('Unsupported file format. Please use CSV, Excel, or JSON files.');
        } else {
          console.error('File validation error:', validation.error);
        }
    }
    return null;
  }

  // Step 2: Parse with error handling
  try {
    const result = await parseFile(file);
    
    // Step 3: Handle warnings
    if (result.warnings.length > 0) {
      console.warn('Data quality warnings:');
      result.warnings.forEach((warning, index) => {
        console.warn(`  ${index + 1}. ${warning}`);
      });
    }
    
    // Step 4: Validate parsed data
    if (result.totalRows === 0) {
      console.warn('No data rows found in file');
      return null;
    }
    
    console.log(`Successfully parsed ${result.totalRows} rows`);
    return result;
    
  } catch (error) {
    if (error instanceof ParseError) {
      // Handle specific parse errors
      switch (error.format) {
        case 'csv':
          console.error('CSV parsing error:', error.message);
          console.error('Please check your CSV format and try again');
          break;
        case 'excel':
          console.error('Excel parsing error:', error.message);
          console.error('Please ensure your Excel file is not corrupted');
          break;
        case 'json':
          console.error('JSON parsing error:', error.message);
          console.error('Please check your JSON syntax');
          break;
      }
    } else {
      console.error('Unexpected parsing error:', error);
    }
    return null;
  }
}

// Example 5: Integration with existing subject validation
export async function subjectImportExample(file: File) {
  try {
    // Parse the file
    const parseResult = await parseFile(file);
    
    console.log(`Parsed ${parseResult.totalRows} subjects from ${parseResult.format} file`);
    console.log('Headers mapped:', Object.keys(parseResult.headerMapping));
    
    // The parsed data can now be passed to existing validation utilities
    // import { processSubjectsForImport } from './subjectImportUtils';
    // const validatedSubjects = processSubjectsForImport(parseResult.rows);
    
    return parseResult.rows;
    
  } catch (error) {
    console.error('Subject import failed:', error);
    return null;
  }
}

// Example 6: Performance monitoring and large file handling
export async function performanceMonitoringExample(file: File) {
  try {
    // Check file size and warn about potential performance issues
    console.log(`Processing file with ${file.size} bytes`);
    console.log(`Performance limits:`, {
      recommendedMaxRows: PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS,
      displayMaxRows: PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS,
      hardLimit: PERFORMANCE_LIMITS.HARD_LIMIT
    });
    
    // Parse the file
    const result = await parseFile(file);
    
    // Check for performance warnings
    if (result.warnings.length > 0) {
      console.warn('Performance warnings detected:');
      result.warnings.forEach((warning, index) => {
        console.warn(`  ${index + 1}. ${warning}`);
      });
      
      // Suggest actions based on file size
      if (result.totalRows > PERFORMANCE_LIMITS.HARD_LIMIT) {
        console.warn('⚠️  File exceeds hard limit. Consider:');
        console.warn('   - Splitting file into smaller chunks');
        console.warn('   - Processing in batches');
        console.warn('   - Using server-side processing');
      } else if (result.totalRows > PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS) {
        console.warn('💡 File exceeds recommended limit. Consider:');
        console.warn('   - Splitting file for better performance');
        console.warn('   - Using pagination for display');
      }
    }
    
    // For large files, you might want to limit displayed data
    const displayData = result.totalRows > PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS 
      ? result.rows.slice(0, PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS)
      : result.rows;
    
    return {
      ...result,
      displayData,
      isLargeFile: result.totalRows > PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS,
      performanceMetrics: {
        totalRows: result.totalRows,
        displayedRows: displayData.length,
        hasPerformanceWarnings: result.warnings.some(w => 
          w.includes('Large file detected') || w.includes('File too large')
        )
      }
    };
  } catch (error) {
    console.error('Performance monitoring example failed:', error);
    return null;
  }
}

// Example usage in a React component or API handler
export function createFileUploadHandler() {
  return async (file: File) => {
    // Quick validation
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Validate file before parsing
    const validation = validateFileForParsing(file);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }
    
    // Parse with default options
    const result = await parseFile(file);
    
    // Return clean data for further processing
    return {
      data: result.rows,
      metadata: {
        format: result.format,
        totalRows: result.totalRows,
        headerMapping: result.headerMapping,
        warnings: result.warnings,
        performanceInfo: {
          isLargeFile: result.totalRows > PERFORMANCE_LIMITS.DISPLAY_MAX_ROWS,
          exceedsRecommended: result.totalRows > PERFORMANCE_LIMITS.RECOMMENDED_MAX_ROWS,
          exceedsHardLimit: result.totalRows > PERFORMANCE_LIMITS.HARD_LIMIT
        }
      }
    };
  };
}
