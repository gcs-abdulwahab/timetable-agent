'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-full px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
            College Timetable Management
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/manage-schedule"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/manage-schedule'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Manage Schedule
            </Link>
            <Link
              href="/manage-departments"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/manage-departments'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Manage Departments
            </Link>
            <Link
              href="/room-management"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/room-management'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              Room Management
            </Link>
            <Link
              href="/?admin=true"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Show Admin Panel
            </Link>
            <Link
              href="/?stats=true"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Show Statistics
            </Link>
            <Link
              href="/?conflicts=true"
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors text-sm font-medium"
            >
              Show Conflicts (0)
            </Link>
            <Link
              href="/?reset=true"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              title="Clear stored data and reset to default"
            >
              Reset Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
