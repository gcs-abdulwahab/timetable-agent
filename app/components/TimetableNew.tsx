import React from "react";
import { formatTime } from '../../lib/utils';
import { usePrograms } from "../hooks/usePrograms";
import { useTimetableEntries } from "../hooks/useTimetableEntries";
import type {
  Day,
  Department,
  Room,
  Semester,
  Subject,
  Teacher,
  Degree,
  TimeSlot,
  TimetableEntry
} from "../types";
import AddEntryModal from "./AddEntryModal";
import ConflictSummary from './ConflictSummary';
import EditEntryModal from "./EditEntryModal";
import EntryBadge from "./EntryBadge";

// Define types for forms and data
type TimetableProps = {
	departments: Department[];
	teachers: Teacher[];
  days: Day[];
  degrees : Degree[];
	rooms: Room[];
	timeSlots: TimeSlot[];
	semesters: Semester[];
	entries: TimetableEntry[];
	subjects: Subject[];
	teacherSlotConflicts?: { [key: string]: number[] }; // <-- add prop
	roomSlotConflicts?: { [key: string]: number[] }; // <-- add prop
};

// Removed unused types

const SemesterTabs: React.FC<{ semesters: Semester[]; selectedId: number | undefined; onSelect: (id: number) => void }> = ({ semesters, selectedId, onSelect }) => (
	<div className="mb-4 flex gap-2">
		{semesters.map(sem => (
			<button
				key={sem.id}
				className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${selectedId === sem.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
				onClick={() => onSelect(sem.id)}
			>
				{sem.name}
			</button>
		))}
	</div>
);

const Timetable: React.FC<TimetableProps> = ({
  departments,
  semesters,
  timeSlots,
  entries,
  subjects,
  teachers,
  rooms,
  degrees,
  days,
  teacherSlotConflicts = {},
  roomSlotConflicts = {},
}) => {
  const { programs } = usePrograms();
  // Removed useDegrees; using degrees prop from TimetableProps
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (programs.length > 0 && selectedProgramId === undefined) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs, selectedProgramId]);

  const filteredTimeSlots = selectedProgramId
    ? timeSlots.filter(ts => ts.programId === selectedProgramId)
    : timeSlots;

  // Memoize active semesters
  const activeSemesters = React.useMemo(() => semesters ? semesters.filter(s => s.isActive) : [], [semesters]);
  const [selectedSemesterId, setSelectedSemesterId] = React.useState<number | undefined>(activeSemesters?.[0]?.id);

  // Local state for conflicts
  const [localTeacherConflicts, setLocalTeacherConflicts] = React.useState<{ [key: string]: number[] }>(teacherSlotConflicts);
  const [localRoomConflicts, setLocalRoomConflicts] = React.useState<{ [key: string]: number[] }>(roomSlotConflicts);

  // Recalculate conflicts when entries change
  const recalculateConflicts = React.useCallback((updatedEntries: TimetableEntry[]) => {
    // Teacher conflicts
    const teacherConflicts: { [key: string]: number[] } = {};
    updatedEntries.forEach(entry => {
      const key = `${entry.teacherId}_${entry.timeSlotId}`;
      if (!teacherConflicts[key]) teacherConflicts[key] = [];
      teacherConflicts[key].push(entry.id);
    });
    const filteredTeacher = Object.entries(teacherConflicts)
      .filter(([_, ids]) => ids.length > 1)
      .reduce((acc, [key, ids]) => { acc[key] = ids; return acc; }, {} as { [key: string]: number[] });
    setLocalTeacherConflicts(filteredTeacher);
    // Room conflicts
    const roomConflicts: { [key: string]: number[] } = {};
    updatedEntries.forEach(entry => {
      const key = `${entry.roomId}_${entry.timeSlotId}`;
      if (!roomConflicts[key]) roomConflicts[key] = [];
      roomConflicts[key].push(entry.id);
    });
    const filteredRoom = Object.entries(roomConflicts)
      .filter(([_, ids]) => ids.length > 1)
      .reduce((acc, [key, ids]) => { acc[key] = ids; return acc; }, {} as { [key: string]: number[] });
    setLocalRoomConflicts(filteredRoom);
  }, []);

  // Use custom hook for entry state and drag/drop, pass recalculateConflicts
  const { entryList, handleDragStart, handleDrop, handleDragOver, setEntryList } = useTimetableEntries(entries, recalculateConflicts);

  // Filter entries only those subjects that belong to that semesterid
  const filteredEntries = selectedSemesterId
    ? entryList.filter(e => e.subjectId && subjects.find(s => s.id === e.subjectId && s.semesterId === selectedSemesterId))
    : entryList;

  // State for edit modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editEntry, setEditEntry] = React.useState<TimetableEntry | null>(null);
  
  const [addedEntries, setAddedEntries] = React.useState<{ [key: string]: boolean }>({});
  const [selectedDepartmentforAdd, setSelectedDepartmentforAdd] = React.useState<Department | undefined>(undefined);
  const [selectedTimeSlotforAdd, setSelectedTimeSlotforAdd] = React.useState<TimeSlot | undefined>(undefined);
  
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | undefined>(undefined);

  const [showAddModal, setShowAddModal] = React.useState(false);

  // Handler for edit button (show modal)
  const handleEditEntry = (entry: TimetableEntry) => {
    setEditEntry(entry);
    const teacher = teachers.find(t => t.id === entry.teacherId);
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };
  const handleAddEntry = (departmentId: number, timeSlotId: number) => {
    setEditEntry(null);
    setSelectedDepartmentforAdd(departments.find(d => d.id === departmentId));
    setSelectedTimeSlotforAdd(timeSlots.find(t => t.id === timeSlotId));
    setShowAddModal(true);
  };

  
  // Refresh timetable entries
  const refreshTimetable = async () => {
    try {
      const res = await fetch('/api/timetable-entries');
      if (res.ok) {
        const updatedEntries = await res.json();
        setEntryList(updatedEntries);
      }
    } catch (err) {
      console.error('Failed to refresh timetable entries', err);
    }
  };

  // Add helper to detect if row is last
  const isLastRow = (rowIdx: number, totalRows: number) => rowIdx === totalRows - 1;



  
  // Render timetable grid
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg overflow-auto">
      {activeSemesters.length > 0 && (
      <SemesterTabs semesters={activeSemesters} selectedId={selectedSemesterId} onSelect={setSelectedSemesterId} />
      )}
      <div className="mb-4">
        <label className="text-xs font-semibold mb-1">Program</label>
        <select
          value={selectedProgramId ?? ''}
          onChange={e => setSelectedProgramId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
        >
          {programs.map(program => (
            <option key={program.id} value={program.id}>{program.name}</option>
          ))}
        </select>
      </div>
      <table className="w-full border-collapse bg-white rounded shadow">
      <thead>
        <tr>
        <th className="border p-2 bg-gray-100 text-left whitespace-nowrap" style={{ width: '160px' }}>
          Degrees
        </th>
        {filteredTimeSlots.map((slot) => (
          <th
          key={slot.id}
          className="border p-2 bg-gray-100 text-center flex-1 min-w-32"
          style={{ minWidth: '120px', width: 'auto' }}
          >
          {formatTime(slot.start)} - {formatTime(slot.end)}
          </th>
        ))}
        </tr>
      </thead>
      <tbody>
        {degrees.map((degree, degreeIdx) => (
        <tr key={degree.id}>
          <td className="border p-2 font-semibold bg-gray-50" style={{ width: '160px' }}>
            {degree.name}
          </td>
          {filteredTimeSlots.map((slot) => {
            // Find entries for this degree and timeslot, matching subject's degreeId
            const degreeEntries = filteredEntries.filter((e) => {
              if (e.timeSlotId !== slot.id || !e.subjectId) return false;
              const subject = subjects.find(s => s.id === e.subjectId);
              return subject && subject.degreeId === degree.id;
            });
            return (
              <td
          key={slot.id}
          className="border p-2 align-top relative"
          onDrop={handleDrop(slot.id)}
          onDragOver={handleDragOver}
              >
          <button
            className="mb-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
            onClick={() => handleAddEntry(degree.id, slot.id)}
          >
            + Add
          </button>
          {degreeEntries.length > 0 ? (
            <>
              <ul>
                {degreeEntries.map((entry, entryIdx) => {
            const subject = subjects.find((s) => s.id === entry.subjectId);
            const teacher = teachers.find((t) => t.id === entry.teacherId);
            const room = rooms.find((r) => r.id === entry.roomId);

            // Check teacher conflict with day overlap
            let hasTeacherConflict = false;
            for (const ids of Object.values(localTeacherConflicts)) {
              if (ids.includes(entry.id)) {
                // Find other conflicting entries
                const others = degreeEntries.filter(e2 => ids.includes(e2.id) && e2.id !== entry.id);
                if (others.some(e2 => e2.dayIds.some(day => entry.dayIds.includes(day)))) {
                  hasTeacherConflict = true;
                  break;
                }
              }
            }
            // Check room conflict with day overlap
            let hasRoomConflict = false;
            for (const ids of Object.values(localRoomConflicts)) {
              if (ids.includes(entry.id)) {
                const others = degreeEntries.filter(e2 => ids.includes(e2.id) && e2.id !== entry.id);
                if (others.some(e2 => e2.dayIds.some(day => entry.dayIds.includes(day)))) {
                  hasRoomConflict = true;
                  break;
                }
              }
            }

            return (
              <div
                key={entry.id}
                draggable
                onDragStart={handleDragStart(entry.id)}
              >
                <EntryBadge
                  entry={entry}
                  subjectName={subject ? subject.name : undefined}
                  teacherName={teacher ? teacher.name : undefined}
                  roomName={room ? room.name : undefined}
                  days={days}
                  onEditEntry={() => handleEditEntry(entry)}
                  isTooltipUp={isLastRow(degreeIdx, degrees.length)}
                  hasTeacherConflict={hasTeacherConflict}
                  hasRoomConflict={hasRoomConflict}
                />
              </div>
            );
                })}
              </ul>
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
              </td>
            );
          })}
        </tr>
        ))}
      </tbody>
      </table>
      {/* Add conflict summary below timetable */}
      <ConflictSummary
        teacherConflicts={localTeacherConflicts}
        roomConflicts={localRoomConflicts}
        entries={entryList}
        teachers={teachers}
        rooms={rooms}
      />

      {/* Edit modal restored */}
      <EditEntryModal
        show={showEditModal}
        setShowEditEntry={setShowEditModal}
        semesters={semesters}
        visibleDepartments={departments}
        subjects={subjects}
        teachers={teachers}
        timeSlots={timeSlots}
        rooms={rooms}
        days={days}
        formatSemesterLabel={sem => sem?.name ?? ""}
        onSaveEdit={async () => {
          setShowEditModal(false);
          // Refresh timetable entries after delete or save
          try {
            const res = await fetch('/api/timetable-entries');
            if (res.ok) {
              const data = await res.json();
              setEntryList(data);
            }
          } catch {}
        }}
        initialSelectedDays={editEntry ? [...editEntry.dayIds].map(String) : []}
        editEntryId={editEntry ? editEntry.id : undefined}
        subjectId={editEntry ? editEntry.subjectId : undefined}
        addDepartmentId={
          editEntry
          ? (() => {
            const subject = subjects.find(s => s.id === editEntry.subjectId);
            return subject ? subject.degreeId : undefined;
            })()
          : undefined
        }
        addTimeSlotId={editEntry ? editEntry.timeSlotId : undefined}
        selectedTeacherId={selectedTeacher ? selectedTeacher.id : undefined}
      />

      <AddEntryModal
      show={showAddModal}
      setShowAddEntry={setShowAddModal}
      department={selectedDepartmentforAdd}
      timeSlot={selectedTimeSlotforAdd}
      subjects={subjects}
      rooms={rooms}
      teachers={teachers}
      semesterId={selectedSemesterId}
      refreshTimetable={refreshTimetable}
      />
    </div>
  );
};

export default Timetable;
