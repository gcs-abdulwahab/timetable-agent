'use client';


import { formatTime } from '../../lib/utils';

import React, { useState } from 'react';

import { usePrograms } from '../hooks/usePrograms';
import { TimeSlot } from './../types';
import { Program } from './../types/Program';
import { TimeSlotWithProgram } from './../types/TimeSlotWithProgram';

interface TimeSlotsManagerProps {
  slots: TimeSlotWithProgram[];
  setSlots: (slots: TimeSlotWithProgram[]) => void;
  // type?: string;
}



const TimeSlotsManager: React.FC<TimeSlotsManagerProps> = ({ slots, setSlots }) => {
  const { programs } = usePrograms();
  const [isEditingSlot, setIsEditingSlot] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlotWithProgram, 'id'>>({ 
    start: '', 
    end: '',
    period: 1,
    programId: undefined
  });
  const [timerIncrement, setTimerIncrement] = useState<number>(45);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);

  // Set default start time to last slot's end time on initial load and when slots change
  React.useEffect(() => {
    if (slots.length > 0) {
      const lastEnd = slots[slots.length - 1].end;
      setNewSlot((prev) => ({ ...prev, start: lastEnd }));
    }
  }, [slots]);
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

  // Set default selected program to first available program
  React.useEffect(() => {
    if (programs.length > 0 && selectedProgramId === undefined) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs]);

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
      // Convert time strings to ISO date-time format (today's date), handling AM/PM
      const today = new Date();
      const parseTimeWithAMPM = (time: string) => {
        // Accepts 'HH:mm' or 'HH:mm AM/PM'
        let hour = 0, minute = 0;
        let ampm = '';
        if (time.includes(' ')) {
          const [hm, ap] = time.split(' ');
          ampm = ap.trim().toUpperCase();
          [hour, minute] = hm.split(':').map(Number);
        } else {
          [hour, minute] = time.split(':').map(Number);
        }
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute).toISOString();
      };
      
      console.log("Start :> "+ slotToAdd.start)
      console.log("End :> " + slotToAdd.end)
    console.log("Start :> "+ parseTimeWithAMPM(slotToAdd.start))
      console.log("End :> "+ parseTimeWithAMPM(slotToAdd.end))
          
      const response = await fetch('/api/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: slotToAdd.start,
          end: slotToAdd.end,


          period: nextPeriod,
          // type: slotToAdd.type,
          duration: timerIncrement,
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
      // Ensure correct AM/PM handling for update
      const today = new Date();
      const parseTimeWithAMPM = (time: string) => {
        let hour = 0, minute = 0;
        let ampm = '';
        if (time && time.includes(' ')) {
          const [hm, ap] = time.split(' ');
          ampm = ap.trim().toUpperCase();
          [hour, minute] = hm.split(':').map(Number);
        } else if (time) {
          [hour, minute] = time.split(':').map(Number);
        }
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute).toISOString();
      };
      const slotUpdate = { ...updatedSlot };
      if (slotUpdate.start) slotUpdate.start = parseTimeWithAMPM(slotUpdate.start);
      if (slotUpdate.end) slotUpdate.end = parseTimeWithAMPM(slotUpdate.end);
      const response = await fetch('/api/timeslots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...slotUpdate,
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
    try {
      const response = await fetch('/api/timeslots', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setSlots(slots.filter(slot => slot.id !== id));
      } else {
        const error = await response.json();
        console.error(error.error || 'Failed to delete time slot');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Time Slots</h2>
      
      <div>
        {/* Program Filter */}
        <div className="mb-4">
          <label className="text-xs font-semibold mb-1 mr-4">Program</label>
          <select
          value={selectedProgramId ?? ''}
          onChange={e => setSelectedProgramId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
        >
          {/* Remove 'All Programs' option for strict prefilter */}
          {programs.map(program => (
            <option key={program.id} value={program.id}>{program.name}</option>
          ))}
        </select>
        </div>

        {/* Add New Slot */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Add New Time Slot</h3>
          <div className="grid grid-cols-5 gap-4 mb-3">
        {/* Program dropdown already handled above */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">Start Time</label>
          <input
            type="time"
            value={newSlot.start}
            onChange={(e) => {
          const start = e.target.value;
          const end = addMinutesToTime(start, timerIncrement);
          setNewSlot({ ...newSlot, start, end });
            }}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[110px]"
            placeholder="Start Time"
          />
          {newSlot.start && (
            <span className="text-blue-700 font-semibold text-xs mt-1">{formatTime(newSlot.start)}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">End Time</label>
          <input
            type="time"
            value={newSlot.end}
            onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[110px]"
            placeholder="End Time"
          />
          {newSlot.end && (
            <span className="text-blue-700 font-semibold text-xs mt-1">{formatTime(newSlot.end)}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">Period</label>
          <input
            type="number"
            value={newSlot.period}
            onChange={(e) => setNewSlot({ ...newSlot, period: parseInt(e.target.value) || 1 })}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[80px]"
            placeholder="Period"
            min="1"
          />
        </div>
        <div className="flex flex-col">
          {/* Type field removed */}
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">Duration</label>
          <select
            value={timerIncrement}
            onChange={e => setTimerIncrement(Number(e.target.value))}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[80px]"
          >
            <option value={45}>45 min</option>
            <option value={50}>50 min</option>
            <option value={60}>60 min</option>
          </select>
        </div>
          </div>
          <button
        onClick={addSlot}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
        Add Slot
          </button>
        </div>
        
        {/* Slots List */}
        <div className="space-y-8">
        {programs.map(program => (
          <div key={program.id}>
            <h3 className="text-lg font-bold text-blue-700 mb-2">{program.name}</h3>
            <div className="space-y-2">
              {[...slots]
                .filter(slot => slot.programId === program.id)
                .sort((a, b) => a.period - b.period)
                .map((slot) => {
                  const isEditing = isEditingSlot === String(slot.id);
                  // Removed unused editData/setEditData
                  return (
                    <div key={slot.id} className="bg-white border rounded-lg p-3">
          {isEditing ? (
            <EditSlotForm
              slot={slot}
              programs={programs}
              onSave={(data: Partial<TimeSlotWithProgram>) => updateSlot(Number(slot.id), data)}
              onCancel={() => setIsEditingSlot(null)}
            />
          ) : (
            <div className="flex justify-between items-center">
              <div>
            {/* Removed period number display */}
            <span className="text-gray-600">{formatTime(slot.start)} - {formatTime(slot.end)}</span>
            {/* Type badge removed */}
            {slot.programId && programs.length > 0 && (
              (() => {
                const prog = programs.find(p => p.id === slot.programId);
                return prog ? (
              <span className="ml-4 px-2 py-1 rounded bg-blue-200 text-xs font-semibold text-blue-700">
                {prog.name}
              </span>
                ) : null;
              })()
            )}
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
          );
        })}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

interface EditSlotFormProps {
  slot: TimeSlotWithProgram;
  programs: Program[];
  onSave: (data: Partial<TimeSlotWithProgram>) => void;
  onCancel: () => void;
}

function EditSlotForm({ slot, programs, onSave, onCancel }: EditSlotFormProps) {
  const [form, setForm] = React.useState({
    start: slot.start,
    end: slot.end,
    period: slot.period,
    programId: slot.programId ?? undefined,
  });
  return (
    <div className="grid grid-cols-5 gap-2">
      <input
        type="time"
        value={form.start}
        onChange={e => setForm({ ...form, start: e.target.value })}
        className="px-2 py-1 border rounded text-sm"
      />
      <input
        type="time"
        value={form.end}
        onChange={e => setForm({ ...form, end: e.target.value })}
        className="px-2 py-1 border rounded text-sm"
      />
      <input
        type="number"
        value={form.period}
        onChange={e => setForm({ ...form, period: parseInt(e.target.value) || form.period })}
        className="px-2 py-1 border rounded text-sm"
        placeholder="Period"
        min="1"
      />
      {/* Type select removed */}
      <select
        value={form.programId ?? ''}
        onChange={e => setForm({ ...form, programId: e.target.value ? Number(e.target.value) : undefined })}
        className="px-2 py-1 border rounded text-sm"
      >
        <option value="">Select Program</option>
        {programs.map(program => (
          <option key={program.id} value={program.id}>{program.name}</option>
        ))}
      </select>
      <button
        className="bg-green-500 text-white px-2 py-1 rounded ml-2"
        onClick={() => onSave(form)}
      >
        Save
      </button>
      <button
        className="bg-gray-400 text-white px-2 py-1 rounded ml-2"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}



export default TimeSlotsManager;


