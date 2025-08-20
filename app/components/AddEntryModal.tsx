import React from "react";
import type { Day } from "../types/Day";
import type { Department } from "../types/Department";
import type { TimeSlot } from "../types/TimeSlot";
import type { Room, Semester, Subject, Teacher } from "../types/timetable";
import type { AddEntryData } from "../types/ui";

interface AddEntryModalProps {
  show: boolean;
  addEntryData: AddEntryData;
  setAddEntryData: (data: AddEntryData) => void;
  setShowAddEntry: (show: boolean) => void;
  semesters: Semester[];
  visibleDepartments: Department[];
  subjects: Subject[];
  teachers: Teacher[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  days: Day[];
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
  days,
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
              className="w-full border rounded p-2 bg-gray-100"
              value={String(addEntryData.selectedSemester || '')}
              disabled
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
              className="w-full border rounded p-2 bg-gray-100"
              value={addEntryData.selectedDepartment}
              disabled
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
              value={String(addEntryData.selectedSubject || '')}
              onChange={e => setAddEntryData({ ...addEntryData, selectedSubject: e.target.value === '' ? '' : Number(e.target.value) })}
              required
            >
              <option value="">Select Subject</option>
              {subjects
                .filter(s => s.departmentId === Number(addEntryData.selectedDepartment) && s.semesterId === Number(addEntryData.selectedSemester))
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
              value={String(addEntryData.selectedTeacher || '')}
              onChange={e => setAddEntryData({ ...addEntryData, selectedTeacher: e.target.value === '' ? '' : Number(e.target.value) })}
              required
            >
              <option value="">Select Teacher</option>
              {teachers
                .filter(t => t.departmentId === Number(addEntryData.selectedDepartment))
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
              className="w-full border rounded p-2 bg-gray-100"
              value={String(addEntryData.selectedTimeSlot || '')}
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
              {days.filter(dayObj => dayObj.isActive).map(dayObj => (
                <label key={dayObj.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={addEntryData.selectedDays.map(String).includes(String(dayObj.dayCode))}
                    onChange={e => {
                      if (e.target.checked) {
                        setAddEntryData({
                          ...addEntryData,
                          selectedDays: [...addEntryData.selectedDays.map(String), String(dayObj.dayCode)]
                        });
                      } else {
                        setAddEntryData({
                          ...addEntryData,
                          selectedDays: addEntryData.selectedDays.map(String).filter(d => d !== String(dayObj.dayCode))
                        });
                      }
                    }}
                  />
                  <span>{dayObj.shortName || dayObj.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Room</label>
            <select
              className="w-full border rounded p-2"
              value={String(addEntryData.room || '')}
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
