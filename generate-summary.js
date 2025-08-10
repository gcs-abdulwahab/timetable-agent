const fs = require('fs');
const path = require('path');

// Load data files
function loadJSONFile(filename) {
    const filepath = path.join('./data', filename);
    if (!fs.existsSync(filepath)) {
        console.error(`File not found: ${filepath}`);
        return null;
    }
    try {
        const content = fs.readFileSync(filepath, 'utf-8');
        // Remove BOM if present
        const cleanContent = content.replace(/^\uFEFF/, '');
        return JSON.parse(cleanContent);
    } catch (error) {
        console.error(`Error parsing ${filename}:`, error.message);
        return null;
    }
}

// Main analysis function
function generateTimetableSummary() {
    console.log('Loading data files...');
    
    // Load all required data
    const departments = loadJSONFile('departments.json');
    const subjects = loadJSONFile('subjects.json');
    const teachers = loadJSONFile('teachers.json');
    const rooms = loadJSONFile('rooms.json');
    const allocations = loadJSONFile('allocations.json');
    const timeslots = loadJSONFile('timeslots.json');
    
    // Try to load the timetable entries (prefer resolved version)
    let timetableEntries = null;
    const resolvedEntries = loadJSONFile('timetable-entries-resolved.json');
    if (resolvedEntries && resolvedEntries.timetableEntries) {
        timetableEntries = resolvedEntries.timetableEntries;
        console.log('Using resolved timetable entries');
    } else {
        const generatedEntries = loadJSONFile('generated-timetable-entries.json');
        if (generatedEntries && generatedEntries.timetableEntries) {
            timetableEntries = generatedEntries.timetableEntries;
            console.log('Using generated timetable entries');
        }
    }
    
    if (!departments || !subjects || !teachers || !rooms) {
        console.error('Failed to load required data files');
        return;
    }

    // Create lookup maps
    const departmentMap = new Map(departments.map(d => [d.id, d]));
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));
    const timeslotMap = new Map(timeslots.map(ts => [ts.id, ts]));
    
    // Initialize department statistics
    const departmentStats = new Map();
    departments.forEach(dept => {
        departmentStats.set(dept.id, {
            name: dept.name,
            shortName: dept.shortName,
            subjects: new Set(),
            entries: 0,
            days: new Set(),
            unresolvedRooms: new Set(),
            unresolvedTeachers: new Set(),
            details: []
        });
    });

    // Determine primary data source
    let primaryData = null;
    let dataSource = '';
    
    if (timetableEntries && Array.isArray(timetableEntries) && timetableEntries.length > 0) {
        primaryData = timetableEntries;
        dataSource = 'timetable entries';
        console.log(`Using ${timetableEntries.length} timetable entries as primary data source`);
    } else if (allocations && Array.isArray(allocations) && allocations.length > 0) {
        primaryData = allocations;
        dataSource = 'allocations';
        console.log(`Using ${allocations.length} allocations as primary data source`);
    } else {
        console.log('No timetable data found to process.');
        return;
    }

    // Process the primary data
    let totalEntries = 0;
    primaryData.forEach(item => {
        // Handle both allocation and timetable entry formats
        const subjectId = item.subjectId;
        const subject = subjectMap.get(subjectId);
        if (!subject) {
            console.warn(`Subject not found: ${subjectId}`);
            return;
        }
        
        const departmentId = item.departmentId || subject.departmentId;
        const dept = departmentStats.get(departmentId);
        if (!dept) {
            console.warn(`Department not found: ${departmentId}`);
            return;
        }
        
        dept.subjects.add(subjectId);
        dept.entries++;
        dept.days.add(item.day);
        totalEntries++;
        
        const teacher = teacherMap.get(item.teacherId);
        const roomId = item.roomId || item.room;
        const room = roomMap.get(roomId);
        const timeslot = timeslotMap.get(item.timeSlotId);
        
        // Check for unresolved placeholders
        if (!teacher || !teacher.name) {
            dept.unresolvedTeachers.add(item.teacherId || 'Unknown');
        }
        if (!room && roomId) {
            dept.unresolvedRooms.add(roomId);
        } else if (!roomId) {
            dept.unresolvedRooms.add('No room assigned');
        }
        
        dept.details.push({
            subjectCode: item.subjectCode || subject.code || `Subject-${subjectId}`,
            roomName: room ? room.name : (roomId || 'Unassigned'),
            dayPattern: item.day,
            period: item.period || (timeslot ? timeslot.period : 'Unknown'),
            teacherName: teacher ? teacher.name : item.teacherId || 'Unassigned'
        });
    });

    // Generate summary
    const summary = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalDepartments: departments.length,
            totalSubjects: subjects.length,
            totalTeachers: teachers.length,
            totalRooms: rooms.length,
            totalEntries: totalEntries
        },
        departmentSummary: [],
        unresolvedPlaceholders: {
            rooms: new Set(),
            teachers: new Set()
        }
    };

    // Compile department summaries
    for (const [deptId, stats] of departmentStats) {
        if (stats.entries === 0) continue;
        
        const deptSummary = {
            departmentName: stats.name,
            shortName: stats.shortName,
            subjectCount: stats.subjects.size,
            entriesGenerated: stats.entries,
            daysCovered: stats.days.size,
            unresolvedRooms: Array.from(stats.unresolvedRooms),
            unresolvedTeachers: Array.from(stats.unresolvedTeachers),
            details: stats.details
        };
        
        summary.departmentSummary.push(deptSummary);
        
        // Aggregate unresolved items
        stats.unresolvedRooms.forEach(room => summary.unresolvedPlaceholders.rooms.add(room));
        stats.unresolvedTeachers.forEach(teacher => summary.unresolvedPlaceholders.teachers.add(teacher));
    }

    // Convert sets to arrays
    summary.unresolvedPlaceholders.rooms = Array.from(summary.unresolvedPlaceholders.rooms);
    summary.unresolvedPlaceholders.teachers = Array.from(summary.unresolvedPlaceholders.teachers);

    // Sort departments by name
    summary.departmentSummary.sort((a, b) => a.departmentName.localeCompare(b.departmentName));

    // Generate outputs
    generateJSONSummary(summary);
    generateMarkdownSummary(summary);
    generateCSVSummaries(summary);

    console.log('\\nSummary generation complete!');
    console.log(`Total entries processed: ${totalEntries}`);
    console.log(`Departments with data: ${summary.departmentSummary.length}`);
    console.log(`Unresolved rooms: ${summary.unresolvedPlaceholders.rooms.length}`);
    console.log(`Unresolved teachers: ${summary.unresolvedPlaceholders.teachers.length}`);
}

function generateJSONSummary(summary) {
    const filename = 'timetable-summary.json';
    fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
    console.log(`Generated: ${filename}`);
}

function generateMarkdownSummary(summary) {
    const filename = 'timetable-summary.md';
    let md = '# Timetable System Summary\\n\\n';
    
    md += `**Generated:** ${summary.metadata.generatedAt}\\n\\n`;
    
    md += '## Overview\\n\\n';
    md += `- **Total Departments:** ${summary.metadata.totalDepartments}\\n`;
    md += `- **Total Subjects:** ${summary.metadata.totalSubjects}\\n`;
    md += `- **Total Teachers:** ${summary.metadata.totalTeachers}\\n`;
    md += `- **Total Rooms:** ${summary.metadata.totalRooms}\\n`;
    md += `- **Total Entries:** ${summary.metadata.totalEntries}\\n\\n`;
    
    md += '## Department Statistics\\n\\n';
    md += '| Department | Subjects | Entries | Days | Unresolved Rooms | Unresolved Teachers |\\n';
    md += '|------------|----------|---------|------|------------------|---------------------|\\n';
    
    summary.departmentSummary.forEach(dept => {
        md += `| ${dept.departmentName} | ${dept.subjectCount} | ${dept.entriesGenerated} | ${dept.daysCovered} | ${dept.unresolvedRooms.length} | ${dept.unresolvedTeachers.length} |\\n`;
    });
    
    md += '\\n## Unresolved Placeholders\\n\\n';
    
    if (summary.unresolvedPlaceholders.rooms.length > 0) {
        md += '### Unresolved Rooms\\n';
        summary.unresolvedPlaceholders.rooms.forEach(room => {
            md += `- ${room}\\n`;
        });
        md += '\\n';
    }
    
    if (summary.unresolvedPlaceholders.teachers.length > 0) {
        md += '### Unresolved Teachers\\n';
        summary.unresolvedPlaceholders.teachers.forEach(teacher => {
            md += `- ${teacher}\\n`;
        });
        md += '\\n';
    }
    
    if (summary.unresolvedPlaceholders.rooms.length === 0 && summary.unresolvedPlaceholders.teachers.length === 0) {
        md += '✅ All rooms and teachers are properly resolved!\\n\\n';
    }
    
    fs.writeFileSync(filename, md);
    console.log(`Generated: ${filename}`);
}

function generateCSVSummaries(summary) {
    // Generate main summary CSV
    const summaryCSV = 'Department,Subjects,Entries,Days,Unresolved_Rooms,Unresolved_Teachers\\n' +
        summary.departmentSummary.map(dept => 
            `"${dept.departmentName}",${dept.subjectCount},${dept.entriesGenerated},${dept.daysCovered},${dept.unresolvedRooms.length},${dept.unresolvedTeachers.length}`
        ).join('\\n');
    
    fs.writeFileSync('department-summary.csv', summaryCSV);
    console.log('Generated: department-summary.csv');
    
    // Generate detailed CSV for each department
    summary.departmentSummary.forEach(dept => {
        if (dept.details.length === 0) return;
        
        const csvHeader = 'Subject_Code,Room_Name,Day_Pattern,Period,Teacher_Name\\n';
        const csvData = dept.details.map(detail => 
            `"${detail.subjectCode}","${detail.roomName}","${detail.dayPattern}",${detail.period},"${detail.teacherName}"`
        ).join('\\n');
        
        const filename = `${dept.shortName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-timetable.csv`;
        fs.writeFileSync(filename, csvHeader + csvData);
        console.log(`Generated: ${filename}`);
    });
}

// Run the analysis
generateTimetableSummary();
