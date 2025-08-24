import { Department } from "@/app/types";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface AddDepartmentComponentProps {
  onDepartmentAdded?: () => void;
  departments?: Department[];
  fetchDepartments?: () => void;
}

const AddDepartmentComponent: React.FC<AddDepartmentComponentProps> = ({ onDepartmentAdded, departments = [], fetchDepartments }) => {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [offersBSDegree, setOffersBSDegree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shortName, offersBSDegree }),
      });
      if (res.ok && onDepartmentAdded) {
        onDepartmentAdded();
      }
      setName("");
      setShortName("");
      setOffersBSDegree(false);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Short Name', 'Offers BS Degree'];
    const rows = departments.map(dept => [dept.name, dept.shortName, dept.offersBSDegree ? 'Yes' : 'No']);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    csvContent += rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'departments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const [header, ...rows] = lines;
      for (const row of rows) {
        const [name, shortNameRaw, offersBSDegreeRaw] = row.split(',');
        const shortName = shortNameRaw.replace(/\s+/g, ''); // Remove spaces
        const offersBSDegree = offersBSDegreeRaw.trim().toLowerCase() === 'yes';
        if (shortName) {
          await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, shortName, offersBSDegree })
          });
        }
      }
      if (fetchDepartments) fetchDepartments();
    };
    reader.readAsText(file);
  };

  return (
    <form className="mb-4 p-4 bg-blue-50 rounded-lg border" onSubmit={handleAdd}>
      <h3 className="text-lg font-bold mb-2 text-blue-800">Add Department...</h3>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Short Name</label>
        <input
          type="text"
          value={shortName}
          onChange={e => setShortName(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="mb-2 flex items-center">
        <input
          type="checkbox"
          checked={offersBSDegree}
          onChange={e => setOffersBSDegree(e.target.checked)}
          className="mr-2"
        />
        <span className="text-sm">Offers BS Degree</span>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Department"}
      </button>
      <div className="flex flex-col gap-3 items-start mt-6">
        <Button onClick={exportToCSV} variant="outline" className="w-full flex items-center gap-2" type="button">
          <span role="img" aria-label="Export">📤</span> Export to CSV
        </Button>
        <Button asChild variant="outline" className="w-full flex items-center gap-2">
          <label className="cursor-pointer m-0 w-full flex items-center gap-2">
            <span role="img" aria-label="Import">📥</span> Import from CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
          </label>
        </Button>
      </div>
    </form>
  );
};

export default AddDepartmentComponent;
