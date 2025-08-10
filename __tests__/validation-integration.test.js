/**
 * Validation System Integration Test
 * 
 * Tests that the validation system components work together correctly
 */

const { runValidation, validationResults } = require('../scripts/validate-timetable');
const { generateDetailedReport } = require('../scripts/generate-validation-report');
const fs = require('fs');
const path = require('path');

describe('Validation System Integration', () => {

  test('validation script can be imported and executed', () => {
    expect(typeof runValidation).toBe('function');
    expect(typeof validationResults).toBe('object');
  });

  test('validation script runs without crashing', () => {
    expect(() => {
      runValidation();
    }).not.toThrow();
  });

  test('validation results have expected structure', () => {
    runValidation();
    
    expect(validationResults).toHaveProperty('success');
    expect(validationResults).toHaveProperty('errors');
    expect(validationResults).toHaveProperty('warnings');
    expect(validationResults).toHaveProperty('stats');
    
    expect(Array.isArray(validationResults.errors)).toBe(true);
    expect(Array.isArray(validationResults.warnings)).toBe(true);
    expect(typeof validationResults.stats).toBe('object');
  });

  test('validation detects data integrity issues', () => {
    runValidation();
    
    // Based on current data, we expect some errors
    expect(validationResults.errors.length).toBeGreaterThan(0);
    
    // Check that errors are properly formatted
    validationResults.errors.forEach(error => {
      expect(typeof error).toBe('string');
      expect(error.length).toBeGreaterThan(0);
    });
  });

  test('validation statistics are calculated', () => {
    runValidation();
    
    expect(validationResults.stats.totalAllocations).toBeGreaterThan(0);
    expect(typeof validationResults.stats.uniqueRooms).toBe('number');
    expect(typeof validationResults.stats.uniqueTeachers).toBe('number');
    expect(typeof validationResults.stats.conflicts).toBe('number');
  });

  test('report generation works', () => {
    const reportPath = path.join(__dirname, '..', 'validation-report.json');
    
    // Remove any existing report
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath);
    }
    
    // Generate report
    expect(() => {
      generateDetailedReport();
    }).not.toThrow();
    
    // Check that report file was created
    expect(fs.existsSync(reportPath)).toBe(true);
    
    // Read and validate report structure
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportContent);
    
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('validationResult');
    expect(report).toHaveProperty('additionalStats');
    expect(report).toHaveProperty('recommendations');
    
    // Clean up
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath);
    }
  }, 10000); // Increase timeout for report generation

  test('validation respects data file structure', () => {
    // Test that validation can load all required data files
    const dataFiles = [
      'allocations.json',
      'rooms.json', 
      'teachers.json',
      'subjects.json',
      'departments.json',
      'timeslots.json'
    ];
    
    dataFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'data', filename);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Test that files contain valid JSON
      expect(() => {
        const content = fs.readFileSync(filePath, 'utf8');
        const cleanContent = content.replace(/^\uFEFF/, '');
        JSON.parse(cleanContent);
      }).not.toThrow();
    });
  });
});
