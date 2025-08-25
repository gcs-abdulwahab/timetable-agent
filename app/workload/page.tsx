"use client";
import React, { useEffect, useState } from 'react';
import Workload from '../components/Workload';


const WorkloadPage: React.FC = () => {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [deptRes, teacherRes, timeslotRes, entryRes, subjectRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/teachers'),
          fetch('/api/timeslots'),
          fetch('/api/timetable-entries'),
          fetch('/api/subjects'),
        ]);
        setDepartments(await deptRes.json());
        setTeachers(await teacherRes.json());
        setTimeslots(await timeslotRes.json());
        setTimetableEntries(await entryRes.json());
        setSubjects(await subjectRes.json());
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading workload data...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Workload
        departments={departments}
        teachers={teachers}
        timeslots={timeslots}
        timetableEntries={timetableEntries}
        subjects={subjects}
      />
    </div>
  );
};

export default WorkloadPage;
