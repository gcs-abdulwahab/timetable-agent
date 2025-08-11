'use client';

import { useState, useEffect } from 'react';
import { Department, Teacher } from '../data';
import Modal from './Modal';

interface Designation {
  value: string;
  label: string;
  order: number;
}

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
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  // Load designations from API
  useEffect(() => {
    loadDesignations();
  }, []);

  const loadDesignations = async () => {
    try {
      setLoadingDesignations(true);
      const response = await fetch('/api/designations');
      if (response.ok) {
        const data = await response.json();
        setDesignations(data.sort((a: Designation, b: Designation) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error loading designations:', error);
    } finally {
      setLoadingDesignations(false);
    }
  };

  // Initialize form with existing teacher data or pre-selected department
  useEffect(() => {
    if (mode === 'edit' && initialTeacher) {
      setName(initialTeacher.name || '');
      setShortName(initialTeacher.shortName || '');
      setDepartmentId(initialTeacher.departmentId || '');
      setDesignation(initialTeacher.designation || '');
      setContactNumber(initialTeacher.contactNumber || '');
      setEmail(initialTeacher.email || '');
      setDateOfBirth(convertDateForInput(initialTeacher.dateOfBirth || ''));
      setSeniority(initialTeacher.seniority || 0);
      setCnic(initialTeacher.cnic || '');
      setPersonnelNumber(initialTeacher.personnelNumber || '');
    } else if (mode === 'add' && preSelectedDepartmentId) {
      setDepartmentId(preSelectedDepartmentId);
    }
  }, [mode, initialTeacher, preSelectedDepartmentId]);

  // Convert date format from dd-mm-yyyy to yyyy-mm-dd for HTML input
  const convertDateForInput = (dayMonthYear: string) => {
    if (!dayMonthYear) return '';
    // Check if it's already in ISO format (yyyy-mm-dd)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dayMonthYear)) {
      return dayMonthYear;
    }
    // Convert from dd-mm-yyyy or dd/mm/yyyy to yyyy-mm-dd
    const parts = dayMonthYear.split(/[-\/]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dayMonthYear;
  };

  // Convert date format from yyyy-mm-dd to dd-mm-yyyy for storage
  const formatDateForStorage = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;  // day-month-year
    }
    return isoDate;
  };

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
        dateOfBirth: dateOfBirth ? formatDateForStorage(dateOfBirth) : undefined,
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
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Name *
            </label>
            <input
              id="teacher-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Dr. John Smith"
              required
            />
          </div>
          
          <div>
            <label htmlFor="teacher-short" className="block text-sm font-medium text-gray-700 mb-1">
              Short Name (Optional)
            </label>
            <input
              id="teacher-short"
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Dr. Smith"
            />
          </div>
        </div>

        <div>
          <label htmlFor="teacher-designation" className="block text-sm font-medium text-gray-700 mb-1">
            Designation *
          </label>
          {loadingDesignations ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-gray-500">Loading designations...</span>
            </div>
          ) : (
            <select
              id="teacher-designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Designation</option>
              {designations.map((des) => (
                <option key={des.value} value={des.value}>
                  {des.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="teacher-contact" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              id="teacher-contact"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., teacher@university.edu"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="teacher-dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="teacher-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* ID Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="teacher-cnic" className="block text-sm font-medium text-gray-700 mb-1">
              CNIC Number
            </label>
            <input
              id="teacher-cnic"
              type="text"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., EMP-2024-001"
            />
          </div>
        </div>

        {/* Only show department field when not pre-selected or in edit mode */}
        {(!preSelectedDepartmentId || mode === 'edit') && (
          <div>
            <label htmlFor="teacher-dept" className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              id="teacher-dept"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.shortName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show selected department info when adding from department context */}
        {preSelectedDepartmentId && mode === 'add' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm font-medium text-blue-800 mb-1">Adding to Department:</div>
            <div className="text-sm text-blue-700">
              {departments.find(d => d.id === preSelectedDepartmentId)?.name} 
              ({departments.find(d => d.id === preSelectedDepartmentId)?.shortName})
            </div>
          </div>
        )}

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
