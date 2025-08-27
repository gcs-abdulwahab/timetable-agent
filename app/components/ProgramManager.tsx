"use client";
import { Program } from '@/app/types/Program';
import React, { useState } from 'react';

const ProgramManager: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [newProgram, setNewProgram] = useState<Program>({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  const fetchPrograms = async () => {
    const res = await fetch('/api/programs');
    const data = await res.json();
    setPrograms(data);
  };

  React.useEffect(() => {
    fetchPrograms();
  }, []);

  const handleAddProgram = async () => {
    setLoading(true);
    const res = await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProgram),
    });
    if (res.ok) {
      setNewProgram({ name: '', description: '' });
      fetchPrograms();
    }
    setLoading(false);
  };

  const handleDeleteProgram = async (id?: number) => {
    if (!id) return;
    setLoading(true);
    const res = await fetch(`/api/programs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchPrograms();
    }
    setLoading(false);
  };

  const handleEditProgram = async () => {
    if (!editProgram || !editProgram.id) return;
    setLoading(true);
    const res = await fetch(`/api/programs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editProgram),
    });
    if (res.ok) {
      setEditingId(null);
      setEditProgram(null);
      fetchPrograms();
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Programs</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Program Name"
          value={newProgram.name || ''}
          onChange={e => setNewProgram({ ...newProgram, name: e.target.value })}
          className="border px-2 py-1 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newProgram.description || ''}
          onChange={e => setNewProgram({ ...newProgram, description: e.target.value })}
          className="border px-2 py-1 rounded mr-2"
        />
        <button
          onClick={handleAddProgram}
          className="bg-blue-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          Add Program
        </button>
      </div>
      <ul>
        {programs.map(program => (
          <li key={program.id} className="mb-2 flex items-center justify-between">
            {editingId === program.id ? (
              <>
                <input
                  type="text"
                  value={editProgram?.name || ''}
                  onChange={e => setEditProgram({ ...editProgram!, name: e.target.value })}
                  className="border px-2 py-1 rounded mr-2"
                />
                <input
                  type="text"
                  value={editProgram?.description || ''}
                  onChange={e => setEditProgram({ ...editProgram!, description: e.target.value })}
                  className="border px-2 py-1 rounded mr-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditProgram}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    disabled={loading}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditProgram(null); }}
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>
                  <span className="font-semibold">{program.name}</span> - {program.description}
                </span>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => { setEditingId(program.id!); setEditProgram(program); }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramManager;
