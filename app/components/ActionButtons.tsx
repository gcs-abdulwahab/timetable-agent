'use client';

import React from 'react';
import AdminMenu from './AdminMenu';

interface ActionButtonsProps {
  showAdmin: boolean;
  showStats: boolean;
  showConflicts: boolean;
  conflictCount: number;
  onToggleAdmin: () => void;
  onToggleStats: () => void;
  onToggleConflicts: () => void;
  
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  
  showConflicts,
  conflictCount,
  
  onToggleConflicts,
  
}) => {
  return (
    <div className="space-x-2">
      <AdminMenu />
      
      <button
        onClick={onToggleConflicts}
        className={`px-4 py-2 rounded-md transition-colors text-sm font-medium text-white ${
          conflictCount > 0
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gray-400 hover:bg-gray-500'
        }`}
      >
        {showConflicts ? 'Hide' : 'Show'} Conflicts ({conflictCount})
      </button>

    </div>
  );
};

export default ActionButtons;
