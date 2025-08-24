import React, { useEffect, useState } from 'react';
import { Day } from '../types';
import AddDaysComponent from './AddDaysComponent';


interface DaysManagerProps {
  days: Day[];
  setDays: (days: Day[]) => void;
}

const DaysManager: React.FC<DaysManagerProps> = ({ days, setDays }) => {
  const [isEditingDay, setIsEditingDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchDays = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/days');
        if (res.ok) {
          const data = await res.json();
          setDays(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDays();
  }, [setDays]);

  // Update day (only allow changing active status)
  const updateDay = async (id: number, updatedDay: Partial<Day>) => {
    const updatedDays = days.map(day => 
      day.id === id ? { ...day, ...updatedDay } : day
    );
    // Persist change to backend
    try {
      await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: updatedDay.isActive }),
      });
      setDays(updatedDays);
    } catch (error) {
      // Optionally show error
    }
    setIsEditingDay(null);
  };

  // Add new day handler
  const handleAddDay = (newDay: Day) => {
    setDays([...days, newDay]);
    setShowAddModal(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Short Name', 'Day Code', 'Active'];
    const rows = days.map(day => [day.name, day.shortName, day.dayCode, day.isActive ? 'Yes' : 'No']);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    csvContent += rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'days.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const [header, ...rows] = lines;
      for (const row of rows) {
        const [name, shortName, dayCodeRaw, isActiveRaw] = row.split(',');
        const dayCode = Number(dayCodeRaw);
        const isActive = isActiveRaw.trim().toLowerCase() === 'yes';
        if (name && shortName && !shortName.includes(' ') && !isNaN(dayCode)) {
          await fetch('/api/days', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, shortName, dayCode, isActive })
          });
        }
      }
      setTimeout(() => window.location.reload(), 500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Days of Week</h2>
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowAddModal(true)}
      >
        Add New Day
      </button>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <AddDaysComponent onAddDay={handleAddDay} />
            <button
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl">
        {loading ? (
          <div className="text-gray-500 p-4">Loading days...</div>
        ) : (
          <div className="space-y-2">
            {days.map((day) => (
              <div key={day.id} className="bg-white border rounded-lg p-3">
                {isEditingDay === day.id ? (
                  <div className="flex gap-2">
                    <span className="flex-1 px-2 py-1 font-medium text-sm">
                      {day.name}
                    </span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={day.isActive}
                        onChange={(e) => updateDay(day.id, { isActive: e.target.checked })}
                        className="mr-1"
                      />
                      Active
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <span className={`font-medium text-base ${day.isActive ? 'text-gray-900' : 'text-gray-400'}`}> 
                      {day.name}
                    </span>
                    <button
                      type="button"
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm border focus:outline-none transition-colors duration-150 ${day.isActive ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'}`}
                      title={day.isActive ? 'Click to deactivate' : 'Click to activate'}
                      onClick={() => updateDay(day.id, { isActive: !day.isActive })}
                    >
                      {day.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-8 mb-2">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <span role="img" aria-label="Export">📤</span> Export to CSV
        </button>
        <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 text-sm flex items-center gap-2">
          <span role="img" aria-label="Import">📥</span> Import from CSV
          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
        </label>
      </div>
    </div>
  );
};

export default DaysManager;
