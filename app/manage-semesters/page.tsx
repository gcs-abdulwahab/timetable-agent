
'use client';

import React, { useEffect, useState } from 'react';
import { Degree } from '../types/Degree';
import { Semester } from '../types/Semester';

const SemesterItem: React.FC<{ semester: Semester }> = ({ semester }) => (
  <div className="border rounded p-4 mb-2 bg-white shadow flex items-center justify-between">
    <span>
      {semester.name} -- {semester.isActive ? 'Active' : 'Inactive'}
    </span>
    <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">View Subjects</button>
    {/* You can add edit/delete buttons here if needed */}
  </div>
);



const ManageSemesters: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  // Collapsible state for degree groups, collapsed by default
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Collapse all by default on first render
    const degreeNames = semesters.reduce((acc, semester) => {
      const degreeName = semester.degree?.name || 'No Degree';
      if (!acc.includes(degreeName)) acc.push(degreeName);
      return acc;
    }, [] as string[]);
    setExpanded(prev => {
      const newState = { ...prev };
      degreeNames.forEach(name => {
        if (!(name in newState)) newState[name] = false;
      });
      return newState;
    });
  }, [semesters]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [degrees, setDegrees] = useState<Degree[]>([]);

  const fetchDegrees = async () => {
    try {
      const response = await fetch('/api/degrees');
      if (!response.ok) {
        throw new Error('Failed to fetch degrees');
      }
      const data = await response.json();
      setDegrees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    fetchSemesters();
    fetchDegrees();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/semesters');
      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }
      const data = await response.json();
      setSemesters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester({ ...semester });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingSemester({ id: 0, name: '', isActive: false, degreeId: 0 });
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this semester?')) {
      try {
        const response = await fetch(`/api/semesters?id=${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete semester');
        }
        fetchSemesters();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleSave = async () => {
    if (!editingSemester) return;

    const url = isCreating ? '/api/semesters' : `/api/semesters?id=${editingSemester.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSemester),
      });
      if (!response.ok) {
        throw new Error('Failed to save semester');
      }
      setEditingSemester(null);
      setIsCreating(false);
      fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingSemester) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditingSemester({
      ...editingSemester,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Semesters</h1>
      <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600">
        Add New Semester
      </button>

      {editingSemester && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">{isCreating ? 'Add New Semester' : 'Edit Semester'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={editingSemester.name}
              onChange={handleInputChange}
              placeholder="Semester Name"
              className="border p-2 rounded-md"
            />
              <select
                name="degreeId"
                value={editingSemester.degreeId ?? ""}
                onChange={handleInputChange}
                className="border p-2 rounded-md"
              >
                <option value="">Select Degree</option>
                {degrees.map(degree => (
                  <option key={degree.id} value={degree.id}>{degree.name}</option>
                ))}
              </select>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={editingSemester.isActive}
                onChange={handleInputChange}
                className="mr-2"
              />
              Active
            </label>
          </div>
          <div className="mt-4">
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600">
              Save
            </button>
            <button onClick={() => setEditingSemester(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        {/* Collapsible groups by degree name */}
        {Object.entries(
          semesters.reduce((acc, semester) => {
            const degreeName = semester.degree?.name || 'No Degree';
            if (!acc[degreeName]) acc[degreeName] = [];
            acc[degreeName].push(semester);
            return acc;
          }, {} as Record<string, Semester[]>)
        )
        .sort(([aName], [bName]) => aName.localeCompare(bName))
        .map(([degreeName, group]) => (
          <div key={degreeName} className="mb-8 border-b last:border-b-0 pb-4">
            <div
              className="flex items-center justify-between cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(e => ({ ...e, [degreeName]: !e[degreeName] }))}
            >
              <span className="font-semibold text-xl text-blue-700 flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="inline-block mr-2 text-blue-400"><circle cx="10" cy="10" r="10" fill="#60A5FA"/><text x="50%" y="55%" textAnchor="middle" fontSize="10" fill="white" dy=".3em">🎓</text></svg>
                {degreeName}
              </span>
              <span className="ml-2 text-gray-500 text-lg">{expanded[degreeName] ? "▲" : "▼"}</span>
            </div>
            {expanded[degreeName] && (
              <div className="px-2 py-2 animate-fade-in">
                {group.map((semester) => (
                  <SemesterItem key={semester.id} semester={semester} />
                ))}
              </div>
            )}
          </div>
        ))}
        <style jsx>{`
          .animate-fade-in {
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ManageSemesters;
