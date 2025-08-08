'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import React, { useEffect, useRef, useState } from 'react';
import {
  departments,
  semesters,
  Subject,
  subjects,
  Teacher,
  teachers,
  timeSlots,
  TimetableEntry
} from './data';

interface TimetableProps {
  entries: TimetableEntry[];
  onUpdateEntries: (entries: TimetableEntry[]) => void;
}

const Timetable: React.FC<TimetableProps> = ({ entries, onUpdateEntries }) => {
  const [mounted, setMounted] = useState(false);
  const idCounterRef = useRef(0);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ entries: TimetableEntry[], subject: Subject, teacher: Teacher } | null>(null);
  const [activeEntry, setActiveEntry] = useState<{ groupKey: string, entries: TimetableEntry[], subject: Subject, teacher: Teacher } | null>(null);
  const [localTimetableEntries, setLocalTimetableEntries] = useState<TimetableEntry[]>(entries || []);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [addEntryData, setAddEntryData] = useState({
    selectedSemester: '',
    selectedDepartment: '',
    selectedSubject: '',
    selectedTeacher: '',
    selectedTimeSlot: '',
    selectedDays: [] as string[],
    room: ''
  });

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync props with local state
  useEffect(() => {
    setLocalTimetableEntries(entries || []);
  }, [entries]);

  // Debug modal state changes (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Modal state changed:', { 
        editingEntry, 
        editingData: !!editingData, 
        updateCounter 
      });
    }
  }, [editingEntry, editingData, updateCounter]);

  // Helper function to update entries and notify parent
  const updateEntries = (newEntries: TimetableEntry[]) => {
    setLocalTimetableEntries(newEntries);
    onUpdateEntries(newEntries);
  };

  // Helper function to get subject by ID
  const getSubject = (id: string) => subjects.find(s => s.id === id);
  
  // Helper function to get teacher by ID
  const getTeacher = (id: string) => teachers.find(t => t.id === id);

  // Get active semesters only
  const getActiveSemesters = () => semesters.filter(s => s.isActive);

  // Get subjects based on selected semester and department
  const getFilteredSubjects = (semesterLevel: number, departmentId: string) => {
    return subjects.filter(s => s.semesterLevel === semesterLevel && s.departmentId === departmentId);
  };

  // Get teachers for a specific department
  const getTeachersForDepartment = (departmentId: string) => {
    return teachers.filter(t => t.departmentId === departmentId || t.departmentId === 'all');
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

    if (dayNumbers.length === 0) return '';
    if (dayNumbers.length === 1) return `(${dayNumbers[0]})`;

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
    
    // Check for teacher conflicts - same teacher teaching multiple subjects at same time
    const teacherConflicts = localTimetableEntries.filter(entry => 
      entry.teacherId === teacher && 
      entry.timeSlotId === timeSlot &&
      !entries.some(e => e.id === entry.id) // Exclude current entries
    );

    // Check for room conflicts - same room used by multiple subjects at same time
    const roomConflicts = firstEntry.room ? localTimetableEntries.filter(entry => 
      entry.room === firstEntry.room && 
      entry.timeSlotId === timeSlot &&
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
    
    const teacherConflicts = localTimetableEntries.filter(entry => 
      entry.teacherId === teacher && 
      entry.timeSlotId === timeSlot &&
      !entries.some(e => e.id === entry.id)
    );

    const roomConflicts = firstEntry.room ? localTimetableEntries.filter(entry => 
      entry.room === firstEntry.room && 
      entry.timeSlotId === timeSlot &&
      !entries.some(e => e.id === entry.id)
    ) : [];

    let details = 'CONFLICTS:\n';
    if (teacherConflicts.length > 0) {
      const teacherName = getTeacher(teacher)?.name || teacher;
      details += `• Teacher ${teacherName} has multiple classes at this time\n`;
    }
    if (roomConflicts.length > 0) {
      details += `• Room ${firstEntry.room} is double-booked\n`;
    }
    
    return details;
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const idParts = (active.id as string).split('|');
    
    if (idParts.length < 3) return;
    
    const [groupKey, departmentId, timeSlotId] = idParts;
    
    // Find the entries for this group
    const departmentEntries = localTimetableEntries.filter(entry => {
      const entryDepartment = subjects.find(s => s.id === entry.subjectId)?.departmentId;
      return entryDepartment === departmentId && entry.timeSlotId === timeSlotId;
    });

    const groupedEntries: { [key: string]: TimetableEntry[] } = {};
    departmentEntries.forEach(entry => {
      const subject = getSubject(entry.subjectId);
      const teacher = getTeacher(entry.teacherId);
      const key = `${subject?.shortName}-${teacher?.shortName}`;
      if (!groupedEntries[key]) groupedEntries[key] = [];
      groupedEntries[key].push(entry);
    });

    const entries = groupedEntries[groupKey];
    
    // Check if entries exist and have at least one entry
    if (!entries || entries.length === 0) {
      console.warn('No entries found for groupKey:', groupKey);
      return;
    }
    
    const subject = getSubject(entries[0].subjectId);
    const teacher = getTeacher(entries[0].teacherId);
    
    if (subject && teacher) {
      setActiveEntry({ groupKey, entries, subject, teacher });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeEntry) {
      setActiveEntry(null);
      return;
    }

    const activeIdParts = (active.id as string).split('|');
    const overIdParts = (over.id as string).split('|');
    
    if (activeIdParts.length < 3 || overIdParts.length < 2) {
      setActiveEntry(null);
      return;
    }

    const [, sourceDepartmentId, sourceTimeSlotId] = activeIdParts;
    const [targetDepartmentId, targetTimeSlotId] = overIdParts;

    console.log('Drag operation:', {
      source: { departmentId: sourceDepartmentId, timeSlotId: sourceTimeSlotId },
      target: { departmentId: targetDepartmentId, timeSlotId: targetTimeSlotId }
    });

    // Don't allow dropping on the same cell
    if (sourceDepartmentId === targetDepartmentId && sourceTimeSlotId === targetTimeSlotId) {
      setActiveEntry(null);
      return;
    }

    // RESTRICTION: Only allow drops within the same row (same department)
    if (sourceDepartmentId !== targetDepartmentId) {
      setNotification({ 
        message: 'Cannot move to different department! Drops are only allowed within the same row.', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 4000);
      setActiveEntry(null);
      return;
    }

    // Check for conflicts in the target location
    const conflictingEntries = localTimetableEntries.filter(entry => {
      const entryDepartment = subjects.find(s => s.id === entry.subjectId)?.departmentId;
      return entryDepartment === targetDepartmentId && 
             entry.timeSlotId === targetTimeSlotId &&
             !activeEntry.entries.some(activeEntryItem => activeEntryItem.id === entry.id);
    });

    // Check for teacher conflicts
    const activeTeacher = activeEntry.teacher;
    const teacherConflicts = localTimetableEntries.filter(entry => 
      entry.teacherId === activeTeacher.id && 
      entry.timeSlotId === targetTimeSlotId &&
      !activeEntry.entries.some(activeEntryItem => activeEntryItem.id === entry.id)
    );

    // If there are conflicts, show warning and prevent drop
    if (conflictingEntries.length > 0 || teacherConflicts.length > 0) {
      const conflictMessage = `Cannot move entry: Conflict detected!\n` +
            `${conflictingEntries.length > 0 ? '- Room/Department conflict\n' : ''}` +
            `${teacherConflicts.length > 0 ? '- Teacher conflict\n' : ''}` +
            `Please choose a different time slot.`;
      
      setNotification({ message: conflictMessage, type: 'error' });
      setTimeout(() => setNotification(null), 4000);
      setActiveEntry(null);
      return;
    }

    // Update the entries to the new time slot and department
    const updatedEntries = localTimetableEntries.map(entry => {
      if (activeEntry.entries.some(activeEntryItem => activeEntryItem.id === entry.id)) {
        // Find the target subject for the new department (keep original subject if moving within same department)
        const targetSubject = targetDepartmentId !== sourceDepartmentId 
          ? subjects.find(s => s.departmentId === targetDepartmentId)
          : subjects.find(s => s.id === entry.subjectId);
        
        const updatedEntry = {
          ...entry,
          timeSlotId: targetTimeSlotId,
          subjectId: targetSubject?.id || entry.subjectId
        };
        
        console.log('Updating entry:', {
          originalTimeSlot: entry.timeSlotId,
          newTimeSlot: targetTimeSlotId,
          originalDept: sourceDepartmentId,
          newDept: targetDepartmentId,
          updatedEntry
        });
        
        return updatedEntry;
      }
      return entry;
    });

    console.log('Updated entries set:', updatedEntries);
    updateEntries([...updatedEntries]); // Force array re-creation to trigger re-render
    setUpdateCounter(prev => prev + 1); // Force component re-render
    
    // Show success notification
    const targetDepartmentName = departments.find(d => d.id === targetDepartmentId)?.shortName || 'Unknown';
    const targetTimeSlot = timeSlots.find(ts => ts.id === targetTimeSlotId);
    const successMessage = `Successfully moved ${activeEntry.subject.shortName} to ${targetDepartmentName} at ${targetTimeSlot?.start}-${targetTimeSlot?.end}`;
    
    setNotification({ message: successMessage, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
    setActiveEntry(null);
  };

  // Draggable entry component
  const DraggableEntry = ({ groupKey, entries, subject, teacher, departmentId, timeSlotId }: {
    groupKey: string;
    entries: TimetableEntry[];
    subject: Subject;
    teacher: Teacher;
    departmentId: string;
    timeSlotId: string;
  }) => {
    const daysDisplay = formatDaysDisplay(entries);
    const dragId = `${groupKey}|${departmentId}|${timeSlotId}`;
    const isConflicted = hasConflicts(entries);
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: dragId,
    });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-1 rounded text-xs border ${subject.color || 'bg-gray-100'} cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200 relative group ${isDragging ? 'z-50' : ''} ${isConflicted ? 'border-red-500 border-2' : ''}`}
      >
        {/* Drag area - excludes the edit button */}
        <div
          {...listeners}
          {...attributes}
          className="w-full h-full"
        >
          {/* Conflict danger icon */}
          {isConflicted && (
            <div 
              className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-20 animate-pulse border-2 border-white shadow-lg"
              title={getConflictDetails(entries)}
            >
              <span className="text-white font-bold">!</span>
            </div>
          )}
          
          <div className="font-semibold text-gray-800 mb-0.5" style={{ fontSize: '8px', lineHeight: '1.1' }}>
            {subject.shortName} {daysDisplay}
          </div>
          <div className="text-gray-600 truncate" style={{ fontSize: '8px', lineHeight: '1.1' }}>
            {teacher.shortName}
          </div>
          {entries[0].room && (
            <div className="text-gray-500 text-xs" style={{ fontSize: '8px', lineHeight: '1.1' }}>
              {entries[0].room}
            </div>
          )}
        </div>
        
        {/* Edit button - separate from drag area */}
        <button
          className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-blue-600 z-30 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Edit button clicked for:', groupKey, { subject, teacher, entries });
            console.log('Current editingEntry state:', editingEntry);
            console.log('Current editingData state:', editingData);
            if (subject && teacher) {
              setEditingData({ entries, subject, teacher });
              setEditingEntry(groupKey);
              console.log('Modal should open now - editingEntry set to:', groupKey);
              console.log('Modal should open now - editingData set to:', { entries, subject, teacher });
            } else {
              console.error('Missing subject or teacher:', { subject, teacher });
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent drag from starting
          }}
          onTouchStart={(e) => {
            e.stopPropagation(); // Prevent drag on mobile
          }}
          style={{ pointerEvents: 'all' }} // Ensure button receives clicks
          title="Edit this entry"
        >
          ✏️
        </button>
      </div>
    );
  };

  // Droppable cell component
  const DroppableCell = ({ departmentId, timeSlotId, children }: {
    departmentId: string;
    timeSlotId: string;
    children: React.ReactNode;
  }) => {
    const dropId = `${departmentId}|${timeSlotId}`;
    const { isOver, setNodeRef } = useDroppable({
      id: dropId,
    });

    // Check for potential conflicts when hovering
    let hasConflict = false;
    let conflictType = '';
    
    if (isOver && activeEntry) {
      // Check for room/department conflicts
      const conflictingEntries = localTimetableEntries.filter(entry => {
        const entryDepartment = subjects.find(s => s.id === entry.subjectId)?.departmentId;
        return entryDepartment === departmentId && 
               entry.timeSlotId === timeSlotId &&
               !activeEntry.entries.some(activeEntryItem => activeEntryItem.id === entry.id);
      });

      // Check for teacher conflicts
      const teacherConflicts = localTimetableEntries.filter(entry => 
        entry.teacherId === activeEntry.teacher.id && 
        entry.timeSlotId === timeSlotId &&
        !activeEntry.entries.some(activeEntryItem => activeEntryItem.id === entry.id)
      );

      if (conflictingEntries.length > 0 || teacherConflicts.length > 0) {
        hasConflict = true;
        conflictType = conflictingEntries.length > 0 ? 'Room' : 'Teacher';
      }
    }

    let cellClasses = `border border-gray-300 p-1 text-center align-top min-h-[60px]`;
    
    if (isOver) {
      if (hasConflict) {
        cellClasses += ' bg-red-100 border-red-300';
      } else {
        cellClasses += ' bg-green-100 border-green-300';
      }
    }

    return (
      <td
        ref={setNodeRef}
        className={cellClasses}
        style={{ minHeight: '60px', verticalAlign: 'top' }}
        title={hasConflict ? `${conflictType} Conflict - Cannot drop here` : ''}
      >
        {children}
        {isOver && hasConflict && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
            ⚠️ Conflict
          </div>
        )}
      </td>
    );
  };

  // Debug: Log modal state (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Current modal state:', { editingData: !!editingData, editingEntry, updateCounter });
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Timetable</h1>
            <div className="text-xs text-gray-500">
              Updates: {updateCounter} | Total Entries: {mounted ? (localTimetableEntries?.length || 0) : '...'}
            </div>
          </div>
          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            + Add Entry
          </button>
        </div>
      </div>

      <DndContext 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-xs font-bold text-gray-700 w-32">
              Department
            </th>
            {timeSlots.map(slot => (
              <th key={slot.id} className="border border-gray-300 p-2 text-xs font-bold text-gray-700 min-w-[150px]">
                Period {slot.period}<br/>
                {slot.start}-{slot.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id} className="hover:bg-gray-50">
              {/* Department column */}
              <td className="border border-gray-300 p-2 text-center bg-gray-50">
                <div className="text-xs font-semibold text-gray-700">
                  {department.shortName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {department.name}
                </div>
              </td>
              
              {/* Time slot columns */}
              {timeSlots.map(timeSlot => {
                // Get all entries for this department and time slot across all days
                const departmentEntries = localTimetableEntries.filter(entry => {
                  const subject = getSubject(entry.subjectId);
                  return subject?.departmentId === department.id && entry.timeSlotId === timeSlot.id;
                });

                // Debug logging after departmentEntries is initialized
                if (department.id === 'd6' && timeSlot.id === 'ts1') { // Debug for Computer Science, Period 1
                  console.log(`Filtering entries for ${department.shortName} Period ${timeSlot.period}:`, {
                    totalEntries: localTimetableEntries.length,
                    departmentEntriesCount: departmentEntries.length,
                    firstEntry: localTimetableEntries[0],
                    filteredEntries: departmentEntries
                  });
                }

                // Group entries by subject and teacher to show days together
                const groupedEntries = departmentEntries.reduce((groups, entry) => {
                  const key = `${entry.subjectId}-${entry.teacherId}`;
                  if (!groups[key]) {
                    groups[key] = [];
                  }
                  groups[key].push(entry);
                  return groups;
                }, {} as Record<string, typeof departmentEntries>);
                
                return (
                  <DroppableCell 
                    key={`${department.id}-${timeSlot.id}`} 
                    departmentId={department.id}
                    timeSlotId={timeSlot.id}
                  >
                    {Object.keys(groupedEntries).length > 0 && (
                      <div className="space-y-1">
                        {Object.entries(groupedEntries).map(([groupKey, entries]) => {
                          const firstEntry = entries[0];
                          const subject = getSubject(firstEntry.subjectId);
                          const teacher = getTeacher(firstEntry.teacherId);
                          
                          if (!subject || !teacher) return null;
                          
                          return (
                            <DraggableEntry
                              key={groupKey}
                              groupKey={groupKey}
                              entries={entries}
                              subject={subject}
                              teacher={teacher}
                              departmentId={department.id}
                              timeSlotId={timeSlot.id}
                            />
                          );
                        })}
                      </div>
                    )}
                  </DroppableCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeEntry ? (
          <div className={`p-1 rounded text-xs border ${activeEntry.subject.color || 'bg-gray-100'} opacity-80 shadow-lg transform rotate-2`}>
            <div className="font-semibold text-gray-800 mb-0.5" style={{ fontSize: '8px', lineHeight: '1.1' }}>
              {activeEntry.subject.shortName} {formatDaysDisplay(activeEntry.entries)}
            </div>
            <div className="text-gray-600 truncate" style={{ fontSize: '8px', lineHeight: '1.1' }}>
              {activeEntry.teacher.shortName}
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Edit Entry Modal */}
      {mounted && editingData && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Entry</h2>
              <button 
                onClick={() => {
                  console.log('Closing modal via X button');
                  setEditingEntry(null);
                  setEditingData(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <div className="text-sm text-gray-800">{editingData.subject.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher</label>
                <div className="text-sm text-gray-800">{editingData.teacher.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
                <div className="text-sm text-gray-800">{editingData.entries[0]?.room || 'No room assigned'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Days</label>
                <div className="text-sm text-gray-800">
                  {editingData.entries.map(e => e.day).join(', ')}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
                <div className="text-sm text-gray-800">
                  {timeSlots.find(ts => ts.id === editingData.entries[0]?.timeSlotId)?.start} - {timeSlots.find(ts => ts.id === editingData.entries[0]?.timeSlotId)?.end}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => {
                  // TODO: Implement actual edit functionality
                  console.log('Save Changes clicked, editingData:', editingData);
                  setEditingEntry(null);
                  setEditingData(null);
                }}
              >
                Save Changes
              </button>
              <button 
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                onClick={() => {
                  console.log('Cancel clicked');
                  setEditingEntry(null);
                  setEditingData(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-75 z-[10000]">
          Modal: {editingEntry ? 'OPEN' : 'CLOSED'} | Data: {editingData ? 'SET' : 'NULL'}
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Add New Entry</h2>
              <button 
                onClick={() => {
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
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                <select
                  value={addEntryData.selectedSemester}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      selectedSemester: e.target.value,
                      selectedSubject: '', // Reset subject when semester changes
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Semester</option>
                  {getActiveSemesters().map(semester => (
                    <option key={semester.id} value={semester.name}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                <select
                  value={addEntryData.selectedDepartment}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      selectedDepartment: e.target.value,
                      selectedSubject: '', // Reset subject when department changes
                      selectedTeacher: '', // Reset teacher when department changes
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection - Filtered by Semester and Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject/Course</label>
                <select
                  value={addEntryData.selectedSubject}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      selectedSubject: e.target.value
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={!addEntryData.selectedSemester || !addEntryData.selectedDepartment}
                >
                  <option value="">Select Subject</option>
                  {addEntryData.selectedSemester && addEntryData.selectedDepartment && (
                    (() => {
                      const semesterLevel = parseInt(addEntryData.selectedSemester.split(' ')[1]);
                      return getFilteredSubjects(semesterLevel, addEntryData.selectedDepartment);
                    })().map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Teacher Selection - Filtered by Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher (Optional)</label>
                <select
                  value={addEntryData.selectedTeacher}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      selectedTeacher: e.target.value
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={!addEntryData.selectedDepartment}
                >
                  <option value="">Select Teacher (Optional)</option>
                  {addEntryData.selectedDepartment && 
                    getTeachersForDepartment(addEntryData.selectedDepartment).map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
                <select
                  value={addEntryData.selectedTimeSlot}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      selectedTimeSlot: e.target.value
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      Period {slot.period} ({slot.start} - {slot.end})
                    </option>
                  ))}
                </select>
              </div>

              {/* Days Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Days</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <label key={day} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={addEntryData.selectedDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAddEntryData(prev => ({
                              ...prev,
                              selectedDays: [...prev.selectedDays, day]
                            }));
                          } else {
                            setAddEntryData(prev => ({
                              ...prev,
                              selectedDays: prev.selectedDays.filter(d => d !== day)
                            }));
                          }
                        }}
                        className="text-sm"
                      />
                      <span className="text-xs">{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room (Optional)</label>
                <input
                  type="text"
                  value={addEntryData.room}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      room: e.target.value
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. Room 101"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
                disabled={!addEntryData.selectedSemester || !addEntryData.selectedDepartment || !addEntryData.selectedSubject || !addEntryData.selectedTimeSlot || addEntryData.selectedDays.length === 0}
                onClick={() => {
                  // Create new entries for each selected day
                  const newEntries = addEntryData.selectedDays.map((day, index) => ({
                    id: `new-${idCounterRef.current + index}`,
                    subjectId: addEntryData.selectedSubject,
                    teacherId: addEntryData.selectedTeacher || 'unassigned', // Use 'unassigned' if no teacher selected
                    timeSlotId: addEntryData.selectedTimeSlot,
                    day: day,
                    room: addEntryData.room || undefined,
                    semesterId: getActiveSemesters().find(s => s.name === addEntryData.selectedSemester)?.id || 'sem1'
                  }));

                  if (process.env.NODE_ENV === 'development') {
                    console.log('Creating new entries:', newEntries);
                  }

                  // Add to timetable
                  const updatedEntries = [...localTimetableEntries, ...newEntries];
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log('All entries before update:', localTimetableEntries.length);
                    console.log('All entries after update:', updatedEntries.length);
                  }
                  
                  updateEntries(updatedEntries);
                  setUpdateCounter(prev => prev + 1);
                  idCounterRef.current += addEntryData.selectedDays.length;

                  if (process.env.NODE_ENV === 'development') {
                    console.log('State updated, counter incremented');
                  }

                  // Show success notification
                  const subject = subjects.find(s => s.id === addEntryData.selectedSubject);
                  setNotification({ 
                    message: `Successfully added ${subject?.shortName} for ${addEntryData.selectedDays.join(', ')}`, 
                    type: 'success' 
                  });
                  setTimeout(() => setNotification(null), 3000);

                  // Close modal and reset form
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
              >
                Add Entry
              </button>
              <button 
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                onClick={() => {
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
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </DndContext>
    </div>
  );
};

export default Timetable;
