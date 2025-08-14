'use client';

import React, { useEffect, useState } from 'react';
import { getDaysOfWeek, getDepartments, getSemesters, getSubjects, getTeachers, getTimeSlots } from '../lib/repositories/timetableRepository';
import { getActiveDepartmentsForSemester } from '../utils/timetable-utils';

// Type definitions
export type TimetableEntryType = {
  id?: string;
  semesterId: string;
  departmentId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room: string; // made required to match TimetableEntry
  note?: string;
};

interface TimetableAdminProps {
  onAddEntry: (entry: Omit<TimetableEntryType, 'id'>) => void;
}

// Remove defaultTimeSlots; will fetch from DB

const TimetableAdmin: React.FC<TimetableAdminProps> = ({ onAddEntry }) => {
  const [formData, setFormData] = useState({
    semesterId: '',
    departmentId: '',
    subjectId: '',
    teacherId: '',
    timeSlotId: '',
    room: ''
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // State for fetched data
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; offersBSDegree: boolean; shortName: string }>>([]);
  const [semesters, setSemesters] = useState<Array<{ id: string; name: string; isActive: boolean }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; departmentId: string; semesterLevel: number }>>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string; departmentId: string }>>([]);
  const [timeSlotsState, setTimeSlotsState] = useState<Array<{ id: string; period: number; start: string; end: string }>>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);

  useEffect(() => {
    getDepartments().then(setDepartments);
    getSemesters().then(semList => {
      setSemesters(semList);
      const firstActive = semList.find(s => s.isActive);
      if (firstActive) {
        setFormData(prev => ({ ...prev, semesterId: firstActive.id }));
      }
    });
    getSubjects().then(setSubjects);
    getTeachers().then(setTeachers);
    getTimeSlots().then(setTimeSlotsState);
    getDaysOfWeek().then(setDaysOfWeek);
  }, []);

  // Get departments that offer BS degrees with semester-scoped filtering
  const getBSDepartmentsForSemester = () => {
    if (!formData.semesterId) {
      return departments.filter(d => d.offersBSDegree);
    }
    return getActiveDepartmentsForSemester(formData.semesterId, departments, semesters);
  };

  // Get teachers filtered by selected department
  const getFilteredTeachers = () => {
    if (!formData.departmentId) return [];
    return teachers.filter(teacher => teacher.departmentId === formData.departmentId);
  };

  // Get subjects for the selected department and semester
  const getDepartmentSubjects = () => {
    if (!formData.departmentId || !formData.semesterId) return [];
    
    // For now, show subjects that match the department (semester filtering can be enhanced later)
    return subjects.filter(subject => 
      subject.departmentId === formData.departmentId &&
      subject.semesterLevel <= 2 // For now, only show first year subjects
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjectId && formData.teacherId && formData.timeSlotId && selectedDays.length > 0) {
      selectedDays.forEach((day) => {
        onAddEntry({
          ...formData,
          day,
          note: ''
        });
      });
      // Reset form
      setFormData({
        semesterId: '',
        departmentId: '',
        subjectId: '',
        teacherId: '',
        timeSlotId: '',
        room: ''
      });
      setSelectedDays([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when semester or department changes
      ...(name === 'semesterId' && { departmentId: '', teacherId: '', subjectId: '', classId: '' }),
      ...(name === 'departmentId' && { teacherId: '', subjectId: '', classId: '' })
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Timetable Entry</h2>
      
  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
          <select
            name="semesterId"
            value={formData.semesterId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Select Semester</option>
            {semesters.filter(semester => semester.isActive).map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
            disabled={!formData.semesterId}
          >
            <option value="">Select Department</option>
            {getBSDepartmentsForSemester().map((department: { id: string; name: string; offersBSDegree: boolean; shortName: string }) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
            disabled={!formData.departmentId}
          >
            <option value="">Select Subject</option>
            {getDepartmentSubjects().map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
          <select
            name="teacherId"
            value={formData.teacherId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
            disabled={!formData.departmentId}
          >
            <option value="">Select Teacher</option>
            {getFilteredTeachers().map((teacher: { id: string; name: string; departmentId: string }) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
          
          {/* Day selection shortcuts */}
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => {
                const firstThreeDays = daysOfWeek.slice(0, 3); // Mon, Tue, Wed
                setSelectedDays(firstThreeDays);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Select First 3 Days (1-3)
            </button>
            <button
              type="button"
              onClick={() => {
                const lastThreeDays = daysOfWeek.slice(3, 6); // Thu, Fri, Sat
                setSelectedDays(lastThreeDays);
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Select Last 3 Days (4-6)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays([])}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-3 p-3 border border-gray-300 rounded-md">
            {daysOfWeek.map((day) => {
              const checked = selectedDays.includes(day);
              return (
                <label key={day} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelectedDays((prev) =>
                        isChecked ? [...prev, day] : prev.filter((d) => d !== day)
                      );
                    }}
                  />
                  <span>{day}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">Select one or more days to add entries for each selected day.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
          <select
            name="timeSlotId"
            value={formData.timeSlotId}
            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100 cursor-not-allowed"
            required
            disabled
          >
            <option value="">Select Time Slot</option>
            {timeSlotsState.map((slot: { id: string; period: number; start: string; end: string }) => (
              <option key={slot.id} value={slot.id}>
                Period {slot.period} ({slot.start}-{slot.end})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room (Optional)</label>
          <input
            type="text"
            name="room"
            value={formData.room}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter room number"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Add Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimetableAdmin;
