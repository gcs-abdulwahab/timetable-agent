// Utility function to add two numbers

import React, { useState } from "react";
import type { Day, TimetableEntry } from "../types";
import { formatDaysDisplay } from "../utils/formatDaysDisplay";



export type EntryBadgeProps = {
	entry: TimetableEntry;
	subjectName?: string;
	teacherName?: string;
	roomName?: string;
	days: Day[];
	onEditEntry?: (entry: TimetableEntry) => void;
	hasRoomConflict?: boolean; // <-- add this prop
	hasTeacherConflict?: boolean; // <-- add this prop
	conflictDetails?: string; // <-- add this prop for conflict details
};

const EntryBadge: React.FC<EntryBadgeProps> = ({
	entry,
	subjectName,
	teacherName,
	roomName,
	days,
	onEditEntry,
	hasRoomConflict = false, // <-- default false
	hasTeacherConflict = false, // <-- default false
	conflictDetails,
}) => {
	const [showTooltip, setShowTooltip] = useState(false);

	// Function to add two numbers
	const addTwoNumbers = (a: number, b: number): number => {
		return a + b;
	};

	

	return (
		<li className="mb-1">
			<div
				className={`flex flex-col items-start px-3 py-2 rounded-lg border shadow-sm relative ${hasRoomConflict || hasTeacherConflict ? 'bg-red-200 border-red-500' : 'bg-blue-50 border-blue-200'}`}
				onMouseEnter={() => (hasRoomConflict || hasTeacherConflict) && setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				style={{ position: 'relative' }}
			>
				<div className="font-semibold text-blue-900 text-sm mb-1">
					{subjectName ? subjectName : `Subject #${entry.subjectId}`}
				</div>
				<div className="text-xs text-gray-700 mb-1">
					{teacherName ? (
						teacherName
					) : (
						<span style={{ color: 'red', fontWeight: 'bold' }}>TBA</span>
					)}
				</div>
				<div className="text-xs text-gray-700 mb-1">
					Room: {roomName ? roomName : `#${entry.roomId}`}
				</div>
                <div className="text-xs text-gray-700">
                    <strong>
                    {days && days.length > 0 ? (
                        formatDaysDisplay(
                            days
                                .filter(day => entry.dayIds.includes(day.id))
                                .map(day => day.dayCode)
                        )
                    ) : (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>No days</span>
                    )}</strong>
                </div>
				<div>
					{(!entry.dayIds || entry.dayIds.length === 0) && (
						<span style={{ color: 'red'}}>Days not selected</span>
					)}
				</div>
				{hasRoomConflict && (
          <div className="text-xs font-bold text-red-700 mb-1 flex items-center">
            🚨 Room Conflict
          </div>
        )}
        {hasTeacherConflict && (
          <div className="text-xs font-bold text-red-700 mb-1 flex items-center">
            🚨 Teacher Conflict
          </div>
        )}
        {/* Tooltip for conflict details */}
        {showTooltip && (hasRoomConflict || hasTeacherConflict) && (
          <div className="absolute z-10 left-1/2 top-full mt-2 w-64 p-2 bg-white border border-red-400 rounded shadow-lg text-xs text-gray-800" style={{ transform: 'translateX(-50%)' }}>
            <div className="font-bold text-red-700 mb-1">Conflict Details:</div>
            <div>
              {hasTeacherConflict && <div>🚨 Teacher Conflict: {conflictDetails?.includes('Teacher') ? conflictDetails : 'Teacher has multiple entries in this slot.'}</div>}
              {hasRoomConflict && <div>🚨 Room Conflict: {conflictDetails?.includes('Room') ? conflictDetails : 'Room is double-booked for this slot.'}</div>}
              {!hasTeacherConflict && !hasRoomConflict && <div>{conflictDetails || 'Multiple entries for the same teacher or room in this slot.'}</div>}
            </div>
          </div>
        )}
				<button
					className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-200 text-blue-900 rounded hover:bg-blue-300"
					onClick={(e) => {
						e.stopPropagation();
                        if (onEditEntry) {
                            
                            onEditEntry(entry)
                        };
					}}
				>
					Edit
				</button>
			</div>
		</li>
	);
};

export default EntryBadge;
