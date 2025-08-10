# Subject Import Conflict Detection System

This module provides comprehensive conflict detection and resolution for subject imports, ensuring data integrity and providing flexible resolution strategies.

## Overview

The conflict detection system performs the following tasks:

1. **Fetches existing subjects** via GET `/api/subjects`
2. **Detects conflicts** both within the import file and against existing data
3. **Builds detailed conflict reports** for each row with specific conflict information
4. **Provides resolution strategies** with customizable global and per-row options

## Features

### Conflict Types Detected

- ✅ **Intra-file ID duplicates**: Same ID appears multiple times in import file
- ✅ **Intra-file code duplicates**: Same code appears multiple times in import file  
- ✅ **Existing data ID conflicts**: Import ID matches existing subject ID
- ✅ **Existing data code conflicts**: Import code matches existing subject code
- ✅ **Case-insensitive matching**: Handles case variations properly
- ✅ **Whitespace normalization**: Trims and normalizes whitespace

### Resolution Strategies

| Conflict Type | Default Strategy | Options |
|---------------|------------------|---------|
| `duplicateId` | `overwrite` | `overwrite`, `skip`, `rename`, `userDecision` |
| `duplicateCode` | `skip` | `overwrite`, `skip`, `rename`, `userDecision` |
| `both` | `userDecision` | `overwrite`, `skip`, `rename`, `userDecision` |
| `none` | `overwrite` | N/A |

### Default Resolution Logic

- **ID conflicts**: Overwrite existing data (newer data wins)
- **Code conflicts**: Skip import (preserve existing courses)
- **Both conflicts**: Require user decision
- **No conflicts**: Proceed with import

## Usage Examples

### Basic Conflict Detection

```typescript
import { detectConflicts, fetchExistingSubjects } from './conflictDetection';

// Detect conflicts for subjects to import
const conflictResult = await detectConflicts(subjectsToImport);

console.log(`Found conflicts in ${conflictResult.conflictingRows} of ${conflictResult.totalRows} subjects`);
```

### With Custom Existing Data

```typescript
import { detectConflicts } from './conflictDetection';

// Use pre-fetched existing subjects
const existingSubjects = await fetchExistingSubjects();
const conflictResult = await detectConflicts(subjectsToImport, existingSubjects);
```

### Applying Resolution Strategies

```typescript
import { applyResolutionStrategy } from './conflictDetection';

// Use default strategy
const resolution = applyResolutionStrategy(
  conflictResult.conflictReports,
  conflictResult.globalStrategy
);

// Custom global strategy
const customStrategy = {
  duplicateIdStrategy: 'skip',
  duplicateCodeStrategy: 'overwrite',
  applyToAll: true
};

const customResolution = applyResolutionStrategy(
  conflictResult.conflictReports,
  customStrategy
);

console.log(`Will import ${customResolution.toImport.length} subjects`);
console.log(`Will skip ${customResolution.toSkip.length} subjects`);
```

### Real-World Import Workflow

```typescript
import { realWorldImportExample } from './examples/conflictDetection-example';

const result = await realWorldImportExample(subjectsToImport);

console.log(`Import Summary:`);
console.log(`- Subjects to import: ${result.toImport.length}`);
console.log(`- Subjects skipped: ${result.skipped.length}`);
console.log(`- Total conflicts: ${result.conflicts}`);

// Process skipped subjects
result.skipped.forEach(({ subject, reason }) => {
  console.log(`Skipped: ${subject.name} - ${reason}`);
});
```

## API Reference

### Core Functions

#### `detectConflicts(subjectsToImport, existingSubjects?)`

Detects all types of conflicts and returns a comprehensive report.

**Parameters:**
- `subjectsToImport: Subject[]` - Array of subjects to import
- `existingSubjects?: Subject[]` - Optional existing subjects (fetched if not provided)

**Returns:** `Promise<ConflictDetectionResult>`

#### `fetchExistingSubjects()`

Fetches existing subjects from the API endpoint.

**Returns:** `Promise<Subject[]>`

#### `applyResolutionStrategy(conflictReports, globalStrategy)`

Applies resolution strategy to conflict reports and categorizes subjects.

**Parameters:**
- `conflictReports: ConflictReport[]` - Reports from conflict detection
- `globalStrategy: GlobalResolutionStrategy` - Resolution strategy to apply

**Returns:** `{ toImport: Subject[], toSkip: ConflictReport[], toOverwrite: ConflictReport[] }`

#### `formatConflictReport(report)`

Formats a conflict report for human-readable display.

**Parameters:**
- `report: ConflictReport` - Individual conflict report

**Returns:** `string` - Formatted report text

### Types

#### `ConflictType`
```typescript
type ConflictType = 'none' | 'duplicateId' | 'duplicateCode' | 'both';
```

#### `ResolutionStrategy` 
```typescript
type ResolutionStrategy = 'overwrite' | 'skip' | 'rename' | 'userDecision';
```

#### `ConflictReport`
```typescript
interface ConflictReport {
  rowIndex: number;
  conflictType: ConflictType;
  hasIdConflict: boolean;
  hasCodeConflict: boolean;
  existingSubjectsByIdConflict: ConflictReference[];
  existingSubjectsByCodeConflict: ConflictReference[];
  intraFileIdConflicts: number[];
  intraFileCodeConflicts: number[];
  recommendedResolution: ResolutionStrategy;
  subject: Subject;
}
```

#### `ConflictDetectionResult`
```typescript
interface ConflictDetectionResult {
  totalRows: number;
  conflictingRows: number;
  conflictFreeRows: number;
  conflictReports: ConflictReport[];
  globalStrategy: GlobalResolutionStrategy;
  summary: {
    idConflicts: number;
    codeConflicts: number;
    bothConflicts: number;
    intraFileIdDuplicates: number;
    intraFileCodeDuplicates: number;
    existingDataIdConflicts: number;
    existingDataCodeConflicts: number;
  };
}
```

## Error Handling

The system includes comprehensive error handling:

- **API Failures**: Graceful handling of API errors with meaningful messages
- **Network Issues**: Proper error propagation for network problems
- **Invalid Data**: Validation and error reporting for malformed data
- **Edge Cases**: Handling of empty arrays, null values, and edge cases

```typescript
try {
  const result = await detectConflicts(subjectsToImport);
  // Handle success
} catch (error) {
  console.error('Conflict detection failed:', error.message);
  // Handle error appropriately
}
```

## Performance Considerations

- **Case-insensitive matching**: Uses `.toLowerCase().trim()` for normalization
- **Efficient lookups**: Uses `Map` data structures for O(1) conflict detection
- **Memory efficiency**: Processes data in single pass where possible
- **Batch operations**: Handles large datasets efficiently

## Testing

Comprehensive test suite covers:

- ✅ **Intra-file duplicate detection** (ID and code)
- ✅ **Existing data conflict detection** (ID and code)  
- ✅ **Case sensitivity handling**
- ✅ **Resolution strategy application**
- ✅ **Error scenarios and edge cases**
- ✅ **Report formatting**
- ✅ **API integration**

Run tests:
```bash
npm test app/lib/import/__tests__/conflictDetection.test.ts
```

## Integration Points

### With Import Pipeline

```typescript
// In your import workflow
import { detectConflicts, applyResolutionStrategy } from './conflictDetection';

async function importSubjects(fileData: any[]) {
  // 1. Parse and validate subjects
  const subjects = await parseAndValidateSubjects(fileData);
  
  // 2. Detect conflicts
  const conflicts = await detectConflicts(subjects);
  
  // 3. Apply resolution strategy
  const resolution = applyResolutionStrategy(conflicts.conflictReports, strategy);
  
  // 4. Import only resolved subjects
  await saveSubjects(resolution.toImport);
  
  return {
    imported: resolution.toImport.length,
    skipped: resolution.toSkip.length,
    conflicts: conflicts.conflictingRows
  };
}
```

### With UI Components

```typescript
// Generate user-friendly conflict summary
import { generateConflictSummary } from './examples/conflictDetection-example';

const summary = generateConflictSummary(conflictResult);

// Display in UI
if (summary.severity === 'error') {
  showError(summary.message, summary.details);
} else if (summary.severity === 'warning') {
  showWarning(summary.message, summary.details);
} else {
  showSuccess(summary.message);
}
```

## Configuration

### Default Global Strategy

```typescript
const defaultStrategy: GlobalResolutionStrategy = {
  duplicateIdStrategy: 'overwrite',  // Newer data overwrites by ID
  duplicateCodeStrategy: 'skip',     // Preserve existing by code
  applyToAll: false                  // Allow per-row decisions
};
```

### Custom Business Rules

```typescript
// Example: University-specific rules
const universityStrategy: GlobalResolutionStrategy = {
  duplicateIdStrategy: 'overwrite',  // System-generated IDs can be overwritten
  duplicateCodeStrategy: 'skip',     // Course codes are authoritative
  applyToAll: true                   // Enforce consistent policy
};
```

## Future Enhancements

### Planned Features

- [ ] **Automatic ID generation** for duplicate ID conflicts with `rename` strategy
- [ ] **Merge conflict resolution** for combining subject data
- [ ] **Audit trail** for conflict resolution decisions
- [ ] **Batch conflict resolution** UI components
- [ ] **Custom conflict rules** engine
- [ ] **Preview mode** for conflict resolution
- [ ] **Rollback functionality** for imports

### Extension Points

- **Custom matchers**: Add domain-specific conflict detection rules
- **Resolution plugins**: Implement custom resolution strategies
- **Notification system**: Hook into conflict detection events
- **Reporting system**: Generate detailed conflict analysis reports

## Troubleshooting

### Common Issues

1. **API Connection Failures**
   ```typescript
   Error: Failed to fetch existing subjects: 500 Internal Server Error
   ```
   - Check API endpoint availability
   - Verify network connectivity
   - Review server logs

2. **Memory Issues with Large Datasets**
   ```typescript
   Error: JavaScript heap out of memory
   ```
   - Process data in smaller batches
   - Use streaming for very large files
   - Optimize data structures

3. **Performance Issues**
   ```typescript
   // For large datasets (>10k subjects), consider batching
   const BATCH_SIZE = 1000;
   for (let i = 0; i < subjects.length; i += BATCH_SIZE) {
     const batch = subjects.slice(i, i + BATCH_SIZE);
     const batchResult = await detectConflicts(batch, existingSubjects);
     // Process batch result
   }
   ```

### Debug Mode

Enable detailed logging:

```typescript
// Add to your environment or config
process.env.DEBUG_CONFLICTS = 'true';

// In conflict detection code
if (process.env.DEBUG_CONFLICTS) {
  console.log('Conflict detection debug info:', {
    subjectsCount: subjectsToImport.length,
    existingCount: existingSubjects.length,
    // ... other debug info
  });
}
```

## Contributing

When extending this system:

1. **Add comprehensive tests** for new functionality
2. **Update type definitions** for TypeScript safety
3. **Document new features** in this README
4. **Follow existing patterns** for consistency
5. **Handle edge cases** appropriately
6. **Consider performance** impact of changes

## License

This conflict detection system is part of the Timetable Agent application and follows the same license terms.
