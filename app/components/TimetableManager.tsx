'use client';

import React, { useEffect, useState } from 'react';
import type { Department, Room, Teacher, TimetableEntry } from "../types";
import { Day, Semester, TimeSlot } from '../types';
import type { Subject } from "../types/Subject";
import TimetableNew from './TimetableNew';

import { generateStats } from './timetableUtils';



const TimetableManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [validation, setValidation] = useState<{ isValid: boolean; conflicts: { details: string }[] }>({ isValid: true, conflicts: [] });
  const [showConflicts, setShowConflicts] = useState(false);

  useEffect(() => {
    loadTimetableEntries();
  }, []);

  const loadTimetableEntries = async () => {
    try {
      const response = await fetch('/api/timetable-entries');
      if (response.ok) {
        const dbEntries = await response.json();
        setEntries(dbEntries);
        console.log('Loaded timetable entries:', dbEntries);

      }
    } catch (error) {
      console.error('Error loading timetable entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // State for fetched data
  const [semesters, setSemesters] = useState<Semester[]>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [days, setDays] = useState<Day[]>([]);


  // Fetch data on mount
  useEffect(() => {
    fetch('/api/semesters')
      .then(res => res.json())
      .then(setSemesters);
    fetch('/api/departments')
      .then(res => res.json())
      .then(setDepartments);
    fetch('/api/subjects')
      .then(res => res.json())
      .then(setSubjects);
    fetch('/api/teachers')
      .then(res => res.json())
      .then(setTeachers);
    fetch('/api/timeslots')
      .then(res => res.json())
      .then((data) => {
        setTimeSlots(data);
      });
    fetch('/api/rooms')
      .then(res => res.json())
      .then(setRooms);
    fetch('/api/days')
      .then(res => res.json())
      .then((data) => {
      setDays(data);
      console.log('Loaded days:', data);
      });
    
  }, []);


  const stats = generateStats(entries);

  // Conflict logic: detect if same teacher is scheduled in the same slot
  const teacherSlotConflicts = React.useMemo(() => {
    const conflicts: { [key: string]: number[] } = {};
    // key: `${teacherId}_${timeSlotId}`
    entries.forEach(entry => {
      const key = `${entry.teacherId}_${entry.timeSlotId}`;
      if (!conflicts[key]) conflicts[key] = [];
      conflicts[key].push(entry.id);
    });
    // Only keep conflicts with more than one entry
    return Object.entries(conflicts)
      .filter(([key, ids]) => ids.length > 1)
      .reduce((acc, [key, ids]) => {
        acc[key] = ids;
        return acc;
      }, {} as { [key: string]: number[] });
  }, [entries]);

  // Conflict logic: detect if same room is scheduled in the same slot
  const roomSlotConflicts = React.useMemo(() => {
    const conflicts: { [key: string]: number[] } = {};
    // key: `${roomId}_${timeSlotId}`
    entries.forEach(entry => {
      const key = `${entry.roomId}_${entry.timeSlotId}`;
      if (!conflicts[key]) conflicts[key] = [];
      conflicts[key].push(entry.id);
    });
    // Only keep conflicts with more than one entry
    return Object.entries(conflicts)
      .filter(([key, ids]) => ids.length > 1)
      .reduce((acc, [key, ids]) => {
        acc[key] = ids;
        return acc;
      }, {} as { [key: string]: number[] });
  }, [entries]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading timetable data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
        College Timetable Management
          </h1>
        </div>

        <TimetableNew
          departments={departments}
          entries={entries}
          rooms={rooms}
          teachers={teachers}
          subjects={subjects}
          days={days}
          timeSlots={timeSlots}
          semesters={semesters ?? []}
          teacherSlotConflicts={teacherSlotConflicts} // pass to child
          roomSlotConflicts={roomSlotConflicts} // pass to child
        />
      </div>
    </div>
  );
};

export default TimetableManager;
