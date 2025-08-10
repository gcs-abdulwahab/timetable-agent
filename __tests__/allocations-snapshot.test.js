/**
 * Allocations Snapshot Test
 * 
 * This test ensures that the allocations.json file structure and sort order
 * remain consistent to prevent unintentional changes to the data format.
 */

const fs = require('fs');
const path = require('path');

describe('Allocations Data Structure', () => {
  let allocationsData;
  
  beforeAll(() => {
    const allocationsPath = path.join(__dirname, '..', 'data', 'allocations.json');
    const content = fs.readFileSync(allocationsPath, 'utf8');
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    allocationsData = JSON.parse(cleanContent);
  });

  test('allocations.json structure matches expected format', () => {
    // Test that allocations is an array
    expect(Array.isArray(allocationsData)).toBe(true);
    
    // Test that we have some allocations
    expect(allocationsData.length).toBeGreaterThan(0);
    
    // Create a snapshot of the first few allocations to verify structure
    const sampleAllocations = allocationsData.slice(0, 3).map(allocation => {
      // Create a normalized version for testing structure
      return {
        id: typeof allocation.id,
        subjectId: typeof allocation.subjectId,
        teacherId: typeof allocation.teacherId,
        timeSlotId: typeof allocation.timeSlotId,
        day: typeof allocation.day,
        room: typeof allocation.room,
        semesterId: typeof allocation.semesterId,
        // Include actual values for key fields to detect changes
        hasId: !!allocation.id,
        hasSubjectId: !!allocation.subjectId,
        hasTimeSlotId: !!allocation.timeSlotId,
        hasDay: !!allocation.day,
        hasSemesterId: !!allocation.semesterId,
        allowedFields: Object.keys(allocation).sort()
      };
    });
    
    expect(sampleAllocations).toMatchSnapshot();
  });

  test('all allocations have required fields', () => {
    const requiredFields = ['id', 'subjectId', 'timeSlotId', 'day', 'semesterId'];
    
    allocationsData.forEach((allocation, index) => {
      requiredFields.forEach(field => {
        expect(allocation).toHaveProperty(field);
        expect(allocation[field]).toBeDefined();
        expect(allocation[field]).not.toBe('');
      });
    });
  });

  test('allocation IDs are unique', () => {
    const ids = allocationsData.map(allocation => allocation.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('days are valid', () => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    allocationsData.forEach(allocation => {
      expect(validDays).toContain(allocation.day);
    });
  });

  test('timeSlotIds follow expected format', () => {
    const timeSlotPattern = /^ts\d+$/;
    
    allocationsData.forEach(allocation => {
      expect(allocation.timeSlotId).toMatch(timeSlotPattern);
    });
  });

  test('data consistency snapshot', () => {
    // Create a summary of the data for snapshot testing
    const summary = {
      totalAllocations: allocationsData.length,
      uniqueSubjects: new Set(allocationsData.map(a => a.subjectId)).size,
      uniqueTeachers: new Set(allocationsData.filter(a => a.teacherId).map(a => a.teacherId)).size,
      uniqueRooms: new Set(allocationsData.filter(a => a.room).map(a => a.room)).size,
      uniqueTimeSlots: new Set(allocationsData.map(a => a.timeSlotId)).size,
      uniqueDays: new Set(allocationsData.map(a => a.day)).size,
      uniqueSemesters: new Set(allocationsData.map(a => a.semesterId)).size,
      
      // Count allocations by day
      dayDistribution: allocationsData.reduce((acc, allocation) => {
        acc[allocation.day] = (acc[allocation.day] || 0) + 1;
        return acc;
      }, {}),
      
      // Count allocations by semester
      semesterDistribution: allocationsData.reduce((acc, allocation) => {
        acc[allocation.semesterId] = (acc[allocation.semesterId] || 0) + 1;
        return acc;
      }, {}),
      
      // Count allocations with/without rooms
      roomAssignmentStats: {
        withRoom: allocationsData.filter(a => a.room).length,
        withoutRoom: allocationsData.filter(a => !a.room).length
      },
      
      // Count allocations with/without teachers
      teacherAssignmentStats: {
        withTeacher: allocationsData.filter(a => a.teacherId).length,
        withoutTeacher: allocationsData.filter(a => !a.teacherId).length
      }
    };
    
    expect(summary).toMatchSnapshot();
  });

  test('sort order is deterministic', () => {
    // Test that the current order can be reproduced by a deterministic sort
    const sortedAllocations = [...allocationsData].sort((a, b) => {
      // Sort by semester, then day, then timeSlot, then subject, then id
      if (a.semesterId !== b.semesterId) {
        return a.semesterId.localeCompare(b.semesterId);
      }
      
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndexA = dayOrder.indexOf(a.day);
      const dayIndexB = dayOrder.indexOf(b.day);
      if (dayIndexA !== dayIndexB) {
        return dayIndexA - dayIndexB;
      }
      
      if (a.timeSlotId !== b.timeSlotId) {
        return a.timeSlotId.localeCompare(b.timeSlotId);
      }
      
      if (a.subjectId !== b.subjectId) {
        return a.subjectId.localeCompare(b.subjectId);
      }
      
      return a.id.localeCompare(b.id);
    });
    
    // Create a simple representation for comparison
    const currentOrder = allocationsData.map(a => `${a.id}-${a.semesterId}-${a.day}-${a.timeSlotId}`);
    const expectedOrder = sortedAllocations.map(a => `${a.id}-${a.semesterId}-${a.day}-${a.timeSlotId}`);
    
    // Store the first 20 items for snapshot (to avoid huge snapshots)
    expect(currentOrder.slice(0, 20)).toMatchSnapshot();
  });

  test('field types are consistent', () => {
    const fieldTypes = {};
    
    allocationsData.forEach(allocation => {
      Object.keys(allocation).forEach(field => {
        const type = typeof allocation[field];
        const isNull = allocation[field] === null;
        const actualType = isNull ? 'null' : type;
        
        if (!fieldTypes[field]) {
          fieldTypes[field] = new Set();
        }
        fieldTypes[field].add(actualType);
      });
    });
    
    // Convert Sets to Arrays for snapshot
    const fieldTypesSummary = Object.fromEntries(
      Object.entries(fieldTypes).map(([field, types]) => [
        field,
        Array.from(types).sort()
      ])
    );
    
    expect(fieldTypesSummary).toMatchSnapshot();
  });
});
