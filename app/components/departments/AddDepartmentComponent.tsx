import React, { useState } from "react";

interface AddDepartmentComponentProps {
  onDepartmentAdded?: () => void;
}

const AddDepartmentComponent: React.FC<AddDepartmentComponentProps> = ({ onDepartmentAdded }) => {
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
    </form>
  );
};

export default AddDepartmentComponent;
