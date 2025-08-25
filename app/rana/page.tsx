"use client";
import React, { useEffect, useState } from "react";
import RanaComponent from "../components/RanaComponent";
import type { Department, TimeSlot, TimetableEntry } from "../types";

const RanaOverviewPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetch("/api/departments").then(res => res.json()).then(setDepartments);
    fetch("/api/timeslots").then(res => res.json()).then(setTimeSlots);
    fetch("/api/timetable-entries").then(res => res.json()).then(setEntries);
    fetch("/api/teachers").then(res => res.json()).then(setTeachers);
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-full overflow-x-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Rana Timetable Entry Count Overview</h1>
        <RanaComponent departments={departments} timeSlots={timeSlots} entries={entries} teachers={teachers} />
      </div>
    </div>
  );
};

export default RanaOverviewPage;
