'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  departments,
  rooms,
  semesters,
  Subject,
  subjects,
  Teacher,
  teachers,
  timeSlots,
  TimetableEntry
} from './data';

// Shared constants for ESC functionality
const ESC_TOOLTIP = 'Press ESC to cancel';
const ESC_LABEL_SUFFIX = ' (ESC)';

interface TimetableProps {
  entries: TimetableEntry[];
  onUpdateEntries: (entries: TimetableEntry[]) => void;
}

// Types for drag/drop ID schema enforcement
type DragIdParts = {
  groupKey: string;
  departmentId: string;
  timeSlotId: string;
};

type DragId = `${string}|${string}|${string}`; // Template literal type to enforce 3-part format

const Timetable: React.FC<TimetableProps> = ({ entries, onUpdateEntries }) => {
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
  const [dragData, setDragData] = useState<{ 
    groupKey: string, 
    entries: TimetableEntry[], 
    subject: Subject, 
    teacher: Teacher,
    departmentId: string,
    sourceTimeSlotId: string
  } | null>(null);
  // Draft state for provisional move preview
  const [draftData, setDraftData] = useState<{ 
    groupKey: string, 
    entries: TimetableEntry[], 
    subject: Subject, 
    teacher: Teacher,
    departmentId: string,
    provisionalTimeSlotId: string
  } | null>(null);
  // Track the current drop target for handleDragEnd
  const [currentDropTarget, setCurrentDropTarget] = useState<{ departmentId: string, timeSlotId: string } | null>(null);
  const [dragOverlay, setDragOverlay] = useState<{ show: boolean, x: number, y: number, subject?: Subject, teacher?: Teacher, daysDisplay?: string } | null>(null);
  const [localTimetableEntries, setLocalTimetableEntries] = useState<TimetableEntry[]>(entries || []);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [conflictTooltip, setConflictTooltip] = useState<{ show: boolean, content: string, x: number, y: number }>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });
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

  // ESC key handling to close modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        let closed = false;

        // Close Edit Entry modal if open
        if (editingEntry || editingData) {
          setEditingEntry(null);
          setEditingData(null);
          closed = true;
        }

        // Close Add New Entry modal if open
        if (showAddEntry) {
          setShowAddEntry(false);
          closed = true;
        }

        if (closed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingEntry, editingData, showAddEntry]);

  // Mouse tracking for drag overlay
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragOverlay?.show) {
        setDragOverlay(prev => prev ? {
          ...prev,
          x: e.clientX,
          y: e.clientY
        } : null);
      }
    };

    if (dragOverlay?.show) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [dragOverlay?.show]);

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

  // Defensive helpers for drag/drop ID schema - ensures consistent format: groupKey|departmentId|timeSlotId
  const buildDragId = (groupKey: string, departmentId: string, timeSlotId: string): DragId | '' => {
    // Validate inputs to prevent undefined/null values
    if (!groupKey || !departmentId || !timeSlotId) {
      console.warn('buildDragId: Invalid parameters', { groupKey, departmentId, timeSlotId });
      return '';
    }
    
    // Ensure no pipe characters in components to avoid parsing issues
    const safeGroupKey = groupKey.replace(/\|/g, '-');
    const safeDepartmentId = departmentId.replace(/\|/g, '-');
    const safeTimeSlotId = timeSlotId.replace(/\|/g, '-');
    
    return `${safeGroupKey}|${safeDepartmentId}|${safeTimeSlotId}` as DragId;
  };

  const parseDragId = (dragId: string): DragIdParts | null => {
    if (!dragId || typeof dragId !== 'string') {
      console.warn('parseDragId: Invalid drag ID', dragId);
      return null;
    }
    
    const parts = dragId.split('|');
    if (parts.length !== 3) {
      console.warn('parseDragId: Invalid ID format - expected 3 parts separated by |', { dragId, parts });
      return null;
    }
    
    const [groupKey, departmentId, timeSlotId] = parts;
    
    // Validate that all parts are non-empty
    if (!groupKey || !departmentId || !timeSlotId) {
      console.warn('parseDragId: Empty parts detected', { groupKey, departmentId, timeSlotId });
      return null;
    }
    
    return { groupKey, departmentId, timeSlotId };
  };

  // Get subjects based on selected semester and department
  const getFilteredSubjects = (semesterLevel: number, departmentId: string) => {
    return subjects.filter(s => s.semesterLevel === semesterLevel && s.departmentId === departmentId);
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
    if (teacherConflicts.length > 0) {
      const teacherName = getTeacher(teacher)?.name || teacher;
      const conflictingSubjects = teacherConflicts.map(c => {
        const subject = getSubject(c.subjectId);
        return `${subject?.name || c.subjectId} (${c.day})`;
      }).join(', ');
      details += `⚠️ Teacher Conflict:\n${teacherName} is also teaching ${conflictingSubjects} at the same time\n\n`;
    }
    if (roomConflicts.length > 0) {
      const conflictingSubjects = roomConflicts.map(c => {
        const subject = getSubject(c.subjectId);
        const conflictTeacher = getTeacher(c.teacherId);
        return `${subject?.name || c.subjectId} (${conflictTeacher?.name || c.teacherId}) on ${c.day}`;
      }).join(', ');
      details += `🏫 Room Conflict:\nRoom ${firstEntry.room} is also booked for ${conflictingSubjects}`;
    }
    
    return details.trim();
  };

  // HTML5 Drag and Drop handlers
  // NOTE: We use the buildDragId/parseDragId helpers to ensure consistent ID schema: groupKey|departmentId|timeSlotId
  const handleDragStart = (e: React.DragEvent, groupKey: string, departmentId: string, timeSlotId: string, entries: TimetableEntry[]) => {
    // Validate the ID schema using our defensive helper
    const dragId = buildDragId(groupKey, departmentId, timeSlotId);
    const parsedDragId = parseDragId(dragId);
    
    if (!parsedDragId) {
      console.error('❌ [DRAG START] Invalid drag ID schema:', { groupKey, departmentId, timeSlotId, dragId });
      return;
    }
    console.log('🎯 [DRAG START] Handler called with:', {
      groupKey,
      departmentId,
      timeSlotId,
      entries: entries?.length || 0,
      'event.target': (e.target as HTMLElement)?.className,
      'event.currentTarget': (e.currentTarget as HTMLElement)?.className
    });
    
    // Validate entries
    if (!entries || entries.length === 0) {
      console.warn('❌ [DRAG START] No entries found for groupKey:', groupKey);
      return;
    }
    
    const subject = getSubject(entries[0].subjectId);
    const teacher = getTeacher(entries[0].teacherId);
    
    if (!subject || !teacher) {
      console.warn('❌ [DRAG START] Could not find subject or teacher for entries');
      return;
    }
    
    const dragPayload = { 
      groupKey, 
      entries, 
      subject, 
      teacher,
      departmentId,
      sourceTimeSlotId: timeSlotId
    };
    
    console.log('✅ [DRAG START] Setting dragData (setActiveEntry):', {
      groupKey: dragPayload.groupKey,
      entriesCount: dragPayload.entries.length,
      subject: dragPayload.subject.name,
      teacher: dragPayload.teacher.name,
      departmentId: dragPayload.departmentId,
      sourceTimeSlotId: dragPayload.sourceTimeSlotId
    });
    
    // Set drag data
    setDragData(dragPayload);
    
    // Initialize drag overlay with current mouse position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOverlay({
      show: true,
      x: e.clientX,
      y: e.clientY,
      subject,
      teacher,
      daysDisplay: formatDaysDisplay(entries)
    });
    
    // Set dragging effect and ghost image
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      groupKey,
      departmentId,
      timeSlotId
    }));
    
    // You can create a custom drag image if needed
    // const dragImage = document.createElement('div');
    // dragImage.textContent = `${subject.shortName}`;
    // document.body.appendChild(dragImage);
    // e.dataTransfer.setDragImage(dragImage, 0, 0);
    // setTimeout(() => document.body.removeChild(dragImage), 0);
  };
  
  const handleDragOver = (e: React.DragEvent, departmentId: string, timeSlotId?: string) => {
    console.log('🎯 [DRAG OVER] Handler called:', {
      departmentId,
      timeSlotId,
      'event.active.id': 'N/A (HTML5 DnD)',
      'event.over?.id': timeSlotId ? `${departmentId}-${timeSlotId}` : departmentId,
      'dragData exists': !!dragData,
      'dragData.departmentId': dragData?.departmentId,
      'allowDrop': dragData && dragData.departmentId === departmentId
    });
    
    // Only allow dropping if we're in the same department row
    if (dragData && dragData.departmentId === departmentId) {
      console.log('✅ [DRAG OVER] Allowing drop - same department');
      e.preventDefault(); // This is required to allow dropping
      e.dataTransfer.dropEffect = 'move';
      
      // If we have a specific timeSlotId and it's different from source, create draft preview
      if (timeSlotId && timeSlotId !== dragData.sourceTimeSlotId) {
        console.log('🎯 [DRAG OVER] Creating provisional preview for timeSlot:', timeSlotId);
        
        // Create provisional entries with updated timeSlotId for preview
        const provisionalEntries = dragData.entries.map(entry => ({
          ...entry,
          timeSlotId: timeSlotId
        }));
        
        // Set draft data for overlay preview
        setDraftData({
          groupKey: dragData.groupKey,
          entries: provisionalEntries,
          subject: dragData.subject,
          teacher: dragData.teacher,
          departmentId: dragData.departmentId,
          provisionalTimeSlotId: timeSlotId
        });
        
        console.log('✅ [DRAG OVER] Draft data set for preview:', {
          provisionalTimeSlotId: timeSlotId,
          entriesCount: provisionalEntries.length
        });
      } else if (!timeSlotId || timeSlotId === dragData.sourceTimeSlotId) {
        // Clear draft data when not over a specific cell or over the original cell
        if (draftData) {
          console.log('🧹 [DRAG OVER] Clearing draft data - not over specific cell or over original');
          setDraftData(null);
        }
      }
    } else {
      console.log('❌ [DRAG OVER] Blocking drop - different department or no dragData');
      // Set cursor-not-allowed effect for invalid drop targets
      if (dragData) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none'; // Indicate that drop is not allowed
      }
      // Clear draft data when not allowed to drop
      if (draftData) {
        console.log('🧹 [DRAG OVER] Clearing draft data - drop not allowed');
        setDraftData(null);
      }
    }
  };
  
  const handleDrop = (e: React.DragEvent, targetDepartmentId: string, targetTimeSlotId: string) => {
    console.log('🎯 [DRAG DROP] Handler called:', {
      targetDepartmentId,
      targetTimeSlotId,
      'event.active.id': 'N/A (HTML5 DnD)',
      'event.over?.id': `${targetDepartmentId}-${targetTimeSlotId}`,
      'dragData exists': !!dragData
    });
    
    e.preventDefault();
    
    // Store the drop target for handleDragEnd to process
    setCurrentDropTarget({ departmentId: targetDepartmentId, timeSlotId: targetTimeSlotId });
    
    console.log('✅ [DRAG DROP] Drop target stored, will be processed in handleDragEnd');
  };
  
  const handleDragEnd = () => {
    console.log('🎯 [DRAG END] Handler called:', {
      'event.active.id': 'N/A (HTML5 DnD)',
      'event.over?.id': currentDropTarget ? `${currentDropTarget.departmentId}-${currentDropTarget.timeSlotId}` : 'N/A', 
      'dragData before clear': !!dragData,
      'draftData before clear': !!draftData,
      'currentDropTarget': currentDropTarget,
      'dragData details': dragData ? {
        groupKey: dragData.groupKey,
        departmentId: dragData.departmentId,
        sourceTimeSlotId: dragData.sourceTimeSlotId
      } : null
    });
    
    // 1. If event.over is null, cancel the drag
    if (!currentDropTarget) {
      console.log('❌ [DRAG END] No drop target - canceling drag');
      setDragData(null);
      setDraftData(null);
      return;
    }
    
    // 2. Enforce same department constraint
    if (dragData && dragData.departmentId !== currentDropTarget.departmentId) {
      console.log('❌ [DRAG END] Drop target in different department - aborting');
      setNotification({ 
        message: 'Cannot move to different department! Drops are only allowed within the same row.', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 4000);
      setDragData(null);
      setDraftData(null);
      setCurrentDropTarget(null);
      return;
    }
    
    // 2. Parse both active and over ids; if the timeSlot actually changed, map over localTimetableEntries
    if (!dragData) {
      console.log('❌ [DRAG END] No dragData - aborting');
      setCurrentDropTarget(null);
      return;
    }
    
    const { departmentId: targetDepartmentId, timeSlotId: targetTimeSlotId } = currentDropTarget;
    
    // No drag data or dropping on the same cell
    if (dragData.departmentId === targetDepartmentId && dragData.sourceTimeSlotId === targetTimeSlotId) {
      console.log('❌ [DRAG END] Dropping on same cell - no change needed');
      setDragData(null);
      setDraftData(null);
      setCurrentDropTarget(null);
      return;
    }
    
    // RESTRICTION: Only allow drops within the same row (same department)
    if (dragData.departmentId !== targetDepartmentId) {
      setNotification({ 
        message: 'Cannot move to different department! Drops are only allowed within the same row.', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 4000);
      setDragData(null);
      setDraftData(null);
      setCurrentDropTarget(null);
      return;
    }
    
    // Check for conflicts in the target location
    const draggedDays = dragData.entries.map(e => e.day); // Get days from dragged entries
    
    // Check for room conflicts - only if dragged entry has a room and on same days
    const roomConflicts = dragData.entries[0]?.room ? localTimetableEntries.filter(entry => {
      return entry.room === dragData.entries[0].room && 
             entry.timeSlotId === targetTimeSlotId &&
             draggedDays.includes(entry.day) && // Only conflict if on same day
             !dragData.entries.some(dragEntryItem => dragEntryItem.id === entry.id);
    }) : [];
    
    // Check for teacher conflicts - same teacher, same time, same day
    const teacherConflicts = localTimetableEntries.filter(entry => 
      entry.teacherId === dragData.teacher.id && 
      entry.timeSlotId === targetTimeSlotId &&
      draggedDays.includes(entry.day) && // Only conflict if on same day
      !dragData.entries.some(dragEntryItem => dragEntryItem.id === entry.id)
    );
    
    const conflictingEntries = roomConflicts; // Keep this for backward compatibility
    
    // If there are conflicts, show warning and prevent drop
    if (conflictingEntries.length > 0 || teacherConflicts.length > 0) {
      const conflictMessage = `Cannot move entry: Conflict detected!\n` +
            `${conflictingEntries.length > 0 ? '- Room/Department conflict\n' : ''}` +
            `${teacherConflicts.length > 0 ? '- Teacher conflict\n' : ''}` +
            `Please choose a different time slot.`;
      
      setNotification({ message: conflictMessage, type: 'error' });
      setTimeout(() => setNotification(null), 4000);
      setDragData(null);
      setDraftData(null);
      setCurrentDropTarget(null);
      return;
    }
    
    console.log('✅ [DRAG END] Time slot changed - updating entries');
    
    // Update the entries to the new time slot - for every entry in the dragged group update its timeSlotId
    const newEntries = localTimetableEntries.map(entry => {
      if (dragData.entries.some(dragEntryItem => dragEntryItem.id === entry.id)) {
        const updatedEntry = {
          ...entry,
          timeSlotId: targetTimeSlotId
        };
        
        console.log('Updating entry:', {
          originalTimeSlot: entry.timeSlotId,
          newTimeSlot: targetTimeSlotId,
          updatedEntry
        });
        
        return updatedEntry;
      }
      return entry;
    });
    
    console.log('Updated entries set:', newEntries);
    
    // 3. Call updateEntries(newEntries) and clear active states
    updateEntries([...newEntries]); // Force array re-creation to trigger re-render
    setUpdateCounter(prev => prev + 1); // Force component re-render
    
    // Show success notification
    const targetDepartmentName = departments.find(d => d.id === targetDepartmentId)?.shortName || 'Unknown';
    const targetTimeSlot = timeSlots.find(ts => ts.id === targetTimeSlotId);
    const successMessage = `Successfully moved ${dragData.subject.shortName} to ${targetDepartmentName} at ${targetTimeSlot?.start}-${targetTimeSlot?.end}`;
    
    setNotification({ message: successMessage, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
    
    console.log('✅ [DRAG END] Clearing dragData and draftData (equivalent to setActiveEntry to null)');
    // Clear drag data, draft data and drop target when drag operation ends - this is our equivalent of setActiveEntry(null)
    setDragData(null);
    setDraftData(null);
    setCurrentDropTarget(null);
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
    const isConflicted = hasConflicts(entries);
    
    // Use parseDragId helper for consistent ID comparison
    const isDragging = dragData && (() => {
      const parsedId = parseDragId(groupKey);
      return parsedId && 
             dragData.groupKey === parsedId.groupKey &&
             dragData.departmentId === parsedId.departmentId && 
             dragData.sourceTimeSlotId === parsedId.timeSlotId;
    })();
    
    return (
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, groupKey, departmentId, timeSlotId, entries)}
        onDragEnd={handleDragEnd}
        className={`p-1 rounded text-xs border ${subject.color || 'bg-gray-100'} cursor-grab hover:shadow-md hover:scale-105 transition-all duration-200 relative group ${isDragging ? 'opacity-50 z-50' : ''} ${isConflicted ? 'border-red-500 border-2' : ''}`}
      >
        {/* Drag area - excludes the edit button */}
        <div className="w-full h-full">
          {/* Conflict danger icon */}
          {isConflicted && (
            <div 
              className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-20 animate-pulse border-2 border-white shadow-lg cursor-pointer hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                
                // Calculate tooltip position with boundary checking
                let tooltipX = rect.left + rect.width / 2;
                let tooltipY = rect.top - 10;
                
                // Ensure tooltip doesn't go off-screen horizontally (only on client side)
                if (mounted && typeof window !== 'undefined') {
                  const tooltipWidth = 300; // Approximate tooltip width
                  if (tooltipX - tooltipWidth / 2 < 10) {
                    tooltipX = tooltipWidth / 2 + 10;
                  } else if (tooltipX + tooltipWidth / 2 > window.innerWidth - 10) {
                    tooltipX = window.innerWidth - tooltipWidth / 2 - 10;
                  }
                }
                
                // Ensure tooltip doesn't go off-screen vertically
                if (tooltipY < 100) {
                  tooltipY = rect.bottom + 20; // Show below if not enough space above
                }
                
                setConflictTooltip({
                  show: true,
                  content: getConflictDetails(entries),
                  x: tooltipX,
                  y: tooltipY
                });
                
                // Auto-close tooltip after 8 seconds (increased for better UX)
                setTimeout(() => {
                  setConflictTooltip({ show: false, content: '', x: 0, y: 0 });
                }, 8000);
              }}
              onMouseDown={(e) => {
                e.stopPropagation(); // Prevent drag from starting
              }}
              title="Click for conflict details"
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
              // Populate form data with current values
              setEditFormData({
                subjectId: subject.id,
                teacherId: teacher.id,
                room: entries[0]?.room || '',
                timeSlotId: entries[0]?.timeSlotId || '',
                selectedDays: entries.map(e => e.day)
              });
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
  const DroppableCell = ({ departmentId, timeSlotId, children, isEmpty = false }: {
    departmentId: string;
    timeSlotId: string;
    children: React.ReactNode;
    isEmpty?: boolean;
  }) => {
    // Check if being dragged over
    const isOver = dragData && dragData.departmentId === departmentId;

    // Handle click on empty cell
    const handleCellClick = (e: React.MouseEvent) => {
      // Only handle click if the cell is empty and we're not dragging
      if (isEmpty && !dragData && e.target === e.currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the department to get its name
        const department = departments.find(dept => dept.id === departmentId);
        const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
        
        if (department && timeSlot) {
          // Get the first active semester as default
          const defaultSemester = getActiveSemesters()[0];
          
          // Pre-fill the modal with department and time slot information
          setAddEntryData(prev => ({
            ...prev,
            selectedSemester: defaultSemester?.name || '',
            selectedDepartment: department.id, // Use department ID, not name
            selectedTimeSlot: timeSlotId,
            selectedDays: [] // Let user select days
          }));
          
          // Open the add entry modal
          setShowAddEntry(true);
        }
      }
    };

    // Check for potential conflicts when hovering
    let hasConflict = false;
    let conflictType = '';
    
    if (isOver && dragData) {
      const draggedDays = dragData.entries.map(e => e.day); // Get days from dragged entries
      
      // Check for room conflicts - only if dragged entry has a room
      const roomConflicts = dragData.entries[0]?.room ? localTimetableEntries.filter(entry => {
        return entry.room === dragData.entries[0].room && 
               entry.timeSlotId === timeSlotId &&
               draggedDays.includes(entry.day) && // Only conflict if on same day
               !dragData.entries.some(dragEntryItem => dragEntryItem.id === entry.id);
      }) : [];

      // Check for teacher conflicts - same teacher, same time, same day
      const teacherConflicts = localTimetableEntries.filter(entry => 
        entry.teacherId === dragData.teacher.id && 
        entry.timeSlotId === timeSlotId &&
        draggedDays.includes(entry.day) && // Only conflict if on same day
        !dragData.entries.some(dragEntryItem => dragEntryItem.id === entry.id)
      );

      if (roomConflicts.length > 0 || teacherConflicts.length > 0) {
        hasConflict = true;
        conflictType = roomConflicts.length > 0 ? 'Room' : 'Teacher';
      }
    }

let cellClasses = `border border-gray-300 p-1 text-center align-top min-h-[60px]`;
    
    // Add hover effect for empty cells
    if (isEmpty) {
      cellClasses += ' hover:bg-blue-50 cursor-pointer';
    }
    
    // Show cursor-not-allowed for different department when dragging
    if (dragData && dragData.departmentId !== departmentId) {
      cellClasses += ' cursor-not-allowed';
    }
    
    if (isOver && dragData?.sourceTimeSlotId !== timeSlotId) {
      if (hasConflict) {
        cellClasses += ' bg-red-100 border-red-300';
      } else if (dragData?.departmentId === departmentId) {
        cellClasses += ' bg-green-100 border-green-300';
      }
    }

    return (
      <td
        className={cellClasses}
        style={{ minHeight: '60px', verticalAlign: 'top' }}
        title={isEmpty ? 'Click to add new entry' : hasConflict ? `${conflictType} Conflict - Cannot drop here` : ''}
        onClick={handleCellClick}
        onDragOver={(e) => handleDragOver(e, departmentId, timeSlotId)}
        onDrop={(e) => handleDrop(e, departmentId, timeSlotId)}
      >
        {children}
        {isEmpty && (
          <div className="flex items-center justify-center h-full">
            <button
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-500 flex items-center justify-center transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Find the department to get its name
                const department = departments.find(dept => dept.id === departmentId);
                const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
                
                if (department && timeSlot) {
                  // Get the first active semester as default
                  const defaultSemester = getActiveSemesters()[0];
                  
                  // Pre-fill the modal with department and time slot information
                  setAddEntryData(prev => ({
                    ...prev,
                    selectedSemester: defaultSemester?.name || '',
                    selectedDepartment: department.id, // Use department ID, not name
                    selectedTimeSlot: timeSlotId,
                    selectedDays: [] // Let user select days
                  }));
                  
                  // Open the add entry modal
                  setShowAddEntry(true);
                }
              }}
              title="Add new entry to this time slot"
            >
              <span className="text-lg font-bold leading-none">+</span>
            </button>
          </div>
        )}
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

      <div>
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
                  // FIXED: Always use the buildDragId helper to ensure consistent ID format with departmentId and timeSlotId
                  const baseGroupKey = `${entry.subjectId}-${entry.teacherId}`;
                  const key = buildDragId(baseGroupKey, department.id, timeSlot.id);
                  
                  // FIXED: Don't fallback to incomplete ID - if buildDragId fails, skip this entry
                  if (!key) {
                    console.warn('Skipping entry due to invalid drag ID generation:', { entry, department: department.id, timeSlot: timeSlot.id });
                    return groups;
                  }
                  
                  if (!groups[key]) {
                    groups[key] = [];
                  }
                  groups[key].push(entry);
                  return groups;
                }, {} as Record<string, typeof departmentEntries>);
                
                const hasEntries = Object.keys(groupedEntries).length > 0;
                
                return (
                  <DroppableCell 
                    key={`${department.id}-${timeSlot.id}`} 
                    departmentId={department.id}
                    timeSlotId={timeSlot.id}
                    isEmpty={!hasEntries}
                  >
                    {hasEntries && (
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

      {/* Draft Overlay for Provisional Move Preview */}
      {draftData && (
        <div className="fixed inset-0 pointer-events-none z-[5000]">
          <div className="absolute top-4 left-4 bg-blue-500 text-white p-3 rounded-lg shadow-xl border-2 border-blue-600 opacity-90">
            <div className="text-sm font-semibold mb-1">
              📋 Preview Move
            </div>
            <div className="text-xs">
              Moving <span className="font-bold">{draftData.subject.shortName}</span> to {timeSlots.find(ts => ts.id === draftData.provisionalTimeSlotId)?.start}-{timeSlots.find(ts => ts.id === draftData.provisionalTimeSlotId)?.end}
            </div>
          </div>
        </div>
      )}

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
                title={ESC_TOOLTIP}
                aria-label="Close (ESC)"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <select
                  value={editFormData.subjectId}
                  onChange={(e) => {
                    const newSubjectId = e.target.value;
                    const newSubject = subjects.find(s => s.id === newSubjectId);
                    const currentSubject = subjects.find(s => s.id === editFormData.subjectId);
                    
                    // Reset teacher if subject's department changes
                    const shouldResetTeacher = newSubject && currentSubject && 
                      newSubject.departmentId !== currentSubject.departmentId;
                    
                    setEditFormData(prev => ({ 
                      ...prev, 
                      subjectId: newSubjectId,
                      ...(shouldResetTeacher && { teacherId: '' })
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher</label>
                <select
                  value={editFormData.teacherId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(() => {
                    // Get the selected subject to find its department
                    const selectedSubject = subjects.find(s => s.id === editFormData.subjectId);
                    
                    // Filter teachers based on the selected subject's department
                    let filteredTeachers = selectedSubject 
                      ? teachers.filter(teacher => teacher.departmentId === selectedSubject.departmentId)
                      : teachers; // Show all teachers if no subject is selected
                    
                    // Ensure the current teacher is always included in the list, even if from different department
                    const currentTeacher = teachers.find(t => t.id === editFormData.teacherId);
                    if (currentTeacher && !filteredTeachers.some(t => t.id === currentTeacher.id)) {
                      // Add current teacher to the list if not already present
                      filteredTeachers = [currentTeacher, ...filteredTeachers];
                    }
                    
                    return filteredTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}{teacher.id === editFormData.teacherId && teacher.departmentId !== selectedSubject?.departmentId ? ' (Current)' : ''}
                      </option>
                    ));
                  })()}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
                <select
                  value={editFormData.room}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Room (Optional)</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.name}>
                      {room.name} - Capacity: {room.capacity} ({room.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <label key={day} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={editFormData.selectedDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditFormData(prev => ({ 
                              ...prev, 
                              selectedDays: [...prev.selectedDays, day] 
                            }));
                          } else {
                            setEditFormData(prev => ({ 
                              ...prev, 
                              selectedDays: prev.selectedDays.filter(d => d !== day) 
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
                <select
                  value={editFormData.timeSlotId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, timeSlotId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlots.map(timeSlot => (
                    <option key={timeSlot.id} value={timeSlot.id}>
                      Period {timeSlot.period} ({timeSlot.start} - {timeSlot.end})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => {
                  if (!editingData) return;
                  
                  console.log('Save Changes clicked, editFormData:', editFormData);
                  
                  // Validate form data
                  if (!editFormData.subjectId || !editFormData.teacherId || !editFormData.timeSlotId || editFormData.selectedDays.length === 0) {
                    setNotification({ message: 'Please fill in all required fields', type: 'error' });
                    setTimeout(() => setNotification(null), 3000);
                    return;
                  }

                  // Remove old entries
                  const entriesWithoutOld = localTimetableEntries.filter(entry => 
                    !editingData.entries.some(oldEntry => oldEntry.id === entry.id)
                  );

                  // Create new entries with updated data
                  const newEntries = editFormData.selectedDays.map((day, index) => ({
                    id: `edited-${idCounterRef.current + index}`,
                    subjectId: editFormData.subjectId,
                    teacherId: editFormData.teacherId,
                    timeSlotId: editFormData.timeSlotId,
                    day: day,
                    room: editFormData.room || undefined,
                    semesterId: editingData.entries[0]?.semesterId || 'sem1'
                  }));

                  // Update counter for next use
                  idCounterRef.current += editFormData.selectedDays.length;

                  // Combine entries
                  const updatedEntries = [...entriesWithoutOld, ...newEntries];
                  
                  updateEntries(updatedEntries);
                  setNotification({ message: 'Entry updated successfully!', type: 'success' });
                  setTimeout(() => setNotification(null), 3000);
                  
                  // Close modal and reset active entry state
                  setEditingEntry(null);
                  setEditingData(null);
                  setEditFormData({
                    subjectId: '',
                    teacherId: '',
                    room: '',
                    timeSlotId: '',
                    selectedDays: []
                  });
                }}
              >
                Save Changes
              </button>
              <button 
                type="button"
                title={ESC_TOOLTIP}
                aria-label={`Cancel${ESC_LABEL_SUFFIX}`}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                onClick={() => {
                  console.log('Cancel clicked');
                  setEditingEntry(null);
                  setEditingData(null);
                  setEditFormData({
                    subjectId: '',
                    teacherId: '',
                    room: '',
                    timeSlotId: '',
                    selectedDays: []
                  });
                }}
              >
                {`Cancel${ESC_LABEL_SUFFIX}`}
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
                title={ESC_TOOLTIP}
                aria-label="Close (ESC)"
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
                      selectedSubject: e.target.value,
                      selectedTeacher: '' // Reset teacher when subject changes
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

              {/* Teacher Selection - Filtered by Selected Subject's Department */}
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
                  disabled={!addEntryData.selectedSubject}
                >
                  <option value="">Select Teacher (Optional)</option>
                  {(() => {
                    // Get the selected subject to find its department
                    const selectedSubject = subjects.find(s => s.id === addEntryData.selectedSubject);
                    
                    // Filter teachers based on the selected subject's department
                    const filteredTeachers = selectedSubject 
                      ? teachers.filter(teacher => teacher.departmentId === selectedSubject.departmentId)
                      : [];
                    
                    return filteredTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ));
                  })()}
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
                <select
                  value={addEntryData.room}
                  onChange={(e) => {
                    setAddEntryData(prev => ({
                      ...prev,
                      room: e.target.value
                    }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Room (Optional)</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.name}>
                      {room.name} - Capacity: {room.capacity} ({room.type})
                    </option>
                  ))}
                </select>
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

                  // Close modal and reset form - no need to reset active entry as we're adding, not editing
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
                type="button"
                title={ESC_TOOLTIP}
                aria-label={`Cancel${ESC_LABEL_SUFFIX}`}
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
                {`Cancel${ESC_LABEL_SUFFIX}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Conflict Tooltip */}
      {conflictTooltip.show && (
        <>
          {/* Overlay to close tooltip */}
          <div 
            className="fixed inset-0 z-[8000]"
            onClick={() => setConflictTooltip({ show: false, content: '', x: 0, y: 0 })}
          />
          
          {/* Tooltip content */}
          <div 
            className="fixed bg-red-600 text-white p-3 rounded-lg shadow-xl z-[9000] max-w-xs border border-red-700"
            style={{ 
              left: `${conflictTooltip.x}px`, 
              top: `${conflictTooltip.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold">⚠️ Conflict Details</div>
              <button
                className="text-white hover:text-red-200 text-lg leading-none"
                onClick={() => setConflictTooltip({ show: false, content: '', x: 0, y: 0 })}
              >
                ×
              </button>
            </div>
            <div className="text-xs whitespace-pre-line">
              {conflictTooltip.content}
            </div>
            
            {/* Arrow pointing down */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"
            />
          </div>
        </>
      )}
      
      </div>
    </div>
  );
};

export default Timetable;
