'use client';
import { 
  teachers, 
  subjects, 
  timeSlots, 
  classes, 
  timetableEntries, 
  daysOfWeek,
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
      entry.day === day && entry.timeSlotId === timeSlotId
    );
  };

  // Helper function to create cell content
  const createCellContent = (entries: TimetableEntry[]) => {
    if (entries.length === 0) return null;

    return entries.map((entry) => {
      const subject = getSubject(entry.subjectId);
      const teacher = getTeacher(entry.teacherId);
      
      return (
        <div 
          key={entry.id} 
          className={`p-1 m-0.5 rounded text-xs border ${subject?.color || 'bg-gray-100'}`}
          style={{ fontSize: '9px', lineHeight: '1.1' }}
        >
          <div className="font-semibold text-gray-800 mb-0.5">
            {subject?.shortName}
          </div>
          <div className="text-gray-600 truncate text-xs">
            {teacher?.shortName}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
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
                    {createCellContent(entries)}
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

      {/* Teachers List */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Teachers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {teachers.map(teacher => (
            <div key={teacher.id} className="text-sm text-gray-700">
              {teacher.name}
            </div>
          ))}
        </div>
      </div>

      {/* Class Information */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Classes & Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">First Three Days (Mon-Wed)</h4>
            <div className="space-y-1">
              {classes.filter(c => c.dayType === 'first-three').map(cls => (
                <div key={cls.id} className="text-sm text-gray-600">
                  Year {cls.year} - Section {cls.section}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Last Three Days (Thu-Sat)</h4>
            <div className="space-y-1">
              {classes.filter(c => c.dayType === 'last-three').map(cls => (
                <div key={cls.id} className="text-sm text-gray-600">
                  Year {cls.year} - Section {cls.section}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">All Days</h4>
            <div className="space-y-1">
              {classes.filter(c => c.dayType === 'all-days').map(cls => (
                <div key={cls.id} className="text-sm text-gray-600">
                  Year {cls.year} - Section {cls.section}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
