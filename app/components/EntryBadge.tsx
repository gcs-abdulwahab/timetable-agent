// Utility function to add two numbers

import React from "react";
import type { Day, TimetableEntry } from "../types";
import { formatDaysDisplay } from "../utils/formatDaysDisplay";



export type EntryBadgeProps = {
	entry: TimetableEntry;
	subjectName?: string;
	teacherName?: string;
	roomName?: string;
	days: Day[];
	onEditEntry?: (entry: TimetableEntry) => void;
};

const EntryBadge: React.FC<EntryBadgeProps> = ({
	entry,
	subjectName,
	teacherName,
	roomName,
	days,
	onEditEntry,
}) => {
	// Function to add two numbers
	const addTwoNumbers = (a: number, b: number): number => {
		return a + b;
	};

	

	return (
		<li className="mb-1">
			
			<div className="flex flex-col items-start px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 shadow-sm relative">
				<div className="font-semibold text-blue-900 text-sm mb-1">
					{subjectName ? subjectName : `Subject #${entry.subjectId}`}
				</div>
				<div className="text-xs text-gray-700 mb-1">
					{teacherName ? teacherName : `#${entry.teacherId}`}
				</div>
				<div className="text-xs text-gray-700 mb-1">
					Room: {roomName ? roomName : `#${entry.roomId}`}
				</div>
                <div className="text-xs text-gray-700">
                    <strong>
                    {formatDaysDisplay(
                        days
                            .filter(day => entry.dayIds.includes(day.id))
                            .map(day => day.dayCode)
                    )}</strong>
                </div>
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
