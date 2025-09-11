import React, { useEffect, useState } from "react";
import type { Program } from "../types/Program";
import type { Shift } from "../types/Shift";

const ShiftDetail: React.FC<{ id?: string }> = ({ id = "1" }) => {
    const [shift, setShift] = useState<Shift | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(false);
    const [programsLoading, setProgramsLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/shifts/${id}`)
            .then(res => res.json())
            .then(data => {
                setShift(data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        setProgramsLoading(true);
    fetch(`/api/programs?shiftId=${id}`)
            .then(res => res.json())
            .then(data => setPrograms(data))
            .finally(() => setProgramsLoading(false));
    }, [id]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Shift Details</h1>
            {loading ? <div>Loading...</div> : shift ? (
                <div className="bg-white rounded shadow p-4 mb-4">
                    <div className="font-semibold text-lg mb-2">Shift: {shift.name}</div>
                    <div className="text-gray-600 mb-1">Institution: {shift.institution?.name ?? shift.institutionId}</div>
                </div>
            ) : (
                <div className="text-red-500">Shift not found.</div>
            )}
            <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-bold mb-4">Programs in this Shift</h2>
                {programsLoading ? (
                    <div>Loading programs...</div>
                ) : programs.length === 0 ? (
                    <div className="text-gray-500">No programs found for this shift.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {programs.map(program => (
                            <div
                                key={program.id}
                                className="block bg-blue-50 rounded-lg shadow hover:shadow-lg p-4 transition-all border border-blue-100 hover:border-blue-400"
                            >
                                <a
                                    href={`/manage-programs/${program.id}`}
                                    className="font-semibold text-blue-700 text-lg mb-2 block hover:underline"
                                >
                                    {program.name}
                                </a>
                                <div className="text-gray-600 mb-2">ID: {program.id}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftDetail;
