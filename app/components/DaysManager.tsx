import React, { useEffect, useState } from 'react';
import { Day } from '../types';


interface DaysManagerProps {
  days: Day[];
  setDays: (days: Day[]) => void;
}

const DaysManager: React.FC<DaysManagerProps> = ({ days, setDays }) => {
  const [isEditingDay, setIsEditingDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Days of Week</h2>
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
  );
};

export default DaysManager;
