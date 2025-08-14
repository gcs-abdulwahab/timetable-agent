// API logic for semesters
export async function fetchSemesters() {
  const res = await fetch("/api/semesters");
  if (!res.ok) throw new Error("Failed to fetch semesters");
  return await res.json();
}

export async function updateSemester(semester) {
  const res = await fetch("/api/semesters", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(semester),
  });
  if (!res.ok) throw new Error("Failed to update semester");
  return await res.json();
}

export async function deleteSemester(id) {
  const res = await fetch("/api/semesters", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete semester");
  return await res.json();
}
