'use client';

import React, { useEffect, useState } from 'react';
import DaysManager from '../components/DaysManager';
import { Day } from '../types/Day';

const ManageDays: React.FC = () => {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDays();
  }, []);

  const fetchDays = async () => {
    try {
      const response = await fetch('/api/days');
      if (!response.ok) {
        throw new Error('Failed to fetch days');
      }
      const data = await response.json();
      setDays(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (day: Day) => {
    try {
      const response = await fetch(`/api/days?id=${day.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...day, isActive: !day.isActive }),
      });
      if (!response.ok) {
        throw new Error('Failed to update day');
      }
      fetchDays(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Days</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <DaysManager days={days} setDays={setDays} />
      </div>
    </div>
  );
};

export default ManageDays;
