'use client';

import { useEffect, useState } from 'react';
import { Department, Teacher } from '../data';
import Modal from './Modal';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: { 
    name: string; 
    shortName?: string; 
    departmentId: string;
    designation?: string;
    contactNumber?: string;
    email?: string;
    dateOfBirth?: string;
    seniority?: number;
    cnic?: string;
    personnelNumber?: string;
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
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [seniority, setSeniority] = useState<number>(0);
  const [cnic, setCnic] = useState('');
  const [personnelNumber, setPersonnelNumber] = useState('');

  // Initialize form with existing teacher data or pre-selected department
  useEffect(() => {
    if (mode === 'edit' && initialTeacher) {
      setName(initialTeacher.name || '');
      setShortName(initialTeacher.shortName || '');
      setDepartmentId(initialTeacher.departmentId || '');
      setDesignation(initialTeacher.designation || '');
      setContactNumber(initialTeacher.contactNumber || '');
      setEmail(initialTeacher.email || '');
      setDateOfBirth(initialTeacher.dateOfBirth || '');
      setSeniority(initialTeacher.seniority || 0);
      setCnic(initialTeacher.cnic || '');
      setPersonnelNumber(initialTeacher.personnelNumber || '');
    } else if (mode === 'add' && preSelectedDepartmentId) {
      setDepartmentId(preSelectedDepartmentId);
    }
  }, [mode, initialTeacher, preSelectedDepartmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && departmentId && designation.trim()) {
      onAdd({ 
        name: name.trim(), 
        shortName: shortName.trim() || undefined, 
        departmentId,
        designation: designation.trim(),
        contactNumber: contactNumber.trim() || undefined,
        email: email.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        seniority: seniority || undefined,
        cnic: cnic.trim() || undefined,
        personnelNumber: personnelNumber.trim() || undefined
      });
      setName('');
      setShortName('');
      setDepartmentId('');
      setDesignation('');
      setContactNumber('');
      setEmail('');
      setDateOfBirth('');
      setSeniority(0);
      setCnic('');
      setPersonnelNumber('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setShortName('');
    setDepartmentId('');
    setDesignation('');
    setContactNumber('');
    setEmail('');
    setDateOfBirth('');
    setSeniority(0);
    setCnic('');
    setPersonnelNumber('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'edit' ? 'Edit Teacher' : 'Add New Teacher'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compact grid for teacher fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Name
            </label>
            <input
              id="teacher-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Dr. John Smith"
              required
            />
          </div>
          
          <div>
            <label htmlFor="teacher-shortname" className="block text-sm font-medium text-gray-700 mb-1">
              Short Name (Optional)
            </label>
            <input
              id="teacher-shortname"
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Dr. Smith"
            />
          </div>

          <div>
            <label htmlFor="teacher-designation" className="block text-sm font-medium text-gray-700 mb-1">
              Designation *
            </label>
            <select
              id="teacher-designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select designation...</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="CTI">CTI</option>
              <option value="Visiting Faculty">Visiting Faculty</option>
              <option value="Lab Instructor">Lab Instructor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="teacher-contact" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              id="teacher-contact"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., +92-XXX-XXXXXXX"
            />
          </div>

          <div>
            <label htmlFor="teacher-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="teacher-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., teacher@university.edu"
            />
          </div>

          <div>
            <label htmlFor="teacher-dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="teacher-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="teacher-seniority" className="block text-sm font-medium text-gray-700 mb-1">
              Seniority (Years)
            </label>
            <input
              id="teacher-seniority"
              type="number"
              value={seniority}
              onChange={(e) => setSeniority(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 10"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="teacher-cnic" className="block text-sm font-medium text-gray-700 mb-1">
              CNIC Number
            </label>
            <input
              id="teacher-cnic"
              type="text"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 12345-1234567-1"
            />
          </div>

          <div>
            <label htmlFor="teacher-personnel" className="block text-sm font-medium text-gray-700 mb-1">
              Personnel Number
            </label>
            <input
              id="teacher-personnel"
              type="text"
              value={personnelNumber}
              onChange={(e) => setPersonnelNumber(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., EMP-2024-001"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            title="Press ESC to cancel"
          >
            Cancel (ESC)
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {mode === 'edit' ? 'Update Teacher' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTeacherModal;
