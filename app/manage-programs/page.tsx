"use client";
import { useSearchParams } from 'next/navigation';
import ProgramManager from '../components/ProgramManager';


export default function ManageProgramsPage() {
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('shiftId');

  return (
    <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-6">Manage Programs {shiftId ? `(Shift ID: ${shiftId})` : ''}</h1>
        <ProgramManager shiftId={shiftId ?? undefined} />
    </div>
  );
}
