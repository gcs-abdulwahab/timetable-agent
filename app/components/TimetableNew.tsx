'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  departments,
  daysOfWeek,
  semesters,
  subjects,
  teachers,
  timeSlots,
  TimetableEntry
} from './data';
import { validateTimetable } from './conflictChecker';

interface TimetableNewProps {
  entries: TimetableEntry[];
  onUpdateEntries: (entries: TimetableEntry[]) => void;
}

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: any[];
  day: string;
  timeSlot: string;
}

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<TimetableEntry, 'id'>) => void;
  prefilledData: {
    day: string;
    timeSlotId: string;
  };
}

// Draggable Entry Component
const DraggableEntry: React.FC<{
  entry: TimetableEntry;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
  conflicts: any[];
}> = ({ entry, onEdit, onDelete, conflicts }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const subject = subjects.find(s => s.id === entry.subjectId);
  const teacher = teachers.find(t => t.id === entry.teacherId);
  const department = departments.find(d => d.id === entry.departmentId);
  const semester = semesters.find(s => s.id === entry.semesterId);

  // Check if this entry has conflicts
  const entryConflicts = conflicts.filter(conflict => 
    conflict.conflictingEntries.includes(entry.id)
  );
  const hasConflicts = entryConflicts.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white border rounded-lg p-3 mb-2 cursor-move shadow-sm hover:shadow-md transition-shadow
        ${hasConflicts ? 'border-red-300 bg-red-50' : 'border-gray-200'}
        ${isDragging ? 'z-50' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-800">
            {subject?.shortName || entry.subjectId}
          </div>
          <div className="text-xs text-gray-600">
            {teacher?.shortName || entry.teacherId}
          </div>
          <div className="text-xs text-blue-600">
            {department?.shortName} - {semester?.name}
          </div>
          {entry.room && (
            <div className="text-xs text-green-600">Room: {entry.room}</div>
          )}
          {hasConflicts && (
            <div className="text-xs text-red-600 font-medium mt-1">
              ⚠️ {entryConflicts.length} conflict{entryConflicts.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs px-1"
            title="Edit entry"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="text-red-600 hover:text-red-800 text-xs px-1"
            title="Delete entry"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// Droppable Time Slot Component
const DroppableTimeSlot: React.FC<{
  day: string;
  timeSlotId: string;
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
  onAddEntry: (day: string, timeSlotId: string) => void;
  conflicts: any[];
}> = ({ day, timeSlotId, entries, onEdit, onDelete, onAddEntry, conflicts }) => {
  const { setNodeRef } = useDroppable({
    id: `${day}-${timeSlotId}`,
  });

  // Get conflicts for this specific time slot
  const slotConflicts = conflicts.filter(conflict => 
    conflict.day === day && conflict.timeSlot === timeSlotId
  );

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] p-2 border rounded-lg relative
        ${slotConflicts.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}
      `}
    >
      {/* Add Entry Button */}
      <button
        onClick={() => onAddEntry(day, timeSlotId)}
        className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
        title="Add new entry"
      >
        + Add
      </button>

      {/* Conflict Indicator */}
      {slotConflicts.length > 0 && (
        <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
          ⚠️ {slotConflicts.length}
        </div>
      )}

      {/* Sortable Entries */}
      <SortableContext items={entries.map(e => e.id)} strategy={horizontalListSortingStrategy}>
        <div className="mt-6">
          {entries.map(entry => (
            <DraggableEntry
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
              conflicts={conflicts}
            />
          ))}
        </div>
      </SortableContext>

      {entries.length === 0 && (
        <div className="text-center text-gray-400 text-sm mt-8">
          No classes scheduled
        </div>
      )}
    </div>
  );
};

// Conflict Modal Component
const ConflictModal: React.FC<ConflictModalProps> = ({ isOpen, onClose, conflicts, day, timeSlot }) => {
  if (!isOpen) return null;

  const timeSlotInfo = timeSlots.find(ts => ts.id === timeSlot);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Conflicts for {day} - Period {timeSlotInfo?.period} ({timeSlotInfo?.start}-{timeSlotInfo?.end})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {conflicts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <div>No conflicts found for this time slot!</div>
            </div>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    conflict.type === 'teacher' 
                      ? 'bg-red-50 border-red-400' 
                      : 'bg-orange-50 border-orange-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-800">
                      {conflict.type === 'teacher' ? '👨‍🏫 Teacher Conflict' : '🏢 Room Conflict'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {conflict.day} at {conflict.timeSlot}
                    </div>
                  </div>
                  <div className="text-gray-700 mb-2">{conflict.details}</div>
                  <div className="text-sm text-gray-600">
                    <strong>Conflicting Entries:</strong>
                    <div className="mt-1 space-y-1">
                      {conflict.conflictingEntries.map((entryId: string) => {
                        // Find the actual entry to show more details
                        const entry = entries.find(e => e.id === entryId);
                        if (!entry) return <div key={entryId}>Entry {entryId}</div>;
                        
                        const subject = subjects.find(s => s.id === entry.subjectId);
                        const teacher = teachers.find(t => t.id === entry.teacherId);
                        const department = departments.find(d => d.id === entry.departmentId);
                        
                        return (
                          <div key={entryId} className="bg-white p-2 rounded border text-xs">
                            <div className="font-medium">{subject?.name || entry.subjectId}</div>
                            <div>Teacher: {teacher?.name || entry.teacherId}</div>
                            <div>Department: {department?.name || entry.departmentId}</div>
                            {entry.room && <div>Room: {entry.room}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Entry Modal Component
const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onAdd, prefilledData }) => {
  const [formData, setFormData] = useState({
    semesterId: '',
    departmentId: '',
    subjectId: '',
    teacherId: '',
    room: ''
  });

  if (!isOpen) return null;

  const getBSDepartments = () => {
    return departments.filter(dept => dept.offersBSDegree);
  };

  const getFilteredTeachers = () => {
    if (!formData.departmentId) return [];
    return teachers.filter(teacher => teacher.departmentId === formData.departmentId);
  };

  const getDepartmentSubjects = () => {
    if (!formData.departmentId || !formData.semesterId) return [];
    return subjects.filter(subject => 
      subject.departmentId === formData.departmentId &&
      subject.semesterLevel <= 2
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjectId && formData.teacherId) {
      onAdd({
        ...formData,
        ...prefilledData,
        note: ''
      });
      setFormData({
        semesterId: '',
        departmentId: '',
        subjectId: '',
        teacherId: '',
        room: ''
      });
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'semesterId' && { departmentId: '', teacherId: '', subjectId: '' }),
      ...(name === 'departmentId' && { teacherId: '', subjectId: '' })
    }));
  };

  const timeSlotInfo = timeSlots.find(ts => ts.id === prefilledData.timeSlotId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Entry - {prefilledData.day} Period {timeSlotInfo?.period}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              name="semesterId"
              value={formData.semesterId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
            >
              <option value="">Select Semester</option>
              {semesters.filter(semester => semester.isActive).map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
            >
              <option value="">Select Department</option>
              {getBSDepartments().map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
              disabled={!formData.departmentId}
            >
              <option value="">Select Subject</option>
              {getDepartmentSubjects().map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
              disabled={!formData.departmentId}
            >
              <option value="">Select Teacher</option>
              {getFilteredTeachers().map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room (Optional)</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter room number"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main TimetableNew Component
const TimetableNew: React.FC<TimetableNewProps> = ({ entries, onUpdateEntries }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflictSlot, setSelectedConflictSlot] = useState<{day: string, timeSlot: string} | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalData, setAddModalData] = useState<{day: string, timeSlotId: string} | null>(null);

  const validation = validateTimetable();
  const conflicts = validation.conflicts;

  // Get entries for a specific day and time slot
  const getEntriesForSlot = (day: string, timeSlotId: string) => {
    return entries.filter(entry => entry.day === day && entry.timeSlotId === timeSlotId);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse the drop target (format: "day-timeSlotId")
    const [targetDay, targetTimeSlotId] = overId.split('-');
    
    // Find the entry being dragged
    const draggedEntry = entries.find(entry => entry.id === activeId);
    if (!draggedEntry) {
      setActiveId(null);
      return;
    }

    // Only allow dropping within the same row (same day)
    if (draggedEntry.day !== targetDay) {
      setActiveId(null);
      return;
    }

    // Update the entry's time slot
    const updatedEntries = entries.map(entry => 
      entry.id === activeId 
        ? { ...entry, timeSlotId: targetTimeSlotId }
        : entry
    );

    onUpdateEntries(updatedEntries);
    setActiveId(null);
  };

  // Handle edit entry
  const handleEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
  };

  // Handle delete entry
  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      onUpdateEntries(updatedEntries);
    }
  };

  // Handle add entry
  const handleAddEntry = (day: string, timeSlotId: string) => {
    setAddModalData({ day, timeSlotId });
    setShowAddModal(true);
  };

  // Handle add entry submit
  const handleAddEntrySubmit = (newEntry: Omit<TimetableEntry, 'id'>) => {
    const entry: TimetableEntry = {
      ...newEntry,
      id: `e${Date.now()}`
    };
    onUpdateEntries([...entries, entry]);
  };

  // Show conflict modal
  const handleShowConflicts = (day: string, timeSlotId: string) => {
    const slotConflicts = conflicts.filter(conflict => 
      conflict.day === day && conflict.timeSlot === timeSlotId
    );
    setSelectedConflictSlot({ day, timeSlot: timeSlotId });
    setShowConflictModal(true);
  };

  // Get the dragged entry for overlay
  const draggedEntry = activeId ? entries.find(entry => entry.id === activeId) : null;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Timetable</h2>
        
        {/* Validation Status */}
        <div className={`mb-4 p-3 rounded-lg ${validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="font-semibold">
            {validation.isValid ? '✅ Timetable is Valid' : `❌ ${conflicts.length} Conflict${conflicts.length > 1 ? 's' : ''} Found`}
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left font-medium">Time</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border border-gray-300 px-4 py-2 text-center font-medium min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.id}>
                  <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                    <div className="text-sm">
                      <div>Period {slot.period}</div>
                      <div className="text-xs text-gray-600">{slot.start} - {slot.end}</div>
                    </div>
                  </td>
                  {daysOfWeek.map(day => {
                    const slotEntries = getEntriesForSlot(day, slot.id);
                    const slotConflicts = conflicts.filter(conflict => 
                      conflict.day === day && conflict.timeSlot === slot.id
                    );
                    
                    return (
                      <td key={`${day}-${slot.id}`} className="border border-gray-300 p-2 align-top">
                        <div className="relative">
                          {/* Conflict Button */}
                          {slotConflicts.length > 0 && (
                            <button
                              onClick={() => handleShowConflicts(day, slot.id)}
                              className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition-colors z-10"
                              title={`${slotConflicts.length} conflict${slotConflicts.length > 1 ? 's' : ''}`}
                            >
                              ⚠️ {slotConflicts.length}
                            </button>
                          )}
                          
                          <DroppableTimeSlot
                            day={day}
                            timeSlotId={slot.id}
                            entries={slotEntries}
                            onEdit={handleEditEntry}
                            onDelete={handleDeleteEntry}
                            onAddEntry={handleAddEntry}
                            conflicts={conflicts}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedEntry && (
            <div className="bg-white border rounded-lg p-3 shadow-lg opacity-90">
              <div className="font-medium text-sm text-gray-800">
                {subjects.find(s => s.id === draggedEntry.subjectId)?.shortName || draggedEntry.subjectId}
              </div>
              <div className="text-xs text-gray-600">
                {teachers.find(t => t.id === draggedEntry.teacherId)?.shortName || draggedEntry.teacherId}
              </div>
            </div>
          )}
        </DragOverlay>
      </div>

      {/* Conflict Modal */}
      {showConflictModal && selectedConflictSlot && (
        <ConflictModal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          conflicts={conflicts.filter(conflict => 
            conflict.day === selectedConflictSlot.day && 
            conflict.timeSlot === selectedConflictSlot.timeSlot
          )}
          day={selectedConflictSlot.day}
          timeSlot={selectedConflictSlot.timeSlot}
        />
      )}

      {/* Add Entry Modal */}
      {showAddModal && addModalData && (
        <AddEntryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEntrySubmit}
          prefilledData={addModalData}
        />
      )}
    </DndContext>
  );
};

export default TimetableNew;