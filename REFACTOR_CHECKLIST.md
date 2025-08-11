# JSON Single Source Refactor Checklist

## Overview
This checklist tracks the refactor to move all data from hardcoded arrays in `app/components/data.ts` to API routes that read and write JSON files in the `data/` directory.

## Branch Created
✅ **Refactor branch**: `refactor/json-single-source` - Created successfully

---

## Acceptance Criteria
1. ❌ No component imports any hardcoded arrays from `app/components/data`
2. ❌ All data is fetched from API routes that read and write JSON files in the data directory  
3. ✅ No use of browser storage (Rule: Do not use browser localstorage)
4. ❌ Existing functionality remains intact

---

## Current Data Structure Analysis

### Files currently importing `app/components/data.ts`:
- ✅ `app/lib/roomUtils.ts` - Only imports `Room` type (line 1)
- ❌ `app/components/SemesterManagementComponent.tsx` (line 5)
- ❌ `app/components/ui/select.tsx` (line 76)  
- ❌ `app/components/room-management/RoomAvailability.tsx` (lines 4, 33)
- ❌ `app/manage-departments/page-backup.tsx` (line 5)
- ❌ `app/components/ui/AddTeacherModal.tsx` (line 4)
- ❌ `app/components/conflictChecker.ts` (line 1)
- ❌ `app/types/subject.ts` (line 7)
- ❌ `app/components/ui/DepartmentSemesterModal.tsx` (line 4)
- ❌ `app/manage-schedule/page.tsx` (line 6)
- ❌ `app/api/rooms/route.ts` (line 4)
- ❌ `app/components/calendarNormalization.ts` (line 4)
- ❌ `app/components/ui/SemesterChipsManager.tsx` (line 4)
- ❌ `app/components/ui/SubjectModal.tsx` (line 4)
- ❌ `app/department-courses/page.tsx` (line 6)
- ❌ `app/api/init-data/route.ts` (line 4)
- ❌ `app/layout.tsx` (line 1)
- ❌ `app/components/timetableUtils.ts` (line 3)
- ❌ `app/components/room-management/AddRoomModal.tsx` (line 4)
- ❌ `app/components/TimetableManager.tsx` (line 9)
- ❌ `app/manage-teachers/page.tsx` (line 6)
- ❌ `app/components/TeacherProfile.tsx` (line 4)
- ❌ `app/components/TimetableNew.test.tsx` (line 5)
- ❌ `app/components/room-management/RoomManagementComponent.tsx` (line 4)
- ❌ `app/manage-departments/page.tsx` (line 8)
- ❌ `app/components/TimetableNew.tsx` (lines 13, 14)
- ❌ `app/components/ui/dialog.tsx` (line 41)
- ❌ `app/lib/dataLoader.ts` (line 1)
- ❌ `app/components/TimetableAdmin.tsx` (line 13)
- ❌ `app/lib/teacherAssignment.ts` (line 1)

**Total files importing from `app/components/data.ts`: 29**

### Hardcoded Arrays in `app/components/data.ts`:
- ❌ `semesters` (lines 88-125) - 4 entries
- ❌ `departments` (lines 127-150) - 20 entries  
- ❌ `teachers` (lines 152-330) - 178 entries
- ❌ `subjects` (lines 332-597) - 266 entries
- ❌ `timeSlots` (lines 599-607) - 7 entries
- ❌ `rooms` (lines 609-680) - 72 entries
- ❌ `timetableEntries` (line 686) - Empty array (already managed via JSON)
- ❌ `daysOfWeek` (line 688) - Simple constant array

### Existing JSON Files in `data/` Directory:
- ✅ `data/departments.json` - Already exists
- ✅ `data/teachers.json` - Already exists  
- ✅ `data/subjects.json` - Already exists
- ✅ `data/semesters.json` - Already exists
- ✅ `data/rooms.json` - Already exists
- ✅ `data/timeslots.json` - Already exists
- ✅ `data/days.json` - Already exists
- ✅ `data/allocations.json` - Already exists (timetable entries)

---

## API Routes to Create/Update

### Data API Routes:
- ❌ `app/api/departments/route.ts` - GET/POST/PUT/DELETE for departments
- ❌ `app/api/teachers/route.ts` - GET/POST/PUT/DELETE for teachers
- ❌ `app/api/subjects/route.ts` - GET/POST/PUT/DELETE for subjects  
- ❌ `app/api/semesters/route.ts` - GET/POST/PUT/DELETE for semesters
- ✅ `app/api/rooms/route.ts` - Already exists (line 4 imports data.ts)
- ❌ `app/api/timeslots/route.ts` - GET/POST/PUT/DELETE for timeslots
- ❌ `app/api/days/route.ts` - GET for days of week

### Existing API Routes to Update:
- ❌ `app/api/rooms/route.ts` - Remove hardcoded import, use JSON file
- ❌ `app/api/init-data/route.ts` - Remove hardcoded import, use JSON files

---

## Refactor Tasks by Priority

### Phase 1: Type Definitions (High Priority)
- ❌ Move type definitions from `app/components/data.ts` to separate files:
  - ❌ `app/types/department.ts`
  - ❌ `app/types/teacher.ts` 
  - ❌ `app/types/subject.ts`
  - ❌ `app/types/semester.ts`
  - ❌ `app/types/room.ts`
  - ❌ `app/types/timeslot.ts`
  - ❌ `app/types/timetableEntry.ts`

### Phase 2: Create Missing API Routes (High Priority)
- ❌ `app/api/departments/route.ts`
- ❌ `app/api/teachers/route.ts`
- ❌ `app/api/subjects/route.ts`
- ❌ `app/api/semesters/route.ts`
- ❌ `app/api/timeslots/route.ts`
- ❌ `app/api/days/route.ts`

### Phase 3: Update Existing API Routes (High Priority)
- ❌ Update `app/api/rooms/route.ts` to use JSON file instead of hardcoded data
- ❌ Update `app/api/init-data/route.ts` to use JSON files instead of hardcoded data

### Phase 4: Update Components - Core Data Access (Medium Priority)
- ❌ `app/lib/dataLoader.ts` - Create centralized data loading utility
- ❌ `app/components/timetableUtils.ts` - Update to use API calls
- ❌ `app/components/conflictChecker.ts` - Update to use API calls
- ❌ `app/components/calendarNormalization.ts` - Update to use API calls
- ❌ `app/lib/teacherAssignment.ts` - Update to use API calls

### Phase 5: Update Page Components (Medium Priority)
- ❌ `app/manage-departments/page.tsx`
- ❌ `app/manage-teachers/page.tsx`
- ❌ `app/manage-schedule/page.tsx`  
- ❌ `app/department-courses/page.tsx`
- ❌ `app/layout.tsx`

### Phase 6: Update UI Components (Medium Priority)
- ❌ `app/components/SemesterManagementComponent.tsx`
- ❌ `app/components/TimetableManager.tsx`
- ❌ `app/components/TimetableAdmin.tsx`
- ❌ `app/components/TimetableNew.tsx`
- ❌ `app/components/TeacherProfile.tsx`

### Phase 7: Update Modal Components (Low Priority)  
- ❌ `app/components/ui/AddTeacherModal.tsx`
- ❌ `app/components/ui/DepartmentSemesterModal.tsx`
- ❌ `app/components/ui/SemesterChipsManager.tsx`
- ❌ `app/components/ui/SubjectModal.tsx`
- ❌ `app/components/ui/select.tsx`
- ❌ `app/components/ui/dialog.tsx`

### Phase 8: Update Room Management Components (Low Priority)
- ❌ `app/components/room-management/RoomAvailability.tsx`
- ❌ `app/components/room-management/AddRoomModal.tsx`
- ❌ `app/components/room-management/RoomManagementComponent.tsx`

### Phase 9: Update Test Files (Low Priority)
- ❌ `app/components/TimetableNew.test.tsx`
- ❌ `app/types/subject.ts`

### Phase 10: Clean up (Final Phase)
- ❌ Remove hardcoded arrays from `app/components/data.ts`
- ❌ Keep only type definitions and helper functions in `app/components/data.ts`
- ❌ Update any remaining references to hardcoded data

### Phase 11: Testing & Validation (Final Phase)
- ❌ Test all CRUD operations work correctly
- ❌ Test all existing functionality still works
- ❌ Verify no components import hardcoded arrays
- ❌ Verify all data comes from JSON files via API routes
- ❌ Run full test suite

---

## Helper Functions Analysis
The following helper functions in `app/components/data.ts` should be preserved:
- ✅ `getSemesterLevel()` (line 691)
- ✅ `departmentOffersInSemester()` (line 698)
- ✅ `getActiveDepartmentsForSemester()` (line 716)
- ✅ `getOfferedLevelsForDept()` (line 729)
- ✅ `setOfferedLevelsForDept()` (line 750)
- ✅ `countSubjectsForDeptLevel()` (line 763)
- ✅ `computeNextOfferedLevels()` (line 774)
- ✅ `departmentHasSubjectsOrLevels()` (line 790)

---

## Notes
- The `data/` directory already contains most JSON files needed
- `timetableEntries` is already managed via `allocations.json`
- `daysOfWeek` is a simple constant that could remain or be moved to `data/days.json`
- Type definitions should be moved to dedicated type files for better organization
- Need to ensure backward compatibility during the transition
- All API routes should follow RESTful conventions
- Need to add proper error handling for file I/O operations

---

## Current Status
✅ **Step 1 Complete**: Branch created and comprehensive checklist compiled  
❌ **Next**: Begin Phase 1 - Move type definitions to separate files
