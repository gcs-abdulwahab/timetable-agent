'use client';

import { useSubjects } from '@/app/hooks/useData';
import { useState } from 'react';
import { Department, computeNextOfferedLevels, countSubjectsForDeptLevel, getOfferedLevelsForDept, setOfferedLevelsForDept } from '../data';

interface SemesterChipsManagerProps {
  department: Department;
  onUpdate: (updatedDepartment: Department) => void;
  onError: (message: string) => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Continue", cancelText = "Cancel" }: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const SemesterChipsManager = ({ department, onUpdate, onError }: SemesterChipsManagerProps) => {
  const { data: subjects } = useSubjects();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const allLevels = [1, 2, 3, 4, 5, 6, 7, 8];
  const currentOfferedLevels = getOfferedLevelsForDept(department);

  const handleChipClick = async (level: number) => {
    if (!department.offersBSDegree) {
      onError('This department does not offer BS degree programs.');
      return;
    }

    const nextOfferedLevels = computeNextOfferedLevels(department, level);
    const isRemoving = currentOfferedLevels.includes(level);
    const subjectCount = countSubjectsForDeptLevel(department.id, level, subjects);
    if (isRemoving && subjectCount > 0) {
      setConfirmDialog({
        isOpen: true,
        title: 'Confirm Level Removal',
        message: `Semester ${level} currently contains ${subjectCount} subject${subjectCount !== 1 ? 's' : ''}. Removing this level will only update availability and will not delete the subjects. The subjects will remain in the system.`,
        onConfirm: () => {
          performUpdate(nextOfferedLevels);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      });
      return;
    }
    performUpdate(nextOfferedLevels);
  };

  const performUpdate = async (newOfferedLevels: number[]) => {
    try {
      // Optimistically update local state
      const updatedDepartment = setOfferedLevelsForDept(department, newOfferedLevels);
      onUpdate(updatedDepartment);
    } catch (error) {
      onError('Failed to update semester levels. Please try again.');
    }
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Semester Levels (Click to toggle)
        </label>
        <div className="flex flex-wrap gap-2">
          {allLevels.map(level => {
            const isOffered = currentOfferedLevels.includes(level);
            const subjectCount = countSubjectsForDeptLevel(department.id, level, subjects);
            
            return (
              <button
                key={level}
                onClick={() => handleChipClick(level)}
                disabled={!department.offersBSDegree}
                className={`
                  px-3 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${!department.offersBSDegree 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : isOffered
                      ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }
                `}
                title={
                  !department.offersBSDegree 
                    ? 'Department does not offer BS degree'
                    : `Semester ${level} - ${isOffered ? 'Active' : 'Inactive'}${subjectCount > 0 ? ` (${subjectCount} subjects)` : ''}`
                }
              >
                <div className="flex items-center space-x-1">
                  <span>S{level}</span>
                  {isOffered && <span className="text-xs">✓</span>}
                  {subjectCount > 0 && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded">
                      {subjectCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        {department.offersBSDegree && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></span>
            Active
            <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 rounded ml-3 mr-1"></span>
            Inactive
            <span className="ml-3">Numbers indicate subject count</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Remove Level"
        cancelText="Cancel"
      />
    </>
  );
};

export default SemesterChipsManager;
