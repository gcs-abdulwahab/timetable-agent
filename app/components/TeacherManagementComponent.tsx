
'use client';

import React, { useEffect, useState } from 'react';
import type { Department } from '../types/Department';
import type { Teacher } from '../types/Teacher';

interface TeacherManagementProps {
  departments: Department[];
}

const TeacherManagementComponent: React.FC<TeacherManagementProps> = ({ departments }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    shortName: '',
    designation: '',
  departmentId: 0,
  });

  // Fetch teachers on component mount
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.departmentId) {
      setError('Name and Department are required');
      return;
    }

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });

      if (response.ok) {
        await loadTeachers();
        setShowAddModal(false);
        setNewTeacher({
          name: '',
          shortName: '',
          designation: '',
          departmentId: 0,
        });
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to add teacher');
      }
    } catch (err) {
      setError('Error adding teacher');
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    try {
      const response = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTeacher),
      });

      if (response.ok) {
        await loadTeachers();
        setEditingTeacher(null);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to update teacher');
      }
    } catch (err) {
      setError('Error updating teacher');
    }
  };

  const handleDeleteTeacher = async (id?: number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const response = await fetch(`/api/teachers/${String(id)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }
      
      await loadTeachers();
    } catch (err) {
      setError('Error deleting teacher');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Management</h2>
        <div className="flex items-center">
          <button
            onClick={() => {
              // Export all teachers to CSV
              const csvRows = [
                ['Name', 'Short Name', 'Designation', 'Department'],
                ...teachers.map(t => [
                  t.name,
                  t.shortName,
                  t.designation,
                  departments.find(d => d.id === t.departmentId)?.name || ''
                ])
              ];
              const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'teachers.csv';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
          >
            Export to CSV
          </button>
          <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4 cursor-pointer">
            Import from CSV
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const lines = text.split(/\r?\n/).filter(Boolean);
                const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
                const nameIdx = header.findIndex(h => h.toLowerCase().includes('name') && !h.toLowerCase().includes('short'));
                const shortNameIdx = header.findIndex(h => h.toLowerCase().includes('short'));
                const designationIdx = header.findIndex(h => h.toLowerCase().includes('designation'));
                const departmentIdx = header.findIndex(h => h.toLowerCase().includes('department'));
                const importedTeachers = lines.slice(1).map(line => {
                  const fields = line.split(',').map(f => f.replace(/"/g, '').trim());
                  const deptName = fields[departmentIdx];
                  const dept = departments.find(d => d.name === deptName);
                  return {
                    name: fields[nameIdx] || '',
                    shortName: fields[shortNameIdx] || '',
                    designation: fields[designationIdx] || '',
                    departmentId: dept?.id || 0,
                  };
                }).filter(t => t.name && t.departmentId);
                // Skip teachers that already exist (same name and department)
                const existingTeachers = teachers.map(t => `${t.name.toLowerCase()}-${t.departmentId}`);
                const teachersToImport = importedTeachers.filter(t => !existingTeachers.includes(`${t.name.toLowerCase()}-${t.departmentId}`));
                for (const teacher of teachersToImport) {
                  await fetch('/api/teachers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(teacher),
                  });
                }
                await loadTeachers();
                alert(`${teachersToImport.length} teachers imported. ${importedTeachers.length - teachersToImport.length} already existed and were skipped.`);
              }}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading teachers...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map(dept => {
                const deptTeachers = teachers.filter(t => t.departmentId === dept.id);
                return (
                  <React.Fragment key={dept.id + '-group'}>
                    <tr className="bg-gray-100">
                      <td colSpan={3} className="px-6 py-3 font-bold text-lg text-blue-700">{dept.name}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => {
                            setNewTeacher({ ...newTeacher, departmentId: dept.id });
                            setShowAddModal(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Add Teacher
                        </button>
                      </td>
                    </tr>
                    {deptTeachers.length === 0 ? (
                      <tr key={dept.id + '-empty'}>
                        <td colSpan={4} className="px-6 py-4 text-gray-400 italic">No teachers in this department.</td>
                      </tr>
                    ) : (
                      deptTeachers
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(teacher => (
                          <tr key={teacher.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.shortName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.designation}</td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                              <button
                                onClick={() => setEditingTeacher(teacher)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Name</label>
                <input
                  type="text"
                  value={newTeacher.shortName}
                  onChange={(e) => setNewTeacher({ ...newTeacher, shortName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  value={newTeacher.designation}
                  onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={newTeacher.departmentId}
                  onChange={(e) => setNewTeacher({ ...newTeacher, departmentId: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Teacher</h3>
            <form onSubmit={handleUpdateTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Name</label>
                <input
                  type="text"
                  value={editingTeacher.shortName}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, shortName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  value={editingTeacher.designation}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, designation: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={editingTeacher.departmentId}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, departmentId: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementComponent;
