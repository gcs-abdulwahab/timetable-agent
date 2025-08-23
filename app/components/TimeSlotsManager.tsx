'use client';

import React, { useState } from 'react';

import { TimeSlot } from './../types';

interface TimeSlotsManagerProps {
  slots: TimeSlot[];
  setSlots: (slots: TimeSlot[]) => void;
}



const TimeSlotsManager: React.FC<TimeSlotsManagerProps> = ({ slots, setSlots }) => {
  const [isEditingSlot, setIsEditingSlot] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'>>({ 
    start: '', 
    end: '',
    period: 1
  });
  const [timerIncrement, setTimerIncrement] = useState<number>(45);

  // Set default start time to last slot's end time on initial load
  React.useEffect(() => {
    if (slots.length > 0) {
      const lastSlot = slots.reduce((a, b) => (a.period > b.period ? a : b));
      setNewSlot({
        start: lastSlot.end,
        end: addMinutesToTime(lastSlot.end, timerIncrement),
        period: lastSlot.period + 1
      });
    }
  }, [slots, timerIncrement]);

  // Helper function to add minutes to time
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(mins + minutes);
    return date.toTimeString().slice(0, 5); // Get HH:mm format
  };

  // CRUD operations for Time Slots
  const addSlot = async () => {
    // If there are existing slots, set default start time to last slot's end time
    const slotToAdd = { ...newSlot };
    if (slots.length > 0 && !newSlot.start) {
      const lastSlot = slots.reduce((a, b) => (a.period > b.period ? a : b));
      slotToAdd.start = lastSlot.end;
      slotToAdd.period = lastSlot.period + 1;
      // Optionally, set default end time to 45 mins after start
      slotToAdd.end = addMinutesToTime(slotToAdd.start, 45);
      setNewSlot(slotToAdd);
    }
    if (!slotToAdd.start || !slotToAdd.end) return;
    try {
      const nextPeriod = slots.length > 0 
        ? Math.max(...slots.map(s => s.period)) + 1 
        : 1;
      // Convert time strings to ISO date-time format (today's date)
      const today = new Date();
      const toISODateTime = (time: string) => {
        const [hours, mins] = time.split(":").map(Number);
        const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, mins);
        return dt.toISOString();
      };
      const response = await fetch('/api/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: toISODateTime(slotToAdd.start),
          end: toISODateTime(slotToAdd.end),
          period: nextPeriod,
        }),
      });

      if (response.ok) {
        const addedSlot = await response.json();
        setSlots([...slots, addedSlot]);
        // Set the start time of the next slot to the end time of the current slot
        setNewSlot({ 
          start: addedSlot.end,
          end: '',
          period: addedSlot.period + 1
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add time slot');
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      alert('Failed to add time slot');
    }
  };

  const updateSlot = async (id: number, updatedSlot: Partial<TimeSlot>) => {
    try {
      const response = await fetch('/api/timeslots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updatedSlot,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setSlots(slots.map(slot => slot.id === id ? updated : slot));
        setIsEditingSlot(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update time slot');
      }
    } catch (error) {
      console.error('Error updating time slot:', error);
      alert('Failed to update time slot');
    }
  };

  const deleteSlot = async (id: number) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      try {
        const response = await fetch(`/api/timeslots?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSlots(slots.filter(slot => slot.id !== id));
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to delete time slot');
        }
      } catch (error) {
        console.error('Error deleting time slot:', error);
        alert('Failed to delete time slot');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Time Slots</h2>
      
      <div>
        {/* Add New Slot */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Add New Time Slot</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input
              type="time"
              value={newSlot.start}
              onChange={(e) => {
                const start = e.target.value;
                const end = addMinutesToTime(start, timerIncrement);
                setNewSlot({ ...newSlot, start, end });
              }}
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
              onChange={(e) => setNewSlot({ ...newSlot, period: parseInt(e.target.value) || 1 })}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Period"
              min="1"
            />
            <select
              value={timerIncrement}
              onChange={e => setTimerIncrement(Number(e.target.value))}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={45}>45 min</option>
              <option value={50}>50 min</option>
              <option value={60}>60 min</option>
            </select>
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
              {isEditingSlot === String(slot.id) ? (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => {
                      const start = e.target.value;
                      const end = addMinutesToTime(start, 45);
                      updateSlot(Number(slot.id), { start, end });
                    }}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(Number(slot.id), { end: e.target.value })}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    value={slot.period}
                    onChange={(e) => updateSlot(Number(slot.id), { period: parseInt(e.target.value) || slot.period })}
                    className="px-2 py-1 border rounded text-sm"
                    placeholder="Period"
                    min="1"
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
                      onClick={() => setIsEditingSlot(String(slot.id))}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSlot(Number(slot.id))}
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
  );
};




export default TimeSlotsManager;


