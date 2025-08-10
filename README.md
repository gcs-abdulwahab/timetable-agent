This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## How to Drag & Drop (Developer Notes)

This timetable application implements a robust drag and drop system for moving scheduled entries between time slots. Here's what developers need to know:

### Drag & Drop Architecture

- **Implementation**: HTML5 native drag-and-drop API (not dnd-kit)
- **Utilities**: Centralized helpers in `utils/dnd.ts` for consistent ID management
- **Constraints**: Entries can only be moved within the same department row
- **Validation**: Real-time conflict detection for teacher and room scheduling

### ID Schema Convention

The system uses a 3-part ID convention for drag operations:

```
groupKey|departmentId|timeSlotId
```

**Why 3 parts?**
- `groupKey`: Identifies related entries (same subject + teacher) that move together
- `departmentId`: Enforces same-department constraint to prevent cross-department moves
- `timeSlotId`: Tracks current time slot for conflict detection and change validation

**Example**: `math-101-teacher-001|dept-cs|slot-09-00`

### Key Features

1. **Visual Feedback**: Custom drag overlay shows what's being moved
2. **Conflict Prevention**: Real-time validation prevents teacher/room double-booking
3. **Same-Department Constraint**: Entries cannot be moved across department boundaries
4. **Batch Operations**: Multiple day entries for the same subject/teacher move together
5. **Provisional Preview**: Shows destination feedback during drag operations

### Developer Usage

```typescript
import { buildDragId, parseDragId, createGroupKey } from '../utils/dnd';

// Create a consistent drag ID
const dragId = buildDragId(groupKey, departmentId, timeSlotId);

// Parse a drag ID back into components
const parts = parseDragId(dragId);
if (parts) {
  const { groupKey, departmentId, timeSlotId } = parts;
}

// Generate consistent group keys
const groupKey = createGroupKey(subjectId, teacherId);
```

See `utils/dnd.ts` for complete API documentation and defensive programming patterns.

## Bulk Import System

The timetable application includes a comprehensive bulk import system for subjects. Here's how to use it:

### Supported File Types

- **CSV files** (`.csv`) - Comma-separated values with header row
- **Excel files** (`.xlsx`, `.xls`) - First worksheet is used
- **JSON files** (`.json`) - Array of subject objects

### Quick Start Guide

1. **Access Import**: Navigate to Department Courses page and click "Bulk Import"
2. **Choose File**: Select your CSV, Excel, or JSON file (max 10MB)
3. **Preview**: Review the parsed data and field mapping
4. **Resolve Conflicts**: Handle any duplicate IDs or codes
5. **Import**: Execute the import with your chosen conflict resolution strategy

### File Format Requirements

#### Required Fields
- `name` - Subject name (max 200 chars)
- `shortName` - Short name/abbreviation (max 50 chars)
- `code` - Subject code (max 20 chars)
- `creditHours` - Credit hours (1-10)
- `departmentId` - Department ID

#### Optional Fields
- `id` - Auto-generated if not provided
- `color` - Auto-assigned if not provided (Tailwind classes or hex)
- `semesterLevel` - Inferred from semesterId if not provided (1-8)
- `semesterId` - Format: 'sem1', 'sem2', ..., 'sem8'
- `isCore` - Boolean (default: true)
- `isMajor` - Boolean (default: true)

### Example CSV Format

```csv
name,shortName,code,creditHours,departmentId,semesterLevel,isCore
Calculus I,Calc 1,MATH101,4,dept-math,1,true
Physics I,Phys 1,PHYS101,3,dept-physics,1,true
Programming,Prog,CS101,4,dept-cs,1,true
```

### Example JSON Format

```json
[
  {
    "name": "Calculus I",
    "shortName": "Calc 1",
    "code": "MATH101",
    "creditHours": 4,
    "departmentId": "dept-math",
    "semesterLevel": 1,
    "isCore": true
  }
]
```

### Conflict Resolution Strategies

**When importing subjects with duplicate IDs or codes:**

- **Overwrite**: Replace existing data with imported data
- **Skip**: Keep existing data, ignore import
- **User Decision**: Review each conflict individually

**Default Behavior:**
- Duplicate ID → Overwrite (assumes update intent)
- Duplicate Code → Skip (preserves existing subjects)
- Both conflicts → User Decision required

### Performance Guidelines

- **Recommended**: Under 5,000 subjects per file
- **Maximum**: 10,000 subjects per file
- **File size limit**: 10MB
- Large files may cause browser performance issues

### Environment Notes

#### Windows Compatibility
- All file paths use Node.js `path.join()` for cross-platform compatibility
- Safe atomic write operations with temporary files
- Automatic backup creation with timestamps
- Data directory: `./data/` relative to project root

#### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (including import system)
npm test

# Build for production
npm run build
```

#### Production Environment
- Ensure `data/` directory is writable
- File system permissions for backup creation
- Consider disk space for backup files
- Monitor memory usage with large imports

#### Error Handling
- Comprehensive validation with detailed error messages
- Automatic rollback on import failures
- Backup files preserved for recovery
- User-friendly error feedback in UI

### Troubleshooting

**Import fails with "Invalid file format":**
- Check file extension matches content type
- Ensure CSV has proper headers
- Validate JSON array structure

**Memory issues with large files:**
- Split files into smaller chunks
- Use streaming for very large datasets
- Consider server-side processing for enterprise use

**Validation errors:**
- Check required fields are present
- Verify data types (numbers, booleans)
- Ensure department IDs exist in system

For technical details, see the import system documentation in `app/lib/import/README.md`.
