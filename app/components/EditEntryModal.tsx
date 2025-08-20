import React from "react";
import type { Room, Semester, Subject, Teacher } from "../types";
import type { Day } from "../types/Day";
import type { Department } from "../types/Department";
import type { TimeSlot } from "../types/TimeSlot";

interface EditEntryModalProps {
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
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({
  show,
  days,
  setShowEditEntry,
  onSaveEdit,
  initialSelectedDays = [] // <-- default to empty array
}) => {
  const [selectedDays, setSelectedDays] = React.useState<string[]>(initialSelectedDays);
  React.useEffect(() => {
    setSelectedDays(initialSelectedDays);
  }, [initialSelectedDays]); // <-- fix: only run when initialSelectedDays changes

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Edit Timetable Entry</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSaveEdit();
          }}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Days</label>
            <div className="flex flex-wrap gap-2">
              {days.filter(dayObj => dayObj.isActive).map(dayObj => (
                <label key={dayObj.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(String(dayObj.dayCode))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedDays(prev => [...prev, String(dayObj.dayCode)]);
                      } else {
                        setSelectedDays(prev => prev.filter(d => d !== String(dayObj.dayCode)));
                      }
                    }}
                  />
                  <span>{dayObj.shortName || dayObj.name}</span>
                </label>
              ))}
            </div>
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
