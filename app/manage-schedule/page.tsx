'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TimeSlot, daysOfWeek, timeSlots } from '../components/data';

interface Day {
  id: string;
  name: string;
  active: boolean;
}

const ManageSchedulePage = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [isEditingSlot, setIsEditingSlot] = useState<string | null>(null);
  const [isEditingDay, setIsEditingDay] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({ start: '', end: '', period: 1 });
  const [newDay, setNewDay] = useState({ name: '', active: true });

  // Load data from localStorage or use defaults
  useEffect(() => {
    const savedSlots = localStorage.getItem('timeSlots');
    const savedDays = localStorage.getItem('daysOfWeek');
    
    if (savedSlots) {
      setSlots(JSON.parse(savedSlots));
    } else {
      setSlots(timeSlots);
      localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
    }
    
    if (savedDays) {
      setDays(JSON.parse(savedDays));
    } else {
      const defaultDays = daysOfWeek.map((day, index) => ({
        id: `day${index + 1}`,
        name: day,
        active: true
      }));
      setDays(defaultDays);
      localStorage.setItem('daysOfWeek', JSON.stringify(defaultDays));
    }
  }, []);

  // Save slots to localStorage and export to data.ts
  const saveSlots = (updatedSlots: TimeSlot[]) => {
    setSlots(updatedSlots);
    localStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
  };

  // Save days to localStorage and export to data.ts
  const saveDays = (updatedDays: Day[]) => {
    setDays(updatedDays);
    localStorage.setItem('daysOfWeek', JSON.stringify(updatedDays));
  };

  // CRUD operations for Time Slots
  const addSlot = () => {
    if (newSlot.start && newSlot.end) {
      const newTimeSlot: TimeSlot = {
        id: `ts${Date.now()}`,
        start: newSlot.start,
        end: newSlot.end,
        period: newSlot.period
      };
      const updatedSlots = [...slots, newTimeSlot];
      saveSlots(updatedSlots);
      setNewSlot({ start: '', end: '', period: Math.max(...slots.map(s => s.period)) + 1 });
    }
  };

  const updateSlot = (id: string, updatedSlot: Partial<TimeSlot>) => {
    const updatedSlots = slots.map(slot => 
      slot.id === id ? { ...slot, ...updatedSlot } : slot
    );
    saveSlots(updatedSlots);
    setIsEditingSlot(null);
  };

  const deleteSlot = (id: string) => {
    const updatedSlots = slots.filter(slot => slot.id !== id);
    saveSlots(updatedSlots);
  };

  // CRUD operations for Days
  const addDay = () => {
    if (newDay.name) {
      const newDayObj: Day = {
        id: `day${Date.now()}`,
        name: newDay.name,
        active: newDay.active
      };
      const updatedDays = [...days, newDayObj];
      saveDays(updatedDays);
      setNewDay({ name: '', active: true });
    }
  };

  const updateDay = (id: string, updatedDay: Partial<Day>) => {
    const updatedDays = days.map(day => 
      day.id === id ? { ...day, ...updatedDay } : day
    );
    saveDays(updatedDays);
    setIsEditingDay(null);
  };

  const deleteDay = (id: string) => {
    const updatedDays = days.filter(day => day.id !== id);
    saveDays(updatedDays);
  };

  const exportToJSON = () => {
    const data = {
      timeSlots: slots,
      daysOfWeek: days.filter(day => day.active).map(day => day.name)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Schedule</h1>
            <div className="space-x-2">
              <Link
                href="/manage-departments"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                Manage Departments
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ← Back to Timetable
              </Link>
            </div>
          </div>
          
          <div className="mb-4">
            <button
              onClick={exportToJSON}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Export to JSON
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Time Slots Management */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Time Slots</h2>
              
              {/* Add New Slot */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium mb-3">Add New Time Slot</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input
                    type="time"
                    value={newSlot.start}
                    onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Start Time"
                  />
                  <input
                    type="time"
                    value={newSlot.end}
                    onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="End Time"
                  />
                  <input
                    type="number"
                    value={newSlot.period}
                    onChange={(e) => setNewSlot({ ...newSlot, period: parseInt(e.target.value) })}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Period"
                  />
                </div>
                <button
                  onClick={addSlot}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Slot
                </button>
              </div>

              {/* Slots List */}
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div key={slot.id} className="bg-white border rounded-lg p-3">
                    {isEditingSlot === slot.id ? (
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="time"
                          defaultValue={slot.start}
                          onChange={(e) => updateSlot(slot.id, { start: e.target.value })}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="time"
                          defaultValue={slot.end}
                          onChange={(e) => updateSlot(slot.id, { end: e.target.value })}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="number"
                          defaultValue={slot.period}
                          onChange={(e) => updateSlot(slot.id, { period: parseInt(e.target.value) })}
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Period {slot.period}</span>
                          <span className="text-gray-600 ml-2">{slot.start} - {slot.end}</span>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => setIsEditingSlot(slot.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Days Management */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Days of Week</h2>
              
              {/* Add New Day */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium mb-3">Add New Day</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newDay.name}
                    onChange={(e) => setNewDay({ ...newDay, name: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Day Name"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newDay.active}
                      onChange={(e) => setNewDay({ ...newDay, active: e.target.checked })}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
                <button
                  onClick={addDay}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Day
                </button>
              </div>

              {/* Days List */}
              <div className="space-y-2">
                {days.map((day) => (
                  <div key={day.id} className="bg-white border rounded-lg p-3">
                    {isEditingDay === day.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={day.name}
                          onChange={(e) => updateDay(day.id, { name: e.target.value })}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={day.active}
                            onChange={(e) => updateDay(day.id, { active: e.target.checked })}
                            className="mr-1"
                          />
                          Active
                        </label>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className={`font-medium ${day.active ? 'text-gray-800' : 'text-gray-400'}`}>
                            {day.name}
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            day.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {day.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => setIsEditingDay(day.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDay(day.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageSchedulePage;
