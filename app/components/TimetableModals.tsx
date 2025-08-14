// Add Entry Modal
export function AddEntryModal({ show, addEntryData, setAddEntryData, setShowAddEntry, semesters, visibleDepartments, subjects, teachers, timeSlots, rooms, onAddEntry, formatSemesterLabel }) {
  if (!show) return null;
  return (
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
            title="Close (ESC)"
            aria-label="Close (ESC)"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          {/* Semester Selection - Read Only */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
            <input
              type="text"
              value={(() => {
                const semester = semesters.find(s => s.id === addEntryData.selectedSemester);
                return semester ? formatSemesterLabel(semester) : 'No semester selected';
              })()}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
              placeholder="Semester will be set automatically"
            />
            <p className="text-xs text-gray-500 mt-1">Semester is automatically set based on the current active tab</p>
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
                  selectedSubject: '',
                  selectedTeacher: '',
                }));
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Department</option>
              {visibleDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject/Course</label>
            <select
              value={addEntryData.selectedSubject}
              onChange={(e) => setAddEntryData(prev => ({ ...prev, selectedSubject: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              disabled={!addEntryData.selectedSemester || !addEntryData.selectedDepartment}
            >
              <option value="">Select Subject</option>
              {addEntryData.selectedSemester && addEntryData.selectedDepartment &&
                subjects.filter(s => s.departmentId === addEntryData.selectedDepartment).map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))
              }
            </select>
          </div>
          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher (Optional)</label>
            <select
              value={addEntryData.selectedTeacher}
              onChange={(e) => {
                setAddEntryData(prev => ({ ...prev, selectedTeacher: e.target.value }));
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              disabled={!addEntryData.selectedSubject}
            >
              <option value="">Select Teacher (Optional)</option>
              {(() => {
                const selectedSubject = subjects.find(s => s.id === addEntryData.selectedSubject);
                const filteredTeachers = selectedSubject 
                  ? teachers.filter(teacher => teacher.departmentId === selectedSubject.departmentId)
                  : [];
                return filteredTeachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ));
              })()}
            </select>
          </div>
          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
            <input
              type="text"
              value={(() => {
                const slot = timeSlots.find(s => s.id === addEntryData.selectedTimeSlot);
                return slot ? `Period ${slot.period} (${slot.start} - ${slot.end})` : '';
              })()}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
          {/* Days Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Days</label>
            <div className="grid grid-cols-3 gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                <label key={day} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={addEntryData.selectedDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAddEntryData(prev => ({ ...prev, selectedDays: [...prev.selectedDays, day] }));
                      } else {
                        setAddEntryData(prev => ({ ...prev, selectedDays: prev.selectedDays.filter(d => d !== day) }));
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
                setAddEntryData(prev => ({ ...prev, room: e.target.value }));
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Room (Optional)</option>
              {rooms.map(room => (
                <option key={room.id} value={room.name}>{room.name} - Capacity: {room.capacity} ({room.type})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
            disabled={!addEntryData.selectedSemester || !addEntryData.selectedDepartment || !addEntryData.selectedSubject || !addEntryData.selectedTimeSlot || addEntryData.selectedDays.length === 0}
            onClick={onAddEntry}
          >
            Add Entry
          </button>
          <button 
            type="button"
            title="Close (ESC)"
            aria-label={`Cancel${" (ESC)"}`}
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
            {`Cancel${" (ESC)"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Entry Modal
export function EditEntryModal({ show, editingData, editingEntry, editFormData, setEditFormData, setEditingEntry, setEditingData, subjects, teachers, timeSlots }) {
  if (!show || !editingData || !editingEntry) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
            <select
              value={editFormData.subjectId}
              onChange={e => setEditFormData(prev => ({ ...prev, subjectId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher</label>
            <select
              value={editFormData.teacherId}
              onChange={e => setEditFormData(prev => ({ ...prev, teacherId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
            <input
              type="text"
              value={editFormData.room}
              onChange={e => setEditFormData(prev => ({ ...prev, room: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
            <select
              value={editFormData.timeSlotId}
              onChange={e => setEditFormData(prev => ({ ...prev, timeSlotId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Time Slot</option>
              {timeSlots.map(slot => (
                <option key={slot.id} value={slot.id}>Period {slot.period} ({slot.start} - {slot.end})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Days</label>
            <div className="grid grid-cols-3 gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                <label key={day} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={editFormData.selectedDays.includes(day)}
                    onChange={e => {
                      if (e.target.checked) {
                        setEditFormData(prev => ({ ...prev, selectedDays: [...prev.selectedDays, day] }));
                      } else {
                        setEditFormData(prev => ({ ...prev, selectedDays: prev.selectedDays.filter(d => d !== day) }));
                      }
                    }}
                    className="text-sm"
                  />
                  <span className="text-xs">{day.substring(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
            disabled={!editFormData.subjectId || !editFormData.teacherId || !editFormData.timeSlotId || editFormData.selectedDays.length === 0}
            onClick={() => {
              setEditingEntry(null);
              setEditingData(null);
            }}
          >
            Save Changes
          </button>
          <button
            type="button"
            title="Close (ESC)"
            aria-label={`Cancel${ESC_LABEL_SUFFIX}`}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
            onClick={() => {
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
  );
}

// Delete Confirmation Modal
export function DeleteConfirmationModal({ show, deleteConfirmation, confirmDeleteEntry, setDeleteConfirmation, timeSlots, formatDaysDisplay }) {
  if (!show || !deleteConfirmation) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="text-red-500 mr-2">🗑️</span>
            Delete Entry
          </h2>
          <button 
            onClick={() => setDeleteConfirmation(null)}
            className="text-gray-500 hover:text-gray-700 text-xl"
            title="Close (ESC)"
            aria-label="Close (ESC)"
          >
            ×
          </button>
        </div>
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-2">Are you sure you want to delete this entry?</p>
              <div className="space-y-1">
                <p><strong>Subject:</strong> {deleteConfirmation.subject.name}</p>
                <p><strong>Teacher:</strong> {deleteConfirmation.teacher.name}</p>
                <p><strong>Days:</strong> {formatDaysDisplay(deleteConfirmation.entries)}</p>
                <p><strong>Time Slot:</strong> {(() => {
                  const timeSlot = timeSlots.find(ts => ts.id === deleteConfirmation.entries[0]?.timeSlotId);
                  return timeSlot ? `Period ${timeSlot.period} (${timeSlot.start} - ${timeSlot.end})` : 'Unknown';
                })()}</p>
                {deleteConfirmation.entries[0]?.room && (
                  <p><strong>Room:</strong> {deleteConfirmation.entries[0].room}</p>
                )}
              </div>
              <p className="mt-3 text-red-700 font-medium">This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
            onClick={confirmDeleteEntry}
          >
            <span className="mr-1">🗑️</span>
            Delete Entry
          </button>
          <button 
            type="button"
            title="Close (ESC)"
            aria-label={`Cancel${ESC_LABEL_SUFFIX}`}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
            onClick={() => setDeleteConfirmation(null)}
          >
            {`Cancel${ESC_LABEL_SUFFIX}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Conflict Tooltip Modal
export function ConflictTooltipModal({ show, conflictTooltip, setConflictTooltip }) {
  if (!show) return null;
  return (
    <>
      <div 
        className="fixed inset-0 z-[8000]"
        onClick={() => setConflictTooltip({ show: false, content: '', x: 0, y: 0 })}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setConflictTooltip({ show: false, content: '', x: 0, y: 0 });
          }
        }}
      />
      <div 
        className="fixed bg-red-600 text-white p-3 rounded-lg shadow-xl z-[9000] max-w-xs border border-red-700"
        style={{ 
          left: `${conflictTooltip.x}px`, 
          top: `${conflictTooltip.y}px`,
          transform: 'translate(-50%, -100%)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-details-title"
        aria-describedby="conflict-details-content"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-2">
          <div id="conflict-details-title" className="text-sm font-semibold">⚠️ Conflict Details</div>
          <button
            className="text-white hover:text-red-200 text-lg leading-none"
            onClick={() => setConflictTooltip({ show: false, content: '', x: 0, y: 0 })}
            aria-label="Close conflict details"
            title="Close (ESC)"
          >
            ×
          </button>
        </div>
        <div id="conflict-details-content" className="text-xs whitespace-pre-line">
          {conflictTooltip.content}
        </div>
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
