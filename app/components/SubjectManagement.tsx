"use client";
// ...existing code...

import React, { useEffect, useState } from "react";
// ...existing code...

const SubjectManagement: React.FC = () => {
  // Remove degree and semester dropdowns. Get semesterId from URL.
  const [subjects, setSubjects] = useState<{ id: number; name: string; code: string }[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Get semesterId from URL
  const getSemesterIdFromUrl = (): number | undefined => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('semesterId');
    return id ? Number(id) : undefined;
  };
  const [semesterId, setSemesterId] = useState<number | undefined>(getSemesterIdFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setSemesterId(getSemesterIdFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  // Removed duplicate state declarations

  useEffect(() => {
    if (!semesterId) {
      setSubjects([]);
      return;
    }
    setSubjectsLoading(true);
    fetch(`/api/subjects?semesterId=${semesterId}`)
      .then(res => res.json())
      .then(data => setSubjects(data))
      .finally(() => setSubjectsLoading(false));
  }, [semesterId]);

  return (
    <div className="border rounded p-6 bg-white shadow">
      <h2 className="text-xl font-semibold mb-2">Subject Management</h2>
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Subjects</h3>
        {subjectsLoading ? (
          <div>Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-gray-500">No subjects found for this semester.</div>
        ) : (
          <table className="min-w-full border rounded shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{subject.name}</td>
                  <td className="px-4 py-2">{subject.code}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
