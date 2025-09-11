"use client";
import { Program } from '@/app/types/Program';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

interface ProgramManagerProps {
  shiftId?: string | number;
}

const ProgramManager: React.FC<ProgramManagerProps> = ({ shiftId }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const searchParams = useSearchParams();
  const effectiveShiftId = shiftId ?? searchParams.get('shiftId');

  React.useEffect(() => {
    let url = '/api/programs';
    if (effectiveShiftId) {
      url += `?shiftId=${effectiveShiftId}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setPrograms(data));
  }, [effectiveShiftId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Programs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {programs.map(program => (
          <div
            key={program.id}
            className="block bg-blue-50 rounded-lg shadow hover:shadow-lg p-4 transition-all border border-blue-100 hover:border-blue-400"
          >
            <div className="font-semibold text-blue-700 text-lg mb-2">{program.name}</div>
            <div className="text-gray-600 mb-2">{program.description}</div>
            <div className="text-gray-500 text-sm mb-2">ID: {program.id}</div>
            <Link
              href={`/manage-degrees?programId=${program.id}`}
              className="inline-block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
            >
              View Degrees
            </Link>
            <Link
              href={`/manage-semesters?programId=${program.id}`}
              className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm ml-2"
            >
              View Semesters
            </Link>
            <Link
              href={`/assign-degree-semester?programId=${program.id}`}
              className="inline-block bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm ml-2"
            >
              Assign Degrees with Semester
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramManager;
