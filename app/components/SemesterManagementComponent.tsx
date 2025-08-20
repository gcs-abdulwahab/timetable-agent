'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Department, Semester, Subject, countSubjectsForDeptLevel, getOfferedLevelsForDept, setOfferedLevelsForDept } from './data';
import ConfirmationDialog from './ui/ConfirmationDialog';
import InlineAlert from './ui/InlineAlert';
import SemesterToggle from './ui/SemesterToggle';
import SubjectModal from './ui/SubjectModal';

// Constants
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const DEFAULT_COLORS = [
  'bg-gray-100',
  'bg-gray-200',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-indigo-100',
  'bg-red-100',
  'bg-teal-100'
] as const;

// Types for modal state
type ModalMode = 'add' | 'edit';
type ActiveTab = 'levels' | 'subjects';

const SemesterManagementComponent = () => {
  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  
  // Filter states
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  
  // Department creation states
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentShortName, setNewDepartmentShortName] = useState('');
  const [newDepartmentOffersBSDegree, setNewDepartmentOffersBSDegree] = useState(true);
  const [addingDepartment, setAddingDepartment] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('subjects');
  
  // Loading and saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Alert states (keeping for compatibility with existing code)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    subject: Subject | null;
  }>({ isOpen: false, subject: null });

  // Load data from API on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [departmentsRes, subjectsRes, semestersRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/subjects').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/semesters').catch(() => ({ ok: false, json: () => [] }))
      ]);

      if (!departmentsRes.ok) {
        // If files don't exist, initialize them
        if (departmentsRes.status === 404) {
          const initRes = await fetch('/api/init-data', { method: 'POST' });
          if (initRes.ok) {
            // Retry loading after initialization
            const [newDepartmentsRes, newSubjectsRes, newSemestersRes] = await Promise.all([
              fetch('/api/departments'),
              fetch('/api/subjects').catch(() => ({ ok: false, json: () => [] })),
              fetch('/api/semesters').catch(() => ({ ok: false, json: () => [] }))
            ]);
            const departmentsData = await newDepartmentsRes.json();
            const subjectsData = newSubjectsRes.ok ? await newSubjectsRes.json() : [];
            const semestersData = newSemestersRes.ok ? await newSemestersRes.json() : [];
            setDepartments(departmentsData);
            setSubjects(subjectsData);
            setSemesters(semestersData);
          } else {
            throw new Error('Failed to initialize data');
          }
        } else {
          throw new Error('Failed to load data');
        }
      } else {
        const departmentsData = await departmentsRes.json();
        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
        const semestersData = semestersRes.ok ? await semestersRes.json() : [];
        setDepartments(departmentsData);
        setSubjects(subjectsData);
        setSemesters(semestersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save subjects to API
  const saveSubjects = async (updatedSubjects: Subject[]) => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSubjects),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subjects');
      }
      
      setSubjects(updatedSubjects);
      showAlert('success', 'Subject saved successfully!');
    } catch (err) {
      console.error('Error saving subjects:', err);
      showAlert('error', 'Failed to save subject. Please try again.');
    }
  };

  // Add new subject
  const handleAddSubject = async (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      id: `subj${Date.now()}`,
      ...subjectData
    };
    await saveSubjects([...subjects, newSubject]);
  };

  // Update existing subject
  const handleUpdateSubject = async (subjectData: Subject | Omit<Subject, 'id'>) => {
    if (!editingSubject) return;
    
    // Ensure we have the ID for the update
    const updatedSubjectData = 'id' in subjectData ? subjectData : { ...subjectData, id: editingSubject.id };
    
    const updatedSubjects = subjects.map(subject =>
      subject.id === editingSubject.id
        ? updatedSubjectData
        : subject
    );
    await saveSubjects(updatedSubjects);
  };

  // Delete subject with confirmation
  const handleDeleteSubject = (subject: Subject) => {
    setConfirmDialog({
      isOpen: true,
      subject: subject
    });
  };
  
  // Confirm delete subject
  const confirmDeleteSubject = async () => {
    if (!confirmDialog.subject) return;
    
    const subjectToDelete = confirmDialog.subject;
    const originalSubjects = [...subjects];
    
    try {
      // Optimistically remove from local state
      const updatedSubjects = subjects.filter(subject => subject.id !== subjectToDelete.id);
      setSubjects(updatedSubjects);
      
      // Attempt to save to server
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSubjects),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }
      
      showAlert('success', `Subject "${subjectToDelete.name}" deleted successfully!`);
    } catch (err) {
      // Revert the local state on error
      setSubjects(originalSubjects);
      console.error('Error deleting subject:', err);
      showAlert('error', `Failed to delete subject "${subjectToDelete.name}". Please try again.`);
    } finally {
      setConfirmDialog({ isOpen: false, subject: null });
    }
  };

  // Show alert with auto-dismiss
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000); // Auto-dismiss after 5 seconds
  };

  // Save semesters to API
  const saveSemesters = async (updatedSemesters: Semester[]) => {
    try {
      const response = await fetch('/api/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSemesters),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save semesters');
      }
      
      setSemesters(updatedSemesters);
      showAlert('success', 'Semester settings updated successfully!');
    } catch (err) {
      console.error('Error saving semesters:', err);
      showAlert('error', 'Failed to update semester settings. Please try again.');
    }
  };

  // Handle semester updates from toggle
  const handleSemestersUpdate = (updatedSemesters: Semester[]) => {
    saveSemesters(updatedSemesters);
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
      
      setDepartments(updatedDepartments);
      showAlert('success', 'Department settings updated successfully!');
    } catch (err) {
      console.error('Error saving departments:', err);
      showAlert('error', 'Failed to update department settings. Please try again.');
    }
  };

  // Toggle BS degree offering for a department
  const handleToggleBSDegree = async (departmentId: string, offersBSDegree: boolean) => {
    const updatedDepartments = departments.map(dept =>
      dept.id === departmentId
        ? { ...dept, offersBSDegree }
        : dept
    );
    await saveDepartments(updatedDepartments);
  };

  // Toggle semester level for a department
  const handleToggleLevel = async (departmentId: string, level: number) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;

    const currentOfferedLevels = getOfferedLevelsForDept(department);
    let newOfferedLevels: number[];
    
    if (currentOfferedLevels.includes(level)) {
      // Remove the level
      newOfferedLevels = currentOfferedLevels.filter(l => l !== level);
    } else {
      // Add the level
      newOfferedLevels = [...currentOfferedLevels, level].sort((a, b) => a - b);
    }

    const updatedDepartment = setOfferedLevelsForDept(department, newOfferedLevels);
    const updatedDepartments = departments.map(dept =>
      dept.id === departmentId ? updatedDepartment : dept
    );
    
    await saveDepartments(updatedDepartments);
  };

  // Add new department
  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim() || !newDepartmentShortName.trim()) {
      showAlert('error', 'Please provide both department name and short name');
      return;
    }

    try {
      setAddingDepartment(true);
      const newDepartment: Department = {
        id: `dept${Date.now()}`,
        name: newDepartmentName.trim(),
        shortName: newDepartmentShortName.trim(),
        offersBSDegree: newDepartmentOffersBSDegree
      };

      const updatedDepartments = [...departments, newDepartment];
      
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDepartments),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save department');
      }
      
      setDepartments(updatedDepartments);
      setSelectedDepartmentId(newDepartment.id); // Auto-select the new department
      
      // Reset form
      setNewDepartmentName('');
      setNewDepartmentShortName('');
      setNewDepartmentOffersBSDegree(true);
      setShowAddDepartment(false);
      
      showAlert('success', 'Department added successfully!');
    } catch (err) {
      console.error('Error adding department:', err);
      showAlert('error', 'Failed to add department. Please try again.');
    } finally {
      setAddingDepartment(false);
    }
  };

  // Auto-select the first department when departments are loaded and none is selected (only for subjects tab)
  useEffect(() => {
    if (departments.length > 0 && !selectedDepartmentId && activeTab === 'subjects') {
      setSelectedDepartmentId(departments[0].id);
    }
  }, [departments, selectedDepartmentId, activeTab]);

  // Calculate comprehensive statistics
  const stats = {
    totalDepartments: departments.length,
    totalSubjects: subjects.length,
    departmentsOfferingBS: departments.filter(d => d.offersBSDegree).length,
    averageSubjectsPerDepartment: departments.length > 0 ? (subjects.length / departments.length).toFixed(1) : '0.0',
    averageOfferedLevelsPerBSDepartment: (() => {
      const bsDepartments = departments.filter(d => d.offersBSDegree);
      if (bsDepartments.length === 0) return '0.0';
      
      const totalLevels = bsDepartments.reduce((sum, dept) => {
        const deptSubjects = subjects.filter(s => s.departmentId === dept.id);
        const uniqueLevels = new Set(deptSubjects.map(s => s.semesterLevel));
        return sum + uniqueLevels.size;
      }, 0);
      
      return (totalLevels / bsDepartments.length).toFixed(1);
    })()
  };

  // Get filtered subjects
  const filteredSubjects = subjects.filter(subject => {
    const deptMatch = !selectedDepartmentId || subject.departmentId === selectedDepartmentId;
    const semesterMatch = activeTab === 'subjects' ? subject.semesterLevel === selectedLevel : true;
    return deptMatch && semesterMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Semester and Subject Management</h1>
            <div className="flex items-center space-x-2">
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
                Back to Timetable
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

          {/* Alert Component */}
          {alert && (
            <div className="mb-4">
              <InlineAlert
                type={alert.type}
                message={alert.message}
                onDismiss={() => setAlert(null)}
              />
            </div>
          )}

          {!loading && !error && (
            <div>
              {/* Semester Toggle Component */}
              <SemesterToggle
                semesters={semesters}
                onSemestersUpdate={handleSemestersUpdate}
                className="mb-6"
              />
              
              {/* Global Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Global Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedDepartmentId}
                        onChange={(e) => {
                          if (e.target.value === 'add_new') {
                            setShowAddDepartment(true);
                          } else {
                            setSelectedDepartmentId(e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {activeTab === 'levels' ? (
                          <option value="">All Departments</option>
                        ) : (
                          <option value="" disabled>Select Department</option>
                        )}
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                        <option value="add_new">+ Add New Department</option>
                      </select>
                    </div>
                    
                    {/* Add Department Form */}
                    {showAddDepartment && (
                      <div className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Add New Department</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                            <input
                              type="text"
                              value={newDepartmentName}
                              onChange={(e) => setNewDepartmentName(e.target.value)}
                              placeholder="e.g., Computer Science"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                            <input
                              type="text"
                              value={newDepartmentShortName}
                              onChange={(e) => setNewDepartmentShortName(e.target.value)}
                              placeholder="e.g., CS"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newDepartmentOffersBSDegree}
                                onChange={(e) => setNewDepartmentOffersBSDegree(e.target.checked)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">Offers BS Degree</span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddDepartment}
                              disabled={addingDepartment}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {addingDepartment ? 'Adding...' : 'Add Department'}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddDepartment(false);
                                setNewDepartmentName('');
                                setNewDepartmentShortName('');
                                setNewDepartmentOffersBSDegree(true);
                              }}
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {activeTab === 'subjects' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester Level</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                          <option key={level} value={level}>Semester {level}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('levels')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'levels'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Semester Levels
                  </button>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'subjects'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Subjects
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'levels' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Department Semester Levels</h2>
                  
                  {/* Department Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments
                      .filter(dept => !selectedDepartmentId || selectedDepartmentId === dept.id)
                      .map(department => {
                        const offeredLevels = getOfferedLevelsForDept(department);
                        
                        return (
                          <div key={department.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            {/* Department Header */}
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-800">{department.name}</h3>
                              <p className="text-sm text-gray-600">({department.shortName})</p>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                department.offersBSDegree ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {department.offersBSDegree ? '✓ Offers BS' : '✗ No BS Degree'}
                              </div>
                            </div>

                            {/* BS Toggle Switch */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium text-gray-700">BS Degree Program</span>
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={department.offersBSDegree}
                                    onChange={(e) => handleToggleBSDegree(department.id, e.target.checked)}
                                    className="sr-only"
                                  />
                                  <div className={`block w-12 h-6 rounded-full transition-colors ${
                                    department.offersBSDegree ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                      department.offersBSDegree ? 'transform translate-x-6' : ''
                                    }`}></div>
                                  </div>
                                </div>
                              </label>
                              {!department.offersBSDegree && (
                                <p className="text-xs text-gray-500 mt-2">Enable BS degree to manage semester levels</p>
                              )}
                            </div>

                            {/* Level Chips */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Semester Levels</h4>
                              <div className="grid grid-cols-4 gap-2">
                                {LEVELS.map(level => {
                                  const isOffered = offeredLevels.includes(level);
                                  const subjectCount = countSubjectsForDeptLevel(department.id, level);
                                  const isDisabled = !department.offersBSDegree;
                                  
                                  return (
                                    <button
                                      key={level}
                                      onClick={() => !isDisabled && handleToggleLevel(department.id, level)}
                                      disabled={isDisabled}
                                      className={`relative p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isDisabled
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : isOffered
                                          ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-dashed border-gray-400'
                                      }`}
                                      title={`${isOffered ? 'Remove' : 'Add'} Semester ${level}`}
                                    >
                                      <div className="flex flex-col items-center">
                                        <span>{level}</span>
                                        {subjectCount > 0 && (
                                          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                                            isOffered
                                              ? 'bg-yellow-400 text-black'
                                              : 'bg-blue-600 text-white'
                                          }`}>
                                            {subjectCount}
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {/* Legend */}
                              <div className="text-xs text-gray-500 mt-3">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                    <span>Active</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-gray-200 rounded border-dashed border border-gray-400"></div>
                                    <span>Inactive</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span>Subject count</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                  
                  {/* No departments message */}
                  {departments.filter(dept => !selectedDepartmentId || selectedDepartmentId === dept.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No departments found for the selected filters.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'subjects' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Subject Management</h2>
                    <button
                      onClick={() => {
                        setEditingSubject(null);
                        setModalOpen(true);
                        setModalMode('add');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      + Add Subject
                    </button>
                  </div>

                  {/* Subjects List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubjects.map((subject) => (
                      <div key={subject.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-800">{subject.name}</div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setEditingSubject(subject);
                                setModalOpen(true);
                                setModalMode('edit');
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Edit subject"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              title="Delete subject"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">({subject.shortName})</div>
                        <div className="text-xs text-blue-600 mb-1">{subject.code}</div>
                        <div className="text-xs text-green-600 mb-1">{subject.creditHours} credit hours</div>
                        <div className="text-xs text-purple-600 mb-1">
                          {departments.find(d => d.id === subject.departmentId)?.name || 'Unknown Department'}
                        </div>
                        <div className="text-xs text-orange-600">
                          {subject.isCore ? 'Core' : 'Elective'}
                        </div>
                        {/* Color removed */}
                      </div>
                    ))}
                  </div>

                  {filteredSubjects.length === 0 && (
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
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Departments</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.totalDepartments}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Total Subjects</h3>
                <div className="text-3xl font-bold text-green-600">{stats.totalSubjects}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Departments Offering BS</h3>
                <div className="text-3xl font-bold text-purple-600">{stats.departmentsOfferingBS}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-orange-800 mb-2">Avg Subjects per Dept</h3>
                <div className="text-3xl font-bold text-orange-600">{stats.averageSubjectsPerDepartment}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-800 mb-2">Avg Levels per BS Dept</h3>
                <div className="text-3xl font-bold text-indigo-600">{stats.averageOfferedLevelsPerBSDepartment}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSubject(null);
        }}
        mode={modalMode}
        initialSubject={editingSubject}
        departmentId={selectedDepartmentId || departments[0]?.id || ''}
  // semesterLevel removed
        departments={departments}
        onSubmit={(subjectData) => {
          if (modalMode === 'edit') {
            // Ensure department and semester level remain fixed per requirements
            const updatedSubjectData = editingSubject ? {
              ...('id' in subjectData ? subjectData : { ...subjectData, id: editingSubject.id }),
              departmentId: editingSubject.departmentId, // Keep original department
              semesterLevel: editingSubject.semesterLevel // Keep original semester level
            } : subjectData;
            handleUpdateSubject(updatedSubjectData);
          } else {
            handleAddSubject(subjectData as Omit<Subject, 'id'>);
          }
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, subject: null })}
        onConfirm={confirmDeleteSubject}
        title="Delete Subject"
        message={confirmDialog.subject ? 
          `Are you sure you want to delete this subject?\n\nSubject: ${confirmDialog.subject.name}\nCode: ${confirmDialog.subject.code}\n\nThis action cannot be undone.` : 
          ''
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SemesterManagementComponent;
