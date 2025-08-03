'use client';

import React, { useState } from 'react';
import TimetableAdmin from './TimetableAdmin';
import TimetableNew from './TimetableNew';
import { validateTimetable } from './conflictChecker';
import { timetableEntries as initialEntries, TimetableEntry } from './data';
import { generateStats } from './timetableUtils';

const TimetableManager: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>(initialEntries);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleAddEntry = (newEntry: Omit<TimetableEntry, 'id'>) => {
    const entry: TimetableEntry = {
      ...newEntry,
      id: `e${Date.now()}` // Simple ID generation
    };
    
    setEntries(prev => [...prev, entry]);
  };

  const validation = validateTimetable();
  const stats = generateStats(entries);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            University Timetable Management
          </h1>
          <div className="space-x-2">
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

        {/* Main Timetable */}
        <TimetableNew />
      </div>
    </div>
  );
};

export default TimetableManager;
