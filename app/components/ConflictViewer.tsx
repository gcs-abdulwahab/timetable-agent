'use client';

import React from 'react';
import { validateTimetable, ConflictInfo } from './conflictChecker';

const ConflictViewer: React.FC = () => {
  const [validation, setValidation] = React.useState<{ isValid: boolean; conflicts: ConflictInfo[] } | null>(null);

  React.useEffect(() => {
    validateTimetable().then(result => setValidation(result));
  }, []);

  const conflicts = validation?.conflicts ?? [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔍 Timetable Conflict Analysis
      </h2>
      
      <div className="mb-4 p-4 rounded-lg bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{conflicts.length}</div>
            <div className="text-sm text-gray-600">Total Conflicts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {conflicts.filter(c => c.type === 'teacher').length}
            </div>
            <div className="text-sm text-gray-600">Teacher Conflicts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {conflicts.filter(c => c.type === 'room').length}
            </div>
            <div className="text-sm text-gray-600">Room Conflicts</div>
          </div>
        </div>
      </div>
      <div className={`mb-4 p-3 rounded-lg ${validation?.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <div className="font-semibold">
          {validation?.isValid ? '✅ Timetable is Valid' : '❌ Timetable has Conflicts'}
        </div>
      </div>

      {conflicts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Conflict Details:</h3>
          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 bg-red-200 border-red-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">
                    {conflict.type === 'teacher' ? '👨‍🏫 Teacher Conflict' : '🏢 Room Conflict'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {conflict.day} at {conflict.timeSlot}
                  </div>
                </div>
                <div className="text-gray-700 mb-2">{conflict.details}</div>
                <div className="text-sm text-gray-600">
                  <strong>Conflicting Entries:</strong> {conflict.conflictingEntries.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflicts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎉</div>
          <div>No conflicts found in the current timetable!</div>
        </div>
      )}
    </div>
  );
}

export default ConflictViewer;
