'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Department, Teacher } from '../components/data';
import AddDepartmentModal from '../components/ui/AddDepartmentModal';
import AddTeacherModal from '../components/ui/AddTeacherModal';

const ManageDepartmentsPage = () => {
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [isEditingDepartment, setIsEditingDepartment] = useState<string | null>(null);
  const [isEditingTeacher, setIsEditingTeacher] = useState<string | null>(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDepartmentData, setEditingDepartmentData] = useState<{name: string, shortName: string, offersBSDegree: boolean}>({name: '', shortName: '', offersBSDegree: false});
  const [editingTeacherData, setEditingTeacherData] = useState<{name: string, shortName: string, departmentId: string, designation?: string, contactNumber?: string, email?: string, dateOfBirth?: string, seniority?: number, cnic?: string, personnelNumber?: string}>({name: '', shortName: '', departmentId: '', designation: '', contactNumber: '', email: '', dateOfBirth: '', seniority: 0, cnic: '', personnelNumber: ''});

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departmentsRes, teachersRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/teachers')
      ]);

      if (!departmentsRes.ok || !teachersRes.ok) {
        // If files don't exist, initialize them
        if (departmentsRes.status === 404 || teachersRes.status === 404) {
          const initRes = await fetch('/api/init-data', { method: 'POST' });
          if (initRes.ok) {
            // Retry loading after initialization
            const [newDepartmentsRes, newTeachersRes] = await Promise.all([
              fetch('/api/departments'),
              fetch('/api/teachers')
            ]);
            const departmentsData = await newDepartmentsRes.json();
            const teachersData = await newTeachersRes.json();
            setDepartmentList(departmentsData);
            setTeacherList(teachersData);
          } else {
            throw new Error('Failed to initialize data');
          }
        } else {
          throw new Error('Failed to load data');
        }
      } else {
        const departmentsData = await departmentsRes.json();
        const teachersData = await teachersRes.json();
        setDepartmentList(departmentsData);
        setTeacherList(teachersData);
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

  // Save teachers to API
  const saveTeachers = async (updatedTeachers: Teacher[]) => {
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTeachers),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save teachers');
      }
      
      setTeacherList(updatedTeachers);
    } catch (err) {
      console.error('Error saving teachers:', err);
      setError('Failed to save teachers');
    }
  };

  // CRUD operations for Departments
  const addDepartment = (newDepartment: { name: string; shortName: string; offersBSDegree: boolean }) => {
    const newDept: Department = {
      id: `d${Date.now()}`,
      name: newDepartment.name,
      shortName: newDepartment.shortName,
      offersBSDegree: newDepartment.offersBSDegree
    };
    const updatedDepartments = [...departmentList, newDept];
    saveDepartments(updatedDepartments);
  };

  const updateDepartment = (id: string, updatedDept: Partial<Department>) => {
    const updatedDepartments = departmentList.map(dept => 
      dept.id === id ? { ...dept, ...updatedDept } : dept
    );
    saveDepartments(updatedDepartments);
  };

  const saveEditingDepartment = (id: string) => {
    const updatedDepartments = departmentList.map(dept => 
      dept.id === id ? { 
        ...dept, 
        name: editingDepartmentData.name, 
        shortName: editingDepartmentData.shortName,
        offersBSDegree: editingDepartmentData.offersBSDegree
      } : dept
    );
    saveDepartments(updatedDepartments);
    setIsEditingDepartment(null);
  };

  const startEditingDepartment = (dept: Department) => {
    setEditingDepartmentData({
      name: dept.name,
      shortName: dept.shortName,
      offersBSDegree: dept.offersBSDegree
    });
    setIsEditingDepartment(dept.id);
  };

  const cancelEditingDepartment = () => {
    setIsEditingDepartment(null);
    setEditingDepartmentData({name: '', shortName: '', offersBSDegree: false});
  };

  const deleteDepartment = (id: string) => {
    // Check if department has teachers
    const hasTeachers = teacherList.some(teacher => teacher.departmentId === id);
    
    if (hasTeachers) {
      alert('Cannot delete department that has teachers assigned. Please reassign or delete teachers first.');
      return;
    }
    
    const updatedDepartments = departmentList.filter(dept => dept.id !== id);
    saveDepartments(updatedDepartments);
  };

  // CRUD operations for Teachers
  const addTeacher = (newTeacher: { 
    name: string; 
    shortName?: string; 
    departmentId: string;
    designation: string;
    contactNumber?: string;
    email?: string;
    dateOfBirth?: string;
    seniority?: number;
    cnic?: string;
    personnelNumber?: string;
  }) => {
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
    const updatedTeachers = [...teacherList, newTeacherObj];
    saveTeachers(updatedTeachers);
  };

  const updateTeacher = (id: string, updatedTeacher: Partial<Teacher>) => {
    const updatedTeachers = teacherList.map(teacher => 
      teacher.id === id ? { ...teacher, ...updatedTeacher } : teacher
    );
    saveTeachers(updatedTeachers);
  };

  const saveEditingTeacher = (id: string) => {
    const updatedTeachers = teacherList.map(teacher => 
      teacher.id === id ? { 
        ...teacher, 
        name: editingTeacherData.name, 
        shortName: editingTeacherData.shortName,
        departmentId: editingTeacherData.departmentId,
        designation: editingTeacherData.designation,
        contactNumber: editingTeacherData.contactNumber,
        email: editingTeacherData.email,
        dateOfBirth: editingTeacherData.dateOfBirth,
        seniority: editingTeacherData.seniority,
        cnic: editingTeacherData.cnic,
        personnelNumber: editingTeacherData.personnelNumber
      } : teacher
    );
    saveTeachers(updatedTeachers);
    setIsEditingTeacher(null);
  };

  const startEditingTeacher = (teacher: Teacher) => {
    setEditingTeacherData({
      name: teacher.name,
      shortName: teacher.shortName,
      departmentId: teacher.departmentId,
      designation: teacher.designation || '',
      contactNumber: teacher.contactNumber || '',
      email: teacher.email || '',
      dateOfBirth: teacher.dateOfBirth || '',
      seniority: teacher.seniority || 0,
      cnic: teacher.cnic || '',
      personnelNumber: teacher.personnelNumber || ''
    });
    setIsEditingTeacher(teacher.id);
  };

  const cancelEditingTeacher = () => {
    setIsEditingTeacher(null);
    setEditingTeacherData({name: '', shortName: '', departmentId: '', designation: '', contactNumber: '', email: '', dateOfBirth: '', seniority: 0, cnic: '', personnelNumber: ''});
  };

  const deleteTeacher = (id: string) => {
    const updatedTeachers = teacherList.filter(teacher => teacher.id !== id);
    saveTeachers(updatedTeachers);
  };

  // Filter teachers by department
  const filteredTeachers = selectedDepartmentFilter === 'all' 
    ? teacherList 
    : teacherList.filter(teacher => teacher.departmentId === selectedDepartmentFilter);

  // Get department name by ID
  const getDepartmentName = (id: string) => {
    const dept = departmentList.find(d => d.id === id);
    return dept ? dept.name : 'Unknown Department';
  };

  const exportToJSON = () => {
    const data = {
      departments: departmentList,
      teachers: teacherList
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'departments-teachers-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.departments && Array.isArray(data.departments)) {
          await saveDepartments(data.departments);
        }
        
        if (data.teachers && Array.isArray(data.teachers)) {
          await saveTeachers(data.teachers);
        }
        
        // Reload data to reflect changes
        loadData();
        
        alert('Data imported successfully!');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Departments & Teachers</h1>
            <div className="space-x-2">
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
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          )}
          
          {/* Error State */}
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
          
          {/* Main Content - Only show when not loading and no error */}
          {!loading && !error && (
            <>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={exportToJSON}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Export to JSON
                </button>
                <button
                  onClick={importFromJSON}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Import Departments
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Departments Management */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Departments</h2>
                    <button
                      onClick={() => setShowAddDepartmentModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      + Add Department
                    </button>
                  </div>

                  {/* Departments List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {departmentList.map((dept) => (
                      <div key={dept.id} className="bg-white border rounded-lg p-3">
                        {isEditingDepartment === dept.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingDepartmentData.name}
                              onChange={(e) => setEditingDepartmentData({...editingDepartmentData, name: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Department Name"
                            />
                            <input
                              type="text"
                              value={editingDepartmentData.shortName}
                              onChange={(e) => setEditingDepartmentData({...editingDepartmentData, shortName: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Short Name"
                            />
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`offers-bs-${dept.id}`}
                                checked={editingDepartmentData.offersBSDegree}
                                onChange={(e) => setEditingDepartmentData({...editingDepartmentData, offersBSDegree: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`offers-bs-${dept.id}`} className="text-sm text-gray-700">
                                Offers BS Degree
                              </label>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveEditingDepartment(dept.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => cancelEditingDepartment()}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div 
                              className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                              onClick={() => setSelectedDepartmentFilter(dept.id)}
                              title="Click to filter teachers by this department"
                            >
                              <div className="font-medium text-gray-800">{dept.name}</div>
                              <div className="text-sm text-gray-600">({dept.shortName})</div>
                              <div className="text-xs text-blue-600">
                                {teacherList.filter(t => t.departmentId === dept.id).length} teachers
                              </div>
                              <div className="text-xs text-purple-600 mt-1">
                                {dept.offersBSDegree ? '✓ Offers BS Degree' : '○ No BS Degree'}
                              </div>
                              {selectedDepartmentFilter === dept.id && (
                                <div className="text-xs text-green-600 font-medium mt-1">
                                  ✓ Filtering teachers
                                </div>
                              )}
                            </div>
                            <div className="space-x-2">
                              <button
                                onClick={() => startEditingDepartment(dept)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteDepartment(dept.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teachers Management */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-700">Teachers</h2>
                      {selectedDepartmentFilter !== 'all' && (
                        <div className="text-sm text-blue-600 mt-1">
                          Showing teachers from: {getDepartmentName(selectedDepartmentFilter)}
                          <button
                            onClick={() => setSelectedDepartmentFilter('all')}
                            className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Clear filter
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAddTeacherModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      + Add Teacher
                    </button>
                  </div>
                  
                  {/* Filter by Department */}
                  <div className="mb-4">
                    <select
                      value={selectedDepartmentFilter}
                      onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Departments</option>
                      {departmentList.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Teachers List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredTeachers.map((teacher) => (
                      <div key={teacher.id} className="bg-white border rounded-lg p-3">
                        {isEditingTeacher === teacher.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingTeacherData.name}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, name: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Teacher Name"
                            />
                            <input
                              type="text"
                              value={editingTeacherData.shortName}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, shortName: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Short Name"
                            />
                            <input
                              type="text"
                              value={editingTeacherData.designation || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, designation: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Designation (e.g., Professor, Associate Professor)"
                            />
                            <input
                              type="text"
                              value={editingTeacherData.contactNumber || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, contactNumber: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Contact Number"
                            />
                            <input
                              type="email"
                              value={editingTeacherData.email || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, email: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Email Address"
                            />
                            <input
                              type="date"
                              value={editingTeacherData.dateOfBirth || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, dateOfBirth: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Date of Birth"
                            />
                            <input
                              type="number"
                              value={editingTeacherData.seniority || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, seniority: parseInt(e.target.value) || 0})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Seniority (years)"
                            />
                            <input
                              type="text"
                              value={editingTeacherData.cnic || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, cnic: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="CNIC Number"
                            />
                            <input
                              type="text"
                              value={editingTeacherData.personnelNumber || ''}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, personnelNumber: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Personnel Number"
                            />
                            <select
                              value={editingTeacherData.departmentId}
                              onChange={(e) => setEditingTeacherData({...editingTeacherData, departmentId: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              {departmentList.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                              ))}
                            </select>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveEditingTeacher(teacher.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => cancelEditingTeacher()}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800">{teacher.name}</div>
                              {teacher.shortName && (
                                <div className="text-sm text-gray-600">({teacher.shortName})</div>
                              )}
                              {teacher.designation ? (
                                <div className="text-xs text-blue-600 font-medium">
                                  {teacher.designation}
                                </div>
                              ) : (
                                <div className="text-xs text-red-500 italic">
                                  No designation assigned
                                </div>
                              )}
                              <div className="text-xs text-green-600">
                                {getDepartmentName(teacher.departmentId)}
                              </div>
                            </div>
                            <div className="space-x-2">
                              <button
                                onClick={() => startEditingTeacher(teacher)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTeacher(teacher.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Total Departments</h3>
              <div className="text-3xl font-bold text-blue-600">{departmentList.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-2">Total Teachers</h3>
              <div className="text-3xl font-bold text-green-600">{teacherList.length}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Average Teachers per Dept</h3>
              <div className="text-3xl font-bold text-yellow-600">
                {departmentList.length > 0 ? (teacherList.length / departmentList.length).toFixed(1) : '0'}
              </div>
            </div>
          </div>

          {/* Department breakdown */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Departments Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentList.map(dept => {
                const teacherCount = teacherList.filter(t => t.departmentId === dept.id).length;
                return (
                  <div key={dept.id} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-gray-800">{dept.name}</div>
                    <div className="text-sm text-gray-600">({dept.shortName})</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {teacherCount} teacher{teacherCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {dept.offersBSDegree ? '✓ BS Degree' : '○ No BS Degree'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={showAddDepartmentModal}
        onClose={() => setShowAddDepartmentModal(false)}
        onAdd={addDepartment}
      />
      
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={() => setShowAddTeacherModal(false)}
        onAdd={addTeacher}
        departments={departmentList}
      />
    </div>
  );
};

export default ManageDepartmentsPage;
