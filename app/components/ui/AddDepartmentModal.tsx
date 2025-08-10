'use client';

import { useState } from 'react';
import Modal from './Modal';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (department: { name: string; shortName: string; offersBSDegree: boolean }) => void;
}

const AddDepartmentModal = ({ isOpen, onClose, onAdd }: AddDepartmentModalProps) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [offersBSDegree, setOffersBSDegree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && shortName.trim()) {
      onAdd({ name: name.trim(), shortName: shortName.trim(), offersBSDegree });
      setName('');
      setShortName('');
      setOffersBSDegree(false);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setShortName('');
    setOffersBSDegree(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Department">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-1">
            Department Name
          </label>
          <input
            id="dept-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Computer Science"
            required
          />
        </div>
        
        <div>
          <label htmlFor="dept-short" className="block text-sm font-medium text-gray-700 mb-1">
            Short Name
          </label>
          <input
            id="dept-short"
            type="text"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., CS"
            required
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={offersBSDegree}
              onChange={(e) => setOffersBSDegree(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Offers BS Degree Program
            </span>
          </label>
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
            Add Department
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDepartmentModal;
