import React from "react";
import { useTimetableEntries } from "../hooks/useTimetableEntries";
import type {
  Day,
  Department,
  Room,
  Semester,
  Subject,
  Teacher,
  TimeSlot,
  TimetableEntry
} from "../types";
import EditEntryModal from "./EditEntryModal";
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

// Removed unused types

const SemesterTabs: React.FC<{ semesters: Semester[]; selectedId: number | undefined; onSelect: (id: number) => void }> = ({ semesters, selectedId, onSelect }) => (
	<div className="mb-4 flex gap-2">
		{semesters.map(sem => (
			<button
				key={sem.id}
				className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${selectedId === sem.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
				onClick={() => onSelect(sem.id)}
			>
				{sem.name}
			</button>
		))}
	</div>
);

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
	// Memoize active semesters
	const activeSemesters = React.useMemo(() => semesters ? semesters.filter(s => s.isActive) : [], [semesters]);
	const [selectedSemesterId, setSelectedSemesterId] = React.useState<number | undefined>(activeSemesters?.[0]?.id);
	React.useEffect(() => {
		if (activeSemesters.length > 0) {
			setSelectedSemesterId(activeSemesters[0].id);
		}
	}, [activeSemesters]);

	// Use custom hook for entry state and drag/drop
	const { entryList, handleDragStart, handleDrop, handleDragOver, setEntryList } = useTimetableEntries(entries);

	// Filter entries only those subjects that belong to that semesterid
	const filteredEntries = selectedSemesterId
		? entryList.filter(e => e.subjectId && subjects.find(s => s.id === e.subjectId && s.semesterId === selectedSemesterId))
		: entryList;

	// State for edit modal
	const [showEditModal, setShowEditModal] = React.useState(false);
	const [editEntry, setEditEntry] = React.useState<TimetableEntry | null>(null);

	// Handler for edit button
	const handleEditEntry = (entry: TimetableEntry) => {
		setEditEntry(entry);
		setShowEditModal(true);
	};

	// Handler for saving edit (close modal)
	const handleSaveEdit = async () => {
		setShowEditModal(false);
		setEditEntry(null);
		// Refetch entries from backend after edit
		try {
			const res = await fetch('/api/timetable-entries');
			if (res.ok) {
				const updatedEntries = await res.json();
				setEntryList(updatedEntries);
			}
		} catch (err) {
			console.error('Failed to refresh timetable entries', err);
		}
	};

	// Render timetable grid
	return (
		<div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
			{activeSemesters.length > 0 && (
				<SemesterTabs semesters={activeSemesters} selectedId={selectedSemesterId} onSelect={setSelectedSemesterId} />
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
									<td
										key={slot.id}
										className="border p-2 align-top"
										onDrop={handleDrop(slot.id)}
										onDragOver={handleDragOver}
									>
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
														<div
															key={entry.id}
															draggable
															onDragStart={handleDragStart(entry.id)}
														>
															<EntryBadge
																entry={entry}
																subjectName={subject ? subject.name : undefined}
																teacherName={teacher ? teacher.name : undefined}
                                roomName={room ? room.name : undefined}
                                days = {days}
																onEditEntry={handleEditEntry}
															/>
														</div>
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
			{/* Edit modal */}
			   <EditEntryModal
				   show={showEditModal}
				   setShowEditEntry={setShowEditModal}
				   semesters={semesters}
				   visibleDepartments={departments}
				   subjects={subjects}
				   teachers={teachers}
				   timeSlots={timeSlots}
				   rooms={rooms}
				   days={days}
				   formatSemesterLabel={sem => sem?.name ?? ""}
				   onSaveEdit={handleSaveEdit}
				   initialSelectedDays={editEntry ? [...editEntry.dayIds].map(String) : []}
				   editEntryId={editEntry ? editEntry.id : undefined}
			   />
		</div>
	);
};

export default Timetable;
