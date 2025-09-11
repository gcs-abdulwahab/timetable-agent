import React, { useEffect, useState } from "react";
import type { Institution } from "../types/Institution";

const InstitutionList: React.FC<{ onView: (institution: Institution) => void }> = ({ onView }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/institutions")
      .then(res => res.json())
      .then(data => setInstitutions(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {loading ? <div>Loading institutions...</div> : institutions.map(inst => (
        <div key={inst.id} className="bg-white rounded shadow p-4 flex flex-col items-start">
          <div className="font-semibold text-lg mb-2">{inst.name}</div>
          <div className="text-gray-600 mb-1">Code: {inst.code}</div>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            onClick={() => onView(inst)}
          >
            View Institution
          </button>
        </div>
      ))}
    </div>
  );
};

export default InstitutionList;
