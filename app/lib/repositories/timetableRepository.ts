// Minimal timetable repository helpers used by client components.
// These wrap fetch calls to local API routes and return arrays.

async function fetchArray(endpoint: string): Promise<any[]> {
  const res = await fetch(`/api/${endpoint}`);
  if (!res.ok) {
    console.error(`Failed to fetch /api/${endpoint}:`, res.statusText);
    return [];
  }
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(`Error parsing JSON from /api/${endpoint}:`, e);
    return [];
  }
}

export async function getDepartments() {
  return fetchArray('departments');
}

export async function getSemesters() {
  return fetchArray('semesters');
}

export async function getSubjects() {
  return fetchArray('subjects');
}

export async function getTeachers() {
  return fetchArray('teachers');
}

export async function getTimeSlots() {
  // API route is named 'timeslots' in many places; support both
  const ts = await fetchArray('timeslots');
  if (ts.length) return ts;
  return fetchArray('time-slots');
}

export async function getDaysOfWeek() {
  // days API
  return fetchArray('days');
}

export default {
  getDepartments,
  getSemesters,
  getSubjects,
  getTeachers,
  getTimeSlots,
  getDaysOfWeek
};
