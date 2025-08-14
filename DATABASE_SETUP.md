# Database Setup Documentation

## Overview
This document describes the database setup for the timetable system with 6 active days and complete data for departments, teachers, subjects, and related entities.

## What Was Created

### 1. Database Schema (Prisma)
- **Database**: SQLite (`dev.db`)
- **Models**: Department, Teacher, Subject, Room, TimeSlot, Semester, TimetableEntry

### 2. Data Files Created
```
data/
├── days.json          - 6 active days (Monday-Saturday)
├── departments.json   - 5 departments (CS, Chemistry, Math, Physics, English)
├── teachers.json      - 12 teachers across all departments
├── subjects.json      - 12 subjects from different departments
├── rooms.json         - 8 rooms (labs, lecture halls, classrooms)
├── semesters.json     - 6 semesters (with Semester 5 active)
└── timeslots.json     - 6 time slots (8:00-13:50, periods 1-6)
```

### 3. Scripts Created
```
scripts/
├── seed-database.js      - Seeds all data into the database
├── test-data-fetch.js    - Tests data retrieval functionality
└── (existing scripts remain unchanged)
```

### 4. Utilities Created
```
app/lib/
└── data-fetcher.ts      - TypeScript utility for data fetching
```

## Database Entities

### Active Days (6 days)
- **Monday** through **Saturday** (08:00-14:00 working hours)
- All days marked as `isActive: true`
- Sunday is not included (only 6 active days as requested)

### Departments (5 departments)
1. **Computer Science** (d1) - CS
2. **Chemistry** (d2) - CHEM  
3. **Mathematics** (d3) - MATH
4. **Physics** (d4) - PHY
5. **English** (d5) - ENG

### Teachers (12 teachers)
- 3 teachers in Computer Science
- 3 teachers in Chemistry
- 2 teachers in Mathematics
- 2 teachers in Physics
- 2 teachers in English
- All with proper designations (Professor, Associate Professor, Assistant Professor)

### Subjects (12 subjects)
- **CS**: Data Structures, Database Systems, Software Engineering, Computer Networks
- **Chemistry**: Organic Chemistry I, Physical Chemistry, Analytical Chemistry
- **Math**: Linear Algebra, Calculus III
- **Physics**: Quantum Physics, Electromagnetic Theory
- **English**: Technical Writing

### Rooms (8 rooms)
- 2 Computer Science Labs
- 2 Chemistry Labs
- 1 Physics Lab
- 2 Lecture Halls (general use)
- 1 General Classroom

### Time Slots (6 periods)
- Period 1: 08:00-08:50
- Period 2: 09:00-09:50
- Period 3: 10:00-10:50
- Period 4: 11:00-11:50
- Period 5: 12:00-12:50
- Period 6: 13:00-13:50

### Semesters (6 semesters)
- Semesters 1-6 spanning 2024-2027
- **Semester 5** is currently active
- Mix of Fall and Spring terms

## How to Use

### 1. Database Migration (if needed)
```bash
npx prisma migrate dev --name init
```

### 2. Seed the Database
```bash
node scripts/seed-database.js
```

### 3. Test Data Fetching
```bash
node scripts/test-data-fetch.js
```

### 4. Using Data in Code
```typescript
import { 
  getDepartments, 
  getTeachers, 
  getSubjects, 
  getActiveDays 
} from './app/lib/data-fetcher';

// Fetch from database
const departments = await getDepartments();
const teachers = await getTeachers();
const subjects = await getSubjects();

// Fetch from files
const activeDays = getActiveDays(); // Returns 6 active days
```

## Data Integrity

### ✅ Validated
- All teachers have valid department IDs
- All subjects have valid department IDs  
- Exactly 6 active days available
- Exactly 6 time slots (periods 1-6)
- One active semester exists
- All relationships are properly maintained

### Key Features
- **6 Active Days**: Monday through Saturday with 8:00-14:00 working hours
- **Complete Department Structure**: 5 departments with proper hierarchy
- **Qualified Teachers**: 12 teachers with proper designations
- **Diverse Subjects**: 12 subjects across all departments
- **Adequate Facilities**: 8 rooms of various types
- **Structured Schedule**: 6 time periods for optimal scheduling

## Next Steps

The system is now ready for:
1. **Timetable Generation**: Use the seeded data to create timetable entries
2. **Schedule Validation**: Validate timetables against available resources
3. **Conflict Detection**: Check for room and teacher conflicts
4. **UI Integration**: Display data in the frontend components

## Files Modified/Created

### New Files
- `data/days.json`
- `data/departments.json` 
- `data/teachers.json`
- `data/subjects.json`
- `data/rooms.json`
- `data/semesters.json`
- `data/timeslots.json`
- `scripts/seed-database.js`
- `scripts/test-data-fetch.js`
- `app/lib/data-fetcher.ts`

### Database
- `dev.db` (SQLite database)
- Prisma migration applied

All data is now available and can be fetched reliably through the provided utilities!
