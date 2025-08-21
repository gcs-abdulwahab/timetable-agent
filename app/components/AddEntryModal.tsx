import React from "react";


interface Subject {
  id: number;
  name: string;
  departmentId: number;
  semesterId?: number;
}

interface Room {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface AddEntryModalProps {
  show: boolean;
  setShowAddEntry: (show: boolean) => void;
  department?: { id: number; name: string };
  timeSlot?: { id: number; period: string | number; start?: string; end?: string };
  subjects?: Subject[];
  rooms?: Room[];
  teachers?: Teacher[];
  semesterId?: number;
  onEntryAdded?: () => void;
  refreshTimetable?: () => void;
  entryAdded?: boolean;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ show, setShowAddEntry, department, timeSlot, subjects = [], rooms = [], teachers = [], semesterId, onEntryAdded, refreshTimetable, entryAdded }) => {
  const [localEntryAdded, setLocalEntryAdded] = React.useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<number | undefined>(undefined);
  const [selectedRoomId, setSelectedRoomId] = React.useState<number | undefined>(undefined);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<number | undefined>(undefined);
  const [alertMsg, setAlertMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalEntryAdded(false);
    setSelectedSubjectId(undefined);
    setSelectedRoomId(undefined);
    setSelectedTeacherId(undefined);
  }, [show, department, timeSlot]);

  const filteredSubjects = department && semesterId
    ? subjects.filter(s => s.departmentId === department.id && s.semesterId === semesterId)
    : [];

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Add Timetable Entry</h2>
        <form
          onSubmit={async e => {
            e.preventDefault();
            const entry = {
              subjectId: selectedSubjectId,
              timeSlotId: timeSlot?.id,
              roomId: selectedRoomId,
              teacherId: selectedTeacherId,
            };
            try {
              const res = await fetch('/api/timetable-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
              });
              if (res.ok) {
                setAlertMsg('Entry added successfully!');
                setLocalEntryAdded(true);
                if (onEntryAdded) onEntryAdded();
                if (refreshTimetable) refreshTimetable();
                setTimeout(() => {
                  setShowAddEntry(false);
                  setAlertMsg(null);
                }, 1200);
              } else {
                setAlertMsg('Failed to add entry.');
              }
            } catch (err) {
              setAlertMsg('Error adding entry.');
            }
          }}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Semester ID</label>
            <input
              type="text"
              className="w-full border rounded p-2 bg-gray-100"
              value={semesterId ?? ""}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              className="w-full border rounded p-2 bg-gray-100"
              value={department?.name ?? ""}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">TimeSlot</label>
            <input
              type="text"
              className="w-full border rounded p-2 bg-gray-100"
              value={timeSlot?.period ?? ""}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select
              className="w-full border rounded p-2"
              value={selectedSubjectId ?? ""}
              onChange={e => setSelectedSubjectId(Number(e.target.value))}
              required
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Room</label>
            <select
              className="w-full border rounded p-2"
              value={selectedRoomId ?? ""}
              onChange={e => setSelectedRoomId(Number(e.target.value))}
              required
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Teacher</label>
            <select
              className="w-full border rounded p-2"
              value={selectedTeacherId ?? ""}
              onChange={e => setSelectedTeacherId(e.target.value === "" ? undefined : Number(e.target.value))}
            >
              <option value="">No Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setShowAddEntry(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Add Entry
            </button>
          </div>
        </form>
        {alertMsg && (
          <div className={`mt-4 text-sm ${alertMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{alertMsg}</div>
        )}
      </div>
    </div>
  );
};

export default AddEntryModal;
