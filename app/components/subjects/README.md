# BulkImportDialog Component

A comprehensive multi-step dialog component for bulk importing subjects with advanced conflict resolution and validation features.

## Features

### Step 1: Upload and Settings
- **File Input**: Accepts .csv, .xlsx, .json files with drag-and-drop support
- **Semester Selector**: Populated from `/api/semesters` endpoint
- **Import Settings**:
  - Assign selected semester to all subjects toggle
  - Auto-generate missing IDs toggle
  - Default conflict strategy selector (Skip, Overwrite, Keep Both)
  - Optional department override selector

### Step 2: Preview and Resolve
- **Data Preview**: Table showing imported subjects with validation states
- **Statistics**: Count of valid, invalid, and duplicate subjects
- **Conflict Resolution**:
  - Individual row-level conflict resolution dropdowns
  - Bulk actions to apply resolution to all conflicts
  - Conflict badges (duplicate, partial match)
- **Row Selection**: Checkbox controls for including/excluding subjects
- **Validation Errors**: Detailed error messages for invalid subjects

### Step 3: Import Progress
- **Multi-stage Progress**: Visual progress through parsing, validation, conflict detection, merging, saving
- **Real-time Updates**: Progress bar and stage indicators
- **Disabled Controls**: All UI controls disabled during import

### Step 4: Results
- **Summary Statistics**: Added, updated, skipped, failed counts in colored cards
- **Detailed Results**: Expandable list showing per-subject outcomes with reasons
- **Export Reports**: Download JSON and CSV reports of import results
- **Complete Action**: Finalizes import and closes dialog

## Usage

```tsx
import BulkImportDialog from '@/components/subjects/BulkImportDialog';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleImportComplete = (results) => {
    console.log('Import results:', results);
    // Handle results - refresh data, show notifications, etc.
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Bulk Import
      </button>
      
      <BulkImportDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </>
  );
}
```

## Props

- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Called when dialog should close
- `onImportComplete: (results: ImportResult[]) => void` - Called when import finishes

## Data Types

```typescript
interface ImportedSubject {
  id: string;
  name: string;
  shortName: string;
  code: string;
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number;
  isCore: boolean;
  validationState: 'valid' | 'invalid' | 'warning';
  validationErrors: string[];
  conflictState: 'none' | 'duplicate' | 'partial_match';
  conflictResolution?: 'skip' | 'overwrite' | 'keep_both';
  includeInImport: boolean;
}

interface ImportResult {
  subject: ImportedSubject;
  status: 'added' | 'updated' | 'skipped' | 'failed';
  reason: string;
}
```

## Dependencies

- Radix UI Dialog components
- Lucide React icons
- Custom UI components (Button, Input, Label, Select, Checkbox, Badge)
- Tailwind CSS for styling

## API Requirements

- `GET /api/semesters` - Returns list of available semesters

## File Format Support

The component accepts three file formats:
- **CSV**: Comma-separated values
- **XLSX**: Excel spreadsheet
- **JSON**: JavaScript Object Notation

Expected columns/fields:
- `name` (required)
- `shortName` (required)  
- `code` (required)
- `creditHours` (required, number)
- `departmentId` (required)
- `semesterLevel` (required, 1-8)
- `isCore` (boolean)
- `color` (hex color code)

## Validation Rules

- Subject ID: Auto-generated if missing and option enabled
- Name: Required, non-empty string
- Short Name: Required, non-empty string
- Code: Required, unique identifier
- Credit Hours: Required, positive number
- Department ID: Required, must exist in system
- Semester Level: Required, 1-8 for BS programs

## Conflict Detection

- **Duplicate**: Subject with same code already exists
- **Partial Match**: Similar subject found (name similarity)

## Import Stages

1. **Parsing**: File content extraction and initial processing
2. **Validation**: Data validation against business rules
3. **Conflict Detection**: Check for duplicates and conflicts
4. **Merging**: Apply conflict resolutions and prepare data
5. **Saving**: Persist to database

## Customization

The component can be extended to:
- Support additional file formats
- Add custom validation rules
- Implement different conflict detection strategies
- Customize the UI theme and styling
- Add more detailed progress reporting
