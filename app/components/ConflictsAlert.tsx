'use client';

import React from 'react';

interface Conflict {
  details: string;
}

interface ConflictsAlertProps {
  conflicts: Conflict[];
}

const ConflictsAlert: React.FC<ConflictsAlertProps> = ({ conflicts }) => {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <strong className="font-bold">Conflicts Detected:</strong>
      <ul className="mt-2">
        {conflicts.map((conflict, index) => (
          <li key={index} className="text-sm">• {conflict.details}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConflictsAlert;
