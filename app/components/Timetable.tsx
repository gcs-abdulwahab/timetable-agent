'use client';
import {
    daysOfWeek,
    departments,
    subjects,
    teachers,
    timeSlots,
    timetableEntries,
    TimetableEntry
} from './data';

const Timetable: React.FC = () => {
  // Helper function to get subject by ID
  const getSubject = (id: string) => subjects.find(s => s.id === id);
  
  // Helper function to get teacher by ID
  const getTeacher = (id: string) => teachers.find(t => t.id === id);
  
  // Helper function to get class by ID
  // const getClass = (id: string) => classes.find(c => c.id === id);

  // Helper function to get entries for a specific day and time slot
  const getEntriesForSlot = (day: string, timeSlotId: string): TimetableEntry[] => {
    return timetableEntries.filter(entry => 
      entry.day === day && (
        entry.timeSlotId === timeSlotId || 
        (entry.endTimeSlotId && entry.timeSlotId <= timeSlotId && entry.endTimeSlotId >= timeSlotId)
      )
    );
  };

  // Helper function to check if an entry spans multiple periods
  const getSpanCount = (entry: TimetableEntry): number => {
    if (!entry.endTimeSlotId) return 1;
    
    const startPeriod = timeSlots.find(ts => ts.id === entry.timeSlotId)?.period || 1;
    const endPeriod = timeSlots.find(ts => ts.id === entry.endTimeSlotId)?.period || 1;
    
    return endPeriod - startPeriod + 1;
  };

  // Helper function to check if this is the first occurrence of a multi-period entry
  const isFirstOccurrence = (entry: TimetableEntry, currentTimeSlotId: string): boolean => {
    return entry.timeSlotId === currentTimeSlotId;
  };

  // Helper function to create cell content
  const createCellContent = (entries: TimetableEntry[], currentTimeSlotId: string) => {
    if (entries.length === 0) return null;

    return entries.map((entry) => {
      const subject = getSubject(entry.subjectId);
      const teacher = getTeacher(entry.teacherId);
      const spanCount = getSpanCount(entry);
      const isFirst = isFirstOccurrence(entry, currentTimeSlotId);
      
      // For multi-period entries, only show content in the first cell
      if (entry.endTimeSlotId && !isFirst) {
        return null;
      }
      
      return (
        <div 
          key={entry.id} 
          className={`p-1 m-0.5 rounded text-xs border ${subject?.color || 'bg-gray-100'} ${
            entry.isLab ? 'border-2 border-dashed border-blue-500' : ''
          }`}
          style={{ 
            fontSize: '9px', 
            lineHeight: '1.1',
            position: entry.endTimeSlotId ? 'relative' : 'static',
            zIndex: entry.endTimeSlotId ? 10 : 'auto',
            height: entry.endTimeSlotId ? `${spanCount * 80 - 4}px` : 'auto',
            minHeight: entry.endTimeSlotId ? `${spanCount * 80 - 4}px` : 'auto'
          }}
        >
          <div className="font-semibold text-gray-800 mb-0.5">
            {subject?.shortName}
            {entry.isLab && <span className="text-blue-600 ml-1">(LAB)</span>}
          </div>
          <div className="text-gray-600 truncate text-xs">
            {teacher?.shortName}
          </div>
          {entry.endTimeSlotId && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              {timeSlots.find(ts => ts.id === entry.timeSlotId)?.start} - 
              {timeSlots.find(ts => ts.id === entry.endTimeSlotId)?.end}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
      {/* Semester Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold text-center">Semester 1 - Timetable</h2>
      </div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-xs font-bold text-gray-700 w-24">
              Periods
            </th>
            {daysOfWeek.map(day => (
              <th key={day} className="border border-gray-300 p-2 text-xs font-bold text-gray-700 min-w-[200px]">
                {day}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-1 text-xs text-gray-600"></th>
            {daysOfWeek.map(day => (
              <th key={day} className="border border-gray-300 p-1 text-xs text-gray-600">
                {/* You can add date headers here if needed */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => (
            <tr key={timeSlot.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 text-center bg-gray-100">
                <div className="text-xs font-bold text-gray-700">
                  {timeSlot.period}
                </div>
                <div className="text-xs text-gray-600">
                  {timeSlot.start}-{timeSlot.end}
                </div>
              </td>
              {daysOfWeek.map(day => {
                const entries = getEntriesForSlot(day, timeSlot.id);
                return (
                  <td 
                    key={`${day}-${timeSlot.id}`} 
                    className="border border-gray-300 p-1 align-top min-h-[80px] max-w-[200px]"
                  >
                    {createCellContent(entries, timeSlot.id)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Subject Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${subject.color} border`}></div>
              <span className="text-sm text-gray-700">
                {subject.shortName} - {subject.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Teachers List by Department */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Teachers by Department</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(department => {
            const departmentTeachers = teachers.filter(teacher => teacher.departmentId === department.id);
            if (departmentTeachers.length === 0) return null;
            
            return (
              <div key={department.id} className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                  {department.name} ({department.shortName})
                </h4>
                <div className="space-y-1">
                  {departmentTeachers.map(teacher => (
                    <div key={teacher.id} className="text-xs text-gray-600">
                      {teacher.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
