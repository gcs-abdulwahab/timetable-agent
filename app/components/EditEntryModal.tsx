import React from "react";
import type { Room, Semester, Subject, Teacher } from "../types";
import type { Day } from "../types/Day";
import type { Department } from "../types/Department";
import type { TimeSlot } from "../types/TimeSlot";

interface EditEntryModalProps {
	entries?: import("../types").TimetableEntry[]; // Add entries prop to get entry data
	show: boolean;
	setShowEditEntry: (show: boolean) => void;
	semesters: Semester[];
	visibleDepartments: Department[];
	subjects: Subject[];
	teachers: Teacher[];
	timeSlots: TimeSlot[];
	rooms: Room[];
	days: Day[];
	formatSemesterLabel: (sem?: Semester) => string;
	onSaveEdit: () => void;
	initialSelectedDays?: string[]; // <-- add this prop
	editEntryId?: number; // <-- add this prop to receive the entry ID
   addDepartmentId?: number;
   addTimeSlotId?: number;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({
	show,
	days,
	editEntryId,
	addDepartmentId,
	addTimeSlotId,
	setShowEditEntry,
	onSaveEdit,
	initialSelectedDays = [],
	...props
}) => {
	// Ensure selectedDays is an array of integers
	const [selectedDays, setSelectedDays] = React.useState<number[]>(
		initialSelectedDays.map(Number)
	);
	const [selectedTeacherID, setSelectedTeacherID] = React.useState<number>();
	const [selectedRoomId, setSelectedRoomId] = React.useState<number>();
	const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<number | undefined>(addDepartmentId);
	const [selectedTimeSlotId, setSelectedTimeSlotId] = React.useState<number | undefined>(addTimeSlotId);

console.log("editEntryID...  " + editEntryId);
console.log("addDepartmentId...  " + addDepartmentId);
console.log("addTimeSlotId...  " + addTimeSlotId);

	
	React.useEffect(() => {
		setSelectedDays(initialSelectedDays.map(Number));
		if (addDepartmentId !== undefined) setSelectedDepartmentId(addDepartmentId);
		if (addTimeSlotId !== undefined) setSelectedTimeSlotId(addTimeSlotId);
	}, [initialSelectedDays, addDepartmentId, addTimeSlotId]);

	// Optionally, set initial teacher/room if passed as props (not shown here)
	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();

		// Save to database
		const updatedDays = selectedDays.map((id) => Number(id));
		const payload = {
			id: editEntryId,
			updatedDays,
			teacherId: selectedTeacherID,
			roomId: selectedRoomId,
			departmentId: selectedDepartmentId,
			timeSlotId: selectedTimeSlotId,
		};
		try {
			const response = await fetch("/api/timetable-entries", {
				method: editEntryId ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (response.ok) {
				console.log("Changes saved successfully!");
			} else {
				console.log("Failed to save changes.", updatedDays);
			}
		} catch (error) {
			console.log("An error occurred while saving changes.");
		}
		onSaveEdit();
		setShowEditEntry(false);
	};

	if (!show) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
				<h2 className="text-lg font-bold mb-4">Edit Timetable Entry</h2>
				<form onSubmit={handleSave}>
					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">Days</label>
						<div className="flex flex-wrap gap-2">
							{days
								.filter((dayObj) => dayObj.isActive)
								.map((dayObj) => (
									<label key={dayObj.id} className="flex items-center gap-1">
										<input
											type="checkbox"
											checked={selectedDays.includes(dayObj.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedDays((prev) => [...prev, dayObj.id]);
												} else {
													setSelectedDays((prev) =>
														prev.filter((d) => d !== dayObj.id)
													);
												}
											}}
										/>
										<span>{dayObj.shortName || dayObj.name}</span>
									</label>
								))}
						</div>
					</div>
					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">Department</label>
						<select
							className="w-full border rounded px-2 py-1"
							value={selectedDepartmentId}
							onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
						>
							{props.visibleDepartments.map((dept) => (
								<option key={dept.id} value={String(dept.id)}>
									{dept.name}
								</option>
							))}
						</select>
					</div>
					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">Time Slot</label>
						<select
							className="w-full border rounded px-2 py-1"
							value={selectedTimeSlotId}
							onChange={(e) => setSelectedTimeSlotId(Number(e.target.value))}
						>
							{props.timeSlots.map((slot) => (
								<option key={slot.id} value={String(slot.id)}>
									Period {slot.period}: {slot.start} - {slot.end}
								</option>
							))}
						</select>
					</div>
					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">Teacher</label>
						<select
							className="w-full border rounded px-2 py-1"
							value={selectedTeacherID}
							onChange={(e) => setSelectedTeacherID(Number(e.target.value))}
						>
							{props.teachers.map((teacher) => (
								<option key={teacher.id} value={String(teacher.id)}>
									{teacher.name}
								</option>
							))}
						</select>
					</div>
					<div className="mb-3">
						<label className="block text-sm font-medium mb-1">Room</label>
						<select
							className="w-full border rounded px-2 py-1"
							value={selectedRoomId}
							onChange={(e) => setSelectedRoomId(Number(e.target.value))}
						>
							{props.rooms.map((room) => (
								<option key={room.id} value={String(room.id)}>
									{room.name}
								</option>
							))}
						</select>
					</div>
					<div className="flex justify-end gap-2 mt-4">
						<button
							type="button"
							className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
							onClick={() => setShowEditEntry(false)}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditEntryModal;
