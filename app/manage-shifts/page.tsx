"use client";
import React, { useEffect, useState } from "react";
import InstitutionShifts from "../components/InstitutionShifts";

const getInstitutionIdFromUrl = (): number => {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("institutionId");
  return id ? Number(id) : 1;
};

const ManageShiftsPage: React.FC = () => {
  const [institutionId, setInstitutionId] = useState<number>(getInstitutionIdFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setInstitutionId(getInstitutionIdFromUrl());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Shifts</h1>
      <InstitutionShifts institutionId={institutionId} />
    </div>
  );
};

export default ManageShiftsPage;
