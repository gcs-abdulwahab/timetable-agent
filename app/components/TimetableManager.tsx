'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ConflictViewer from './ConflictViewer';
import TimetableAdmin, { TimetableEntryType } from './TimetableAdmin';
import TimetableNew from './TimetableNew';
import { validateTimetable } from './conflictChecker';
import { TimetableEntry } from './data';
import { generateStats } from './timetableUtils';

const TimetableManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [validation, setValidation] = useState<{ isValid: boolean; conflicts: { details: string }[] }>({ isValid: true, conflicts: [] });
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStats, setShowStats] = useState(false);
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
        validateTimetable().then(setValidation);
      }
    } catch (error) {
      console.error('Error loading timetable entries:', error);
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
      validateTimetable().then(setValidation);
    } catch (error) {
      console.error('Error saving allocations:', error);
      alert('Failed to save allocations. Please try again.');
    }
  };

  const handleAddEntry = async (newEntry: Omit<TimetableEntryType, 'id'>) => {
    const entry: TimetableEntry = {
      ...newEntry,
      id: `e${Date.now()}`
    };
    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    await saveAllocations(updatedEntries);
  };

  const handleUpdateEntries = async (updatedEntries: TimetableEntry[]) => {
    setEntries(updatedEntries);
    await saveAllocations(updatedEntries);
  };

  const handleClearStorage = async () => {
    const emptyEntries: TimetableEntry[] = [];
    setEntries(emptyEntries);
    await saveAllocations(emptyEntries);
  };

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
              href="/teachers"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium inline-block"
            >
              Manage Teachers
            </Link>
            <Link
              href="/departments"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-block"
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
        <TimetableNew entries={entries} onUpdateEntries={handleUpdateEntries} />
      </div>
    </div>
  );
};

export default TimetableManager;
