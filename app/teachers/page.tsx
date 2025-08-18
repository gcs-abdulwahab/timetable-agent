'use client';

import { useEffect, useState } from 'react';
import TeacherManagementComponent from '../components/TeacherManagementComponent';
import type { Department } from '../lib/data-fetcher';
import { fetchFromApi } from '../lib/data-fetcher';

export default function TeacherManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchFromApi<Department>('departments');
        setDepartments(data);
      } catch (error) {
        console.error('Error loading departments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teacher Management</h1>
      <TeacherManagementComponent departments={departments} />
    </div>
  );
}
