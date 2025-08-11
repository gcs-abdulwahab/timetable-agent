'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Department, Teacher, TimetableEntry } from '../components/data';
import AddTeacherModal from '../components/ui/AddTeacherModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import TeacherProfile from '../components/TeacherProfile';

const ManageTeachersPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  
  // Modal and dialog states
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    teacher: Teacher | null;
  }>({ isOpen: false, teacher: null });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  
  // Status states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load initial data
  useEffect(() => {
    loadData();
    loadTimetableEntries();
    
    // Handle URL parameter for pre-selecting department
    const departmentParam = searchParams.get('departmentId');
    if (departmentParam) {
      setSelectedDepartmentId(departmentParam);
    }
  }, [searchParams]);

  const loadTimetableEntries = async () => {
    try {
      const response = await fetch('/api/allocations');
      if (response.ok) {
        const data = await response.json();
        setTimetableEntries(data);
      }
    } catch (err) {
      console.error('Error loading timetable entries:', err);
    }
  };

  // Filter teachers when department selection changes
  useEffect(() => {
    if (selectedDepartmentId === 'all') {
      setFilteredTeachers(allTeachers);
      setCurrentDepartment(null);
    } else {
      const filtered = allTeachers.filter(teacher => teacher.departmentId === selectedDepartmentId);
      setFilteredTeachers(filtered);
      
      const dept = departmentList.find(d => d.id === selectedDepartmentId);
      setCurrentDepartment(dept || null);
    }
  }, [selectedDepartmentId, allTeachers, departmentList]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departmentsRes, teachersRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/teachers')
      ]);

      const departmentsData = departmentsRes.ok ? await departmentsRes.json() : [];
      const teachersData = teachersRes.ok ? await teachersRes.json() : [];
      
      setDepartmentList(departmentsData);
      setAllTeachers(teachersData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
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
      
      setAllTeachers(updatedTeachers);
    } catch (err) {
      console.error('Error saving teachers:', err);
      setError('Failed to save teachers');
      throw err;
    }
  };

  // Handle teacher edit
  const handleTeacherEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowAddTeacherModal(true);
  };

  // Handle teacher delete
  const handleTeacherDelete = (teacher: Teacher) => {
    setDeleteConfirmation({ isOpen: true, teacher });
  };

  // Confirm teacher deletion
  const confirmTeacherDelete = async () => {
    if (!deleteConfirmation.teacher) return;

    try {
      const updatedTeachers = allTeachers.filter(t => t.id !== deleteConfirmation.teacher!.id);
      await saveTeachers(updatedTeachers);
      
      const departmentName = departmentList.find(d => d.id === deleteConfirmation.teacher!.departmentId)?.name || 'Unknown Department';
      setSuccessMessage(`Teacher "${deleteConfirmation.teacher!.name}" has been deleted from ${departmentName}.`);
      
      setDeleteConfirmation({ isOpen: false, teacher: null });
    } catch (error) {
      setError('Failed to delete teacher. Please try again.');
    }
  };

  // Handle teacher modal close
  const handleTeacherModalClose = () => {
    setShowAddTeacherModal(false);
    setEditingTeacher(null);
  };

  // Handle teacher add/update submission
  const handleTeacherSubmit = async (teacherData: Omit<Teacher, 'id'> | Teacher) => {
    try {
      setSuccessMessage(null);
      setError(null);

      if (editingTeacher) {
        // Update existing teacher
        const updatedTeacher = {
          ...teacherData,
          id: editingTeacher.id,
        } as Teacher;
        
        const updatedTeachers = allTeachers.map(t => 
          t.id === editingTeacher.id ? updatedTeacher : t
        );
        
        await saveTeachers(updatedTeachers);
        
        const departmentName = departmentList.find(d => d.id === updatedTeacher.departmentId)?.name || 'Unknown Department';
        setSuccessMessage(`Teacher "${updatedTeacher.name}" has been updated successfully in ${departmentName}.`);
      } else {
        // Add new teacher
        const newTeacher: Teacher = {
          id: `t${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
          ...(teacherData as Omit<Teacher, 'id'>)
        };
        
        const updatedTeachers = [...allTeachers, newTeacher];
        await saveTeachers(updatedTeachers);
        
        const departmentName = departmentList.find(d => d.id === newTeacher.departmentId)?.name || 'Unknown Department';
        setSuccessMessage(`Teacher "${newTeacher.name}" has been added successfully to ${departmentName}.`);
      }
    } catch (error) {
      setError(`Failed to ${editingTeacher ? 'update' : 'add'} teacher. Please try again.`);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  // Sort teachers by name for consistent display
  const sortedTeachers = [...filteredTeachers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Teacher Management
                {currentDepartment && (
                  <span className="text-2xl font-normal text-gray-600 ml-2">
                    - {currentDepartment.name}
                  </span>
                )}
              </h1>
              {currentDepartment && (
                <p className="text-gray-600 mt-2">
                  Managing teachers for {currentDepartment.name} ({currentDepartment.shortName}) department
                </p>
              )}
            </div>
            <div className="space-x-2">
              <Link
                href="/manage-departments"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Manage Departments
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
              <p className="mt-2 text-gray-600">Loading teachers...</p>
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

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Success</p>
              <p>{successMessage}</p>
            </div>
          )}

          {!loading && !error && (
            <div>
              {/* Department Filter and Add Teacher Button */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) => setSelectedDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Departments</option>
                      {departmentList.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Total Teachers: <span className="font-semibold">{sortedTeachers.length}</span></p>
                    {selectedDepartmentId !== 'all' && (
                      <p>Department: <span className="font-semibold">{currentDepartment?.name}</span></p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => setShowAddTeacherModal(true)}
                      disabled={selectedDepartmentId === 'all'}
                      className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                        selectedDepartmentId === 'all'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      title={selectedDepartmentId === 'all' 
                        ? 'Please select a specific department to add a teacher'
                        : 'Add a new teacher to the selected department'
                      }
                    >
                      + Add Teacher
                    </button>
                  </div>
                </div>
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTeachers.map((teacher) => {
                  const department = departmentList.find(d => d.id === teacher.departmentId);
                  
                  return (
                    <div key={teacher.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      {/* Teacher Info */}
                      <div className="mb-3">
                        <div className="font-medium text-gray-800 text-lg">{teacher.name}</div>
                        {teacher.shortName && teacher.shortName !== teacher.name && (
                          <div className="text-sm text-gray-600 mt-1">({teacher.shortName})</div>
                        )}
                        <div className="text-sm text-purple-600 mt-1">
                          {department?.name || 'Unknown Department'}
                        </div>
                        
                        {/* Additional Details */}
                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                          {teacher.designation && (
                            <div><span className="font-medium">Designation:</span> {teacher.designation}</div>
                          )}
                          {teacher.email && (
                            <div><span className="font-medium">Email:</span> {teacher.email}</div>
                          )}
                          {teacher.contactNumber && (
                            <div><span className="font-medium">Contact:</span> {teacher.contactNumber}</div>
                          )}
                          {teacher.seniority && (
                            <div><span className="font-medium">Seniority:</span> {teacher.seniority}</div>
                          )}
                          {teacher.personnelNumber && (
                            <div><span className="font-medium">Personnel #:</span> {teacher.personnelNumber}</div>
                          )}
                          {teacher.cnic && (
                            <div><span className="font-medium">CNIC:</span> {teacher.cnic}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex space-x-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedTeacher(teacher)}
                          className="flex-1 bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition-colors font-medium"
                          title="View teacher profile"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleTeacherEdit(teacher)}
                          className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                          title="Edit this teacher"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleTeacherDelete(teacher)}
                          className="flex-1 bg-red-600 text-white text-xs px-3 py-2 rounded hover:bg-red-700 transition-colors font-medium"
                          title="Delete this teacher"
                          disabled={teacher.id === 'unassigned'}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sortedTeachers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {selectedDepartmentId === 'all' 
                    ? 'No teachers found.' 
                    : `No teachers found for ${currentDepartment?.name || 'the selected department'}.`
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* Department Statistics */}
        {!loading && !error && selectedDepartmentId !== 'all' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Department Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Teachers</h3>
                <div className="text-3xl font-bold text-blue-600">{sortedTeachers.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Department</h3>
                <div className="text-lg font-bold text-green-600">{currentDepartment?.name}</div>
                <div className="text-sm text-green-600">({currentDepartment?.shortName})</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-2">BS Degree</h3>
                <div className="text-lg font-bold text-purple-600">
                  {currentDepartment?.offersBSDegree ? 'Offered' : 'Not Offered'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Modal */}
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={handleTeacherModalClose}
        onAdd={handleTeacherSubmit}
        departments={departmentList}
        mode={editingTeacher ? 'edit' : 'add'}
        initialTeacher={editingTeacher}
        preSelectedDepartmentId={selectedDepartmentId !== 'all' ? selectedDepartmentId : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, teacher: null })}
        onConfirm={confirmTeacherDelete}
        title="Delete Teacher"
        message={
          deleteConfirmation.teacher 
            ? `Are you sure you want to delete "${deleteConfirmation.teacher.name}"?\n\nThis action cannot be undone and will remove the teacher from all schedules and assignments.`
            : ''
        }
        confirmText="Delete Teacher"
        cancelText="Cancel"
        variant="destructive"
        icon={
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl text-red-600">🗑️</span>
          </div>
        }
      />

      {/* Teacher Profile Modal */}
      {selectedTeacher && (
        <TeacherProfile
          teacher={selectedTeacher}
          timetableEntries={timetableEntries}
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
};

export default ManageTeachersPage;
