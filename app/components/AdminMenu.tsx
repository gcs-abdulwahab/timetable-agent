"use client";

import Link from 'next/link';
import React from 'react';

const AdminMenu: React.FC = () => {
  return (
    <div className="space-x-2 inline-block">
      <Link
        href="/"
        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium inline-block"
      >
        Home
      </Link>
      <Link
        href="/manage-schedule"
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Schedule
      </Link>
      <Link
        href="/teachers"
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Teachers
      </Link>
      <Link
        href="/manage-departments"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Departments
      </Link>
      <Link
        href="/manage-days"
        className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Days
      </Link>
      <Link
        href="/manage-semesters"
        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Semesters
      </Link>
      <Link
        href="/manage-subjects"
        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Subjects
      </Link>
      <Link
        href="/manage-timeslots"
        className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors text-sm font-medium inline-block"
      >
        Manage Timeslots
      </Link>
      <Link
        href="/room-management"
        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium inline-block"
      >
        Room Management
      </Link>
    </div>
  );
};

export default AdminMenu;
