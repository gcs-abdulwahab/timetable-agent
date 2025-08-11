'use client';

import { useDepartments, useSemesters, useSubjects, useTeachers } from '@/app/hooks/useData';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ConflictViewer from './ConflictViewer';
import TimetableAdmin from './TimetableAdmin';
import TimetableNew from './TimetableNew';
import { validateTimetable } from './conflictChecker';
import { TimetableEntry } from './data';
import { generateStats } from './timetableUtils';

const TimetableManager: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSemesterTab, setActiveSemesterTab] = useState<string>('');
  
  // Load data from APIs
  const { data: departments } = useDepartments();
  const { data: subjects } = useSubjects();
  const { data: semesters } = useSemesters();
  const { data: teachers } = useTeachers();
  
  // Load entries from allocations.json file
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);

  // Load from allocations.json file
  useEffect(() => {
    setMounted(true);
    loadAllocations();
  }, []);

  // Set first active semester tab on load
  useEffect(() => {
    if (semesters && semesters.length > 0) {
      const firstActive = semesters.find(s => s.isActive);
      if (firstActive && !activeSemesterTab) {
        setActiveSemesterTab(firstActive.id);
      }
    }
  }, [semesters, activeSemesterTab]);

  const loadAllocations = async () => {
    try {
      const response = await fetch('/api/allocations');
      if (response.ok) {
        const allocations = await response.json();
        setEntries(allocations);
      } else {
        console.warn('Failed to load allocations, using empty entries');
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAllocations = async (updatedEntries: TimetableEntry[]) => {
    try {
      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEntries),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save allocations');
      }
    } catch (error) {
      console.error('Error saving allocations:', error);
      alert('Failed to save allocations. Please try again.');
    }
  };

  const handleAddEntry = async (newEntry: Omit<TimetableEntry, 'id'>) => {
    const entry: TimetableEntry = {
      ...newEntry,
      id: `e${Date.now()}` // Simple ID generation
    };
    
    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    await saveAllocations(updatedEntries);
  };

  const handleUpdateEntries = async (updatedEntries: TimetableEntry[]) => {
    setEntries(updatedEntries);
    await saveAllocations(updatedEntries);
  };

  // Clear allocations data
  const handleClearStorage = async () => {
    setEntries([]);
    await saveAllocations([]);
  };

  const validation = (entries.length > 0 && teachers.length > 0 && subjects.length > 0 && semesters.length > 0) 
    ? validateTimetable(entries, teachers, subjects, semesters)
    : { isValid: true, conflicts: [] };
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
          <div className="space-x-2">
            <Link
              href="/manage-schedule"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium inline-block"
            >
              Manage Schedule
            </Link>
            <Link
              href="/manage-departments"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium inline-block"
            >
              Manage Departments
            </Link>
            <Link
              href="/room-management"
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium inline-block"
            >
              Room Management
            </Link>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {showAdmin ? 'Hide' : 'Show'} Admin Panel
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              {showStats ? 'Hide' : 'Show'} Statistics
            </button>
            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium text-white ${
                validation.conflicts.length > 0 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {showConflicts ? 'Hide' : 'Show'} Conflicts ({validation.conflicts.length})
            </button>
            <button
              onClick={handleClearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              title="Clear stored data and reset to default"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Conflicts Alert */}
        {validation.conflicts.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Conflicts Detected:</strong>
            <ul className="mt-2">
              {validation.conflicts.map((conflict, index) => (
                <li key={index} className="text-sm">• {conflict.details}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Statistics Panel */}
        {showStats && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Timetable Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Day Distribution</h3>
                <div className="space-y-1">
                  {Object.entries(stats.dayDistribution).map(([day, count]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span>{day}:</span>
                      <span>{count} classes</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Teacher Workload (Top 5)</h3>
                <div className="space-y-1">
                  {Object.entries(stats.teacherLoad)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([teacherId, count]) => (
                    <div key={teacherId} className="flex justify-between text-sm">
                      <span>{teacherId}:</span>
                      <span>{count} classes</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                <div className="space-y-1 text-sm">
                  <div>Total Entries: {stats.totalEntries}</div>
                  <div>Conflicts: {validation.conflicts.length}</div>
                  <div>Teachers: {Object.keys(stats.teacherLoad).length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdmin && (
          <TimetableAdmin onAddEntry={handleAddEntry} />
        )}

        {/* Conflict Viewer */}
        {showConflicts && (
          <ConflictViewer />
        )}

        {/* Main Timetable */}
        <TimetableNew
          entries={entries.filter(e => e.semesterId === activeSemesterTab)}
          onUpdateEntries={handleUpdateEntries}
          activeSemesterTab={activeSemesterTab}
          setActiveSemesterTab={setActiveSemesterTab}
        />
      </div>
    </div>
  );
};

export default TimetableManager;
