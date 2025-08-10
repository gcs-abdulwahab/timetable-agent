const fs = require('fs');
const path = require('path');

// Helper function to read JSON files and handle BOM
function readJsonFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    return JSON.parse(cleanContent);
}

// Load data files
const subjects = readJsonFile('data/subjects.json');
const rooms = readJsonFile('data/rooms.json');
const allocations = readJsonFile('data/allocations.json');
const timeslots = readJsonFile('data/timeslots.json');

// Chemistry subject codes to room mapping as specified in task
const chemistrySubjectMapping = [
    { code: 'CHEM-301', targetPeriod: 3 },
    { code: 'CHEM-303', targetPeriod: 4 },
    { code: 'CHEM-304', targetPeriod: 5 },
    { code: 'CHEM-307', targetPeriod: 6 },
    { code: 'CHEM-309', targetPeriod: 3 },
    { code: 'CHEM-311', targetPeriod: 4 }
];

// Helper function to get room assignments for specific period and day
function getRoomAssignments(day, period) {
    const periodTimeSlot = timeslots.find(ts => ts.period === period);
    if (!periodTimeSlot) return [];
    
    return allocations
        .filter(alloc => alloc.day === day && alloc.timeSlotId === periodTimeSlot.id)
        .map(alloc => alloc.room)
        .filter(room => room); // Only allocated rooms
}

// Helper function to check if a room is available at a specific time
function isRoomAvailable(roomId, day, period) {
    const usedRooms = getRoomAssignments(day, period);
    return !usedRooms.includes(roomId);
}

// Score rooms based on suitability for chemistry (prefer high capacity, BS program rooms as they're available for other departments)
function scoreRoomForChemistry(room) {
    let score = 0;
    
    // Prefer higher capacity rooms (suitable for lab work)
    score += room.capacity;
    
    // Prefer rooms available to other departments
    if (room.availableForOtherDepartments) {
        score += 100;
    }
    
    // Prefer BS program rooms as they tend to be more modern
    if (room.programTypes && room.programTypes.includes('BS')) {
        score += 50;
    }
    
    // Prefer rooms with projector and AC (better facilities)
    if (room.hasProjector) score += 20;
    if (room.hasAC) score += 20;
    
    // Prefer buildings that might be science-oriented
    if (room.building && room.building.includes('Block')) {
        score += 10;
    }
    
    return score;
}

// Find best available rooms for chemistry subjects
function findBestAvailableRooms(day, targetPeriod, excludeRooms = []) {
    const availableRooms = rooms.filter(room => 
        !excludeRooms.includes(room.id) &&
        isRoomAvailable(room.id, day, targetPeriod)
    );
    
    // Score and sort rooms
    const scoredRooms = availableRooms.map(room => ({
        ...room,
        score: scoreRoomForChemistry(room)
    }));
    
    scoredRooms.sort((a, b) => b.score - a.score);
    
    return scoredRooms;
}

// Generate room assignments for chemistry subjects
function assignChemistryRooms() {
    const assignments = [];
    const usedRooms = new Set();
    
    console.log('=== CHEMISTRY ROOM ASSIGNMENT SYSTEM ===\n');
    console.log('Finding Chemistry subjects and assigning optimal rooms...\n');
    
    // Find chemistry subjects in the dataset
    const chemistrySubjects = subjects.filter(subject => 
        chemistrySubjectMapping.some(mapping => mapping.code === subject.code)
    );
    
    console.log(`Found ${chemistrySubjects.length} Chemistry subjects to assign:`);
    chemistrySubjects.forEach(subject => {
        const mapping = chemistrySubjectMapping.find(m => m.code === subject.code);
        console.log(`- ${subject.code}: ${subject.name} (Target Period: ${mapping.targetPeriod})`);
    });
    console.log();
    
    // Process each chemistry subject
    for (const mapping of chemistrySubjectMapping) {
        const subject = chemistrySubjects.find(s => s.code === mapping.code);
        
        if (!subject) {
            console.log(`⚠️  Subject ${mapping.code} not found in dataset`);
            continue;
        }
        
        console.log(`Processing ${mapping.code} (Period ${mapping.targetPeriod}):`);
        
        // Find best rooms for different days
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const subjectAssignments = [];
        
        for (const day of daysOfWeek) {
            const availableRooms = findBestAvailableRooms(day, mapping.targetPeriod, Array.from(usedRooms));
            
            if (availableRooms.length === 0) {
                console.log(`  ❌ No available rooms for ${day} period ${mapping.targetPeriod}`);
                continue;
            }
            
            // Select the best room
            const selectedRoom = availableRooms[0];
            const timeSlotId = timeslots.find(ts => ts.period === mapping.targetPeriod).id;
            
            const assignment = {
                subjectId: subject.id,
                subjectCode: mapping.code,
                subjectName: subject.name,
                roomId: selectedRoom.id,
                roomName: selectedRoom.name,
                day: day,
                period: mapping.targetPeriod,
                timeSlotId: timeSlotId,
                roomCapacity: selectedRoom.capacity,
                roomBuilding: selectedRoom.building,
                roomType: selectedRoom.type
            };
            
            subjectAssignments.push(assignment);
            assignments.push(assignment);
            
            console.log(`  ✅ ${day}: ${selectedRoom.name} (${selectedRoom.building}, Capacity: ${selectedRoom.capacity})`);
        }
        
        // Mark room as used for this time period to avoid conflicts
        if (subjectAssignments.length > 0) {
            // Use the most common room across days for this subject
            const roomCounts = {};
            subjectAssignments.forEach(assign => {
                roomCounts[assign.roomId] = (roomCounts[assign.roomId] || 0) + 1;
            });
            const mostUsedRoom = Object.keys(roomCounts).reduce((a, b) => 
                roomCounts[a] > roomCounts[b] ? a : b
            );
            usedRooms.add(mostUsedRoom);
        }
        
        console.log();
    }
    
    return assignments;
}

// Generate allocation entries for the assignments
function generateAllocationEntries(assignments) {
    const newAllocations = [];
    let allocationId = Math.max(...allocations.map(a => parseInt(a.id.replace('edited-', '').replace('new-', '')) || 0)) + 1;
    
    for (const assignment of assignments) {
        const allocation = {
            id: `chem-${allocationId++}`,
            subjectId: assignment.subjectId.toString(),
            teacherId: null, // To be assigned later by teacher assignment system
            timeSlotId: assignment.timeSlotId,
            day: assignment.day,
            room: assignment.roomName,
            semesterId: "sem5" // Chemistry subjects are in semester 5
        };
        
        newAllocations.push(allocation);
    }
    
    return newAllocations;
}

// Validate for conflicts
function validateAssignments(assignments) {
    console.log('=== CONFLICT VALIDATION ===\n');
    
    const conflicts = [];
    const roomPeriodMap = new Map();
    
    // Check for double booking within our assignments
    for (const assignment of assignments) {
        const key = `${assignment.roomName}-${assignment.day}-${assignment.period}`;
        if (roomPeriodMap.has(key)) {
            conflicts.push({
                type: 'Internal Double Booking',
                room: assignment.roomName,
                day: assignment.day,
                period: assignment.period,
                subjects: [roomPeriodMap.get(key).subjectCode, assignment.subjectCode]
            });
        } else {
            roomPeriodMap.set(key, assignment);
        }
    }
    
    // Check against existing allocations
    for (const assignment of assignments) {
        const existingAllocations = allocations.filter(alloc => 
            alloc.room === assignment.roomName &&
            alloc.day === assignment.day &&
            alloc.timeSlotId === assignment.timeSlotId
        );
        
        if (existingAllocations.length > 0) {
            conflicts.push({
                type: 'Existing Allocation Conflict',
                room: assignment.roomName,
                day: assignment.day,
                period: assignment.period,
                existingSubject: existingAllocations[0].subjectId,
                newSubject: assignment.subjectCode
            });
        }
    }
    
    if (conflicts.length === 0) {
        console.log('✅ No conflicts detected! All assignments are valid.\n');
    } else {
        console.log(`❌ Found ${conflicts.length} conflict(s):`);
        conflicts.forEach((conflict, index) => {
            console.log(`${index + 1}. ${conflict.type}:`);
            console.log(`   Room: ${conflict.room}, Day: ${conflict.day}, Period: ${conflict.period}`);
            if (conflict.subjects) {
                console.log(`   Conflicting subjects: ${conflict.subjects.join(', ')}`);
            } else {
                console.log(`   Existing: ${conflict.existingSubject}, New: ${conflict.newSubject}`);
            }
        });
        console.log();
    }
    
    return conflicts;
}

// Print final assignment summary
function printAssignmentSummary(assignments) {
    console.log('=== FINAL ROOM ASSIGNMENTS ===\n');
    
    // Group by subject
    const subjectGroups = {};
    assignments.forEach(assignment => {
        if (!subjectGroups[assignment.subjectCode]) {
            subjectGroups[assignment.subjectCode] = [];
        }
        subjectGroups[assignment.subjectCode].push(assignment);
    });
    
    for (const [subjectCode, subjectAssignments] of Object.entries(subjectGroups)) {
        console.log(`${subjectCode} (${subjectAssignments[0].subjectName}):`);
        console.log(`  Target Period: ${subjectAssignments[0].period}`);
        console.log('  Room Assignments:');
        
        subjectAssignments.forEach(assignment => {
            console.log(`    ${assignment.day}: ${assignment.roomName} (${assignment.roomBuilding}, Cap: ${assignment.roomCapacity})`);
        });
        console.log();
    }
    
    // Room utilization summary
    console.log('=== ROOM UTILIZATION SUMMARY ===\n');
    const roomUsage = {};
    assignments.forEach(assignment => {
        const key = `${assignment.roomName} (${assignment.roomBuilding})`;
        if (!roomUsage[key]) {
            roomUsage[key] = {
                capacity: assignment.roomCapacity,
                assignments: []
            };
        }
        roomUsage[key].assignments.push(`${assignment.subjectCode} - ${assignment.day} P${assignment.period}`);
    });
    
    Object.entries(roomUsage).forEach(([room, usage]) => {
        console.log(`${room} (Capacity: ${usage.capacity}):`);
        usage.assignments.forEach(assignment => {
            console.log(`  - ${assignment}`);
        });
        console.log();
    });
}

// Save assignments to file
function saveAssignments(assignments, newAllocations) {
    const output = {
        timestamp: new Date().toISOString(),
        chemistryRoomAssignments: assignments,
        newAllocationEntries: newAllocations,
        summary: {
            totalAssignments: assignments.length,
            uniqueRooms: [...new Set(assignments.map(a => a.roomName))].length,
            subjectsAssigned: [...new Set(assignments.map(a => a.subjectCode))].length
        }
    };
    
    const outputPath = 'data/chemistry-room-assignments.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`📁 Assignments saved to: ${outputPath}\n`);
    
    return output;
}

// Main execution
function main() {
    try {
        console.log('Starting Chemistry Room Assignment Process...\n');
        
        // Generate assignments
        const assignments = assignChemistryRooms();
        
        if (assignments.length === 0) {
            console.log('❌ No assignments were made. Check subject codes and room availability.');
            return;
        }
        
        // Validate assignments
        const conflicts = validateAssignments(assignments);
        
        // Generate allocation entries
        const newAllocations = generateAllocationEntries(assignments);
        
        // Print summary
        printAssignmentSummary(assignments);
        
        // Save results
        const output = saveAssignments(assignments, newAllocations);
        
        console.log('=== TASK COMPLETION SUMMARY ===');
        console.log(`✅ Successfully assigned ${output.summary.subjectsAssigned} Chemistry subjects`);
        console.log(`✅ Used ${output.summary.uniqueRooms} different rooms`);
        console.log(`✅ Created ${output.summary.totalAssignments} total room assignments`);
        
        if (conflicts.length === 0) {
            console.log('✅ No scheduling conflicts detected');
        } else {
            console.log(`⚠️  ${conflicts.length} conflicts need manual resolution`);
        }
        
        console.log('\n🎯 Step 7 Complete: Chemistry rooms assigned programmatically!');
        
    } catch (error) {
        console.error('❌ Error during assignment process:', error);
        process.exit(1);
    }
}

// Run the assignment
main();
