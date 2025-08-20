import React from "react";
import type {
  Day,
  Department,
  Room,
  Semester,
  Teacher,
  TimeSlot,
  TimetableEntry,
  Subject
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
	subjects: Subject[];
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

		const activeSemesters = semesters ? semesters.filter(s => s.isActive) : [];
		const [selectedSemesterId, setSelectedSemesterId] = React.useState(activeSemesters?.[0]?.id);

  // Filter entries only those subjects that belong to that semesterid
  // from timetable entry  we get the subject id  and from that we can get the semester id and then filter on that semester basis
  const filteredEntries = selectedSemesterId
    ? entries.filter(e => e.subjectId && subjects.find(s => s.id === e.subjectId && s.semesterId === selectedSemesterId))
    : entries;

	return (
		<div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
			{/* Semesters tab bar */}
					{activeSemesters && activeSemesters.length > 0 && (
						<div className="mb-4 flex gap-2">
							{activeSemesters.map(sem => (
								<button
									key={sem.id}
									className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${selectedSemesterId === sem.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
									onClick={() => setSelectedSemesterId(sem.id)}
								>
									{sem.name}
								</button>
							))}
						</div>
					)}
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
												// Find entries for this department and timeslot, matching subject's departmentId
												const deptEntries = filteredEntries.filter((e) => {
													if (e.timeSlotId !== slot.id || !e.subjectId) return false;
													const subject = subjects.find(s => s.id === e.subjectId);
													return subject && subject.departmentId === dept.id;
												});
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
