import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Room, Semester, Subject, Teacher, TimetableEntry } from "../types/timetable";
import type { AddEntryData, ConflictTooltip, DeleteConfirmation, Notification } from "../types/ui";
import { getActiveDepartmentsForSemester } from "../utils/timetable-utils";
import AddEntryModal from "./AddEntryModal";
import { ConflictTooltipModal, DeleteConfirmationModal, EditEntryModal } from "./TimetableModals";

// Define TimetableProps type locally
type TimetableProps = {
  entries: TimetableEntry[];
  onUpdateEntries: (entries: TimetableEntry[]) => void;
};
// Define missing constants for tooltips and labels
const ESC_TOOLTIP = "Close (ESC)";
const ESC_LABEL_SUFFIX = " (ESC)";


const Timetable: React.FC<TimetableProps> = ({ entries, onUpdateEntries }) => {
  const [notification, setNotification] = useState<Notification>(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [conflictTooltip, setConflictTooltip] = useState<ConflictTooltip>({ show: false, content: '', x: 0, y: 0 });
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>(null);
  const [addEntryData, setAddEntryData] = useState<AddEntryData>({
    selectedSemester: '',
    selectedDepartment: '',
    selectedSubject: '',
    selectedTeacher: '',
    selectedTimeSlot: '',
    selectedDays: [],
    room: ''
  });
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idCounterRef = useRef(0);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ entries: TimetableEntry[], subject: Subject, teacher: Teacher } | null>(null);
  const [editFormData, setEditFormData] = useState({
    subjectId: '',
    teacherId: '',
    room: '',
    timeSlotId: '',
    selectedDays: [] as string[]
  });
  const [localTimetableEntries, setLocalTimetableEntries] = useState<TimetableEntry[]>(entries || []);
  const [activeSemesterTab, setActiveSemesterTab] = useState<string>('');

  // State for fetched data
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; offersBSDegree: boolean; shortName: string }>>([]);
  const [semesters, setSemesters] = useState<Array<{ id: string; name: string; isActive: boolean }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; departmentId: string; semesterLevel: number }>>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string; departmentId: string }>>([]);
  const [timeSlots, setTimeSlots] = useState<Array<{ id: string; period: number; start: string; end: string }>>([]);
  const [rooms, setRooms] = useState<Array<Room>>([]);
  const [days, setDays] = useState<Array<{ id: string; name: string; shortName: string; dayCode: number; isActive: boolean }>>([]);
  const [semesterMode, setSemesterMode] = useState<'odd' | 'even' | 'mixed'>('mixed');

  // Hardcoded timeslots for demonstration
  const defaultTimeSlots = [
    { id: 'ts1', period: 1, start: '08:00', end: '09:00' },
    { id: 'ts2', period: 2, start: '09:00', end: '10:00' },
    { id: 'ts3', period: 3, start: '10:00', end: '11:00' },
    { id: 'ts4', period: 4, start: '11:00', end: '12:00' }
  ];

  // Add state for showing the add time slot form
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({ period: '', start: '', end: '' });
  const [addTimeSlotError, setAddTimeSlotError] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(setDepartments);
    fetch('/api/semesters')
      .then(res => res.json())
      .then(setSemesters);
    fetch('/api/subjects')
      .then(res => res.json())
      .then(setSubjects);
    fetch('/api/teachers')
      .then(res => res.json())
      .then(setTeachers);
    fetch('/api/timeslots')
      .then(res => res.json())
      .then((data) => {
        // Use hardcoded timeslots if API returns empty
        setTimeSlots(data.length ? data : defaultTimeSlots);
        console.log('[DEBUG] TimeSlots fetched:', data.length ? data : defaultTimeSlots);
      });
    fetch('/api/rooms')
      .then(res => res.json())
      .then(setRooms);
    fetch('/api/days')
      .then(res => res.json())
      .then(setDays);
  }, []);

  // Derive the semester-scoped department list whenever activeSemesterTab changes
    const visibleDepartments = useMemo(
      () => activeSemesterTab
        ? getActiveDepartmentsForSemester(activeSemesterTab, departments, semesters)
        : departments.filter(d => d.offersBSDegree),
      [activeSemesterTab, departments, semesters]
    );

  // Mark as mounted after hydration and set first active semester tab
  useEffect(() => {
    setMounted(true);
    fetch('/api/semesters')
      .then(res => res.json())
      .then((semList) => {
        const activeSems = semList.filter((s: any) => s.isActive);
        if (activeSems.length > 0) {
          setActiveSemesterTab(activeSems[0].id);
        } else if (semList.length > 0) {
          setActiveSemesterTab(semList[0].id);
        }
      });
  }, []);

  // Sync props with local state
  useEffect(() => {
    setLocalTimetableEntries(entries || []);
  }, [entries]);

  // Initialize semester when modal opens
  useEffect(() => {
    if (showAddEntry && activeSemesterTab && !addEntryData.selectedSemester) {
      const activeSemester = semesters.find(s => s.id === activeSemesterTab);
      if (activeSemester) {
        setAddEntryData(prev => ({
          ...prev,
          selectedSemester: activeSemester.id
        }));
      }
    }
  }, [activeSemesterTab, semesters]);

  // Debug modal state changes (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Modal state changed:', { 
        editingEntry, 
        editingData: !!editingData, 
        updateCounter 
      });
    }
  }, [editingEntry, editingData]);

  // ESC key handling to close modals and cancel drag operations
  // ENTER key handling to complete drag operations
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Only handle modal and tooltip closing
      if (editingEntry || editingData) {
        setEditingEntry(null);
        setEditingData(null);
      }
      if (showAddEntry) {
        setShowAddEntry(false);
      }
      if (deleteConfirmation) {
        setDeleteConfirmation(null);
      }
      if (conflictTooltip.show) {
        setConflictTooltip({ show: false, content: '', x: 0, y: 0 });
      }
      e.preventDefault();
      e.stopPropagation();
    }
    // No drag-and-drop logic for ENTER key
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingEntry, editingData, showAddEntry, deleteConfirmation, conflictTooltip.show, localTimetableEntries]);

  // Helper function to update entries and notify parent
  const updateEntries = (newEntries: TimetableEntry[]) => {
    setLocalTimetableEntries(newEntries);
    onUpdateEntries(newEntries);
  };

  // Helper function to get subject by ID
  const getSubject = (id: string) => subjects.find(s => s.id === id);
  
  // Helper function to get teacher by ID
  const getTeacher = (id: string) => teachers.find(t => t.id === id);
  
  // Helper function to get semester by ID
  const getSemester = (id: string) => semesters.find(s => s.id === id);
  
  // Helper function to format semester label
  const formatSemesterLabel = (sem?: Semester) => {
    if (!sem) return 'Unknown Semester';
    const match = sem.name?.match(/\d+/);
    if (match) {
      return `Semester ${match[0]}`;
    } else {
      return sem.name;
    }
  };

  // Get active semesters only
  const getActiveSemesters = () => semesters.filter(s => s.isActive);


  // Get subjects based on selected semester and department
  const getFilteredSubjects = (semesterLevel: number, departmentId: string) => {
    return subjects.filter(s => s.semesterLevel === semesterLevel && s.departmentId === departmentId);
  };

  // Handle delete entry confirmation
  const handleDeleteEntry = (groupKey: string, entries: TimetableEntry[], subject: Subject, teacher: Teacher) => {
    setDeleteConfirmation({
      show: true,
      groupKey,
      entries,
      subject,
      teacher
    });
  };

  // Confirm delete entry
  const confirmDeleteEntry = () => {
    if (!deleteConfirmation) return;
    
    console.log('Deleting entries:', deleteConfirmation.entries);
    
    // Remove entries from the timetable
    const updatedEntries = localTimetableEntries.filter((entry) => 
      !deleteConfirmation.entries.some((deleteEntry) => deleteEntry.id === entry.id)
    );
    
    updateEntries(updatedEntries);
    setUpdateCounter(prev => prev + 1);
    
    // Show success notification
    const daysDisplay = formatDaysDisplay(deleteConfirmation.entries);
    setNotification({ 
      message: `Successfully deleted ${deleteConfirmation.subject.shortName || deleteConfirmation.subject.code || deleteConfirmation.subject.name} ${daysDisplay} by ${deleteConfirmation.teacher.shortName}`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    
    // Close confirmation dialog
    setDeleteConfirmation(null);
  };

  // Helper function to format days display
  const formatDaysDisplay = (entries: TimetableEntry[]) => {
    const dayNumbers = entries.map(entry => {
      const dayMap: { [key: string]: number } = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      return dayMap[entry.day];
    }).filter(num => num !== undefined).sort((a, b) => a - b);

    if (dayNumbers.length === 0) {
      return '';
    }
    if (dayNumbers.length === 1) {
      return `(${dayNumbers[0]})`;
    }
    // Check if days are consecutive
    const isConsecutive = dayNumbers.every((day, index) =>
      index === 0 || day === dayNumbers[index - 1] + 1
    );
    if (isConsecutive && dayNumbers.length > 1) {
      return `(${dayNumbers[0]}-${dayNumbers[dayNumbers.length - 1]})`;
    } else {
      return `(${dayNumbers.join(',')})`;
    }
  };

  // Helper function to check if an entry group has conflicts
  const hasConflicts = (entries: TimetableEntry[]): boolean => {
    if (!entries || entries.length === 0) return false;
    
    const firstEntry = entries[0];
    const timeSlot = firstEntry.timeSlotId;
    const teacher = firstEntry.teacherId;
    const currentDays = entries.map(e => e.day); // Get all days for current entries
    
    // Check for teacher conflicts - same teacher teaching multiple subjects at same time AND same day
    const teacherConflicts = localTimetableEntries.filter(entry => 
      entry.teacherId === teacher && 
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.day) && // Only conflict if on same day
      !entries.some(e => e.id === entry.id) // Exclude current entries
    );

    // Check for room conflicts - same room used by multiple subjects at same time AND same day
    const roomConflicts = firstEntry.room ? localTimetableEntries.filter(entry => 
      entry.room === firstEntry.room && 
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.day) && // Only conflict if on same day
      !entries.some(e => e.id === entry.id) // Exclude current entries
    ) : [];

    return teacherConflicts.length > 0 || roomConflicts.length > 0;
  };

  // Helper function to get conflict details
  const getConflictDetails = (entries: TimetableEntry[]): string => {
    if (!entries || entries.length === 0) return '';
    
    const firstEntry = entries[0];
    const timeSlot = firstEntry.timeSlotId;
    const teacher = firstEntry.teacherId;
    const currentDays = entries.map(e => e.day); // Get all days for current entries
    
    const teacherConflicts = localTimetableEntries.filter(entry => 
      entry.teacherId === teacher && 
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.day) && // Only conflict if on same day
      !entries.some(e => e.id === entry.id)
    );

    const roomConflicts = firstEntry.room ? localTimetableEntries.filter(entry => 
      entry.room === firstEntry.room && 
      entry.timeSlotId === timeSlot &&
      currentDays.includes(entry.day) && // Only conflict if on same day
      !entries.some(e => e.id === entry.id)
    ) : [];

    let details = '';
    
    // Enhanced teacher conflict details
    if (teacherConflicts.length > 0) {
  const teacherObj = getTeacher(teacher);
  const teacherName = teacherObj?.name || teacher;
  const teacherShortName = teacherObj?.name ?? teacher;
      const currentSubject = getSubject(firstEntry.subjectId);
      const currentTimeSlotDetails = timeSlots.find(ts => ts.id === timeSlot);
      
      details += `⚠️ TEACHER CONFLICT DETECTED\n`;
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      details += `👨‍🏫 Teacher: ${teacherName} (${teacherShortName})\n`;
      details += `⏰ Time Slot: Period ${currentTimeSlotDetails?.period || ''} (${currentTimeSlotDetails?.start}-${currentTimeSlotDetails?.end})\n`;
      details += `📚 Current Subject: ${currentSubject?.name || firstEntry.subjectId}\n`;
      details += `📅 Days: ${currentDays.join(', ')}\n\n`;
      
      details += `🔴 Conflicting with:\n`;
      teacherConflicts.forEach((c, index) => {
        const subject = getSubject(c.subjectId);
        const semester = getSemester(c.semesterId);
        const semLabel = formatSemesterLabel(semester);
        const department = departments.find(d => d.id === subject?.departmentId);
        details += `   ${index + 1}. ${subject?.name || c.subjectId}\n`;
  details += `      📖 Subject Code: ${subject?.name || c.subjectId}\n`;
        details += `      🏛️  Department: ${department?.name || 'Unknown'} (${department?.shortName || 'N/A'})\n`;
        details += `      📊 ${semLabel}\n`;
        details += `      📅 Day: ${c.day}\n`;
        details += `      🏫 Room: ${c.room || 'Not assigned'}\n\n`;
      });
    }
    
    // Enhanced room conflict details
    if (roomConflicts.length > 0) {
      if (teacherConflicts.length > 0) details += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      const currentSubject = getSubject(firstEntry.subjectId);
      const currentTeacher = getTeacher(firstEntry.teacherId);
      const currentTimeSlotDetails = timeSlots.find(ts => ts.id === timeSlot);
      
      details += `🏫 ROOM CONFLICT DETECTED\n`;
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      details += `🏛️  Room: ${firstEntry.room}\n`;
      details += `⏰ Time Slot: Period ${currentTimeSlotDetails?.period || ''} (${currentTimeSlotDetails?.start}-${currentTimeSlotDetails?.end})\n`;
      details += `📚 Current Subject: ${currentSubject?.name || firstEntry.subjectId}\n`;
  details += `👨‍🏫 Current Teacher: ${currentTeacher?.name} (${currentTeacher?.name})\n`;
      details += `📅 Days: ${currentDays.join(', ')}\n\n`;
      
      details += `🔴 Room also booked for:\n`;
      roomConflicts.forEach((c, index) => {
        const subject = getSubject(c.subjectId);
        const conflictTeacher = getTeacher(c.teacherId);
        const semester = getSemester(c.semesterId);
        const semLabel = formatSemesterLabel(semester);
        const department = departments.find(d => d.id === subject?.departmentId);
        details += `   ${index + 1}. ${subject?.name || c.subjectId}\n`;
  details += `      📖 Subject Code: ${subject?.name || c.subjectId}\n`;
  details += `      🏛️  Department: ${department?.name || 'Unknown'} (${department?.name || 'N/A'})\n`;
  details += `      👨‍🏫 Teacher: ${conflictTeacher?.name || c.teacherId} (${conflictTeacher?.name || c.teacherId})\n`;
        details += `      📊 ${semLabel}\n`;
        details += `      📅 Day: ${c.day}\n\n`;
      });
    }
    
    // Add resolution suggestions
    if (teacherConflicts.length > 0 || roomConflicts.length > 0) {
      details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      details += `💡 RESOLUTION SUGGESTIONS:\n`;
      if (teacherConflicts.length > 0) {
        details += `• Assign a different teacher to one of the conflicting subjects\n`;
        details += `• Move one of the subjects to a different time slot\n`;
        details += `• Reschedule conflicting classes to different days\n`;
      }
      if (roomConflicts.length > 0) {
        details += `• Assign a different room to one of the conflicting subjects\n`;
        details += `• Move one of the subjects to a different time slot\n`;
        details += `• Reschedule conflicting classes to different days\n`;
      }
    }
    
    return details.trim();
  };

  // Debug modal state (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Current modal state:', { editingData: !!editingData, editingEntry, updateCounter });
  }

  // If not mounted yet, show loading state to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading timetable...</div>
        </div>
      </div>
    );
  }

  // Main render: wrap all content in a single parent div
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[10000] p-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs text-gray-500">
          Updates: {updateCounter} | Total Entries: {mounted ? (localTimetableEntries?.length || 0) : '...'}
        </div>
      </div>

      {/* Semester Tabs - Centered */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex justify-center space-x-8">
            {getActiveSemesters().map((semester) => (
              <button
                key={semester.id}
                onClick={() => setActiveSemesterTab(semester.id)}
                className={`py-3 px-6 border-b-3 font-semibold text-base rounded-t-lg transition-all duration-200 ${
                  activeSemesterTab === semester.id
                    ? 'border-emerald-500 text-emerald-700 bg-emerald-50 shadow-md transform scale-105'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {formatSemesterLabel(semester)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Timetable Content */}
      <div role="region" aria-label="Weekly timetable grid">
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full border-collapse" role="table" aria-label="Timetable showing subjects by department and time slots">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2 text-xs font-bold text-gray-700 w-32" scope="col" aria-label="Department column">
                  <span className="sr-only">Department</span>
                  Department
                </th>
                {/* Time slot headers */}
                {timeSlots.map(slot => (
                  <th key={slot.id} className="border border-gray-300 p-2 text-xs font-bold text-gray-700 min-w-[150px]" scope="col" aria-label={`Time slot period ${slot.period} from ${slot.start} to ${slot.end}`}>
                    Period {slot.period}<br/>
                    {slot.start}-{slot.end}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleDepartments.map((department) => (
                <tr key={department.id} role="row">
                  {/* Department column */}
                  <th className="border border-gray-300 p-2 text-center bg-gray-50" scope="row" role="rowheader" aria-label={`${department.name} department`}>
                    <div className="text-xs font-semibold text-gray-700">
                      {department.shortName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {department.name}
                    </div>
                  </th>
                  {/* Time slot columns */}
                  {timeSlots.map(timeSlot => {
                    // Get entries for this department, time slot, and active semester
                    const cellEntries = localTimetableEntries.filter(entry => 
                      entry.semesterId === activeSemesterTab &&
                      entry.timeSlotId === timeSlot.id &&
                      subjects.find(s => s.id === entry.subjectId)?.departmentId === department.id
                    );

                    // Group entries by subject+teacher combination
                    const entryGroups = cellEntries.reduce((groups, entry) => {
                      const key = `${entry.subjectId}-${entry.teacherId}`;
                      if (!groups[key]) {
                        groups[key] = [];
                      }
                      groups[key].push(entry);
                      return groups;
                    }, {} as Record<string, typeof cellEntries>);

                    return (
                      <td key={`${department.id}-${timeSlot.id}`} className="border border-gray-300 p-1 text-center align-top min-h-[60px] relative">
                        {/* Add Entry Button - simple plus icon in bottom left */}
                        <button
                          onClick={() => {
                            setAddEntryData(prev => ({
                              ...prev,
                              selectedSemester: activeSemesterTab,
                              selectedDepartment: department.id,
                              selectedTimeSlot: timeSlot.id
                            }));
                            setShowAddEntry(true);
                          }}
                          className="absolute left-1 bottom-1 w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 border border-green-300 rounded-full hover:bg-green-200 transition-colors shadow"
                          title={`Add entry for ${department.shortName} at Period ${timeSlot.period}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Render entry groups */}
                        <div className="space-y-1">
                          {Object.entries(entryGroups).map(([groupKey, entries]) => {
                            const firstEntry = entries[0];
                            const subject = getSubject(firstEntry.subjectId);
                            const teacher = getTeacher(firstEntry.teacherId);
                            const hasConflict = hasConflicts(entries);
                            
                            if (!subject || !teacher) return null;

                            return (
                              <div
                                key={groupKey}
                                className={`relative p-1 rounded border text-xs ${
                                  hasConflict 
                                    ? 'bg-red-50 border-red-300' 
                                    : 'bg-blue-50 border-blue-300'
                                }`}
                              >
                                {/* Subject and Teacher */}
                                <div className="font-semibold text-gray-800 truncate" title={subject.name}>
                                  {subject.name.substring(0, 8)}
                                </div>
                                <div className="text-gray-600 truncate" title={teacher.name}>
                                  {teacher.name.substring(0, 10)}
                                </div>
                                
                                {/* Days display */}
                                <div className="text-gray-500 text-xs mt-1">
                                  {formatDaysDisplay(entries)}
                                </div>
                                
                                {/* Room info */}
                                {firstEntry.room && (
                                  <div className="text-gray-500 text-xs">
                                    Room: {firstEntry.room}
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex justify-between items-center mt-1 gap-1">
                                  {/* Conflict button */}
                                  {hasConflict && (
                                    <button
                                      onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setConflictTooltip({
                                          show: true,
                                          content: getConflictDetails(entries),
                                          x: rect.left + rect.width / 2,
                                          y: rect.top
                                        });
                                      }}
                                      className="px-1 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                      title="View conflict details"
                                    >
                                      ⚠ Conflict
                                    </button>
                                  )}
                                  
                                  {/* Delete button */}
                                  <button
                                    onClick={() => handleDeleteEntry(groupKey, entries, subject, teacher)}
                                    className="px-1 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors ml-auto"
                                    title="Delete this entry"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draft Overlay for Provisional Move Preview */}
      {/* Removed draftData overlay as drag-and-drop is no longer used */}

      {/* Edit Entry Modal */}
      <EditEntryModal
        show={mounted && editingData && editingEntry}
        editingData={editingData}
        editingEntry={editingEntry}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        setEditingEntry={setEditingEntry}
        setEditingData={setEditingData}
        subjects={subjects}
        teachers={teachers}
        timeSlots={timeSlots}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={!!deleteConfirmation}
        deleteConfirmation={deleteConfirmation}
        confirmDeleteEntry={confirmDeleteEntry}
        setDeleteConfirmation={setDeleteConfirmation}
        timeSlots={timeSlots}
        formatDaysDisplay={formatDaysDisplay}
      />
      {/* Conflict Tooltip Modal */}
      <ConflictTooltipModal
        show={conflictTooltip.show}
        conflictTooltip={conflictTooltip}
        setConflictTooltip={setConflictTooltip}
      />

      {/* Add Entry Modal */}
        <AddEntryModal
          show={showAddEntry}
          addEntryData={addEntryData}
          setAddEntryData={setAddEntryData}
          setShowAddEntry={setShowAddEntry}
          semesters={semesters}
          visibleDepartments={visibleDepartments}
          subjects={subjects}
          teachers={teachers}
          timeSlots={timeSlots}
          rooms={rooms}
          days={days}
          formatSemesterLabel={formatSemesterLabel}
          onAddEntry={() => {
            // Create new entries for each selected day
            const newEntries = addEntryData.selectedDays.map((day, index) => ({
              id: `new-${idCounterRef.current + index}`,
              subjectId: addEntryData.selectedSubject,
              teacherId: addEntryData.selectedTeacher || 'unassigned',
              timeSlotId: addEntryData.selectedTimeSlot,
              day: day,
              room: addEntryData.room || '', // Ensure room is always a string
              semesterId: addEntryData.selectedSemester,
              departmentId: addEntryData.selectedDepartment
            }));
            const updatedEntries = [...localTimetableEntries, ...newEntries];
            updateEntries(updatedEntries);
            setUpdateCounter(prev => prev + 1);
            idCounterRef.current += addEntryData.selectedDays.length;
            const subject = subjects.find(s => s.id === addEntryData.selectedSubject);
            setNotification({ 
              message: `Successfully added ${subject?.name} for ${addEntryData.selectedDays.join(', ')}`,
              type: 'success' 
            });
            setTimeout(() => setNotification(null), 3000);
            setShowAddEntry(false);
            setAddEntryData({
              selectedSemester: '',
              selectedDepartment: '',
              selectedSubject: '',
              selectedTeacher: '',
              selectedTimeSlot: '',
              selectedDays: [],
              room: ''
            });
          }}
        />

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-75 z-[10000]">
          Modal: {editingEntry ? 'OPEN' : 'CLOSED'} | Data: {editingData ? 'SET' : 'NULL'}
        </div>
      )}
    </div>
  );
}

export default Timetable;
