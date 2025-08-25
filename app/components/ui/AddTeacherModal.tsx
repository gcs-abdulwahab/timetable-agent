'use client';

import { Department, Teacher } from '@/app/types';
import { useEffect, useState } from 'react';
import Modal from './Modal';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: { 
    name: string; 
    shortName: string; 
    departmentId: number;
    designation?: string;
  } | Teacher) => void;
  departments: Department[];
  mode?: 'add' | 'edit';
  initialTeacher?: Teacher | null;
  preSelectedDepartmentId?: string;
}

const AddTeacherModal = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  departments, 
  mode = 'add', 
  initialTeacher = null, 
  preSelectedDepartmentId 
}: AddTeacherModalProps) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [designation, setDesignation] = useState('');

  // Initialize form with existing teacher data or pre-selected department
  useEffect(() => {
    if (mode === 'edit' && initialTeacher) {
      setName(initialTeacher.name || '');
      setShortName(initialTeacher.shortName || '');
      setDepartmentId(initialTeacher.departmentId || '');
      setDesignation(initialTeacher.designation || '');
    } else if (mode === 'add' && preSelectedDepartmentId) {
      setDepartmentId(Number(preSelectedDepartmentId));
    }
  }, [mode, initialTeacher, preSelectedDepartmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && departmentId && shortName.trim()) {
      onAdd({ 
        name: name.trim(), 
        shortName: shortName.trim(), 
        departmentId: Number(departmentId),
        designation: designation.trim() || undefined,
      });
      setName('');
      setShortName('');
      setDepartmentId('');
      setDesignation('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setShortName('');
    setDepartmentId('');
    setDesignation('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'edit' ? 'Edit Teacher' : 'Add New Teacher'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Name <span className="text-red-500">*</span>
            </label>
            <input
              id="teacher-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-gray-50 text-lg placeholder-gray-400"
              placeholder="e.g., Dr. John Smith"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="teacher-shortname" className="block text-sm font-medium text-gray-700 mb-1">
              Short Name <span className="text-red-500">*</span>
            </label>
            <input
              id="teacher-shortname"
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-gray-50 text-lg placeholder-gray-400"
              placeholder="e.g., Dr. Smith"
              required
              autoComplete="off"
            />
          </div>
                <div>
                <label htmlFor="teacher-designation" className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  id="teacher-designation"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="shadcn-input w-full"
                  placeholder="e.g., Professor"
                  autoComplete="off"
                />
                </div>
          <div>
            <label htmlFor="teacher-department" className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="teacher-department"
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-gray-50 text-lg"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            title="Press ESC to cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {mode === 'edit' ? 'Update Teacher' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTeacherModal;
