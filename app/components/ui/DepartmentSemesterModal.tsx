'use client';

import { useState, useEffect } from 'react';
import { Department, computeNextOfferedLevels, countSubjectsForDeptLevel, setOfferedLevelsForDept } from '../data';

interface DepartmentSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  onSave: (departmentId: string, semesterConfig: { 
    offeredLevels?: number[]; 
    excludedLevels?: number[]; 
  }) => void;
}

const DepartmentSemesterModal = ({ isOpen, onClose, department, onSave }: DepartmentSemesterModalProps) => {
  const [managementType, setManagementType] = useState<'included' | 'excluded'>('included');
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([]);

  // Initialize state when department changes
  useEffect(() => {
    if (department) {
      const config = department.bsSemesterAvailability;
      if (config?.offeredLevels?.length) {
        setManagementType('included');
        setSelectedSemesters([...config.offeredLevels]);
      } else if (config?.excludedLevels?.length) {
        setManagementType('excluded');
        setSelectedSemesters([...config.excludedLevels]);
      } else {
        // Default: all semesters active (using excluded with empty array)
        setManagementType('included');
        setSelectedSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
      }
    }
  }, [department]);

  const handleSemesterToggle = (semester: number) => {
    setSelectedSemesters(prev => 
      prev.includes(semester) 
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  };

  const handleSave = () => {
    if (!department) return;
    
    const config = managementType === 'included' 
      ? { offeredLevels: selectedSemesters }
      : { excludedLevels: selectedSemesters };
      
    onSave(department.id, config);
    onClose();
  };

  const handleReset = () => {
    // Reset to all semesters active
    setManagementType('included');
    setSelectedSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
  };

  if (!isOpen || !department) return null;

  const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Semesters</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-800 mb-2">{department.name}</h3>
          <p className="text-sm text-gray-600">Configure which semesters are offered by this department</p>
        </div>

        {/* Management Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Management Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="included"
                checked={managementType === 'included'}
                onChange={(e) => setManagementType(e.target.value as 'included' | 'excluded')}
                className="mr-2"
              />
              <span className="text-sm">Select Active Semesters</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="excluded"
                checked={managementType === 'excluded'}
                onChange={(e) => setManagementType(e.target.value as 'included' | 'excluded')}
                className="mr-2"
              />
              <span className="text-sm">Select Inactive Semesters</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {managementType === 'included' 
              ? 'Only selected semesters will be active' 
              : 'Selected semesters will be inactive, all others active'
            }
          </p>
        </div>

        {/* Semester Grid */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semesters (1-8)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {allSemesters.map(semester => {
              const isSelected = selectedSemesters.includes(semester);
              const isActive = managementType === 'included' ? isSelected : !isSelected;
              
              return (
                <button
                  key={semester}
                  onClick={() => handleSemesterToggle(semester)}
                  className={`p-3 text-sm font-medium rounded border-2 transition-colors ${
                    isSelected
                      ? managementType === 'included' 
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                  title={`Semester ${semester} - ${isActive ? 'Active' : 'Inactive'}`}
                >
                  S{semester}
                  <div className="text-xs mt-1">
                    {isActive ? '✓' : '✗'}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 bg-green-100 border border-green-500 rounded mr-1"></span>
            Active
            <span className="inline-block w-3 h-3 bg-red-100 border border-red-500 rounded ml-3 mr-1"></span>
            Inactive
            <span className="inline-block w-3 h-3 bg-gray-50 border border-gray-300 rounded ml-3 mr-1"></span>
            Default (all active)
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Current Configuration:</strong>
            <br />
            {managementType === 'included' 
              ? `Active Semesters: ${selectedSemesters.length > 0 ? selectedSemesters.sort((a,b) => a-b).join(', ') : 'None'}`
              : `Inactive Semesters: ${selectedSemesters.length > 0 ? selectedSemesters.sort((a,b) => a-b).join(', ') : 'None (All Active)'}`
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset to All Active
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSemesterModal;
