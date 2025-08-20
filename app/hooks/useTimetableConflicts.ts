import { useMemo } from "react";
import type { Semester, Subject, Teacher, TimetableEntry } from "../types";

export function useTimetableConflicts(entries: TimetableEntry[], subjects: Subject[], teachers: Teacher[], semesters: Semester[], departments: any[], days: any[], rooms: any[]) {
  // Helper function to get subject by ID
  const getSubject = (id: number | string | undefined) => subjects.find(s => s.id === Number(id));
  // Helper function to get teacher by ID
  const getTeacher = (id: number | string | undefined) => teachers.find(t => t.id === Number(id));
  // Helper function to get semester by ID
  const getSemester = (id: number | string | undefined) => semesters.find(s => s.id === Number(id));
  // Helper function to format semester label
  const formatSemesterLabel = (sem?: Semester) => {
    if (!sem) return 'Unknown Semester';
    const match = sem.name?.match(/\d+/);
    if (match) {
      return `Semester ${match[0]}`;
    } else {
      return sem.name;
    }
  };

  // Conflict detection
  const hasConflicts = useMemo(() => (groupEntries: TimetableEntry[]): boolean => {
    if (!groupEntries || groupEntries.length === 0) return false;
    const firstEntry = groupEntries[0];
    const timeSlot = firstEntry.timeSlotId;
    const teacher = firstEntry.teacherId;
    const currentDays = groupEntries.map(e => e.dayId);
    const teacherConflicts = groupEntries.filter(entry =>
      entry.teacherId === teacher &&
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.dayId) &&
      !groupEntries.some(e => e.id === entry.id)
    );
    const roomConflicts = firstEntry.roomId ? groupEntries.filter(entry =>
      entry.roomId === firstEntry.roomId &&
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.dayId) &&
      !groupEntries.some(e => e.id === entry.id)
    ) : [];
    return teacherConflicts.length > 0 || roomConflicts.length > 0;
  }, [subjects, teachers, semesters, departments, days, rooms]);

  // Conflict details
  const getConflictDetails = useMemo(() => (groupEntries: TimetableEntry[]): string => {
    if (!groupEntries || groupEntries.length === 0) return '';
    const firstEntry = groupEntries[0];
    const timeSlot = firstEntry.timeSlotId;
    const teacher = firstEntry.teacherId;
    const currentDays = groupEntries.map(e => e.dayId);
    const teacherConflicts = groupEntries.filter(entry =>
      entry.teacherId === teacher &&
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.dayId) &&
      !groupEntries.some(e => e.id === entry.id)
    );
    const roomConflicts = firstEntry.roomId ? groupEntries.filter(entry =>
      entry.roomId === firstEntry.roomId &&
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.dayId) &&
      !groupEntries.some(e => e.id === entry.id)
    ) : [];
    let details = '';
    if (teacherConflicts.length > 0) {
      const teacherObj = getTeacher(teacher);
      const teacherName = teacherObj?.name || teacher;
      const teacherShortName = teacherObj?.name ?? teacher;
      const currentSubject = getSubject(firstEntry.subjectId);
      const currentTimeSlotDetails = timeSlots.find((ts: any) => ts.id === timeSlot);
      details += `⚠️ TEACHER CONFLICT DETECTED\n`;
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      details += `👨‍🏫 Teacher: ${teacherName} (${teacherShortName})\n`;
      details += `⏰ Time Slot: Period ${currentTimeSlotDetails?.period || ''} (${currentTimeSlotDetails?.start}-${currentTimeSlotDetails?.end})\n`;
      details += `📚 Current Subject: ${currentSubject?.name || firstEntry.subjectId}\n`;
      details += `📅 Days: ${currentDays.join(', ')}\n\n`;
      details += `🔴 Conflicting with:\n`;
      teacherConflicts.forEach((c, index) => {
        const subject = getSubject(c.subjectId);
        const semester = getSemester(c.semesterId);
        const semLabel = formatSemesterLabel(semester);
        const department = departments.find((d: any) => d.id === subject?.departmentId);
        details += `   ${index + 1}. ${subject?.name || c.subjectId}\n`;
        details += `      📖 Subject Code: ${subject?.name || c.subjectId}\n`;
        details += `      🏛️  Department: ${department?.name || 'Unknown'} (${department?.shortName || 'N/A'})\n`;
        details += `      📊 ${semLabel}\n`;
        const day = days.find((d: any) => d.id === c.dayId);
        details += `      📅 Day: ${day?.name || 'Unknown'}\n`;
        const room = rooms.find((r: any) => r.id === c.roomId);
        details += `      🏫 Room: ${room?.name || 'Not assigned'}\n\n`;
      });
    }
    if (roomConflicts.length > 0) {
      if (teacherConflicts.length > 0) details += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      const currentSubject = getSubject(firstEntry.subjectId);
      const currentTeacher = getTeacher(firstEntry.teacherId);
      const currentTimeSlotDetails = timeSlots.find((ts: any) => ts.id === timeSlot);
      details += `🏫 ROOM CONFLICT DETECTED\n`;
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const room = rooms.find((r: any) => r.id === firstEntry.roomId);
      details += `🏛️  Room: ${room?.name || 'Not assigned'}\n`;
      details += `⏰ Time Slot: Period ${currentTimeSlotDetails?.period || ''} (${currentTimeSlotDetails?.start}-${currentTimeSlotDetails?.end})\n`;
      details += `📚 Current Subject: ${currentSubject?.name || firstEntry.subjectId}\n`;
      details += `👨‍🏫 Current Teacher: ${currentTeacher?.name} (${currentTeacher?.name})\n`;
      details += `📅 Days: ${currentDays.join(', ')}\n\n`;
      details += `🔴 Room also booked for:\n`;
      roomConflicts.forEach((c, index) => {
        const subject = subjects.find((s: any) => s.id === c.subjectId);
        const conflictTeacher = teachers.find((t: any) => t.id === c.teacherId);
        const semester = subject?.semesterId ? semesters.find((s: any) => s.id === subject.semesterId) : null;
        const semLabel = formatSemesterLabel(semester);
        const department = departments.find((d: any) => d.id === subject?.departmentId);
        details += `   ${index + 1}. ${subject?.name || c.subjectId}\n`;
        details += `      📖 Subject Code: ${subject?.name || c.subjectId}\n`;
        details += `      🏛️  Department: ${department?.name || 'Unknown'} (${department?.name || 'N/A'})\n`;
        details += `      👨‍🏫 Teacher: ${conflictTeacher?.name || c.teacherId} (${conflictTeacher?.name || c.teacherId})\n`;
        details += `      📊 ${semLabel}\n`;
        const day = days.find((d: any) => d.id === c.dayId);
        details += `      📅 Day: ${day?.name || 'Unknown'}\n\n`;
      });
    }
    if (teacherConflicts.length > 0 || roomConflicts.length > 0) {
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      details += `💡 RESOLUTION SUGGESTIONS:\n`;
      if (teacherConflicts.length > 0) {
        details += `• Assign a different teacher to one of the conflicting subjects\n`;
        details += `• Move one of the subjects to a different time slot\n`;
        details += `• Reschedule conflicting classes to different days\n`;
      }
      if (roomConflicts.length > 0) {
        details += `• Assign a different room to one of the conflicting subjects\n`;
        details += `• Move one of the subjects to a different time slot\n`;
        details += `• Reschedule conflicting classes to different days\n`;
      }
    }
    return details.trim();
  }, [subjects, teachers, semesters, departments, days, rooms]);

  return { hasConflicts, getConflictDetails };
}
