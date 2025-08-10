#!/usr/bin/env node

const AllocationPersistence = require('./persist-allocations');

/**
 * Example Usage of Allocation Persistence
 * 
 * This demonstrates how to use the AllocationPersistence class
 * programmatically to add new allocations or replace existing ones.
 */

// Example new allocations to add
const newAllocations = [
    {
        "id": "demo-1",
        "subjectId": "bba102", 
        "teacherId": "t5",
        "timeSlotId": "ts4",
        "day": "Friday",
        "room": "R-101",
        "semesterId": "sem1"
    },
    {
        "id": "demo-2", 
        "subjectId": "cs101",
        "teacherId": "t10",
        "timeSlotId": "ts1", 
        "day": "Monday",
        "room": "R-44",
        "semesterId": "sem1"
    }
];

async function demonstrateUsage() {
    console.log('🎯 Allocation Persistence Usage Example\n');
    
    const persistence = new AllocationPersistence();
    
    try {
        // Example 1: Add new allocations (merge mode)
        console.log('📝 Example 1: Adding new allocations (merge mode)');
        const result1 = persistence.persistAllocations(newAllocations, false);
        console.log(`   Result: ${result1.total} total, departments: ${result1.departments.join(', ')}\n`);
        
        // Example 2: Replace all allocations (replace mode)
        console.log('📝 Example 2: Replace with specific allocations (replace mode)');
        const result2 = persistence.persistAllocations(newAllocations, true);
        console.log(`   Result: ${result2.total} total, departments: ${result2.departments.join(', ')}\n`);
        
        // Example 3: Clean up existing data (merge mode with no new data)
        console.log('📝 Example 3: Reprocess existing data (merge mode, no new data)');
        const result3 = persistence.persistAllocations([], false);
        console.log(`   Result: ${result3.total} total, departments: ${result3.departments.join(', ')}\n`);
        
        console.log('✅ All examples completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in demonstration:', error.message);
        process.exit(1);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    demonstrateUsage();
}

module.exports = { newAllocations, demonstrateUsage };
