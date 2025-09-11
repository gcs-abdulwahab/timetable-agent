"use client";
import { Program } from '@/app/types/Program';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProgramManage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('shiftId');

  useEffect(() => {
    let url = '/api/programs';
    if (shiftId) {
      url += `?shiftId=${shiftId}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setPrograms(data));
  }, [shiftId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Programs</h2>
      <ul>
        {programs.map(program => (
          <li key={program.id} className="mb-2">
            <span className="font-semibold">{program.name}</span> - {program.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramManage;
