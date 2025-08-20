'use client';

import React, { useEffect, useState } from 'react';
import { Semester } from '../types/timetable';

const ManageSemesters: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSemesters();
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester({ ...semester });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingSemester({ id: 0, name: '', code: '', year: new Date().getFullYear(), term: '', isActive: false });
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
        setError(err.message);
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
      setError(err.message);
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
            <input
              type="text"
              name="code"
              value={editingSemester.code || ''}
              onChange={handleInputChange}
              placeholder="Semester Code"
              className="border p-2 rounded-md"
            />
            <input
              type="number"
              name="year"
              value={editingSemester.year || ''}
              onChange={handleInputChange}
              placeholder="Year"
              className="border p-2 rounded-md"
            />
            <select
              name="term"
              value={editingSemester.term || ''}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
            >
              <option value="">Select Term</option>
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
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

      <div className="bg-white shadow-md rounded-lg p-4">
        <ul className="divide-y divide-gray-200">
          {semesters.map((semester) => (
            <li key={semester.id} className="flex items-center justify-between py-2">
              <span>
                {semester.name} ({semester.code}) - {semester.year} {semester.term} - {semester.isActive ? 'Active' : 'Inactive'}
              </span>
              <div>
                <button onClick={() => handleEdit(semester)} className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600">
                  Edit
                </button>
                <button onClick={() => handleDelete(semester.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageSemesters;
