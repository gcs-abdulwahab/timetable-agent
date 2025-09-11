"use client";
import { useEffect, useState } from 'react';
import type { Degree } from '../types/Degree';
import type { Program } from '../types/Program';

const fetchDegrees = async (): Promise<Degree[]> => {
  const query = typeof window !== "undefined" && window.location.search ? window.location.search : "";
  const params = new URLSearchParams(query);
  const programId = params.get("programId");
  const url = programId ? `/api/degrees?programId=${programId}` : '/api/degrees';
  const res = await fetch(url);
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

  const handleEditClick = (degree: Degree) => {
    setEditDegree(degree);
  };

 

  return (
    <div>
     
      
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
              
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ManageDegreesPage;
