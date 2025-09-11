"use client";
import React, { useState } from "react";
import InstitutionList from "../components/InstitutionList";
import InstitutionShifts from "../components/InstitutionShifts";
import type { Institution } from "../types/Institution";

const ManageInstitutionsPage: React.FC = () => {
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Institutions</h1>
      <InstitutionList onView={setSelectedInstitution} />
      {selectedInstitution && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">{selectedInstitution.name} ({selectedInstitution.code})</h2>
          <InstitutionShifts institutionId={selectedInstitution.id} />
        </div>
      )}
    </div>
  );
};

export default ManageInstitutionsPage;
