'use client';

import { useDepartments, useSemesters, useSubjects, useTimeSlots } from '@/app/hooks/useData';
import React, { useEffect, useMemo } from 'react';
import { Semester, Teacher, TimetableEntry } from './data';

interface TeacherProfileProps {
  teacher: Teacher;
  timetableEntries: TimetableEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({
  teacher,
  timetableEntries,
  isOpen,
  onClose
}) => {
  // Load data from APIs
  const { data: departments } = useDepartments();
  const { data: subjects } = useSubjects();
  const { data: semesters } = useSemesters();
  const { data: timeSlots } = useTimeSlots();

  // Calculate teacher's statistics and workload
  const teacherStats = useMemo(() => {
    // Get all entries for this teacher
    const teacherEntries = timetableEntries.filter(entry => entry.teacherId === teacher.id);
    
    // Calculate total teaching hours per week
    const totalHoursPerWeek = teacherEntries.length; // Each entry is 1 hour
    
    // Get unique subjects taught
    const uniqueSubjects = [...new Set(teacherEntries.map(entry => entry.subjectId))];
    
    // Get semesters taught
    const uniqueSemesters = [...new Set(teacherEntries.map(entry => entry.semesterId))];
    
    // Get days of week the teacher is active
    const activeDays = [...new Set(teacherEntries.map(entry => entry.day))];
    
    // Calculate workload distribution by day
    const workloadByDay = teacherEntries.reduce((acc, entry) => {
      acc[entry.day] = (acc[entry.day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate peak teaching time (most common time slot)
    const timeSlotFrequency = teacherEntries.reduce((acc, entry) => {
      acc[entry.timeSlotId] = (acc[entry.timeSlotId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const peakTimeSlotId = Object.entries(timeSlotFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const peakTimeSlot = timeSlots.find(ts => ts.id === peakTimeSlotId);
    
    return {
      totalHoursPerWeek,
      uniqueSubjects: uniqueSubjects.length,
      uniqueSemesters: uniqueSemesters.length,
      activeDays: activeDays.length,
      workloadByDay,
      peakTimeSlot,
      teacherEntries
    };
  }, [teacher.id, timetableEntries, timeSlots]);

  // Get teacher's department
  const teacherDepartment = useMemo(() => {
    return departments.find(dept => dept.id === teacher.departmentId);
  }, [departments, teacher.departmentId]);

  // Create mini timetable data
  const miniTimetableData = useMemo(() => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetableGrid: Record<string, Record<string, TimetableEntry[]>> = {};
    
    // Initialize grid
    daysOfWeek.forEach(day => {
      timetableGrid[day] = {};
      timeSlots.forEach(slot => {
        timetableGrid[day][slot.id] = [];
      });
    });
    
    // Fill grid with teacher's entries
    teacherStats.teacherEntries.forEach(entry => {
      if (timetableGrid[entry.day] && timetableGrid[entry.day][entry.timeSlotId]) {
        timetableGrid[entry.day][entry.timeSlotId].push(entry);
      }
    });
    
    return { daysOfWeek, timetableGrid };
  }, [teacherStats.teacherEntries, timeSlots]);

  // Helper function to format semester label
  const formatSemesterLabel = (sem?: Semester) => {
    if (!sem) return 'Unknown Semester';
    const match = sem.name?.match(/\d+/);
    return match ? `Semester ${match[0]}` : sem.name;
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{teacher.name}</h2>
              <div className="flex items-center space-x-4 mt-2 text-blue-100">
                <span className="text-lg">{teacher.shortName}</span>
                {teacherDepartment && (
                  <>
                    <span>•</span>
                    <span>{teacherDepartment.name} ({teacherDepartment.shortName})</span>
                  </>
                )}
              </div>
              {teacher.designation && (
                <div className="text-blue-100 mt-1">{teacher.designation}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-800 transition-colors"
              title="Close (ESC)"
            >
              ×
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Teaching Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{teacherStats.totalHoursPerWeek}</div>
              <div className="text-sm text-gray-600">Hours/Week</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{teacherStats.uniqueSubjects}</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{teacherStats.uniqueSemesters}</div>
              <div className="text-sm text-gray-600">Semesters</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{teacherStats.activeDays}</div>
              <div className="text-sm text-gray-600">Active Days</div>
            </div>
          </div>

          {/* Peak Time */}
          {teacherStats.peakTimeSlot && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">Peak Teaching Time</div>
              <div className="text-lg font-semibold text-gray-800">
                Period {teacherStats.peakTimeSlot.period} ({teacherStats.peakTimeSlot.start} - {teacherStats.peakTimeSlot.end})
              </div>
            </div>
          )}
        </div>

        {/* Teacher Details */}
        {(teacher.email || teacher.contactNumber || teacher.cnic || teacher.personnelNumber || teacher.seniority) && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacher.email && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-800">{teacher.email}</span>
                </div>
              )}
              {teacher.contactNumber && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Contact:</span>
                  <span className="text-gray-800">{teacher.contactNumber}</span>
                </div>
              )}
              {teacher.personnelNumber && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Personnel #:</span>
                  <span className="text-gray-800">{teacher.personnelNumber}</span>
                </div>
              )}
              {teacher.seniority && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Seniority:</span>
                  <span className="text-gray-800">{teacher.seniority}</span>
                </div>
              )}
              {teacher.cnic && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">CNIC:</span>
                  <span className="text-gray-800">{teacher.cnic}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workload Distribution */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Workload Distribution</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-xs text-gray-600 font-medium">{day.slice(0, 3)}</div>
                  <div className="text-lg font-bold text-blue-600 mt-1">
                    {teacherStats.workloadByDay[day] || 0}
                  </div>
                  <div className="text-xs text-gray-500">hours</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Timetable */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mini Timetable</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left font-medium">Time</th>
                  {miniTimetableData.daysOfWeek.map(day => (
                    <th key={day} className="border border-gray-300 p-2 text-center font-medium">
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.id}>
                    <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                      <div>{slot.start}-{slot.end}</div>
                      <div className="text-xs text-gray-500">P{slot.period}</div>
                    </td>
                    {miniTimetableData.daysOfWeek.map(day => {
                      const entries = miniTimetableData.timetableGrid[day][slot.id] || [];
                      return (
                        <td key={day} className="border border-gray-300 p-1">
                          {entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((entry, index) => {
                                const subject = subjects.find(s => s.id === entry.subjectId);
                                const semester = semesters.find(s => s.id === entry.semesterId);
                                return (
                                  <div
                                    key={index}
                                    className="bg-blue-100 rounded px-2 py-1 text-xs"
                                    title={`${subject?.name} - ${formatSemesterLabel(semester)} - Room: ${entry.room || 'Not assigned'}`}
                                  >
                                    <div className="font-medium text-blue-800">
                                      {subject?.shortName || subject?.code}
                                    </div>
                                    {entry.room && (
                                      <div className="text-blue-600">{entry.room}</div>
                                    )}
                                    <div className="text-blue-500">{formatSemesterLabel(semester)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-12 flex items-center justify-center text-gray-400">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject List */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subjects Teaching</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...new Set(teacherStats.teacherEntries.map(entry => entry.subjectId))].map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              const subjectEntries = teacherStats.teacherEntries.filter(entry => entry.subjectId === subjectId);
              const uniqueSemesters = [...new Set(subjectEntries.map(entry => entry.semesterId))];
              
              if (!subject) return null;
              
              return (
                <div key={subjectId} className="bg-white border rounded-lg p-4">
                  <div className="font-semibold text-gray-800">{subject.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Code: {subject.code} • Credit Hours: {subject.creditHours}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Semesters: {uniqueSemesters.map(semId => {
                      const sem = semesters.find(s => s.id === semId);
                      return formatSemesterLabel(sem);
                    }).join(', ')}
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    {subjectEntries.length} hours/week
                  </div>
                </div>
              );
            })}
          </div>
          
          {teacherStats.teacherEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No teaching assignments found for this teacher.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
