'use client';

import React, { useEffect, useState } from 'react';
import { Department } from '../types/Department';
import { Semester } from '../types/Semester';
import { Subject } from '../types/Subject';

type SubjectFormProps = {
  subject: Partial<Subject>;
  departments: Department[];
  semesters: Semester[];
  onChange: (field: string, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  isCreating: boolean;
};

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, departments, semesters, onChange, onSave, onCancel, isCreating }) => (
  <div className="bg-white shadow-md rounded-lg p-4 mb-4">
    <h2 className="text-xl font-bold mb-2">{isCreating ? 'Add New Subject' : 'Edit Subject'}</h2>
    <div className="grid grid-cols-2 gap-4">
      <input type="text" name="name" value={subject.name || ''} onChange={e => onChange('name', e.target.value)} placeholder="Subject Name" className="border p-2 rounded-md" />
      <input type="text" name="code" value={subject.code || ''} onChange={e => onChange('code', e.target.value)} placeholder="Subject Code" className="border p-2 rounded-md" />
  <input type="number" name="creditHours" value={subject.creditHours || ''} onChange={e => onChange('creditHours', parseInt(e.target.value, 10))} placeholder="Credit Hours" className="border p-2 rounded-md" />
      <select name="semesterId" value={subject.semesterId || ''} onChange={e => onChange('semesterId', parseInt(e.target.value, 10))} className="border p-2 rounded-md">
        <option value="">Select Semester</option>
        {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
      </select>
      <label className="flex items-center">
        <input type="checkbox" name="isCore" checked={subject.isCore || false} onChange={e => onChange('isCore', e.target.checked)} className="mr-2" />
        Core Subject
      </label>
    </div>
    <div className="mt-4">
      <button onClick={onSave} className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600">Save</button>
      <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
    </div>
  </div>
);


const api = {
  getAll: async () => {
    const [subjectsRes, departmentsRes, semestersRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch('/api/departments'),
      fetch('/api/semesters'),
    ]);
    if (!subjectsRes.ok || !departmentsRes.ok || !semestersRes.ok) {
      throw new Error('Failed to fetch data');
    }
    return Promise.all([
      subjectsRes.json(),
      departmentsRes.json(),
      semestersRes.json(),
    ]);
  },
  save: async (subject: Partial<Subject>, isCreating: boolean) => {
    const url = isCreating ? '/api/subjects' : `/api/subjects?id=${subject.id}`;
    const method = isCreating ? 'POST' : 'PUT';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    if (!response.ok) throw new Error('Failed to save subject');
  },
  delete: async (id: number) => {
    const response = await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete subject');
  },
};

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ subject: Partial<Subject> | null; isCreating: boolean }>({ subject: null, isCreating: false });
  const [expandedDepartments, setExpandedDepartments] = useState<number[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subjectsData, departmentsData, semestersData] = await api.getAll();
      setSubjects(subjectsData);
      setDepartments(departmentsData);
      setSemesters(semestersData);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (subject: Subject) => setFormState({ subject: { ...subject }, isCreating: false });
  const openCreate = () => setFormState({
    subject: {
      name: '',
      code: '',
      creditHours: 3,
      departmentId: departments[0]?.id || 0,
      isCore: false,
      semesterId: semesters[0]?.id || 0,
    },
    isCreating: true,
  });
  const closeForm = () => setFormState({ subject: null, isCreating: false });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(id);
      fetchAll();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!formState.subject) return;
    try {
      await api.save(formState.subject, formState.isCreating);
      closeForm();
      fetchAll();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleFormChange = (field: string, value: unknown) => {
    if (!formState.subject) return;
    setFormState(prev => ({
      ...prev,
      subject: {
        ...prev.subject!,
        [field]: value,
      },
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
      <button onClick={openCreate} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600">
        Add New Subject
      </button>

      {formState.subject && (
        <SubjectForm
          subject={formState.subject}
          departments={departments}
          semesters={semesters}
          onChange={handleFormChange}
          onSave={handleSave}
          onCancel={closeForm}
          isCreating={formState.isCreating}
        />
      )}

      <div className="shadow-md rounded-lg p-4">
        {departments.map((department, idx) => {
          const isExpanded = expandedDepartments.includes(department.id);
          // Semester summary for department
          const deptSubjects = subjects.filter(subject => subject.departmentId === department.id);
          const semesterIds = Array.from(new Set(deptSubjects.map(s => s.semesterId))).sort((a, b) => (a ?? 0) - (b ?? 0));
          const semesterSummaries = semesterIds
            .filter((semId): semId is number => typeof semId === 'number')
            .map(semId => {
              const semester = semesters.find(s => s.id === semId);
              const semSubjects = deptSubjects.filter(s => s.semesterId === semId);
              return (
                <span key={semId} className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-1 mr-2 mb-1 text-xs">
                  {semester ? semester.name : `Semester ${semId}`}: {semSubjects.length} course{semSubjects.length !== 1 ? 's' : ''}
                </span>
              );
            });
          return (
            <div
              key={department.id}
              className={`mb-6 rounded-lg p-4 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{department.name}</h2>
                <button
                  onClick={() => {
                    setExpandedDepartments(prev =>
                      isExpanded
                        ? prev.filter(id => id !== department.id)
                        : [...prev, department.id]
                    );
                  }}
                  className="px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
              <div className="mb-2 flex flex-wrap items-center">
                {semesterSummaries.length > 0 ? semesterSummaries : <span className="text-xs text-gray-500">No subjects for this department.</span>}
              </div>
              {isExpanded && (() => {
                if (deptSubjects.length === 0) {
                  return <div className="py-2 text-gray-500">No subjects for this department.</div>;
                }
                return semesterIds
                  .filter((semId): semId is number => typeof semId === 'number')
                  .map((semId, semIdx) => {
                    const semester = semesters.find(s => s.id === semId);
                    const semSubjects = deptSubjects.filter(s => s.semesterId === semId);
                    const semesterBg = semIdx % 2 === 0 ? 'bg-purple-50' : 'bg-yellow-50';
                    return (
                      <div key={semId} className={`mb-4 rounded-lg p-3 ${semesterBg}`}>
                        <h3 className="text-md font-semibold mb-1 flex items-center justify-between">
                          <span>{semester ? semester.name : `Semester ${semId}`}</span>
                          <span className="text-xs text-gray-600 bg-gray-200 rounded px-2 py-1 ml-2">{semSubjects.length} course{semSubjects.length !== 1 ? 's' : ''}</span>
                        </h3>
                        <ul className="divide-y divide-gray-200">
                          {semSubjects.map(subject => (
                            <li key={subject.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center">
                                <span>
                                  {subject.name} ({subject.code})
                                </span>
                              </div>
                              <div>
                                <button onClick={() => openEdit(subject)} className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600">Edit</button>
                                <button onClick={() => handleDelete(subject.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Delete</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  });
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageSubjects;
