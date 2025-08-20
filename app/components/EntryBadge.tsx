import React from "react";
import type { TimetableEntry } from "../types";
import { formatDaysDisplay } from "../utils/formatDaysDisplay";

export type EntryBadgeProps = {
  entry: TimetableEntry;
  subjectName?: string;
  teacherName?: string;
  roomName?: string;
};

const EntryBadge: React.FC<EntryBadgeProps> = ({ entry, subjectName, teacherName, roomName }) => (
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
        Days: {Array.isArray(entry.dayIds) ? formatDaysDisplay(entry.dayIds) : entry.dayIds ?? ''}
      </div>
    </div>
  </li>
);

export default EntryBadge;
