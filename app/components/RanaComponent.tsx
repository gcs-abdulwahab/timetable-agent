import React from "react";
import type { Department, Teacher, TimeSlot, TimetableEntry } from "../types";

interface RanaComponentProps {
  departments: Department[];
  timeSlots: TimeSlot[];
  entries: TimetableEntry[];
  teachers: Teacher[];
}

const RanaComponent: React.FC<RanaComponentProps> = ({ departments, timeSlots, entries, teachers }) => {
  // Helper to format time string to 12-hour format with AM/PM
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };
  // Helper to count teachers in a department
  const getTeacherCount = (deptId: number) => safeTeachers.filter(t => t.departmentId === deptId).length;
  // Use fallback for teachers in logic
  const safeTeachers = teachers ?? [];
  // Helper to count entries for department and timeslot based on teacher's department
  const getEntryCount = (deptId: number, slotId: number) => {
    return entries.filter(e => {
      const teacher = safeTeachers.find(t => t.id === e.teacherId);
      return (
        e.timeSlotId === slotId &&
        teacher && teacher.departmentId === deptId
      );
    }).length;
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
      <h2 className="text-xl font-bold mb-4">Rana Timetable Overview</h2>
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 text-left whitespace-nowrap" style={{ width: '160px' }}>Department</th>
            {timeSlots.map(slot => (
              <th key={slot.id} className="border p-2 bg-gray-100 text-center" style={{ minWidth: '120px' }}>
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept.id}>
              <td className="border p-2 font-semibold bg-gray-50" style={{ width: '160px' }}>
                {dept.name}
                <span className="ml-2 text-xs text-gray-500">({getTeacherCount(dept.id)} teachers)</span>
              </td>
              {timeSlots.map(slot => (
                <td key={slot.id} className="border p-2 text-center align-top">
                  {getEntryCount(dept.id, slot.id) > 0 ? (
                    <span className="font-bold text-blue-700 text-lg">{getEntryCount(dept.id, slot.id)}</span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RanaComponent;
