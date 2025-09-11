
'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Semester } from '../types/Semester';

const SemesterItem: React.FC<{ semester: Semester }> = ({ semester }) => (
  <div className="border rounded p-4 mb-2 bg-white shadow flex items-center justify-between">
    <span>
      {semester.name} -- {semester.isActive ? 'Active' : 'Inactive'}
    </span>
    <div className="flex gap-2">
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        onClick={() => {
          window.location.href = `/manage-degrees?semesterId=${semester.id}`;
        }}
      >
        View Degrees
      </button>
    </div>
  </div>
);



const ManageSemesters: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        let url = '/api/semesters';
        if (programId) {
          url += `?programId=${programId}`;
        }
        const response = await fetch(url);
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
    fetchSemesters();
  }, [programId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Semesters</h1>
      {loading ? <div>Loading...</div> : error ? <div>Error: {error}</div> : (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          {semesters.length === 0 ? (
            <div className="text-gray-500">No semesters found for this program.</div>
          ) : (
            semesters.map((semester) => (
              <SemesterItem key={semester.id} semester={semester} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ManageSemesters;
