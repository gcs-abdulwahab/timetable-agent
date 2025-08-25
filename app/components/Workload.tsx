"use client";

import React, { useMemo, useState } from 'react';
import type { Department } from '../types/Department';
import type { Subject } from '../types/Subject';
import type { Teacher } from '../types/Teacher';
import type { TimeSlot } from '../types/TimeSlot';
import type { TimetableEntry } from '../types/TimetableEntry';

interface WorkloadProps {
  departments: Department[];
  teachers: Teacher[];
  timeslots: TimeSlot[];
  timetableEntries: TimetableEntry[];
  subjects: Subject[];
}

const formatTimeSlot = (ts: TimeSlot) => `${ts.start} - ${ts.end}`;

const Workload: React.FC<WorkloadProps> = ({ departments, teachers, timeslots, timetableEntries, subjects }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(departments[0]?.id || null);

  // Filter teachers and entries by department
  const deptTeachers = useMemo(() => teachers.filter(t => t.departmentId === selectedDeptId), [teachers, selectedDeptId]);
  const deptEntries = useMemo(() => timetableEntries.filter(e => deptTeachers.some(t => t.id === e.teacherId)), [timetableEntries, deptTeachers]);

  // Helper to get entries for a teacher and timeslot
  const getEntries = (teacherId: number, timeSlotId: number) =>
    deptEntries.filter(e => e.teacherId === teacherId && e.timeSlotId === timeSlotId);

  // Helper to get subject name
  const getSubjectName = (subjectId: number) => subjects.find(s => s.id === subjectId)?.name || subjectId;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Workload Overview</h2>
      <div className="mb-4">
        <label className="font-semibold mr-2">Department:</label>
        <select
          value={selectedDeptId ?? ''}
          onChange={e => setSelectedDeptId(Number(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-gray-100">Teacher</th>
              {timeslots.map(ts => (
                <th key={ts.id} className="border px-4 py-2 bg-gray-100">{formatTimeSlot(ts)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deptTeachers.map(teacher => (
              <tr key={teacher.id}>
                <td className="border px-4 py-2 font-semibold bg-gray-50">{teacher.name}</td>
                {timeslots.map(ts => (
                  <td key={ts.id} className="border px-2 py-2 align-top">
                    {getEntries(teacher.id, ts.id).map(entry => (
                      <div key={entry.id} className="mb-1 p-1 bg-blue-50 rounded text-xs">
                        {getSubjectName(entry.subjectId)}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Workload;
