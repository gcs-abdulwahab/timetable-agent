#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Allocation Persistence Script
 * 
 * This script handles the persistence of allocation data to allocations.json with:
 * - Backup creation with timestamp
 * - Duplicate detection and removal
 * - Proper sorting by department → room → day → period
 * - JSON-only persistence (no browser localStorage)
 */

class AllocationPersistence {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.allocationsPath = path.join(this.dataDir, 'allocations.json');
        this.subjectsPath = path.join(this.dataDir, 'subjects.json');
        this.departmentsPath = path.join(this.dataDir, 'departments.json');
        this.timeslotsPath = path.join(this.dataDir, 'timeslots.json');
        
        // Day ordering for proper sorting
        this.dayOrder = {
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6,
            'Sunday': 7
        };
    }

    /**
     * Load reference data for lookups
     */
    loadReferenceData() {
        // Helper function to remove BOM and parse JSON
        const parseJsonFile = (filePath) => {
            const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
            return JSON.parse(content);
        };
        
        const subjects = parseJsonFile(this.subjectsPath);
        const departments = parseJsonFile(this.departmentsPath);
        const timeslots = parseJsonFile(this.timeslotsPath);

        // Add missing CS subjects temporarily
        const missingCSSubjects = [
            {
                "id": "cs101",
                "name": "Programming Fundamentals",
                "code": "CS-101",
                "creditHours": 3,
                "color": "bg-gray-100",
                "departmentId": "d6",
                "semesterLevel": 1,
                "isCore": true,
                "semesterId": "sem1"
            },
            {
                "id": "cs301",
                "name": "Data Structures",
                "code": "CS-301",
                "creditHours": 3,
                "color": "bg-gray-100",
                "departmentId": "d6",
                "semesterLevel": 3,
                "isCore": true,
                "semesterId": "sem3"
            }
        ];
        
        // Merge with existing subjects
        const allSubjects = [...subjects, ...missingCSSubjects.filter(cs => 
            !subjects.some(s => s.id === cs.id)
        )];
        
        // Create lookup maps
        this.subjectMap = new Map(allSubjects.map(s => [s.id, s]));
        this.departmentMap = new Map(departments.map(d => [d.id, d]));
        this.timeslotMap = new Map(timeslots.map(t => [t.id, t]));
    }

    /**
     * Create backup of existing allocations file
     */
    createBackup() {
        if (!fs.existsSync(this.allocationsPath)) {
            console.log('No existing allocations.json to backup');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
        const backupPath = path.join(this.dataDir, `allocations.backup.${timestamp}.json`);
        
        fs.copyFileSync(this.allocationsPath, backupPath);
        console.log(`✓ Backup created: ${path.basename(backupPath)}`);
    }

    /**
     * Load existing allocations
     */
    loadExistingAllocations() {
        if (!fs.existsSync(this.allocationsPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(this.allocationsPath, 'utf8'));
    }

    /**
     * Remove duplicate allocations based on ID
     */
    removeDuplicates(allocations, newAllocations = []) {
        const seenIds = new Set();
        const combined = [...allocations, ...newAllocations];
        
        const deduplicated = combined.filter(allocation => {
            if (seenIds.has(allocation.id)) {
                console.log(`⚠ Removing duplicate allocation: ${allocation.id}`);
                return false;
            }
            seenIds.add(allocation.id);
            return true;
        });

        console.log(`✓ Removed ${combined.length - deduplicated.length} duplicate(s)`);
        return deduplicated;
    }

    /**
     * Enrich allocations with department and period information for sorting
     */
    enrichAllocationsForSorting(allocations) {
        return allocations.map(allocation => {
            const subject = this.subjectMap.get(allocation.subjectId);
            const department = subject ? this.departmentMap.get(subject.departmentId) : null;
            const timeslot = this.timeslotMap.get(allocation.timeSlotId);

            // Debug output for missing subjects/departments
            if (!subject) {
                console.log(`⚠ Subject not found: ${allocation.subjectId}`);
            } else if (!department) {
                console.log(`⚠ Department not found for subject ${allocation.subjectId}: ${subject.departmentId}`);
            }

            return {
                ...allocation,
                _sortData: {
                    departmentName: department?.name || 'ZZ_Unknown',
                    departmentOrder: department?.name || 'ZZ_Unknown',
                    room: allocation.room || 'ZZ_Unassigned',
                    dayOrder: this.dayOrder[allocation.day] || 99,
                    period: timeslot?.period || 99
                }
            };
        });
    }

    /**
     * Sort allocations by department → room → day → period
     */
    sortAllocations(enrichedAllocations) {
        return enrichedAllocations.sort((a, b) => {
            // 1. Sort by department name
            if (a._sortData.departmentOrder !== b._sortData.departmentOrder) {
                return a._sortData.departmentOrder.localeCompare(b._sortData.departmentOrder);
            }

            // 2. Sort by room
            if (a._sortData.room !== b._sortData.room) {
                return a._sortData.room.localeCompare(b._sortData.room);
            }

            // 3. Sort by day
            if (a._sortData.dayOrder !== b._sortData.dayOrder) {
                return a._sortData.dayOrder - b._sortData.dayOrder;
            }

            // 4. Sort by period
            return a._sortData.period - b._sortData.period;
        });
    }

    /**
     * Clean up enriched data before saving
     */
    cleanAllocationsForSaving(enrichedAllocations) {
        return enrichedAllocations.map(allocation => {
            const { _sortData, ...cleanAllocation } = allocation;
            return cleanAllocation;
        });
    }

    /**
     * Validate allocation structure
     */
    validateAllocation(allocation) {
        const required = ['id', 'subjectId', 'teacherId', 'timeSlotId', 'day', 'semesterId'];
        const missing = required.filter(field => !allocation[field]);
        
        if (missing.length > 0) {
            throw new Error(`Invalid allocation ${allocation.id}: missing fields ${missing.join(', ')}`);
        }

        return true;
    }

    /**
     * Save allocations to JSON file
     */
    saveAllocations(allocations) {
        // Validate all allocations
        allocations.forEach(this.validateAllocation);

        // Write to file with pretty formatting
        const jsonContent = JSON.stringify(allocations, null, 2);
        fs.writeFileSync(this.allocationsPath, jsonContent, 'utf8');
        
        console.log(`✓ Saved ${allocations.length} allocation(s) to ${path.basename(this.allocationsPath)}`);
    }

    /**
     * Main persistence method
     * @param {Array} newAllocations - Optional array of new allocations to add
     * @param {boolean} replaceMode - If true, replace all existing data; if false, append/merge
     */
    persistAllocations(newAllocations = [], replaceMode = false) {
        console.log('🔄 Starting allocation persistence...');

        // Load reference data for sorting
        this.loadReferenceData();

        // Create backup
        this.createBackup();

        let allocations;
        
        if (replaceMode) {
            console.log('📝 Replace mode: Using provided allocations only');
            allocations = newAllocations;
        } else {
            console.log('📝 Merge mode: Combining with existing allocations');
            const existing = this.loadExistingAllocations();
            allocations = this.removeDuplicates(existing, newAllocations);
        }

        // Enrich for sorting
        const enriched = this.enrichAllocationsForSorting(allocations);
        
        // Sort allocations
        const sorted = this.sortAllocations(enriched);
        
        // Clean up for saving
        const cleaned = this.cleanAllocationsForSaving(sorted);
        
        // Save to file
        this.saveAllocations(cleaned);
        
        console.log('✅ Allocation persistence completed successfully');
        
        // Return summary
        return {
            total: cleaned.length,
            departments: [...new Set(cleaned.map(a => {
                const subject = this.subjectMap.get(a.subjectId);
                const dept = subject ? this.departmentMap.get(subject.departmentId) : null;
                return dept?.name || 'Unknown';
            }))].sort()
        };
    }
}

// CLI interface
if (require.main === module) {
    const persistence = new AllocationPersistence();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const replaceMode = args.includes('--replace');
    
    if (args.includes('--help')) {
        console.log(`
Allocation Persistence Tool

Usage:
  node persist-allocations.js [options]

Options:
  --replace    Replace existing allocations instead of merging
  --help       Show this help message

Examples:
  node persist-allocations.js            # Merge with existing data
  node persist-allocations.js --replace  # Replace all existing data
        `);
        process.exit(0);
    }

    try {
        const result = persistence.persistAllocations([], replaceMode);
        console.log(`
📊 Summary:
   Total allocations: ${result.total}
   Departments: ${result.departments.join(', ')}
        `);
        
    } catch (error) {
        console.error('❌ Error during persistence:', error.message);
        process.exit(1);
    }
}

module.exports = AllocationPersistence;
