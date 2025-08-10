# Allocation Persistence System

This directory contains the JSON-only persistence system for timetable allocations, implemented as requested in Step 10 of the project plan.

## Features

✅ **Backup Creation**: Automatic timestamped backups before any changes  
✅ **Duplicate Detection**: Removes duplicate allocations based on ID  
✅ **Proper Sorting**: Sort by department → room → day → period  
✅ **JSON-Only**: No browser localStorage dependencies  
✅ **Validation**: Ensures all required fields are present  
✅ **Merge/Replace Modes**: Support for both appending and replacing data  

## Files

- `persist-allocations.js` - Main persistence script and class
- `example-usage.js` - Usage examples
- `README-persistence.md` - This documentation

## Usage

### Command Line Interface

```bash
# Reprocess existing allocations with proper sorting
node scripts/persist-allocations.js

# Replace all allocations (when you have validated data)
node scripts/persist-allocations.js --replace

# Show help
node scripts/persist-allocations.js --help
```

### Programmatic Usage

```javascript
const AllocationPersistence = require('./scripts/persist-allocations');

const persistence = new AllocationPersistence();

// Add new allocations (merge mode)
const newAllocations = [
    {
        "id": "new-allocation-1",
        "subjectId": "cs101",
        "teacherId": "t1",
        "timeSlotId": "ts2", 
        "day": "Monday",
        "room": "R-201",
        "semesterId": "sem1"
    }
];

const result = persistence.persistAllocations(newAllocations, false);
console.log(`Saved ${result.total} allocations for departments: ${result.departments.join(', ')}`);
```

## Data Sorting Logic

The system sorts allocations by:

1. **Department Name** (alphabetically)
2. **Room** (alphabetically, with "ZZ_Unassigned" for missing rooms)
3. **Day** (Monday → Tuesday → Wednesday → Thursday → Friday → Saturday → Sunday)
4. **Period** (1 → 2 → 3 → 4 → 5 → 6 → 7)

## Backup System

- Backups are created automatically before any changes
- Format: `allocations.backup.YYYYMMDDTHHMMSS.json`
- Located in the `data/` directory alongside the main file

## Validation

All allocations must have these required fields:
- `id` - Unique identifier
- `subjectId` - Reference to subject
- `teacherId` - Reference to teacher  
- `timeSlotId` - Reference to time slot
- `day` - Day of the week
- `semesterId` - Reference to semester

Optional fields:
- `room` - Room assignment

## Error Handling

The system handles:
- Missing subject/department references (warns but continues)
- BOM characters in JSON files
- Invalid allocation structures (throws error)
- Duplicate IDs (removes duplicates with warning)

## Integration Notes

This persistence system is designed to:

- Work independently of browser storage
- Handle data from various sources (manual input, imports, API responses)
- Maintain data integrity through validation and deduplication
- Provide consistent, readable output through proper sorting
- Allow for both incremental updates and full replacements

The system follows the project's rule to avoid browser localStorage and use JSON files for all data persistence.
