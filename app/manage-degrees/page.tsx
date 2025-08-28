"use client";
import React, { useEffect, useState } from 'react';
import type { Degree } from '../types/Degree';
import type { Program } from '../types/Program';

const fetchDegrees = async (): Promise<Degree[]> => {
  const res = await fetch('/api/degrees');
  return res.ok ? await res.json() : [];
};

const fetchPrograms = async (): Promise<Program[]> => {
  const res = await fetch('/api/programs');
  return res.ok ? await res.json() : [];
};


const ManageDegreesPage = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [newDegree, setNewDegree] = useState<Degree | null>({
    id: 0,
    name: '',
    programId: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editDegree, setEditDegree] = useState<Degree | null>(null);

  useEffect(() => {
    fetchDegrees().then(setDegrees);
    fetchPrograms().then(setPrograms);
  }, []);

  const handleAddDegree = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (editDegree) {
      // Edit existing degree
      const res = await fetch("/api/degrees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editDegree.id,
          name: editDegree.name,
          programId: Number(editDegree.programId),
        }),
      });
      if (res.ok) {
        setEditDegree(null);
        fetchDegrees().then(setDegrees);
      }
    } else {
      // Add new degree
      const res = await fetch("/api/degrees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDegree?.name,
          programId: Number(newDegree?.programId),
        }),
      });
      if (res.ok) {
        setNewDegree({
          id: 0,
          name: "",
          programId: 0,
        });
        fetchDegrees().then(setDegrees);
      }
    }
    setLoading(false);
  };

  const handleEditClick = (degree: Degree) => {
    setEditDegree(degree);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    const res = await fetch("/api/degrees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchDegrees().then(setDegrees);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Filter by Program</label>
        <select
          value={selectedProgramId ?? ''}
          onChange={e => setSelectedProgramId(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">All Programs</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <form onSubmit={handleAddDegree} className="mb-6 space-y-4 bg-gray-50 p-4 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Degree Name</label>
          <input
            type="text"
            value={editDegree ? editDegree.name : newDegree?.name ?? ""}
            onChange={e => {
              if (editDegree) {
                setEditDegree({ ...editDegree, name: e.target.value });
              } else {
                setNewDegree(
                  newDegree
                    ? { ...newDegree, name: e.target.value }
                    : { id: 0, name: e.target.value, programId: 0 }
                );
              }
            }}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Program</label>
          <select
            value={editDegree ? editDegree.programId : newDegree?.programId ?? ""}
            onChange={e => {
              if (editDegree) {
                setEditDegree({ ...editDegree, programId: Number(e.target.value) });
              } else {
                setNewDegree(
                  newDegree
                    ? { ...newDegree, programId: Number(e.target.value) }
                    : { id: 0, name: "", programId: Number(e.target.value) }
                );
              }
            }}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {editDegree ? "Update Degree" : "Add Degree"}
        </button>
        {editDegree && (
          <button
            type="button"
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => setEditDegree(null)}
          >
            Cancel
          </button>
        )}
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {degrees
          .filter(degree => selectedProgramId === null || degree.programId === selectedProgramId)
          .map((degree) => (
            <div key={degree.id} className="bg-white rounded shadow p-4 flex flex-col items-start">
              <div className="font-semibold text-lg mb-2">{degree.name}</div>
              <div className="text-gray-600 mb-1">
                Program: {programs.find((p) => p.id === degree.programId)?.name || "—"}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEditClick(degree)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(degree.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ManageDegreesPage;
