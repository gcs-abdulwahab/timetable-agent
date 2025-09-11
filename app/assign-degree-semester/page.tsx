"use client";
import { Degree } from "@/app/types/Degree";
import { Semester } from "@/app/types/Semester";
import { notFound, useSearchParams } from "next/navigation";
import React from "react";

async function fetchDegrees(programId: string): Promise<Degree[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/degrees?programId=${programId}`);
  if (!res.ok) throw new Error("Failed to fetch degrees");
  return res.json();
}

async function fetchSemesters(programId: string): Promise<Semester[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/semesters?programId=${programId}`);
  if (!res.ok) throw new Error("Failed to fetch semesters");
  return res.json();
}

const AssignDegreeSemesterPage: React.FC = () => {
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId");
  const [degrees, setDegrees] = React.useState<Degree[]>([]);
  const [semesters, setSemesters] = React.useState<Semester[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!programId) {
      setError("Program ID not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([fetchDegrees(programId), fetchSemesters(programId)])
      .then(([degreesData, semestersData]) => {
        setDegrees(degreesData);
        setSemesters(semestersData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [programId]);

  if (!programId) return notFound();
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Assign Degrees with Semesters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Degrees</h3>
          <ul className="list-disc pl-5">
            {degrees.map(degree => (
              <li key={degree.id}>{degree.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Semesters</h3>
          <ul className="list-disc pl-5">
            {semesters.map(semester => (
              <li key={semester.id}>{semester.name}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Assignment UI goes here */}
      <div className="mt-6">
        <p className="text-gray-600">Select degrees and semesters to assign their relationship.</p>
        {/* TODO: Add assignment form and logic */}
      </div>
    </div>
  );
};

export default AssignDegreeSemesterPage;
