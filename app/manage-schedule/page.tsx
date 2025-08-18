'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TimeSlot } from '../components/data';
import DaysManager from '../components/DaysManager';
import Navigation from '../components/Navigation';
import SemesterInfoComponent from '../components/SemesterInfoComponent';
import TimeSlotsManager from '../components/TimeSlotsManager';

interface Day {
  id: string;
  name: string;
  active: boolean;
}

const ManageSchedulePage = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  useEffect(() => {
    const loadData = async () => {
      try {
        const slotsResponse = await fetch('/api/timeslots');
        setSlots(slotsResponse.ok ? await slotsResponse.json() : []);
        const daysResponse = await fetch('/api/days');
        setDays(daysResponse.ok ? await daysResponse.json() : []);
      } catch (error) {
        setSlots([]);
        setDays([]);
      }
    };
    loadData();
  }, []);



  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Semester Info Section */}
          <SemesterInfoComponent />
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Manage Schedule</h1>
              <div className="space-x-2">
                <Link
                  href="/manage-departments"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Manage Departments
                </Link>
                <Link
                  href="/"
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  ← Back to Timetable
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TimeSlotsManager slots={slots} setSlots={setSlots} />
              <DaysManager days={days} setDays={setDays} />
            </div>
          </div>
        </div>
      </div>
  </div>
  );
};

export default ManageSchedulePage;
