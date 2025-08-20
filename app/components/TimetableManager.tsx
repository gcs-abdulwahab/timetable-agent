'use client';

import { Day, Semester, TimeSlot } from '@/lib/generated/prisma';
import React, { useEffect, useState } from 'react';
import type { Department, Room, Teacher, TimetableEntry } from "../types";
import type { Subject } from "../types/Subject";
import ConflictViewer from './ConflictViewer';
import ConflictsAlert from './ConflictsAlert';
import TimetableNew from './TimetableNew';
import { validateTimetable } from './conflictChecker';
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
        validateTimetable().then(setValidation);
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
      .then(setDays);
  }, []);


  const stats = generateStats(entries);

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

        <ConflictsAlert conflicts={validation.conflicts} />


        {showConflicts && <ConflictViewer />}


        <TimetableNew
          departments={departments}
          entries={entries}
          rooms={rooms}
          teachers={teachers}
          subjects={subjects}
          timeSlots={timeSlots.map(ts => ({
            ...ts,
            start: typeof ts.start === 'string' ? ts.start : ts.start.toISOString(),
            end: typeof ts.end === 'string' ? ts.end : ts.end.toISOString(),
          }))}
          semesters={semesters ?? []}
        />
      </div>
    </div>
  );
};

export default TimetableManager;
