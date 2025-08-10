import { teachers, timetableEntries, subjects, semesters } from './data';

export interface ConflictInfo {
  type: 'teacher' | 'room';
  timeSlot: string;
  day: string;
  conflictingEntries: string[];
  details: string;
}

export function checkScheduleConflicts(): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  
  // Group entries by time slot and day
  const timeSlotGroups = timetableEntries.reduce((groups, entry) => {
    const key = `${entry.timeSlotId}_${entry.day}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
    return groups;
  }, {} as Record<string, typeof timetableEntries>);

  // Check each time slot for conflicts
  Object.entries(timeSlotGroups).forEach(([timeSlotKey, entries]) => {
    const [timeSlotId, day] = timeSlotKey.split('_');
    
    // Check teacher conflicts
    const teacherMap = new Map<string, string[]>();
    entries.forEach(entry => {
      if (!teacherMap.has(entry.teacherId)) {
        teacherMap.set(entry.teacherId, []);
      }
      teacherMap.get(entry.teacherId)!.push(entry.id);
    });

    teacherMap.forEach((entryIds, teacherId) => {
      if (entryIds.length > 1) {
        const teacher = teachers.find(t => t.id === teacherId);
        
        // Generate detailed conflict message for QA testing
        const conflictEntries = entryIds.map(entryId => {
          const entry = timetableEntries.find(e => e.id === entryId);
          if (!entry) return 'Unknown Entry';
          
          const subject = subjects.find(s => s.id === entry.subjectId);
          const semester = semesters.find(sem => sem.id === entry.semesterId);
          
          const subjectName = subject?.name || 'Unknown Subject';
          const semesterName = semester?.name || 'Unknown Semester';
          
          return `${subjectName} (${semesterName}) on ${entry.day}`;
        });
        
        const detailsMessage = conflictEntries.join(', ');
        
        conflicts.push({
          type: 'teacher',
          timeSlot: timeSlotId,
          day,
          conflictingEntries: entryIds,
          details: detailsMessage
        });
      }
    });

    // Check room conflicts
    const roomMap = new Map<string, string[]>();
    entries.forEach(entry => {
      if (entry.room) {
        if (!roomMap.has(entry.room)) {
          roomMap.set(entry.room, []);
        }
        roomMap.get(entry.room)!.push(entry.id);
      }
    });

    roomMap.forEach((entryIds, room) => {
      if (entryIds.length > 1) {
        
        // Generate detailed room conflict message for QA testing
        const conflictEntries = entryIds.map(entryId => {
          const entry = timetableEntries.find(e => e.id === entryId);
          if (!entry) return 'Unknown Entry';
          
          const subject = subjects.find(s => s.id === entry.subjectId);
          const semester = semesters.find(sem => sem.id === entry.semesterId);
          const teacher = teachers.find(t => t.id === entry.teacherId);
          
          const subjectName = subject?.name || 'Unknown Subject';
          const semesterName = semester?.name || 'Unknown Semester';
          const teacherName = teacher?.name || 'Unknown Teacher';
          
          return `${subjectName} (${semesterName}) - ${teacherName} on ${entry.day}`;
        });
        
        const detailsMessage = conflictEntries.join(', ');
        
        conflicts.push({
          type: 'room',
          timeSlot: timeSlotId,
          day,
          conflictingEntries: entryIds,
          details: detailsMessage
        });
      }
    });
  });

  return conflicts;
}

export function validateTimetable(): { isValid: boolean; conflicts: ConflictInfo[] } {
  const conflicts = checkScheduleConflicts();
  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

export function getTeacherSchedule(teacherId: string) {
  return timetableEntries
    .filter(entry => entry.teacherId === teacherId)
    .sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCompare = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayCompare !== 0) return dayCompare;
      return a.timeSlotId.localeCompare(b.timeSlotId);
    });
}

export function getRoomSchedule(room: string) {
  return timetableEntries
    .filter(entry => entry.room === room)
    .sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCompare = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayCompare !== 0) return dayCompare;
      return a.timeSlotId.localeCompare(b.timeSlotId);
    });
}
