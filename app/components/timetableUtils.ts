// Additional timetable management functions and utilities

import type { Subject, Teacher, TimeSlot, TimetableEntry } from '../types';

// Function to check for conflicts
export const checkConflicts = (entries: TimetableEntry[]): string[] => {
  const conflicts: string[] = [];
  
  // Group entries by day and time slot
  const grouped = entries.reduce((acc, entry) => {
    const key = `${entry.day}-${entry.timeSlotId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  // Check for teacher conflicts (same teacher in multiple places at same time)
  Object.entries(grouped).forEach(([timeKey, slotEntries]) => {
    const teacherCounts = slotEntries.reduce((acc, entry) => {
      acc[entry.teacherId] = (acc[entry.teacherId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(teacherCounts).forEach(([teacherId, count]) => {
      if (count > 1) {
        conflicts.push(`Teacher ${teacherId} has multiple classes at ${timeKey}`);
      }
    });
  });

  return conflicts;
};

// Function to generate statistics
export const generateStats = (entries: TimetableEntry[]) => {
  const teacherLoad = entries.reduce((acc, entry) => {
    acc[entry.teacherId] = (acc[entry.teacherId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subjectFrequency = entries.reduce((acc, entry) => {
    acc[entry.subjectId] = (acc[entry.subjectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dayDistribution = entries.reduce((acc, entry) => {
    acc[entry.day] = (acc[entry.day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    teacherLoad,
    subjectFrequency,
    dayDistribution,
    totalEntries: entries.length
  };
};

// Function to export timetable to CSV format
export const exportToCSV = (entries: TimetableEntry[], teachers: Teacher[], subjects: Subject[]): string => {
  const headers = ['Day', 'Time Slot', 'Subject', 'Teacher', 'Class', 'Room'];
  
  const rows = entries.map(entry => {
    const teacher = teachers.find(t => t.id === entry.teacherId);
    const subject = subjects.find(s => s.id === entry.subjectId);
    
    return [
      entry.day,
      entry.timeSlotId,
      subject?.name || '',
      teacher?.name || '',
      entry.room || ''
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

// Function to validate timetable structure
export const validateTimetable = (entries: TimetableEntry[], teachers: Teacher[], subjects: Subject[], timeSlots: TimeSlot[]): string[] => {
  const errors: string[] = [];

  entries.forEach(entry => {
    // Check if teacher exists
    if (!teachers.find(t => t.id === entry.teacherId)) {
      errors.push(`Entry ${entry.id}: Teacher ${entry.teacherId} not found`);
    }

    // Check if subject exists
    if (!subjects.find(s => s.id === entry.subjectId)) {
      errors.push(`Entry ${entry.id}: Subject ${entry.subjectId} not found`);
    }

    // Check if time slot exists
    if (!timeSlots.find(ts => ts.id === entry.timeSlotId)) {
      errors.push(`Entry ${entry.id}: Time slot ${entry.timeSlotId} not found`);
    }
  });

  return errors;
};
