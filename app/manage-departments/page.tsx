'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ConflictViewer from '../components/ConflictViewer';
import { validateTimetable } from '../components/conflictChecker';
import { Department, Subject, Teacher } from '../components/data';
import AddDepartmentModal from '../components/ui/AddDepartmentModal';
import AddTeacherModal from '../components/ui/AddTeacherModal';

const ManageDepartmentsPage = () => {
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'departments' | 'subjects'>('departments');
  
  // Subject management states
  const [selectedSubjectDepartment, setSelectedSubjectDepartment] = useState<string>('all');
  const [selectedSemesterLevel, setSelectedSemesterLevel] = useState<number>(1);
  
  // Modal states
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  
  // Conflict detection states
  const [showConflictViewer, setShowConflictViewer] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for conflicts
  const validation = validateTimetable();
  const hasConflicts = validation.conflicts.length > 0;

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departmentsRes, teachersRes, subjectsRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/teachers'),
        fetch('/api/subjects').catch(() => ({ ok: false, json: () => [] }))
      ]);

      if (!departmentsRes.ok || !teachersRes.ok) {
        // If files don't exist, initialize them
        if (departmentsRes.status === 404 || teachersRes.status === 404) {
          const initRes = await fetch('/api/init-data', { method: 'POST' });
          if (initRes.ok) {
            // Retry loading after initialization
            const [newDepartmentsRes, newTeachersRes, newSubjectsRes] = await Promise.all([
              fetch('/api/departments'),
              fetch('/api/teachers'),
              fetch('/api/subjects').catch(() => ({ ok: false, json: () => [] }))
            ]);
            const departmentsData = await newDepartmentsRes.json();
            const teachersData = await newTeachersRes.json();
            const subjectsData = newSubjectsRes.ok ? await newSubjectsRes.json() : [];
            setDepartmentList(departmentsData);
            setTeacherList(teachersData);
            setSubjectList(subjectsData);
          } else {
            throw new Error('Failed to initialize data');
          }
        } else {
          throw new Error('Failed to load data');
        }
      } else {
        const departmentsData = await departmentsRes.json();
        const teachersData = await teachersRes.json();
        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
        setDepartmentList(departmentsData);
        setTeacherList(teachersData);
        setSubjectList(subjectsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save departments to API
  const saveDepartments = async (updatedDepartments: Department[]) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDepartments),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save departments');
      }
      
      setDepartmentList(updatedDepartments);
    } catch (err) {
      console.error('Error saving departments:', err);
      setError('Failed to save departments');
    }
  };

  // Update department with prompt-based editing
  const handleDepartmentEdit = async (dept: Department) => {
    const newName = prompt('Department Name:', dept.name);
    if (!newName || newName === dept.name) return;
    
    const newShortName = prompt('Short Name:', dept.shortName);
    if (!newShortName) return;
    
    const newOffersBSDegree = confirm(`Currently offers BS degree: ${dept.offersBSDegree}. Change this?`) ? !dept.offersBSDegree : dept.offersBSDegree;
    
    const updatedDepartments = departmentList.map(d => 
      d.id === dept.id ? { 
        ...d, 
        name: newName, 
        shortName: newShortName,
        offersBSDegree: newOffersBSDegree
      } : d
    );
    
    await saveDepartments(updatedDepartments);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Departments & Subjects</h1>
            <div className="flex items-center space-x-2">
              {/* Conflict Warning Button */}
              {hasConflicts && (
                <button
                  onClick={() => setShowConflictViewer(!showConflictViewer)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
                  title="Click to view conflict details"
                >
                  <span className="font-bold">⚠️</span>
                  <span>{validation.conflicts.length} Conflict{validation.conflicts.length !== 1 ? 's' : ''}</span>
                </button>
              )}
              <Link
                href="/manage-schedule"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Manage Schedule
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ← Back to Timetable
              </Link>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <button
                onClick={loadData}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Conflict Viewer */}
          {showConflictViewer && (
            <div className="mb-6">
              <ConflictViewer />
            </div>
          )}

          {!loading && !error && (
            <div>
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('departments')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'departments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Department Management
                  </button>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'subjects'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Subject Management
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'departments' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Department Management</h2>
                    {hasConflicts && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        ⚠️ Some departments have scheduling conflicts. Check the conflict details above.
                      </div>
                    )}
                    <button
                      onClick={() => setShowAddDepartmentModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      + Add Department
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-4">Click on department cards below to edit them:</p>
                  
                  {/* Editable Department Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentList.map(dept => {
                      const teacherCount = teacherList.filter(t => t.departmentId === dept.id).length;
                      const subjectCount = subjectList.filter(s => s.departmentId === dept.id).length;
                      
                      // Check if this department has any teachers involved in conflicts
                      const departmentTeachers = teacherList.filter(t => t.departmentId === dept.id);
                      const deptHasConflicts = validation.conflicts.some(conflict => 
                        departmentTeachers.some(teacher => 
                          conflict.conflictingEntries.some(entryId => entryId.includes(teacher.id))
                        )
                      );
                      
                      return (
                        <div 
                          key={dept.id} 
                          className={`bg-white p-4 rounded border cursor-pointer hover:bg-gray-50 transition-colors shadow-sm ${
                            deptHasConflicts ? 'border-red-300 bg-red-50' : ''
                          }`}
                          onClick={() => handleDepartmentEdit(dept)}
                          title="Click to edit department"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-800">{dept.name}</div>
                            {deptHasConflicts && (
                              <span className="text-red-600 text-xs font-bold" title="This department has scheduling conflicts">
                                ⚠️
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">({dept.shortName})</div>
                          <div className="text-sm text-blue-600 mt-1">
                            {teacherCount} teacher{teacherCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-green-600">
                            {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            {dept.offersBSDegree ? '✓ BS Degree' : '○ No BS Degree'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'subjects' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Subject Management</h2>
                  
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={selectedSubjectDepartment}
                        onChange={(e) => setSelectedSubjectDepartment(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Departments</option>
                        {departmentList.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester Level</label>
                      <select
                        value={selectedSemesterLevel}
                        onChange={(e) => setSelectedSemesterLevel(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                          <option key={level} value={level}>Semester {level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subjects List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectList
                      .filter(subject => {
                        const deptMatch = selectedSubjectDepartment === 'all' || subject.departmentId === selectedSubjectDepartment;
                        const semesterMatch = subject.semesterLevel === selectedSemesterLevel;
                        return deptMatch && semesterMatch;
                      })
                      .map((subject) => (
                        <div key={subject.id} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="font-medium text-gray-800">{subject.name}</div>
                          <div className="text-sm text-gray-600">({subject.shortName})</div>
                          <div className="text-xs text-blue-600 mt-1">{subject.code}</div>
                          <div className="text-xs text-green-600">{subject.creditHours} credit hours</div>
                          <div className="text-xs text-purple-600">
                            {departmentList.find(d => d.id === subject.departmentId)?.name || 'Unknown Department'} - Semester {subject.semesterLevel}
                          </div>
                          <div className="text-xs text-orange-600">
                            {subject.isCore ? 'Core' : 'Elective'}
                          </div>
                        </div>
                      ))}
                  </div>

                  {subjectList.filter(subject => {
                    const deptMatch = selectedSubjectDepartment === 'all' || subject.departmentId === selectedSubjectDepartment;
                    const semesterMatch = subject.semesterLevel === selectedSemesterLevel;
                    return deptMatch && semesterMatch;
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No subjects found for the selected filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Statistics & System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Departments</h3>
                <div className="text-3xl font-bold text-blue-600">{departmentList.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Total Teachers</h3>
                <div className="text-3xl font-bold text-green-600">{teacherList.length}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Total Subjects</h3>
                <div className="text-3xl font-bold text-purple-600">{subjectList.length}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Avg Teachers/Dept</h3>
                <div className="text-3xl font-bold text-yellow-600">
                  {departmentList.length > 0 ? (teacherList.length / departmentList.length).toFixed(1) : '0'}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${hasConflicts ? 'bg-red-50' : 'bg-green-50'}`}>
                <h3 className={`text-lg font-medium mb-2 ${hasConflicts ? 'text-red-800' : 'text-green-800'}`}>
                  Schedule Health
                </h3>
                <div className={`text-3xl font-bold ${hasConflicts ? 'text-red-600' : 'text-green-600'}`}>
                  {hasConflicts ? validation.conflicts.length : '✓'}
                </div>
                <div className={`text-sm ${hasConflicts ? 'text-red-600' : 'text-green-600'}`}>
                  {hasConflicts ? 'Conflicts Found' : 'No Conflicts'}
                </div>
                {hasConflicts && (
                  <button
                    onClick={() => setShowConflictViewer(!showConflictViewer)}
                    className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={showAddDepartmentModal}
        onClose={() => setShowAddDepartmentModal(false)}
        onAdd={async (newDept) => {
          const newDepartment: Department = {
            id: `d${Date.now()}`,
            name: newDept.name,
            shortName: newDept.shortName,
            offersBSDegree: newDept.offersBSDegree
          };
          await saveDepartments([...departmentList, newDepartment]);
        }}
      />
      
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={() => setShowAddTeacherModal(false)}
        onAdd={async (newTeacher) => {
          const newTeacherObj: Teacher = {
            id: `t${Date.now()}`,
            name: newTeacher.name,
            shortName: newTeacher.shortName,
            departmentId: newTeacher.departmentId,
            designation: newTeacher.designation,
            contactNumber: newTeacher.contactNumber,
            email: newTeacher.email,
            dateOfBirth: newTeacher.dateOfBirth,
            seniority: newTeacher.seniority,
            cnic: newTeacher.cnic,
            personnelNumber: newTeacher.personnelNumber
          };
          
          try {
            const response = await fetch('/api/teachers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify([...teacherList, newTeacherObj]),
            });
            
            if (response.ok) {
              setTeacherList([...teacherList, newTeacherObj]);
            }
          } catch (err) {
            console.error('Error saving teacher:', err);
          }
        }}
        departments={departmentList}
      />
    </div>
  );
};

export default ManageDepartmentsPage;
