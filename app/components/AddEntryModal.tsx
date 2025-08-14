import React from "react";
import type { AddEntryData } from "../types/ui";
import type { Semester, Subject, Teacher, Room } from "../types/timetable";

interface AddEntryModalProps {
  show: boolean;
  addEntryData: AddEntryData;
  setAddEntryData: (data: AddEntryData) => void;
  setShowAddEntry: (show: boolean) => void;
  semesters: Semester[];
  visibleDepartments: Array<{ id: string; name: string; offersBSDegree: boolean; shortName: string }>;
  subjects: Subject[];
  teachers: Teacher[];
  timeSlots: Array<{ id: string; period: number; start: string; end: string }>;
  rooms: Room[];
  formatSemesterLabel: (sem?: Semester) => string;
  onAddEntry: () => void;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  show,
  addEntryData,
  setAddEntryData,
  setShowAddEntry,
  semesters,
  visibleDepartments,
  subjects,
  teachers,
  timeSlots,
  rooms,
  formatSemesterLabel,
  onAddEntry
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Add Timetable Entry</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onAddEntry();
          }}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Semester</label>
            <select
              className="w-full border rounded p-2"
              value={addEntryData.selectedSemester}
              onChange={e => setAddEntryData({ ...addEntryData, selectedSemester: e.target.value })}
              required
            >
              <option value="">Select Semester</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {formatSemesterLabel(sem)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              className="w-full border rounded p-2"
              value={addEntryData.selectedDepartment}
              onChange={e => setAddEntryData({ ...addEntryData, selectedDepartment: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {visibleDepartments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.shortName} - {dep.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select
              className="w-full border rounded p-2"
              value={addEntryData.selectedSubject}
              onChange={e => setAddEntryData({ ...addEntryData, selectedSubject: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects
                .filter(s => s.departmentId === addEntryData.selectedDepartment)
                .map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Teacher</label>
            <select
              className="w-full border rounded p-2"
              value={addEntryData.selectedTeacher}
              onChange={e => setAddEntryData({ ...addEntryData, selectedTeacher: e.target.value })}
              required
            >
              <option value="">Select Teacher</option>
              {teachers
                .filter(t => t.departmentId === addEntryData.selectedDepartment)
                .map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Time Slot</label>
            <select
              className="w-full border rounded p-2"
              value={addEntryData.selectedTimeSlot}
              onChange={e => setAddEntryData({ ...addEntryData, selectedTimeSlot: e.target.value })}
              required
              disabled
            >
              <option value="">Select Time Slot</option>
              {timeSlots.map(ts => (
                <option key={ts.id} value={ts.id}>
                  Period {ts.period}: {ts.start}-{ts.end}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Time slot is preselected and read-only.</div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Days</label>
            <div className="flex flex-wrap gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                <label key={day} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={addEntryData.selectedDays.includes(day)}
                    onChange={e => {
                      if (e.target.checked) {
                        setAddEntryData({
                          ...addEntryData,
                          selectedDays: [...addEntryData.selectedDays, day]
                        });
                      } else {
                        setAddEntryData({
                          ...addEntryData,
                          selectedDays: addEntryData.selectedDays.filter(d => d !== day)
                        });
                      }
                    }}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Room</label>
            <select
              className="w-full border rounded p-2"
              value={addEntryData.room}
              onChange={e => setAddEntryData({ ...addEntryData, room: e.target.value })}
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setShowAddEntry(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              disabled={
                !addEntryData.selectedSemester ||
                !addEntryData.selectedDepartment ||
                !addEntryData.selectedSubject ||
                !addEntryData.selectedTeacher ||
                !addEntryData.selectedTimeSlot ||
                addEntryData.selectedDays.length === 0
              }
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntryModal;
