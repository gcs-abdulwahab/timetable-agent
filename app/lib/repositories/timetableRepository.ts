// Centralized repository for timetable data fetching
// All functions return promises and fetch from API endpoints

export async function getDaysOfWeek() {
  // Replace with API call if you have an endpoint
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
}

export async function getDepartments() {
  const res = await fetch('/api/departments');
  if (!res.ok) throw new Error('Failed to fetch departments');
  return await res.json();
}

export async function getSemesters() {
  const res = await fetch('/api/semesters');
  if (!res.ok) throw new Error('Failed to fetch semesters');
  return await res.json();
}

export async function getSubjects() {
  const res = await fetch('/api/subjects');
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return await res.json();
}

export async function getTeachers() {
  const res = await fetch('/api/teachers');
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return await res.json();
}

export async function getTimeSlots() {
  const res = await fetch('/api/timeslots');
  if (!res.ok) throw new Error('Failed to fetch time slots');
  return await res.json();
}
