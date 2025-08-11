'use client';

import { Department, Room, Semester, Subject, Teacher, TimeSlot } from '@/app/components/data';
import { useEffect, useState } from 'react';

type LoadState<T> = { data: T; loading: boolean; error: string | null };

function useGeneric<T>(url: string, initial: T): LoadState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        setLoading(true);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        if (active) setData(json);
      } catch (e: any) {
        if (active) setError(e?.message || 'Unknown error');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
}

export function useDepartments() {
  return useGeneric<Department[]>('/api/departments', []);
}

export function useTeachers() {
  return useGeneric<Teacher[]>('/api/teachers', []);
}

export function useSubjects() {
  return useGeneric<Subject[]>('/api/subjects', []);
}

export function useSemesters() {
  return useGeneric<Semester[]>('/api/semesters', []);
}

export function useTimeSlots() {
  return useGeneric<TimeSlot[]>('/api/timeslots', []);
}

export function useRooms() {
  return useGeneric<Room[]>('/api/rooms', []);
}
