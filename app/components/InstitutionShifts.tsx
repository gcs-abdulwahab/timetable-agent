import Link from "next/link";
import React, { useEffect, useState } from "react";
import type { Shift } from "../types/Shift";

const InstitutionShifts: React.FC<{ institutionId: number }> = ({ institutionId }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/shifts?institutionId=${institutionId}`)
      .then(res => res.json())
      .then(data => setShifts(data))
      .finally(() => setLoading(false));
  }, [institutionId]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Shifts</h3>
      {loading ? <div>Loading shifts...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shifts.map(shift => (
            <div
              key={shift.id}
              className="block bg-green-50 rounded-lg shadow hover:shadow-lg p-4 transition-all border border-green-100 hover:border-green-400"
            >
              <a
                href={`/manage-shifts/${shift.id}`}
                className="font-semibold text-green-700 text-lg mb-2 block hover:underline"
              >
                {shift.name}
              </a>
              <div className="text-gray-600 mb-2">ID: {shift.id}</div>
              <Link
                href={`/manage-programs?shiftId=${shift.id}`}
                className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                View Programs
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionShifts;
