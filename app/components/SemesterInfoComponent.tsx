
"use client";
import { useEffect, useState } from "react";

import { deleteSemester, fetchSemesters, updateSemester } from "./semesterApi";

interface Semester {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  isBS: boolean;
}

const SemesterInfoComponent = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  // Helper to get next semester code
  const getNextSemesterCode = () => {
    const nums = semesters.map(s => {
      const match = s.code.match(/S(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const nextNum = Math.max(0, ...nums) + 1;
    return `S${nextNum}`;
  };
  const [newSemester, setNewSemester] = useState({ name: "", code: "S1", isActive: false, isBS: false });
  const [editModal, setEditModal] = useState<{ open: boolean; semester: Semester | null }>({ open: false, semester: null });
  const [editSemester, setEditSemester] = useState({ name: "", code: "", isActive: false, isBS: false });
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: "code" | "name" | null } | null>(null);
  const [inlineValue, setInlineValue] = useState<string>("");

  useEffect(() => {
    const loadSemesters = async () => {
      setLoading(true);
      try {
        const data = await fetchSemesters();
        setSemesters(data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching semesters");
      } finally {
        setLoading(false);
      }
    };
    loadSemesters();
  }, []);

  // Sorting logic
  type SortKey = "code" | "name" | "isActive" | "isBS";
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);

  const getSemesterNumber = (code: string) => {
    if (!code || typeof code !== "string") return 0;
    const match = code.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const sortedSemesters = [...semesters].sort((a, b) => {
    let result = 0;
    if (sortKey === "code") {
      result = getSemesterNumber(a.code) - getSemesterNumber(b.code);
    } else if (sortKey === "name") {
      result = a.name.localeCompare(b.name);
    } else if (sortKey === "isActive") {
      result = Number(a.isActive) - Number(b.isActive);
    } else if (sortKey === "isBS") {
      result = Number(a.isBS) - Number(b.isBS);
    }
    return sortAsc ? result : -result;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((asc) => !asc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Toggle active state
  const handleToggleActive = async (sem: Semester) => {
    const updatedSemester = { ...sem, isActive: !sem.isActive };
    setSemesters((prev) => prev.map((s) => (s.id === sem.id ? updatedSemester : s)));
    try {
      await updateSemester(updatedSemester);
    } catch {}
  };

  // Toggle BS
  const handleToggleBS = async (sem: Semester) => {
    const updatedSemester = { ...sem, isBS: !sem.isBS };
    setSemesters((prev) => prev.map((s) => (s.id === sem.id ? updatedSemester : s)));
    try {
      await updateSemester(updatedSemester);
    } catch {}
  };

  // Add semester
  const handleAddSemester = async () => {
    if (!newSemester.name || !newSemester.code) return;
    const semesterToAdd = {
      ...newSemester,
      id: `sem${Date.now()}`,
    };
    setSemesters((prev) => [...prev, semesterToAdd]);
    setShowAddModal(false);
    setNewSemester({ name: "", code: getNextSemesterCode(), isActive: false, isBS: false });
    try {
      // POST expects an array for bulk creation
      await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([semesterToAdd]),
      });
      // Refetch semesters to sync UI with DB
      const data = await fetchSemesters();
      setSemesters(data);
    } catch {}
  };

  // Edit semester
  const handleEditSemester = (sem: Semester) => {
    setEditSemester({ name: sem.name, code: sem.code, isActive: sem.isActive, isBS: sem.isBS });
    setEditModal({ open: true, semester: sem });
  };

  // Inline edit logic
  const startInlineEdit = (id: string, field: "code" | "name", value: string) => {
    setInlineEdit({ id, field });
    setInlineValue(value);
  };
  const saveInlineEdit = async () => {
    if (!inlineEdit) return;
    const sem = semesters.find(s => s.id === inlineEdit.id);
    if (!sem) return;
  const updatedSemester = { ...sem, [inlineEdit.field as string]: inlineValue };
    setSemesters(prev => prev.map(s => s.id === sem.id ? updatedSemester : s));
    setInlineEdit(null);
    setInlineValue("");
    try {
      await updateSemester(updatedSemester);
    } catch {}
  };

  const handleSaveEditSemester = async () => {
    if (!editModal.semester) return;
    // Merge all fields, including code
    const updatedSemester = {
      ...editModal.semester,
      ...editSemester,
      code: editSemester.code,
      name: editSemester.name,
      isActive: editSemester.isActive ?? editModal.semester.isActive,
      isBS: editSemester.isBS ?? editModal.semester.isBS,
    };
    setEditModal({ open: false, semester: null });
    try {
      await updateSemester(updatedSemester);
      // Refetch semesters to sync UI with DB
      const data = await fetchSemesters();
      setSemesters(data);
    } catch {}
  };

  // Delete semester
  const handleDeleteSemester = async (sem: Semester) => {
    try {
      await deleteSemester(sem.id);
      const data = await fetchSemesters();
      setSemesters(data);
    } catch {}
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="w-7 h-7 mr-2 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
        Semester Information
      </h2>
      {loading && <div className="text-center py-8 animate-pulse text-lg text-gray-500">Loading...</div>}
      {error && <div className="text-red-600 font-semibold text-center py-4">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition-colors font-semibold"
              onClick={() => setShowAddModal(true)}
            >
              + Add Semester
            </button>
          </div>
          <table className="min-w-full text-sm rounded-lg shadow border border-gray-200 bg-white">
            <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
              <tr>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("code")}
                >
                  Code {sortKey === "code" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  Name {sortKey === "name" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("isActive")}
                >
                  Status {sortKey === "isActive" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort("isBS")}
                >
                  BS {sortKey === "isBS" && (sortAsc ? "▲" : "▼")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSemesters.map((sem) => (
                <tr key={sem.id} className="hover:bg-blue-50 transition">
                  <td className="py-3 px-4 font-bold text-purple-700">
                    {inlineEdit?.id === sem.id && inlineEdit.field === "code" ? (
                      <input
                        type="text"
                        value={inlineValue}
                        autoFocus
                        onChange={e => setInlineValue(e.target.value)}
                        onBlur={saveInlineEdit}
                        onKeyDown={e => { if (e.key === "Enter") saveInlineEdit(); }}
                        className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    ) : (
                      <span onClick={() => startInlineEdit(sem.id, "code", sem.code)} style={{ cursor: "pointer" }} title="Click to edit">
                        {sem.code}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {inlineEdit?.id === sem.id && inlineEdit.field === "name" ? (
                      <input
                        type="text"
                        value={inlineValue}
                        autoFocus
                        onChange={e => setInlineValue(e.target.value)}
                        onBlur={saveInlineEdit}
                        onKeyDown={e => { if (e.key === "Enter") saveInlineEdit(); }}
                        className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    ) : (
                      <span onClick={() => startInlineEdit(sem.id, "name", sem.name)} style={{ cursor: "pointer" }} title="Click to edit">
                        {sem.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(sem)}
                      className={sem.isActive
                        ? "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        : "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"}
                      style={{ cursor: "pointer" }}
                      aria-label={sem.isActive ? "Set inactive" : "Set active"}
                    >
                      {sem.isActive ? (
                        <span>
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Active
                        </span>
                      ) : (
                        <span>
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handleToggleBS(sem)}
                      className={sem.isBS
                        ? "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        : "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"}
                      style={{ cursor: "pointer" }}
                      aria-label={sem.isBS ? "Unset BS" : "Set BS"}
                    >
                      {sem.isBS ? "BS" : "Not BS"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold px-3 py-1 rounded border border-indigo-100 bg-indigo-50 transition-colors duration-150"
                      onClick={() => handleEditSemester(sem)}
                    >Edit</button>
                    <button
                      type="button"
                      className="ml-2 text-red-600 hover:text-red-900 text-xs font-semibold px-3 py-1 rounded border border-red-100 bg-red-50 transition-colors duration-150"
                      onClick={() => handleDeleteSemester(sem)}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Add Semester Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Add Semester</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Semester Code (e.g. S1, S2, S7)"
                    value={newSemester.code}
                    onChange={e => setNewSemester(s => ({ ...s, code: e.target.value }))}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <input
                    type="text"
                    placeholder="Semester Name"
                    value={newSemester.name}
                    onChange={e => setNewSemester(s => ({ ...s, name: e.target.value }))}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newSemester.isBS}
                        onChange={e => setNewSemester(s => ({ ...s, isBS: e.target.checked }))}
                        className="form-checkbox h-4 w-4 text-purple-600"
                      />
                      <span className="text-gray-700">BS</span>
                    </label>
                  </div>
                  <div className="flex gap-4 mt-6 justify-end">
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 font-semibold"
                      onClick={handleAddSemester}
                    >Add</button>
                    <button
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400 font-semibold"
                      onClick={() => setShowAddModal(false)}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Edit Semester Modal */}
          {editModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Edit Semester</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Semester Code (e.g. S1, S2, S7)"
                    value={editSemester.code}
                    onChange={e => setEditSemester(s => ({ ...s, code: e.target.value }))}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <input
                    type="text"
                    placeholder="Semester Name"
                    value={editSemester.name}
                    onChange={e => setEditSemester(s => ({ ...s, name: e.target.value }))}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  {/* BS checkbox removed for Edit Semester modal */}
                  <div className="flex gap-4 mt-6 justify-end">
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 font-semibold"
                      onClick={handleSaveEditSemester}
                    >Save</button>
                    <button
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400 font-semibold"
                      onClick={() => setEditModal({ open: false, semester: null })}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SemesterInfoComponent;

