import React from "react";
import type {
  Day,
  Department,
  Room,
  Semester,
  Teacher,
  TimeSlot,
  TimetableEntry,
} from "../types";
import EntryBadge from "./EntryBadge";

// Define types for forms and data
type TimetableProps = {
	departments: Department[];
	teachers: Teacher[];
	days: Day[];
	rooms: Room[];
	timeSlots: TimeSlot[];
	semesters: Semester[];
	entries: TimetableEntry[];
	subjects: { id: number; name: string }[];
};

type AddEntryData = {
	selectedSubjectId: number;
	selectedTeacherId: number;
	selectedTimeSlotId: number;
	selectedDaysIds: number[];
	selectedRoomId: number;
};

type EditFormData = {
	subjectId: number;
	teacherId: number;
	roomId: number;
	timeSlotId: number;
	selectedDays: number[];
};

const Timetable: React.FC<TimetableProps> = ({
	departments,
	semesters,
	timeSlots,
	entries,
	subjects,
	teachers,
	rooms,
	days,
}) => {
	// ...existing code...

	// Main render: wrap all content in a single parent div
	return (
		<div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
			<table className="w-full border-collapse bg-white rounded shadow">
				<thead>
					<tr>
						<th className="border p-2 bg-gray-100 text-left whitespace-nowrap min-w-32">
							Department
						</th>
						{timeSlots.map((slot) => (
							<th
								key={slot.id}
								className="border p-2 bg-gray-100 text-center w-48 min-w-48 max-w-48"
							>
								Period {slot.period}
								<br />
								{slot.start}-{slot.end}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{departments.map((dept) => (
						<tr key={dept.id}>
							<td className="border p-2 font-semibold bg-gray-50">
								{dept.name}
							</td>
							{timeSlots.map((slot) => {
								// Find entries for this department and timeslot
								const deptEntries = entries.filter(
									(e) =>
										e.timeSlotId === slot.id &&
										e.subjectId &&
										departments.some((d) => d.id === dept.id)
								);
								return (
									<td key={slot.id} className="border p-2 align-top">
										{deptEntries.length > 0 ? (
											<ul>
												{deptEntries.map((entry) => {
													const subject = subjects.find(
														(s) => s.id === entry.subjectId
													);
													const teacher = teachers.find(
														(t) => t.id === entry.teacherId
													);
													const room = rooms.find((r) => r.id === entry.roomId);

													return (
														<EntryBadge
															key={entry.id}
															entry={entry}
															subjectName={subject ? subject.name : undefined}
															teacherName={teacher ? teacher.name : undefined}
															roomName={room ? room.name : undefined}
														/>
													);
												})}
											</ul>
										) : (
											<span className="text-gray-400">—</span>
										)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Timetable;
