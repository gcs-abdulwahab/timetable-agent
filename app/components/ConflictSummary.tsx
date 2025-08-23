import React from "react";
import type { Room, Teacher, TimetableEntry } from "../types";

interface ConflictSummaryProps {
  teacherConflicts: { [key: string]: number[] };
  roomConflicts: { [key: string]: number[] };
  entries: TimetableEntry[];
  teachers: Teacher[];
  rooms: Room[];
}

const ConflictSummary: React.FC<ConflictSummaryProps> = ({ teacherConflicts, roomConflicts, entries, teachers, rooms }) => {
  // Helper to get entry details
  const getEntryDetails = (entryId: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return null;
    const teacher = teachers.find(t => t.id === entry.teacherId);
    const room = rooms.find(r => r.id === entry.roomId);
    return {
      teacher: teacher?.name || entry.teacherId,
      room: room?.name || entry.roomId,
      timeSlotId: entry.timeSlotId,
      entryId: entry.id,
    };
  };

  // Render teacher conflicts
  const teacherConflictList = Object.entries(teacherConflicts).map(([key, ids]) => (
    <li key={key} className="mb-2">
      <span className="font-bold text-red-700">Teacher Conflict:</span> 
      {ids.map(id => {
        const details = getEntryDetails(id);
        return details ? (
          <span key={id} className="ml-2">Entry #{details.entryId} (Teacher: {details.teacher}, Room: {details.room}, Slot: {details.timeSlotId})</span>
        ) : null;
      })}
    </li>
  ));

  // Render room conflicts
  const roomConflictList = Object.entries(roomConflicts).map(([key, ids]) => (
    <li key={key} className="mb-2">
      <span className="font-bold text-red-700">Room Conflict:</span> 
      {ids.map(id => {
        const details = getEntryDetails(id);
        return details ? (
          <span key={id} className="ml-2">Entry #{details.entryId} (Room: {details.room}, Teacher: {details.teacher}, Slot: {details.timeSlotId})</span>
        ) : null;
      })}
    </li>
  ));

  if (teacherConflictList.length === 0 && roomConflictList.length === 0) {
    return <div className="mt-6 p-4 bg-green-50 text-green-700 rounded">No conflicts detected.</div>;
  }

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
      <h3 className="text-lg font-bold text-red-800 mb-2">All Conflicts</h3>
      <ul>{teacherConflictList}</ul>
      <ul>{roomConflictList}</ul>
    </div>
  );
};

export default ConflictSummary;
