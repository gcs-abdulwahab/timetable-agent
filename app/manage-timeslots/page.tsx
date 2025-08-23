"use client";
import { useEffect, useState } from "react";
import TimeSlotsManager from "../components/TimeSlotsManager";
import type { TimeSlot } from "../types";

const ManageTimeSlotsPage = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const response = await fetch("/api/timeslots");
        setSlots(response.ok ? await response.json() : []);
      } catch {
        setSlots([]);
      }
    };
    loadSlots();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Time Slots</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TimeSlotsManager slots={slots} setSlots={setSlots} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTimeSlotsPage;
