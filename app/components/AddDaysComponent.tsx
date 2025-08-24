import React, { useState } from 'react';
import type { Day } from '../types';

interface AddDaysComponentProps {
  onAddDay: (newDay: Day) => void;
}

const AddDaysComponent: React.FC<AddDaysComponentProps> = ({ onAddDay }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [dayCode, setDayCode] = useState<number | ''>(''); // dayCode is number
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shortName, dayCode: Number(dayCode), isActive }),
      });
      if (res.ok) {
        const newDay = await res.json();
        onAddDay(newDay);
        setName('');
        setShortName('');
        setDayCode('');
        setIsActive(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mb-4 p-4 bg-blue-50 rounded-lg border" onSubmit={handleAdd}>
      <h3 className="text-lg font-bold mb-2 text-blue-800">Add New Day</h3>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Short Name</label>
        <input
          type="text"
          value={shortName}
          onChange={e => setShortName(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Day Code</label>
        <input
          type="number"
          value={dayCode}
          onChange={e => setDayCode(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-2 flex items-center">
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          className="mr-2"
        />
        <span className="text-sm">Active</span>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Day'}
      </button>
    </form>
  );
};

export default AddDaysComponent;
