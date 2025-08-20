'use client';

import React, { useEffect, useState } from 'react';
import { Department } from '../types/Department';
import { Subject } from '../types/Subject';
import { Semester } from '../types/timetable';

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, departmentsRes, semestersRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/departments'),
        fetch('/api/semesters'),
      ]);
      if (!subjectsRes.ok || !departmentsRes.ok || !semestersRes.ok) {
        throw new Error('Failed to fetch data');
      }
      const [subjectsData, departmentsData, semestersData] = await Promise.all([
        subjectsRes.json(),
        departmentsRes.json(),
        semestersRes.json(),
      ]);
      setSubjects(subjectsData);
      setDepartments(departmentsData);
      setSemesters(semestersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject({ ...subject });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingSubject({
      name: '',
      code: '',
      creditHours: 3,
      departmentId: departments[0]?.id || 0,
  // semesterLevel removed
      isCore: false,
      semesterId: semesters[0]?.id || 0,
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await fetch(`/api/subjects?id=${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete subject');
        }
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleSave = async () => {
    if (!editingSubject) return;

    const url = isCreating ? '/api/subjects' : `/api/subjects?id=${editingSubject.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSubject),
      });
      if (!response.ok) {
        throw new Error('Failed to save subject');
      }
      setEditingSubject(null);
      setIsCreating(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingSubject) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let processedValue: any = value;
    if (['creditHours', 'departmentId', 'semesterLevel', 'semesterId'].includes(name)) {
      processedValue = parseInt(value, 10);
    } else if (type === 'checkbox') {
      processedValue = checked;
    }

    setEditingSubject({
      ...editingSubject,
      [name]: processedValue,
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
      <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600">
        Add New Subject
      </button>

      {editingSubject && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">{isCreating ? 'Add New Subject' : 'Edit Subject'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="name" value={editingSubject.name || ''} onChange={handleInputChange} placeholder="Subject Name" className="border p-2 rounded-md" />
            <input type="text" name="code" value={editingSubject.code || ''} onChange={handleInputChange} placeholder="Subject Code" className="border p-2 rounded-md" />
            <input type="number" name="creditHours" value={editingSubject.creditHours || ''} onChange={handleInputChange} placeholder="Credit Hours" className="border p-2 rounded-md" />
            <select name="departmentId" value={editingSubject.departmentId || ''} onChange={handleInputChange} className="border p-2 rounded-md">
              <option value="">Select Department</option>
              {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
            </select>
            <select name="semesterId" value={editingSubject.semesterId || ''} onChange={handleInputChange} className="border p-2 rounded-md">
              <option value="">Select Semester</option>
              {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
            </select>
            <label className="flex items-center">
              <input type="checkbox" name="isCore" checked={editingSubject.isCore || false} onChange={handleInputChange} className="mr-2" />
              Core Subject
            </label>
          </div>
          <div className="mt-4">
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600">Save</button>
            <button onClick={() => setEditingSubject(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4">
        <ul className="divide-y divide-gray-200">
          {subjects.map((subject) => (
            <li key={subject.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <span>{subject.name} ({subject.code}) - {subject.department.name}</span>
              </div>
              <div>
                <button onClick={() => handleEdit(subject)} className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600">Edit</button>
                <button onClick={() => handleDelete(subject.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageSubjects;
