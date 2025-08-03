'use client';

import React from 'react';
import {
    classes,
    departments,
    subjects,
    teachers,
    timeSlots,
    timetableEntries
} from './data';

const Timetable: React.FC = () => {
  // Helper function to get subject by ID
  const getSubject = (id: string) => subjects.find(s => s.id === id);
  
  // Helper function to get teacher by ID
  const getTeacher = (id: string) => teachers.find(t => t.id === id);

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-xs font-bold text-gray-700 w-32">
              Department
            </th>
            {timeSlots.map(slot => (
              <th key={slot.id} className="border border-gray-300 p-2 text-xs font-bold text-gray-700 min-w-[150px]">
                Period {slot.period}<br/>
                {slot.start}-{slot.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id} className="hover:bg-gray-50">
              {/* Department column */}
              <td className="border border-gray-300 p-2 text-center bg-gray-50">
                <div className="text-xs font-semibold text-gray-700">
                  {department.shortName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {department.name}
                </div>
              </td>
              
              {/* Time slot columns */}
              {timeSlots.map(timeSlot => {
                // Get all entries for this department and time slot across all days
                const departmentEntries = timetableEntries.filter(entry => {
                  const subject = getSubject(entry.subjectId);
                  return subject?.departmentId === department.id && entry.timeSlotId === timeSlot.id;
                });
                
                return (
                  <td 
                    key={`${department.id}-${timeSlot.id}`} 
                    className="border border-gray-300 p-1 align-top min-h-[80px] max-w-[150px]"
                  >
                    {departmentEntries.length > 0 && (
                      <div className="space-y-1">
                        {departmentEntries.map((entry) => {
                          const subject = getSubject(entry.subjectId);
                          const teacher = getTeacher(entry.teacherId);
                          
                          return (
                            <div 
                              key={entry.id} 
                              className={`p-1 rounded text-xs border ${subject?.color || 'bg-gray-100'}`}
                              style={{ fontSize: '8px', lineHeight: '1.1' }}
                            >
                              <div className="font-semibold text-gray-800 mb-0.5">
                                {subject?.shortName}
                              </div>
                              <div className="text-gray-600 truncate">
                                {teacher?.shortName}
                              </div>
                              {entry.room && (
                                <div className="text-gray-500 text-xs">
                                  {entry.room}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Department Overview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Departments</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {departments.map(department => (
            <div key={department.id} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-blue-200 border"></div>
              <span className="text-sm text-gray-700">
                {department.name} ({department.shortName})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Subject Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${subject.color} border`}></div>
              <span className="text-sm text-gray-700">
                {subject.shortName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Teachers List */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Teachers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {teachers.map(teacher => (
            <div key={teacher.id} className="text-sm text-gray-700">
              {teacher.name}
            </div>
          ))}
        </div>
      </div>

      {/* Class Information */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Classes & Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">First Three Days (Mon-Wed)</h4>
            <div className="space-y-1">
              {classes.filter(c => c.dayType === 'first-three').map(cls => (
                <div key={cls.id} className="text-sm text-gray-600">
                  Year {cls.year} - Section {cls.section}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Last Three Days (Thu-Sat)</h4>
            <div className="space-y-1">
              {classes.filter(c => c.dayType === 'last-three').map(cls => (
                <div key={cls.id} className="text-sm text-gray-600">
                  Year {cls.year} - Section {cls.section}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">All Days</h4>
            <div className="space-y-1">
              {classes.filter(c => c.dayType === 'all-days').map(cls => (
                <div key={cls.id} className="text-sm text-gray-600">
                  Year {cls.year} - Section {cls.section}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
