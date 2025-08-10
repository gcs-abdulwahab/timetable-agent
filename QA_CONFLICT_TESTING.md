# QA Testing Guide: Conflict Popup Content Verification

## Overview

This document provides comprehensive guidance for manually testing the conflict popup content to ensure it displays the correct format messages as specified in the requirements.

## Test Setup Completed

### 1. Data Structure Enhancements
- ✅ Added BBA subjects: "Subject A", "Subject B", "Subject C"
- ✅ Updated teacher t71 to "Dr. Jane Doe" 
- ✅ Added test subject for unknown semester fallback
- ✅ Created cross-semester conflict scenarios

### 2. Conflict Test Cases Added

#### QA Teacher Conflict
- **Teacher**: Dr. Hassan Raza (t70)
- **Conflict**: Same teacher, different semesters
- **Entry 1**: Subject A (Semester 1) on Monday at 9:00-10:00
- **Entry 2**: Subject B (Semester 3) on Wednesday at 9:00-10:00

#### QA Room Conflict
- **Room**: QA-TestRoom
- **Conflict**: Same room, different semesters, different teachers
- **Entry 1**: Subject C (Semester 5) with Dr. Jane Doe on Tuesday at 10:00-11:00
- **Entry 2**: Calculus I (Semester 1) with Dr. Naveed Akhtar on Tuesday at 10:00-11:00

#### QA Unknown Semester Fallback
- **Entry**: Test Subject with unknown_sem semester on Friday
- **Purpose**: Verify "Unknown Semester" fallback message

### 3. Enhanced Conflict Checker
- ✅ Updated `conflictChecker.ts` to include subject, semester, and teacher information
- ✅ Teacher conflicts now show: `"Subject A (Semester 1) on Monday, Subject B (Semester 3) on Wednesday"`
- ✅ Room conflicts now show: `"Subject C (Semester 5) - Dr. Jane Doe on Tuesday"`
- ✅ Unknown semester fallback shows: `"Test Subject (Unknown Semester) on Friday"`

## Manual QA Steps

### Step 1: Start the Application
```bash
cd D:\herd\timetable-agent
npm run dev
```

### Step 2: Navigate to Conflicts
1. Open browser to `http://localhost:3000`
2. Go to "Manage Departments" page
3. Look for the red conflict warning button
4. Click the conflict button to open the conflict viewer

### Step 3: Verify Conflict Messages

#### Expected Teacher Conflict Message
```
👨‍🏫 Teacher Conflict
Wednesday at ts2
Subject A (Semester 1) on Monday, Subject B (Semester 3) on Wednesday
```

#### Expected Room Conflict Message  
```
🏢 Room Conflict
Tuesday at ts3
Subject C (Semester 5) - Dr. Jane Doe on Tuesday, Calculus I (Semester 1) - Dr. Naveed Akhtar on Tuesday
```

#### Expected Unknown Semester Fallback
```
Test Subject (Unknown Semester) on Friday
```

## Verification Checklist

### ✅ Teacher Conflicts
- [ ] Teacher conflict shows both subjects with semester information
- [ ] Format matches: `"Subject A (Semester 1) on Monday, Subject B (Semester 3) on Wednesday"`
- [ ] Cross-semester conflicts are detected correctly

### ✅ Room Conflicts  
- [ ] Room conflict shows subject, semester, and teacher information
- [ ] Format matches: `"Subject C (Semester 5) - Dr. Jane Doe on Tuesday"`
- [ ] Multiple entries show comma-separated format

### ✅ Unknown Semester Fallback
- [ ] Entries with non-existent semesters show "Unknown Semester"
- [ ] Format matches: `"Test Subject (Unknown Semester) on Friday"`

### ✅ UI Elements
- [ ] Red conflict warning button appears when conflicts exist
- [ ] Conflict count is displayed correctly
- [ ] Popup opens when conflict button is clicked
- [ ] Conflicts are categorized as "Teacher Conflict" or "Room Conflict"
- [ ] Time slot and day information is displayed

## Additional Test Scenarios

### Cross-Semester Detection
The conflict detection should identify conflicts where:
- Same teacher scheduled in different semesters at overlapping times
- Same room booked across different semesters at same time slots

### Message Format Requirements
- **Teacher conflicts**: Should show all conflicting subjects with their semesters and days
- **Room conflicts**: Should show subject, semester, teacher name, and day for each conflict
- **Fallback**: Unknown semesters should gracefully display "Unknown Semester"

## Troubleshooting

### If conflicts don't appear:
1. Check browser console for JavaScript errors
2. Verify data is loading correctly in the Network tab
3. Check that conflict detection is working by looking at existing conflicts

### If message format is incorrect:
1. Check `conflictChecker.ts` implementation
2. Verify subject, semester, and teacher data is properly linked
3. Test with browser developer tools to inspect conflict data

## Expected Results Summary

After completing the QA testing, you should observe:

1. **Teacher conflicts** display comprehensive information about overlapping schedules across semesters
2. **Room conflicts** show detailed booking information with teacher names
3. **Fallback behavior** gracefully handles missing semester data
4. **UI elements** clearly present conflict information to users

## Files Modified

- `app/components/data.ts` - Added QA test conflicts and subjects
- `app/components/conflictChecker.ts` - Enhanced message formatting
- `test-qa-conflicts.js` - QA verification script
- `QA_CONFLICT_TESTING.md` - This documentation

## Build Status

✅ Application builds successfully
⚠️ Minor ESLint warnings (non-blocking)
🔧 All functionality operational
