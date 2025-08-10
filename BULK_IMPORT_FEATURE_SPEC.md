# Bulk Import Feature Specification
## Step 1: Scope, Acceptance Criteria, and UX Entry Point

### Feature Overview
The Bulk Import feature enables administrators to import multiple subject records from external files (CSV, Excel xlsx, JSON) into the subject management system. This feature integrates seamlessly into the existing subject management interface following established Radix UI and Tailwind styling patterns.

---

## 1. Feature Scope

### 1.1 Integration Point
- **Location**: Subject Management Interface (`/manage-departments?tab=subjects`)
- **UI Pattern**: Follows existing modal-based workflows using Radix UI components
- **Styling**: Consistent with current Tailwind CSS design system
- **Entry Point**: New "Bulk Import" button positioned alongside existing "Add Subject" button

### 1.2 Supported File Formats
- **CSV Files** (`.csv`): Comma-separated values with header row
- **Excel Files** (`.xlsx`): Microsoft Excel format with first sheet data
- **JSON Files** (`.json`): Structured JSON array of subject objects

### 1.3 Import Process Flow
```
File Upload → Format Validation → Data Parsing → Preview Grid → 
Conflict Detection → Resolution Options → Import Execution → 
Progress Tracking → Result Report
```

---

## 2. Acceptance Criteria

### 2.1 File Upload & Validation
**AC-1.1**: System accepts CSV, Excel (.xlsx), and JSON file uploads
**AC-1.2**: File size limit of 10MB maximum
**AC-1.3**: Format validation with clear error messages for unsupported formats
**AC-1.4**: Content validation to ensure required columns/fields are present

### 2.2 Semester Selection & Assignment
**AC-2.1**: Admin selects target semester from dropdown (current active semesters)
**AC-2.2**: Option to "Force assign semester" - applies selected semester to all rows
**AC-2.3**: Option to "Respect per-row semester" - honors semesterId field when present
**AC-2.4**: Clear indication of which option is selected and its impact

### 2.3 Preview Grid with Validation
**AC-3.1**: Data displays in scrollable grid format with all columns visible
**AC-3.2**: Row-level validation indicators:
   - ✅ Green: Valid, ready to import
   - ⚠️ Yellow: Warnings (e.g., missing optional fields)
   - ❌ Red: Errors (e.g., invalid data, missing required fields)
**AC-3.3**: Conflict indicators for duplicate subjects (same code + department + semester)
**AC-3.4**: Summary statistics showing total rows, valid, warnings, errors
**AC-3.5**: Ability to exclude specific rows from import

### 2.4 Conflict Resolution Options
**AC-4.1**: **Skip Conflicting Rows** - Don't import rows that would create duplicates
**AC-4.2**: **Overwrite by ID** - Replace existing subjects with matching IDs
**AC-4.3**: **Overwrite by Code** - Replace subjects with matching code+department+semester
**AC-4.4**: **Keep Both (Generate New IDs)** - Import as new subjects with system-generated IDs
**AC-4.5**: Clear explanation of each option's impact with counts

### 2.5 Import Progress & Results
**AC-5.1**: Real-time progress indicator during import process
**AC-5.2**: Detailed result report showing:
   - Total processed: X records
   - Successfully imported: X records  
   - Skipped (conflicts): X records
   - Failed (errors): X records
   - Updated (overwrites): X records
**AC-5.3**: Per-row status with specific success/failure reasons
**AC-5.4**: Option to download detailed import report as CSV
**AC-5.5**: Success/failure notifications using existing toast/alert system

---

## 3. UX Entry Point & Navigation

### 3.1 Button Placement
- **Location**: Subject Management tab, filter controls section
- **Position**: Right side of filter controls, alongside "Add Subject" button
- **Styling**: Consistent with existing button design using Tailwind classes
- **Icon**: 📥 Upload icon to indicate import functionality

### 3.2 Button Specifications
```tsx
<button
  onClick={() => setShowBulkImportModal(true)}
  disabled={selectedSubjectDepartment === 'all'}
  className={`px-4 py-2 rounded font-medium transition-colors ${
    selectedSubjectDepartment === 'all'
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-indigo-600 text-white hover:bg-indigo-700'
  }`}
  title={selectedSubjectDepartment === 'all' 
    ? 'Please select a specific department for bulk import'
    : 'Import multiple subjects from CSV, Excel, or JSON file'
  }
>
  📥 Bulk Import
</button>
```

### 3.3 Modal Design Pattern
- **Component**: `<BulkImportModal />` using existing Radix UI Dialog components
- **Size**: Large modal (`max-w-6xl`) to accommodate preview grid
- **Structure**: Multi-step wizard interface with clear progress indication
- **Responsiveness**: Mobile-friendly with collapsible columns on small screens

---

## 4. Technical Requirements

### 4.1 Data Model Compatibility
Must work with existing Subject interface:
```typescript
interface Subject {
  id: string;
  name: string;
  shortName: string;
  code: string;
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number;
  isCore: boolean;
  isMajor: boolean;
  teachingDepartmentIds: string[];
}
```

### 4.2 File Format Specifications

#### CSV Format Requirements:
```csv
name,shortName,code,creditHours,departmentId,semesterLevel,isCore,isMajor,teachingDepartmentIds,color
"Database Systems","DB Systems","CS-301",3,"d6",5,true,true,"d6","#3B82F6"
```

#### JSON Format Requirements:
```json
[
  {
    "name": "Database Systems",
    "shortName": "DB Systems", 
    "code": "CS-301",
    "creditHours": 3,
    "departmentId": "d6",
    "semesterLevel": 5,
    "isCore": true,
    "isMajor": true,
    "teachingDepartmentIds": ["d6"],
    "color": "#3B82F6"
  }
]
```

### 4.3 Validation Rules
- **Required Fields**: name, code, creditHours, departmentId, semesterLevel
- **Optional Fields**: shortName, color, isCore, isMajor, teachingDepartmentIds
- **Data Types**: Proper validation for numbers, booleans, arrays
- **Business Rules**: Valid department IDs, semester levels 1-8, positive credit hours

### 4.4 Error Handling
- **File Upload Errors**: Size limits, format validation, read errors
- **Data Parsing Errors**: Invalid JSON, malformed CSV, Excel read issues
- **Validation Errors**: Missing fields, invalid data types, business rule violations
- **Import Errors**: Database constraints, duplicate keys, reference integrity

---

## 5. Implementation Architecture

### 5.1 Component Structure
```
BulkImportModal/
├── BulkImportWizard.tsx          # Main wizard container
├── components/
│   ├── FileUploadStep.tsx        # Step 1: File selection & upload
│   ├── SemesterSelectionStep.tsx # Step 2: Semester configuration  
│   ├── PreviewGridStep.tsx       # Step 3: Data preview & validation
│   ├── ConflictResolutionStep.tsx# Step 4: Conflict handling options
│   ├── ImportProgressStep.tsx    # Step 5: Progress tracking
│   └── ResultsStep.tsx           # Step 6: Import results & report
├── utils/
│   ├── fileProcessors.ts         # CSV, Excel, JSON parsers
│   ├── validators.ts             # Data validation logic
│   ├── conflictDetector.ts       # Duplicate detection
│   └── importEngine.ts           # Batch import processing
└── types/
    └── bulkImport.types.ts       # TypeScript interfaces
```

### 5.2 State Management
```typescript
interface BulkImportState {
  currentStep: number;
  uploadedFile: File | null;
  parsedData: ParsedSubject[];
  targetSemester: string;
  semesterAssignmentMode: 'force' | 'respect';
  validationResults: ValidationResult[];
  conflicts: ConflictInfo[];
  resolutionMode: 'skip' | 'overwrite-id' | 'overwrite-code' | 'keep-both';
  excludedRows: Set<number>;
  importProgress: ImportProgress;
  importResults: ImportResults;
}
```

---

## 6. User Experience Flow

### 6.1 Step-by-Step Workflow

#### Step 1: File Upload
1. User clicks "Bulk Import" button in Subject Management
2. Modal opens with file upload interface
3. User selects CSV, Excel, or JSON file
4. System validates file format and size
5. File uploads and parsing begins

#### Step 2: Semester Configuration
1. Dropdown shows available active semesters
2. User selects target semester
3. Radio buttons for assignment mode:
   - "Force assign to all rows" (default)
   - "Respect per-row semester when present"
4. Clear explanation of each option's impact

#### Step 3: Data Preview & Validation
1. Grid displays all parsed data with validation status
2. Filtering options to show only errors, warnings, or all
3. Row selection to exclude specific entries
4. Summary panel shows counts and statistics
5. Continue button disabled if critical errors exist

#### Step 4: Conflict Resolution
1. List of detected conflicts with details
2. Resolution options with impact preview
3. Ability to review conflicts before proceeding
4. Clear indication of which subjects will be affected

#### Step 5: Import Progress
1. Progress bar with percentage complete
2. Real-time status updates
3. Option to cancel import (with rollback)
4. Estimated time remaining

#### Step 6: Results & Report
1. Summary of import results with colored statistics
2. Detailed per-row status list
3. Option to download comprehensive report
4. "Import Another File" and "Close" buttons

### 6.2 Error States & Recovery
- **Invalid File Format**: Clear message with supported formats list
- **Parse Errors**: Specific line/field error identification
- **Validation Failures**: Inline error indicators with helpful messages
- **Import Failures**: Partial success handling with rollback options

---

## 7. Performance Requirements

### 7.1 File Processing
- **Large Files**: Streaming processing for files >1MB
- **Batch Size**: Process imports in batches of 100 records
- **Memory Management**: Efficient parsing to prevent browser crashes
- **Progress Updates**: UI updates every 10% of progress

### 7.2 User Experience
- **Responsive UI**: No blocking operations during file processing
- **Cancellation**: Ability to cancel import at any stage
- **Error Recovery**: Graceful handling of network/server errors
- **Progress Feedback**: Clear indication of processing status

---

## 8. Security & Validation

### 8.1 File Security
- **File Type Validation**: MIME type checking beyond extension
- **Content Scanning**: Basic malware/script injection prevention
- **Size Limits**: 10MB maximum file size
- **Memory Limits**: Prevent excessive memory usage

### 8.2 Data Integrity
- **Transaction Safety**: Rollback capability for failed imports
- **Duplicate Prevention**: Robust conflict detection algorithms
- **Reference Integrity**: Validate department IDs against existing data
- **Audit Logging**: Track import activities for compliance

---

## 9. Testing Strategy

### 9.1 File Format Testing
- ✅ Valid CSV with all required fields
- ✅ Valid Excel with multiple sheets (uses first sheet)
- ✅ Valid JSON with proper structure
- ❌ Invalid formats (PDF, DOCX, etc.)
- ❌ Corrupted files
- ❌ Empty files
- ❌ Files exceeding size limits

### 9.2 Data Validation Testing
- ✅ All required fields present
- ✅ Valid data types for each field
- ✅ Valid department IDs
- ✅ Semester levels within range (1-8)
- ❌ Missing required fields
- ❌ Invalid department references
- ❌ Negative credit hours
- ❌ Invalid semester levels

### 9.3 Conflict Resolution Testing
- Test duplicate subjects by code+department+semester
- Verify skip functionality
- Verify overwrite operations
- Verify new ID generation
- Test mixed conflict resolution scenarios

### 9.4 Import Process Testing
- Large file imports (thousands of records)
- Network interruption recovery
- Server error handling
- Progress tracking accuracy
- Result report completeness

---

## 10. Future Enhancements

### 10.1 Phase 2 Features (Out of Current Scope)
- **Template Download**: Provide CSV/Excel templates for easy data entry
- **Field Mapping**: Custom column mapping for non-standard file formats
- **Bulk Update**: Modify existing subjects in bulk
- **Import History**: Track and review previous imports
- **Scheduled Imports**: Automated imports from external systems
- **Advanced Validation**: Custom validation rules configuration
- **Multi-Department Imports**: Import across multiple departments simultaneously

### 10.2 Integration Opportunities
- **External Systems**: SIS integration for automatic subject sync
- **Backup/Restore**: Include bulk import in system backup procedures
- **API Endpoints**: REST endpoints for programmatic bulk operations
- **Audit Trail**: Enhanced logging and change tracking

---

## Conclusion

This specification defines a comprehensive bulk import feature that seamlessly integrates with the existing subject management interface. The feature follows established design patterns, maintains data integrity, and provides a user-friendly experience for importing large volumes of subject data while handling various edge cases and error scenarios gracefully.

The implementation will enhance administrative efficiency by reducing manual data entry while maintaining the reliability and consistency of the existing system.
