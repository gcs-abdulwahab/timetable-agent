'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConflictViewer from '../components/ConflictViewer';
import { validateTimetable } from '../components/conflictChecker';
import { Department, Subject, Teacher, departmentHasSubjectsOrLevels, getOfferedLevelsForDept, setOfferedLevelsForDept } from '../components/data';
import AddDepartmentModal from '../components/ui/AddDepartmentModal';
import AddTeacherModal from '../components/ui/AddTeacherModal';
import DepartmentSemesterModal from '../components/ui/DepartmentSemesterModal';
import SemesterChipsManager from '../components/ui/SemesterChipsManager';
import SubjectModal from '../components/ui/SubjectModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { Badge } from '../components/ui/badge';
import { Toggle } from '@/components/ui/toggle';

const ManageDepartmentsPage = () => {
  const searchParams = useSearchParams();
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
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [selectedDepartmentForSemesters, setSelectedDepartmentForSemesters] = useState<Department | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Success/error alert states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  
  // Conflict detection states
  const [showConflictViewer, setShowConflictViewer] = useState(false);
  
  // Toggle states for semester management
  const [evenSemestersToggle, setEvenSemestersToggle] = useState(false);
  const [oddSemestersToggle, setOddSemestersToggle] = useState(false);
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'even' | 'odd';
    pressed: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'even',
    pressed: false
  });
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-clear alert error after 5 seconds
  useEffect(() => {
    if (alertError) {
      const timer = setTimeout(() => {
        setAlertError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertError]);

  // Check for conflicts
  const validation = validateTimetable();
  const hasConflicts = validation.conflicts.length > 0;

  // Load data from API on component mount and handle URL parameters
  useEffect(() => {
    loadData();
    
    // Handle URL parameters for tab, department, and semester
    const tab = searchParams.get('tab');
    const departmentParam = searchParams.get('department');
    const semesterParam = searchParams.get('semester');
    
    if (tab === 'subjects') {
      setActiveTab('subjects');
      
      if (departmentParam) {
        setSelectedSubjectDepartment(departmentParam);
      }
      
      if (semesterParam) {
        const semesterLevel = parseInt(semesterParam);
        if (!isNaN(semesterLevel) && semesterLevel >= 1 && semesterLevel <= 8) {
          setSelectedSemesterLevel(semesterLevel);
        }
      }
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // GET from api/departments and api/subjects in parallel
      const [departmentsRes, subjectsRes, teachersRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/subjects'),
        fetch('/api/teachers')
      ]);

      // Both routes return empty arrays when files are missing
      const departmentsData = departmentsRes.ok ? await departmentsRes.json() : [];
      const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
      const teachersData = teachersRes.ok ? await teachersRes.json() : [];
      
      // Update local state
      setDepartmentList(departmentsData);
      setSubjectList(subjectsData);
      setTeacherList(teachersData);
      
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

  // Save subjects to API
  const saveSubjects = async (updatedSubjects: Subject[]) => {
    try {
      console.log('🟡 ManageDepartments: saveSubjects called with', {
        count: updatedSubjects.length,
        lastFew: updatedSubjects.slice(-3).map(s => ({ id: s.id, name: s.name, isMajor: s.isMajor, teachingDepartmentIds: s.teachingDepartmentIds }))
      });
      
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
      
      console.log('🟡 ManageDepartments: saveSubjects successful, updating local state');
      setSubjectList(updatedSubjects);
    } catch (err) {
      console.error('🔴 ManageDepartments: Error saving subjects:', err);
      setError('Failed to save subjects');
    }
  };

  // Update department with prompt-based editing
  const handleDepartmentEdit = async (dept: Department) => {
    const newName = prompt('Department Name:', dept.name);
    if (!newName || newName === dept.name) return;
    
    const newShortName = prompt('Short Name:', dept.shortName);
    if (!newShortName) return;
    
    let newOffersBSDegree = dept.offersBSDegree;
    if (confirm(`Currently offers BS degree: ${dept.offersBSDegree}. Change this?`)) {
      newOffersBSDegree = !dept.offersBSDegree;
      
      // If turning off BS degree, show warning if department has subjects or levels
      if (!newOffersBSDegree && departmentHasSubjectsOrLevels(dept)) {
        const subjectCount = subjectList.filter(s => s.departmentId === dept.id).length;
        const proceed = confirm(
          `Warning: This department has ${subjectCount} subject${subjectCount !== 1 ? 's' : ''} and/or configured semester levels. ` +
          'Turning off BS degree will not delete subjects but will affect semester availability. Continue?'
        );
        if (!proceed) {
          newOffersBSDegree = dept.offersBSDegree; // Keep original value
        }
      }
    }
    
    const updatedDepartment = {
      ...dept,
      name: newName,
      shortName: newShortName,
      offersBSDegree: newOffersBSDegree
    };
    
    const updatedDepartments = departmentList.map(d => 
      d.id === dept.id ? updatedDepartment : d
    );
    
    // Optimistic update
    const originalDepartments = [...departmentList];
    setDepartmentList(updatedDepartments);
    
    try {
      await saveDepartments(updatedDepartments);
    } catch (error) {
      // Rollback on failure
      setDepartmentList(originalDepartments);
      setError('Failed to update department. Changes have been reverted.');
    }
  };
  
  // Handle semester chip updates with optimistic updates and rollback
  const handleSemesterChipUpdate = async (updatedDepartment: Department) => {
    const originalDepartments = [...departmentList];
    
    // Optimistic update
    const updatedDepartments = departmentList.map(d => 
      d.id === updatedDepartment.id ? updatedDepartment : d
    );
    setDepartmentList(updatedDepartments);
    
    try {
      await saveDepartments(updatedDepartments);
    } catch (error) {
      // Rollback on failure
      setDepartmentList(originalDepartments);
      setError('Failed to update semester levels. Changes have been reverted.');
    }
  };

  // Handle semester configuration save
  const handleSemesterSave = async (departmentId: string, semesterConfig: { 
    offeredLevels?: number[]; 
    excludedLevels?: number[]; 
  }) => {
    const updatedDepartments = departmentList.map(d => 
      d.id === departmentId ? { 
        ...d, 
        bsSemesterAvailability: semesterConfig
      } : d
    );
    
    await saveDepartments(updatedDepartments);
  };

  // Handle subject edit
  const handleSubjectEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowSubjectModal(true);
  };

  // Handle subject delete
  const handleSubjectDelete = async (subject: Subject) => {
    const departmentName = departmentList.find(d => d.id === subject.departmentId)?.name || 'Unknown';
    const confirmMessage = `Are you sure you want to delete the subject "${subject.name}" (${subject.code}) from ${departmentName}?\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      try {
        const updatedSubjects = subjectList.filter(s => s.id !== subject.id);
        await saveSubjects(updatedSubjects);
      } catch (error) {
        setError('Failed to delete subject. Please try again.');
      }
    }
  };

  // Handle subject modal close
  const handleSubjectModalClose = () => {
    setShowSubjectModal(false);
    setEditingSubject(null);
  };

  // Handle department click to navigate to courses page
  const handleDepartmentClick = (dept: Department) => {
    window.location.href = `/department-courses?departmentId=${dept.id}`;
  };
  
  // Handle bulk semester toggle for all BS departments
  const handleBulkSemesterToggle = async (type: 'even' | 'odd', pressed: boolean) => {
    const bsDepartments = departmentList.filter(d => d.offersBSDegree);
    
    if (bsDepartments.length === 0) {
      setError('No departments offering BS degree found.');
      return;
    }

    const targetSemesters = type === 'even' ? [2, 4, 6, 8] : [1, 3, 5, 7];
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const action = pressed ? 'enable' : 'disable';
    
    const confirmMessage = `Are you sure you want to ${action} ${typeLabel.toLowerCase()} semesters (${targetSemesters.join(', ')}) for all ${bsDepartments.length} BS degree departments?\n\nDepartments affected:\n${bsDepartments.map(d => `• ${d.name}`).join('\n')}\n\nThis will ${action} the selected semester levels across all these departments.`;
    
    // Show custom confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${typeLabel} Semesters`,
      message: confirmMessage,
      type,
      pressed,
      onConfirm: () => performBulkSemesterToggle(type, pressed)
    });
  };
  
  // Perform the actual bulk semester toggle operation
  const performBulkSemesterToggle = async (type: 'even' | 'odd', pressed: boolean) => {
    const bsDepartments = departmentList.filter(d => d.offersBSDegree);
    const targetSemesters = type === 'even' ? [2, 4, 6, 8] : [1, 3, 5, 7];
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

    const originalDepartments = [...departmentList];
    
    try {
      // Process each BS department
      const updatedDepartments = departmentList.map(dept => {
        if (!dept.offersBSDegree) {
          return dept; // Skip non-BS departments
        }

        // Get current offered levels using the helper function
        const currentLevels = getOfferedLevelsForDept(dept);
        
        let newOfferedLevels: number[];
        
        if (pressed) {
          // Add target semesters
          const levelsSet = new Set([...currentLevels, ...targetSemesters]);
          newOfferedLevels = Array.from(levelsSet).sort((a, b) => a - b);
        } else {
          // Remove target semesters
          newOfferedLevels = currentLevels.filter(level => !targetSemesters.includes(level));
        }
        
        return setOfferedLevelsForDept(dept, newOfferedLevels);
      });

      // Optimistic update
      setDepartmentList(updatedDepartments);
      
      // Save to API
      await saveDepartments(updatedDepartments);
      
      // Show success message
      const affectedCount = bsDepartments.length;
      setSuccessMessage(`Successfully ${pressed ? 'enabled' : 'disabled'} ${typeLabel.toLowerCase()} semesters (${targetSemesters.join(', ')}) for ${affectedCount} BS degree department${affectedCount !== 1 ? 's' : ''}.`);
      
    } catch (error) {
      // Rollback on failure
      setDepartmentList(originalDepartments);
      setError(`Failed to update ${typeLabel.toLowerCase()} semesters for departments. Changes have been reverted.`);
      console.error('Error in bulk semester toggle:', error);
      
      // Reset toggle state on error
      if (type === 'even') {
        setEvenSemestersToggle(!pressed);
      } else {
        setOddSemestersToggle(!pressed);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Departments & Subjects</h1>
            <div className="flex items-center space-x-2">
              {/* Bulk Semester Toggle Section */}
              {departmentList.filter(d => d.offersBSDegree).length > 1 && (
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 font-medium">
                    <span className="text-blue-600">🎯</span>
                    <span>Bulk Semester Management:</span>
                  </div>
                  
                  {/* Even Semesters Toggle */}
                  <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded-md shadow-sm border">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-indigo-700 mb-1">EVEN</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-mono">2</span>
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-mono">4</span>
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-mono">6</span>
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-mono">8</span>
                      </div>
                    </div>
                    <Toggle
                      pressed={evenSemestersToggle}
                      onPressedChange={(pressed) => {
                        setEvenSemestersToggle(pressed);
                        handleBulkSemesterToggle('even', pressed);
                      }}
                      aria-label="Toggle even semesters for all BS departments"
                      className="data-[state=on]:bg-indigo-600 data-[state=on]:border-indigo-600 transition-all duration-200"
                      size="sm"
                    >
                      {evenSemestersToggle ? '✓ ON' : 'OFF'}
                    </Toggle>
                  </div>
                  
                  {/* Odd Semesters Toggle */}
                  <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded-md shadow-sm border">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-teal-700 mb-1">ODD</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full font-mono">1</span>
                        <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full font-mono">3</span>
                        <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full font-mono">5</span>
                        <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full font-mono">7</span>
                      </div>
                    </div>
                    <Toggle
                      pressed={oddSemestersToggle}
                      onPressedChange={(pressed) => {
                        setOddSemestersToggle(pressed);
                        handleBulkSemesterToggle('odd', pressed);
                      }}
                      aria-label="Toggle odd semesters for all BS departments"
                      className="data-[state=on]:bg-teal-600 data-[state=on]:border-teal-600 transition-all duration-200"
                      size="sm"
                    >
                      {oddSemestersToggle ? '✓ ON' : 'OFF'}
                    </Toggle>
                  </div>
                  
                  {/* Info text */}
                  <div className="text-xs text-gray-600 lg:ml-auto">
                    Affects {departmentList.filter(d => d.offersBSDegree).length} BS departments
                  </div>
                </div>
              )}
              {/* Manage Semesters Button */}
              {departmentList.length > 0 && (
                <button
                  onClick={() => {
                    if (departmentList.length === 1) {
                      // If only one department, directly open semester management
                      setSelectedDepartmentForSemesters(departmentList[0]);
                      setShowSemesterModal(true);
                    } else {
                      // Show department selection for semester management
                      const deptName = prompt(`Select department for semester management:
${departmentList.map((d, i) => `${i + 1}. ${d.name}`).join('\n')}

Enter department number:`);
                      if (deptName) {
                        const deptIndex = parseInt(deptName) - 1;
                        if (deptIndex >= 0 && deptIndex < departmentList.length) {
                          setSelectedDepartmentForSemesters(departmentList[deptIndex]);
                          setShowSemesterModal(true);
                        }
                      }
                    }
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                  title="Manage semester availability for departments"
                >
                  📅 Manage Semesters
                </button>
              )}
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

          {/* Success Alert */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Success</p>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Alert Error */}
          {alertError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{alertError}</p>
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
                  
                  <p className="text-gray-600 mb-4">Click on department cards to view their courses, or click on the teacher count (📚) to manage teachers for that department:</p>
                  
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
                          className={`bg-white p-4 rounded border transition-colors shadow-sm ${
                            deptHasConflicts ? 'border-red-300 bg-red-50' : ''
                          }`}
                        >
                          <div 
                            className="cursor-pointer hover:bg-gray-50 transition-colors p-2 -m-2 rounded mb-3"
                            onClick={() => handleDepartmentClick(dept)}
                            title="Click to view courses in active semesters"
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
                            <div 
                              className="text-sm text-blue-600 mt-1 cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/manage-teachers?departmentId=${dept.id}`;
                              }}
                              title="Click to manage teachers for this department"
                            >
                              📚 {teacherCount} teacher{teacherCount !== 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-green-600">
                              {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-purple-600 mt-1">
                              {dept.offersBSDegree ? '✓ BS Degree' : '○ No BS Degree'}
                            </div>
                          </div>
                          
                          {/* Semester Chips Manager */}
                          <div className="border-t pt-3 mt-3" onClick={(e) => e.stopPropagation()}>
                            <SemesterChipsManager
                              department={dept}
                              onUpdate={handleSemesterChipUpdate}
                              onError={(message) => setError(message)}
                            />
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
                  
                  {/* Filter controls and Action buttons */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                          value={selectedSubjectDepartment}
                          onChange={(e) => setSelectedSubjectDepartment(e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All</option>
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
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            // Pre-populate modal with current filter selections if a specific department is selected
                            if (selectedSubjectDepartment !== 'all') {
                              // The modal will use the selectedSubjectDepartment and selectedSemesterLevel
                              setShowSubjectModal(true);
                            } else {
                              setShowSubjectModal(true);
                            }
                          }}
                          disabled={selectedSubjectDepartment === 'all'}
                          className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                            selectedSubjectDepartment === 'all'
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          title={selectedSubjectDepartment === 'all' 
                            ? 'Please select a specific department to add a subject'
                            : 'Add a new subject for the selected department and semester level'
                          }
                        >
                          + Add Subject
                        </button>
                      </div>
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
                        <div key={subject.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          {/* Subject Info */}
                          <div className="mb-3">
                            <div className="font-medium text-gray-800">{subject.name}</div>
                            <div className="text-sm text-gray-600 mt-1">({subject.shortName})</div>
                            <div className="text-xs text-blue-600 mt-1 font-mono">{subject.code}</div>
                            <div className="text-xs text-green-600">{subject.creditHours} credit hour{subject.creditHours !== 1 ? 's' : ''}</div>
                            <div className="text-xs text-purple-600">
                              {departmentList.find(d => d.id === subject.departmentId)?.name || 'Unknown Department'} - Semester {subject.semesterLevel}
                            </div>
                            <div className="text-xs space-y-2">
                              <div className="flex flex-wrap gap-1">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  subject.isMajor
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {subject.isMajor ? 'Major' : 'Minor'}
                                </span>
                              </div>
                              
                              {/* Teaching Departments - only show for minor subjects or if there are multiple teaching departments */}
                              {(!subject.isMajor || (subject.teachingDepartmentIds && subject.teachingDepartmentIds.length > 1)) && subject.teachingDepartmentIds && subject.teachingDepartmentIds.length > 0 && (
                                <div>
                                  <div className="text-xs text-gray-600 mb-1">Taught by:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {subject.teachingDepartmentIds.map(deptId => {
                                      const dept = departmentList.find(d => d.id === deptId);
                                      if (!dept) return null;
                                      const isOwner = deptId === subject.departmentId;
                                      return (
                                        <Badge 
                                          key={deptId} 
                                          variant={isOwner ? 'secondary' : 'success'}
                                          size="sm"
                                        >
                                          {dept.name}{isOwner ? ' 📚' : ''}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex space-x-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleSubjectEdit(subject)}
                              className="flex-1 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors font-medium"
                              title="Edit this subject"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleSubjectDelete(subject)}
                              className="flex-1 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition-colors font-medium"
                              title="Delete this subject"
                            >
                              🗑️ Delete
                            </button>
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
      
      <DepartmentSemesterModal
        isOpen={showSemesterModal}
        onClose={() => {
          setShowSemesterModal(false);
          setSelectedDepartmentForSemesters(null);
        }}
        department={selectedDepartmentForSemesters}
        onSave={handleSemesterSave}
      />
      
      <SubjectModal
        isOpen={showSubjectModal}
        onClose={handleSubjectModalClose}
        mode={editingSubject ? 'edit' : 'add'}
        initialSubject={editingSubject}
        departmentId={editingSubject ? editingSubject.departmentId : (selectedSubjectDepartment !== 'all' ? selectedSubjectDepartment : departmentList[0]?.id || '')}
        semesterLevel={editingSubject ? editingSubject.semesterLevel : selectedSemesterLevel}
        departments={departmentList}
        onSubmit={async (subjectData) => {
          // Clear any previous alert messages
          setSuccessMessage(null);
          setAlertError(null);
          
          console.log('🟠 ManageDepartments: Received subject data from modal', {
            mode: editingSubject ? 'edit' : 'add',
            subjectData,
            editingSubject: editingSubject?.id
          });
          
          if (editingSubject) {
            // Edit mode - update existing subject
            // Ensure department and semester level remain fixed per requirements
            const updatedSubjectData = 'id' in subjectData ? {
              ...subjectData,
              departmentId: editingSubject.departmentId, // Keep original department
              semesterLevel: editingSubject.semesterLevel // Keep original semester level
            } : { 
              ...subjectData, 
              id: editingSubject.id,
              departmentId: editingSubject.departmentId, // Keep original department
              semesterLevel: editingSubject.semesterLevel // Keep original semester level
            };
            
            try {
              // Map and replace the subject in local state
              const updatedSubjects = subjectList.map(s => 
                s.id === editingSubject.id 
                  ? updatedSubjectData
                  : s
              );
              
              console.log('🟠 ManageDepartments: Calling saveSubjects for edit with', {
                updatedSubjectData,
                totalSubjects: updatedSubjects.length
              });
              
              // Call saveSubjects
              await saveSubjects(updatedSubjects);
              
              // Show success message
              const departmentName = departmentList.find(d => d.id === updatedSubjectData.departmentId)?.name || 'Unknown Department';
              setSuccessMessage(`Subject "${updatedSubjectData.name}" has been updated successfully in ${departmentName} - Semester ${updatedSubjectData.semesterLevel}.`);
            } catch (error) {
              // Show error message
              setAlertError('Failed to update subject. Please try again.');
              throw error; // Re-throw to prevent modal from closing
            }
          } else {
            // Add mode - create new subject with enhanced validation and collision-resistant ID
            const typedSubjectData = subjectData as Omit<Subject, 'id'>;
            
            // Duplicate validation: check if the same code exists for the same department and level
            const duplicateSubject = subjectList.find(s => 
              s.code.toLowerCase() === typedSubjectData.code.toLowerCase() &&
              s.departmentId === typedSubjectData.departmentId &&
              s.semesterLevel === typedSubjectData.semesterLevel
            );
            
            if (duplicateSubject) {
              const departmentName = departmentList.find(d => d.id === typedSubjectData.departmentId)?.name || 'Unknown Department';
              const warningMessage = `Warning: A subject with code "${typedSubjectData.code}" already exists for ${departmentName} - Semester ${typedSubjectData.semesterLevel}.\n\nExisting subject: "${duplicateSubject.name}"\n\nDo you want to continue adding this subject anyway?`;
              
              if (!confirm(warningMessage)) {
                return; // User cancelled, don't add the subject
              }
            }
            
            // Generate collision-resistant ID: sub + timestamp + random suffix
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substr(2, 6); // 6 character random string
            const newId = `sub${timestamp}${randomSuffix}`;
            
            const newSubjectObj: Subject = {
              id: newId,
              ...typedSubjectData
            };
            
            // Store original state for potential rollback
            const originalSubjects = [...subjectList];
            
            try {
              console.log('🟠 ManageDepartments: Calling saveSubjects for add with', {
                newSubjectObj,
                totalSubjects: [...subjectList, newSubjectObj].length
              });
              
              // Optimistic update - append to subjects array
              const updatedSubjects = [...subjectList, newSubjectObj];
              await saveSubjects(updatedSubjects);
              
              // Success - show success alert and close modal
              const departmentName = departmentList.find(d => d.id === typedSubjectData.departmentId)?.name || 'Unknown Department';
              setSuccessMessage(`Subject "${newSubjectObj.name}" has been added successfully to ${departmentName} - Semester ${typedSubjectData.semesterLevel}.`);
            } catch (error) {
              // Error - revert optimistic update and show error alert
              setSubjectList(originalSubjects);
              setAlertError('Failed to add subject. Changes have been reverted. Please try again.');
              throw error; // Re-throw to prevent modal from closing
            }
          }
        }}
      />
      
      {/* Confirmation Dialog for Bulk Semester Toggles */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => {
          // Reset toggle state if user cancels
          if (confirmationDialog.type === 'even') {
            setEvenSemestersToggle(!confirmationDialog.pressed);
          } else {
            setOddSemestersToggle(!confirmationDialog.pressed);
          }
          setConfirmationDialog({ ...confirmationDialog, isOpen: false });
        }}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmText={confirmationDialog.pressed ? 'Enable' : 'Disable'}
        cancelText="Cancel"
        variant={confirmationDialog.pressed ? 'default' : 'destructive'}
        icon={
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            confirmationDialog.pressed ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            <span className={`text-2xl ${
              confirmationDialog.pressed ? 'text-green-600' : 'text-orange-600'
            }`}>
              {confirmationDialog.pressed ? '✓' : '⚠️'}
            </span>
          </div>
        }
      >
        {/* Additional content showing affected departments */}
        <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Departments affected:</p>
          <div className="space-y-1">
            {departmentList.filter(d => d.offersBSDegree).map(dept => (
              <div key={dept.id} className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {dept.name} ({dept.shortName})
              </div>
            ))}
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  );
};

export default ManageDepartmentsPage;
