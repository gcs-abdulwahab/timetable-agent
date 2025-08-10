# Timetable Validation System

This document describes the automated validation system for the timetable scheduling application.

## Overview

The validation system ensures data integrity and prevents scheduling conflicts by automatically checking:

1. **Room/Teacher Conflicts** - No double-booking of rooms or teachers
2. **Day Patterns** - Valid days of the week
3. **Period Ranges** - Valid time periods
4. **Room Mapping** - Consistency between room names and IDs
5. **Data Integrity** - Valid references between data files
6. **Structure Consistency** - Snapshot testing for data format

## Components

### 1. Validation Script (`scripts/validate-timetable.js`)

The main validation script that checks all constraints:

```bash
# Run validation manually
npm run validate

# Run validation with detailed output
node scripts/validate-timetable.js
```

**Features:**
- Room conflict detection
- Teacher conflict detection
- Day and period validation
- Chemistry department period restrictions (periods 3-6 only)
- Room-name to ID mapping verification
- Data integrity checks
- Required field validation

### 2. Snapshot Tests (`__tests__/allocations-snapshot.test.js`)

Jest-based snapshot tests that guard against unintentional changes to the allocations.json structure:

```bash
# Run snapshot tests
npm run test:snapshot

# Update snapshots (when structure changes are intentional)
npm test -- --updateSnapshot __tests__/allocations-snapshot.test.js
```

**Tests:**
- Data structure consistency
- Required field presence
- Unique ID validation
- Valid days and time slots
- Field type consistency
- Sort order determinism
- Data distribution summaries

### 3. CI/CD Integration (`.github/workflows/validate-timetable.yml`)

GitHub Actions workflow that automatically runs validation on:
- Push to main/develop branches
- Pull requests to main/develop branches
- Changes to data/, scripts/, or __tests__ directories

**Jobs:**
- `validate` - Runs validation script and snapshot tests
- `lint-data` - Validates JSON format and file encoding

## Validation Rules

### Room Conflicts
- No two classes can be scheduled in the same room at the same time
- Checks room + day + time slot combinations

### Teacher Conflicts
- No teacher can teach multiple classes at the same time
- Checks teacher + day + time slot combinations

### Day Patterns
- Allowed days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
- Invalid days will cause validation failure

### Period Ranges
- Allowed periods: 1-7 (corresponding to time slots ts1-ts7)
- Chemistry department restriction: periods 3-6 only

### Room Mapping
- All rooms used in allocations should exist in rooms.json
- Case-insensitive mapping
- Warnings for unmapped rooms (not errors)

### Data Integrity
- All teacher IDs must exist in teachers.json
- All subject IDs must exist in subjects.json
- All time slot IDs must exist in timeslots.json
- All allocation IDs must be unique
- All required fields must be present

## Running Validations

### Local Development

```bash
# Run full validation suite
npm run test:validation

# Run only the validation script
npm run validate

# Run only snapshot tests
npm run test:snapshot

# Run all tests
npm test
```

### CI/CD

Validation runs automatically on GitHub Actions for:
- All pushes to main/develop branches
- All pull requests targeting main/develop branches
- Only when relevant files change (data/, scripts/, __tests__)

### Validation Output

Successful validation:
```
🚀 Starting timetable validation...

🔍 Checking room conflicts...
   Found 0 room conflicts
🔍 Checking teacher conflicts...
   Found 0 teacher conflicts
🔍 Checking day patterns and period ranges...
   Found 0 invalid days, 0 invalid periods, 0 chemistry violations
🔍 Checking room-name→ID mapping coverage...
   Room mapping coverage: 85.0% (17/20)
🔍 Checking data integrity...
   Found 0 duplicate IDs, 0 missing teachers, 0 missing subjects, 0 missing timeslots
🔍 Checking required fields...
   Found 0 missing required fields

📊 VALIDATION SUMMARY
====================
Status: ✅ PASS
Total Allocations: 96
Unique Rooms: 17
Unique Teachers: 3
Total Conflicts: 0
Errors: 0
Warnings: 3

🎉 All validations passed!
```

Failed validation example:
```
❌ ERRORS:
1. Room conflict: Room "R-39" on Monday at ts2 has multiple bookings: edited-16 (cs301), edited-20 (math101)
2. Teacher conflict: Dr. Smith (t3) on Monday at ts2 has multiple classes: edited-16 (cs301) in R-39, edited-21 (phys101) in R-44

💥 Validation failed with 2 error(s)
```

## Customization

### Adding New Validation Rules

To add new validation rules, modify `scripts/validate-timetable.js`:

1. Create a new validation function
2. Call it from `runValidation()`
3. Use `addError()` for failures and `addWarning()` for soft issues

Example:
```javascript
function validateCustomRule() {
  console.log('🔍 Checking custom rule...');
  
  allocations.forEach(allocation => {
    if (/* your condition */) {
      addError(`Custom rule violation: ${allocation.id}`);
    }
  });
}
```

### Updating Constraints

Common constraint updates:

```javascript
// Allow new days
const ALLOWED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Change chemistry restrictions
const CHEMISTRY_ALLOWED_PERIODS = [2, 3, 4, 5, 6];

// Add department-specific period restrictions
const DEPARTMENT_RESTRICTIONS = {
  'd2': [3, 4, 5, 6], // Chemistry
  'd6': [1, 2, 3, 4], // Computer Science
};
```

### Updating Snapshot Tests

When data structure changes are intentional:

```bash
# Update snapshots
npm test -- --updateSnapshot __tests__/allocations-snapshot.test.js

# Or update all snapshots
npm test -- --updateSnapshot
```

## Troubleshooting

### Common Issues

1. **BOM in JSON files**: Remove byte order marks from JSON files
2. **Invalid JSON**: Use `python -m json.tool file.json` to check JSON validity
3. **Missing references**: Ensure all IDs reference existing entities
4. **Snapshot mismatches**: Review changes and update snapshots if intentional

### Debugging

Enable verbose output:
```bash
# Run with debug info
DEBUG=1 node scripts/validate-timetable.js

# Check specific validation step
node -e "const {runValidation} = require('./scripts/validate-timetable.js'); runValidation();"
```

## Best Practices

1. **Run validation locally** before committing changes
2. **Update snapshots intentionally** only when data structure changes
3. **Fix conflicts immediately** - don't let them accumulate
4. **Monitor warnings** - they often indicate data quality issues
5. **Keep validation rules updated** as requirements change
6. **Document constraint changes** in commit messages
