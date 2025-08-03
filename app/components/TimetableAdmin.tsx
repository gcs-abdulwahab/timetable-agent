'use client';

import React, { useState } from 'react';
import {
    classes,
    daysOfWeek,
    subjects,
    teachers,
    timeSlots,
    TimetableEntry
} from './data';

interface TimetableAdminProps {
  onAddEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
}

const TimetableAdmin: React.FC<TimetableAdminProps> = ({ onAddEntry }) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    classId: '',
    timeSlotId: '',
    day: '',
    room: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjectId && formData.teacherId && formData.classId && formData.timeSlotId && formData.day) {
      onAddEntry({
        ...formData,
        note: ''
      });
      // Reset form
      setFormData({
        subjectId: '',
        teacherId: '',
        classId: '',
        timeSlotId: '',
        day: '',
        room: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Timetable Entry</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
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
          >
            <option value="">Select Teacher</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            name="classId"
            value={formData.classId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                Year {cls.year} - Section {cls.section} ({cls.dayType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <select
            name="day"
            value={formData.day}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Select Day</option>
            {daysOfWeek.map(day => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
          <select
            name="timeSlotId"
            value={formData.timeSlotId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Select Time Slot</option>
            {timeSlots.map(slot => (
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
