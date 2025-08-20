import React from "react";
import type { TimetableEntry } from "../types";

export type EntryBadgeProps = {
  entry: TimetableEntry;
  subjectName?: string;
  teacherName?: string;
  roomName?: string;
  dayName?: string;
};

const EntryBadge: React.FC<EntryBadgeProps> = ({ entry, subjectName, teacherName, roomName, dayName }) => (
  <li className="mb-1">
    <div className="flex flex-col items-start px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 shadow-sm">
      <div className="font-semibold text-blue-900 text-sm mb-1">
        {subjectName ? subjectName : `Subject #${entry.subjectId}`}
      </div>
      <div className="text-xs text-gray-700 mb-1">
        Teacher: {teacherName ? teacherName : `#${entry.teacherId}`}
      </div>
      <div className="text-xs text-gray-700 mb-1">
        Room: {roomName ? roomName : `#${entry.roomId}`}
      </div>
      <div className="text-xs text-gray-700">
        Day: {dayName ? dayName : `#${entry.dayId}`}
      </div>
    </div>
  </li>
);

export default EntryBadge;
