'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Department, Subject, getOfferedLevelsForDept } from '../components/data';

const DepartmentCoursesPage = () => {
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departmentsRes, subjectsRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/subjects')
      ]);

      const departmentsData = departmentsRes.ok ? await departmentsRes.json() : [];
      const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
      
      setDepartmentList(departmentsData);
      setSubjectList(subjectsData);
      
      // Find the specific department
      if (departmentId) {
        const foundDept = departmentsData.find((d: Department) => d.id === departmentId);
        setDepartment(foundDept || null);
        
        if (!foundDept) {
          setError('Department not found');
        }
      } else {
        setError('No department specified');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading department courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error || 'Department not found'}</p>
            </div>
            <Link
              href="/manage-departments"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              ← Back to Departments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeSemesters = getOfferedLevelsForDept(department).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Courses in Active Semesters - {department.name}
            </h1>
            <div className="flex items-center space-x-2">
              <Link
                href="/manage-departments"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ← Back to Departments
              </Link>
            </div>
          </div>

          {activeSemesters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No active semesters configured for this department.</p>
              <p className="text-sm mt-2">Please configure semester levels using the semester chips in the department management page.</p>
              <Link
                href="/manage-departments"
                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Configure Semesters
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSemesters.map(semester => {
                const coursesForSemester = subjectList.filter(
                  subject => subject.departmentId === department.id && subject.semesterLevel === semester
                );
                
                return (
                  <div key={semester} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                        Semester {semester}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({coursesForSemester.length} course{coursesForSemester.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                    
                    {coursesForSemester.length === 0 ? (
                      <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
                        <div className="text-gray-500 text-sm mb-3">
                          No courses configured for Semester {semester}
                        </div>
                        <Link
                          href={`/manage-departments?tab=subjects&department=${department.id}&semester=${semester}`}
                          className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors font-medium"
                        >
                          + Add Course for Semester {semester}
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div></div>
                          <Link
                            href={`/manage-departments?tab=subjects&department=${department.id}&semester=${semester}`}
                            className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors font-medium"
                          >
                            + Add Another Course
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {coursesForSemester.map(course => (
                            <div key={course.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-800 text-sm">{course.name}</h4>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  course.isCore 
                                    ? 'bg-orange-100 text-orange-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {course.isCore ? 'Core' : 'Elective'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div><strong>Code:</strong> <span className="font-mono">{course.code}</span></div>
                                <div><strong>Short Name:</strong> {course.shortName}</div>
                                <div><strong>Credit Hours:</strong> {course.creditHours}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-200 mt-8 pt-4 bg-gray-50 rounded-b-lg p-4">
            <div className="text-sm text-gray-600">
              <strong>Department:</strong> {department.name} ({department.shortName}) • 
              <strong>Active Semesters:</strong> {activeSemesters.join(', ') || 'None'} • 
              <strong>Total Courses:</strong> {subjectList.filter(s => s.departmentId === department.id).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCoursesPage;
