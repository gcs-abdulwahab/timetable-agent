// Types for our timetable data
export interface Department {
  id: string;
  name: string;
  shortName: string;
}

export interface Teacher {
  id: string;
  name: string;
  shortName: string;
  departmentId: string;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  departmentId: string;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  period: number;
}

export interface Class {
  id: string;
  year: number;
  section: string;
  dayType: 'first-three' | 'last-three' | 'all-days';
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  timeSlotId: string;
  day: string;
  room?: string;
  note?: string;
}

// Sample data
export const departments: Department[] = [
  { id: 'd1', name: 'Biotechnology G1', shortName: 'BBA G1' },
  { id: 'd1b', name: 'Biotechnology G2', shortName: 'BBA G2' },
  { id: 'd2', name: 'Chemistry', shortName: 'Chemistry' },
  { id: 'd3', name: 'Economics', shortName: 'Economics' },
  { id: 'd4', name: 'Education', shortName: 'Education' },
  { id: 'd5', name: 'English', shortName: 'English' },
  { id: 'd6', name: 'Computer Science G1', shortName: 'CS G1' },
  { id: 'd6b', name: 'Computer Science G2', shortName: 'CS G2' },
  { id: 'd7', name: 'Geography', shortName: 'Geography' },
  { id: 'd8', name: 'Mass Communication', shortName: 'Mass Com' },
  { id: 'd9', name: 'Mathematics', shortName: 'Mathematics' },
  { id: 'd10', name: 'Physics', shortName: 'Physics' },
  { id: 'd11', name: 'Political Science', shortName: 'Pol Science' },
  { id: 'd12', name: 'Sociology', shortName: 'Sociology' },
  { id: 'd13', name: 'Psychology', shortName: 'Psychology' },
  { id: 'd14', name: 'Statistics', shortName: 'Statistics' },
  { id: 'd15', name: 'Urdu', shortName: 'Urdu' },
  { id: 'd16', name: 'Zoology', shortName: 'Zoology' },
];

export const teachers: Teacher[] = [
  { id: 't1', name: 'Dr. Mehfooz Bhatti', shortName: 'Dr. Mehfooz Bhatti', departmentId: 'd1' },
  { id: 't1b', name: 'Dr. Farman Ali', shortName: 'Dr. Farman Ali', departmentId: 'd1b' },
  { id: 't2', name: 'Dr. Junaid Shareef', shortName: 'Dr. Junaid Shareef', departmentId: 'd2' },
  { id: 't3', name: 'Dr. Khalid', shortName: 'Dr. Khalid', departmentId: 'd6' },
  { id: 't3b', name: 'Prof. Ahmad', shortName: 'Prof. Ahmad', departmentId: 'd6b' },
  { id: 't4', name: 'Dr. M Tanveer', shortName: 'Dr. M Tanveer', departmentId: 'd9' },
  { id: 't5', name: 'Dr. Zafar', shortName: 'Dr. Zafar', departmentId: 'd10' },
  { id: 't6', name: 'Amjad Ali', shortName: 'Amjad Ali', departmentId: 'd5' },
  { id: 't7', name: 'Nisar Rahman Usmani', shortName: 'Nisar Rahman Usmani', departmentId: 'd7' },
  { id: 't8', name: 'Asim Khalid', shortName: 'Asim Khalid', departmentId: 'd11' },
  { id: 't9', name: 'Tauq Rashid', shortName: 'Tauq Rashid', departmentId: 'd14' },
  { id: 't10', name: 'Asif Warraich', shortName: 'Asif Warraich', departmentId: 'd4' },
  { id: 't11', name: 'Rao M Tariq', shortName: 'Rao M Tariq', departmentId: 'd3' },
  { id: 't12', name: 'M Sohaif Rana', shortName: 'M Sohaif Rana', departmentId: 'd15' },
  { id: 't13', name: 'Nauman', shortName: 'Nauman', departmentId: 'd16' },
  { id: 't14', name: 'CTI', shortName: 'CTI', departmentId: 'd12' },
  { id: 't15', name: 'Qasim Malik', shortName: 'Qasim Malik', departmentId: 'd13' },
  { id: 't16', name: 'Prof. Sarah', shortName: 'Prof. Sarah', departmentId: 'd8' },
];

export const subjects: Subject[] = [
  { id: 's1', name: 'Biology G1', shortName: 'BBA-101, G1, B21(1-3)', color: 'bg-blue-100', departmentId: 'd1' },
  { id: 's1b', name: 'Biology G2', shortName: 'BBA-101, G2, B22(4-6)', color: 'bg-blue-200', departmentId: 'd1b' },
  { id: 's2', name: 'Biotechnology G1', shortName: 'BBA-102, G1, B21(1-3)', color: 'bg-green-100', departmentId: 'd1' },
  { id: 's2b', name: 'Biotechnology G2', shortName: 'BBA-102, G2, B22(4-6)', color: 'bg-green-200', departmentId: 'd1b' },
  { id: 's3', name: 'Chemistry', shortName: 'GISL-101, R3(1-2)', color: 'bg-yellow-100', departmentId: 'd2' },
  { id: 's4', name: 'Economics', shortName: 'ECON-104, R-105(1-3)', color: 'bg-purple-100', departmentId: 'd3' },
  { id: 's5', name: 'Education', shortName: 'GISL-101, B11(1-2)', color: 'bg-pink-100', departmentId: 'd4' },
  { id: 's6', name: 'English', shortName: 'ELL-102, R3(1-3)', color: 'bg-indigo-100', departmentId: 'd5' },
  { id: 's7', name: 'Computer Science G1', shortName: 'CS-169, G1, R-124(1-3)', color: 'bg-gray-100', departmentId: 'd6' },
  { id: 's7b', name: 'Computer Science G2', shortName: 'CS-169, G2, R-125(4-6)', color: 'bg-gray-200', departmentId: 'd6b' },
  { id: 's8', name: 'Geography', shortName: 'Geog-101 R-132(4-6)', color: 'bg-emerald-100', departmentId: 'd7' },
  { id: 's9', name: 'Mass Communication', shortName: 'BSCS-102, B17(4-6)', color: 'bg-orange-100', departmentId: 'd8' },
  { id: 's10', name: 'Mathematics', shortName: 'MATH-101 R-124(1-2)', color: 'bg-red-100', departmentId: 'd9' },
  { id: 's11', name: 'Physics', shortName: 'APHL-122, R-78(1-2)', color: 'bg-teal-100', departmentId: 'd10' },
  { id: 's12', name: 'Political Science', shortName: 'PS-xxx, B23(4-6)', color: 'bg-cyan-100', departmentId: 'd11' },
  { id: 's13', name: 'Sociology', shortName: 'GCCE-101, B13(2-3)', color: 'bg-lime-100', departmentId: 'd12' },
  { id: 's14', name: 'Psychology', shortName: 'APSY-111A, B-16(4-6)', color: 'bg-amber-100', departmentId: 'd13' },
  { id: 's15', name: 'Statistics', shortName: 'STAT-101, R-136(1-3)', color: 'bg-rose-100', departmentId: 'd14' },
  { id: 's16', name: 'Urdu', shortName: 'GCCE-101, B15(2-3)', color: 'bg-violet-100', departmentId: 'd15' },
  { id: 's17', name: 'Zoology', shortName: 'ZOOL-103, B25(4-6)', color: 'bg-sky-100', departmentId: 'd16' },
];

export const timeSlots: TimeSlot[] = [
  { id: 'ts1', start: '8:00', end: '9:00', period: 1 },
  { id: 'ts2', start: '9:00', end: '10:00', period: 2 },
  { id: 'ts3', start: '10:00', end: '11:00', period: 3 },
  { id: 'ts4', start: '11:15', end: '12:15', period: 4 },
  { id: 'ts5', start: '12:15', end: '1:15', period: 5 },
  { id: 'ts6', start: '1:30', end: '2:30', period: 6 },
  { id: 'ts7', start: '2:30', end: '3:30', period: 7 },
];

export const classes: Class[] = [
  { id: 'c1', year: 1, section: 'A', dayType: 'first-three' },
  { id: 'c2', year: 1, section: 'B', dayType: 'first-three' },
  { id: 'c3', year: 1, section: 'C', dayType: 'last-three' },
  { id: 'c4', year: 2, section: 'A', dayType: 'first-three' },
  { id: 'c5', year: 2, section: 'B', dayType: 'last-three' },
  { id: 'c6', year: 3, section: 'A', dayType: 'all-days' },
  { id: 'c7', year: 3, section: 'B', dayType: 'all-days' },
  { id: 'c8', year: 4, section: 'A', dayType: 'first-three' },
  { id: 'c9', year: 4, section: 'B', dayType: 'last-three' },
];

export const timetableEntries: TimetableEntry[] = [
  // Period 1 (8:00-9:00) - ALL DEPARTMENTS
  // CS G1 - Monday to Wednesday
  { id: 'e1', subjectId: 's1', teacherId: 't1', classId: 'c1', timeSlotId: 'ts1', day: 'Monday', room: 'B21' },
  { id: 'e2', subjectId: 's2', teacherId: 't2', classId: 'c1', timeSlotId: 'ts1', day: 'Tuesday', room: 'B21' },
  { id: 'e3', subjectId: 's3', teacherId: 't3', classId: 'c1', timeSlotId: 'ts1', day: 'Wednesday', room: 'B21' },
  
  // CS G2 - Thursday to Saturday  
  { id: 'e4', subjectId: 's1b', teacherId: 't1b', classId: 'c3', timeSlotId: 'ts1', day: 'Thursday', room: 'B22' },
  { id: 'e5', subjectId: 's2b', teacherId: 't2b', classId: 'c3', timeSlotId: 'ts1', day: 'Friday', room: 'B22' },
  { id: 'e6', subjectId: 's3b', teacherId: 't3b', classId: 'c3', timeSlotId: 'ts1', day: 'Saturday', room: 'B22' },
  
  // BBA G1 - Monday to Wednesday
  { id: 'e7', subjectId: 's7', teacherId: 't7', classId: 'c4', timeSlotId: 'ts1', day: 'Monday', room: 'R124' },
  { id: 'e8', subjectId: 's8', teacherId: 't8', classId: 'c4', timeSlotId: 'ts1', day: 'Tuesday', room: 'R124' },
  { id: 'e9', subjectId: 's9', teacherId: 't9', classId: 'c4', timeSlotId: 'ts1', day: 'Wednesday', room: 'R124' },
  
  // BBA G2 - Thursday to Saturday
  { id: 'e10', subjectId: 's7b', teacherId: 't7b', classId: 'c5', timeSlotId: 'ts1', day: 'Thursday', room: 'R125' },
  { id: 'e11', subjectId: 's8b', teacherId: 't8b', classId: 'c5', timeSlotId: 'ts1', day: 'Friday', room: 'R125' },
  { id: 'e12', subjectId: 's9b', teacherId: 't9b', classId: 'c5', timeSlotId: 'ts1', day: 'Saturday', room: 'R125' },
  
  // Other departments - spread across days
  { id: 'e13', subjectId: 's10', teacherId: 't10', classId: 'c2', timeSlotId: 'ts1', day: 'Monday', room: 'R3' },
  { id: 'e14', subjectId: 's11', teacherId: 't11', classId: 'c6', timeSlotId: 'ts1', day: 'Tuesday', room: 'R105' },
  { id: 'e15', subjectId: 's12', teacherId: 't12', classId: 'c7', timeSlotId: 'ts1', day: 'Wednesday', room: 'B15' },
  { id: 'e16', subjectId: 's13', teacherId: 't13', classId: 'c8', timeSlotId: 'ts1', day: 'Thursday', room: 'B25' },
  { id: 'e17', subjectId: 's14', teacherId: 't14', classId: 'c9', timeSlotId: 'ts1', day: 'Friday', room: 'B16' },
  { id: 'e18', subjectId: 's15', teacherId: 't15', classId: 'c10', timeSlotId: 'ts1', day: 'Saturday', room: 'R136' },

  // Period 2 (9:00-10:00) - ALL DEPARTMENTS
  { id: 'e19', subjectId: 's4', teacherId: 't4', classId: 'c1', timeSlotId: 'ts2', day: 'Monday', room: 'B21' },
  { id: 'e20', subjectId: 's5', teacherId: 't5', classId: 'c1', timeSlotId: 'ts2', day: 'Tuesday', room: 'B21' },
  { id: 'e21', subjectId: 's6', teacherId: 't6', classId: 'c1', timeSlotId: 'ts2', day: 'Wednesday', room: 'B21' },
  
  { id: 'e22', subjectId: 's4b', teacherId: 't4b', classId: 'c3', timeSlotId: 'ts2', day: 'Thursday', room: 'B22' },
  { id: 'e23', subjectId: 's5b', teacherId: 't5b', classId: 'c3', timeSlotId: 'ts2', day: 'Friday', room: 'B22' },
  { id: 'e24', subjectId: 's6b', teacherId: 't6b', classId: 'c3', timeSlotId: 'ts2', day: 'Saturday', room: 'B22' },
  
  { id: 'e25', subjectId: 's10', teacherId: 't16', classId: 'c4', timeSlotId: 'ts2', day: 'Monday', room: 'R124' },
  { id: 'e26', subjectId: 's11', teacherId: 't17', classId: 'c4', timeSlotId: 'ts2', day: 'Tuesday', room: 'R124' },
  { id: 'e27', subjectId: 's12', teacherId: 't18', classId: 'c4', timeSlotId: 'ts2', day: 'Wednesday', room: 'R124' },
  
  { id: 'e28', subjectId: 's10b', teacherId: 't10b', classId: 'c5', timeSlotId: 'ts2', day: 'Thursday', room: 'R125' },
  { id: 'e29', subjectId: 's11b', teacherId: 't11b', classId: 'c5', timeSlotId: 'ts2', day: 'Friday', room: 'R125' },
  { id: 'e30', subjectId: 's12b', teacherId: 't12b', classId: 'c5', timeSlotId: 'ts2', day: 'Saturday', room: 'R125' },
  
  { id: 'e31', subjectId: 's13', teacherId: 't1', classId: 'c2', timeSlotId: 'ts2', day: 'Monday', room: 'R3' },
  { id: 'e32', subjectId: 's14', teacherId: 't2', classId: 'c6', timeSlotId: 'ts2', day: 'Tuesday', room: 'R105' },
  { id: 'e33', subjectId: 's15', teacherId: 't3', classId: 'c7', timeSlotId: 'ts2', day: 'Wednesday', room: 'B15' },
  { id: 'e34', subjectId: 's16', teacherId: 't7', classId: 'c8', timeSlotId: 'ts2', day: 'Thursday', room: 'B25' },
  { id: 'e35', subjectId: 's17', teacherId: 't8', classId: 'c9', timeSlotId: 'ts2', day: 'Friday', room: 'B16' },
  { id: 'e36', subjectId: 's1', teacherId: 't9', classId: 'c10', timeSlotId: 'ts2', day: 'Saturday', room: 'R136' },

  // Period 3 (10:00-11:00) - ALL DEPARTMENTS
  { id: 'e37', subjectId: 's1', teacherId: 't10', classId: 'c1', timeSlotId: 'ts3', day: 'Monday', room: 'B21' },
  { id: 'e38', subjectId: 's2', teacherId: 't11', classId: 'c1', timeSlotId: 'ts3', day: 'Tuesday', room: 'B21' },
  { id: 'e39', subjectId: 's3', teacherId: 't12', classId: 'c1', timeSlotId: 'ts3', day: 'Wednesday', room: 'B21' },
  
  { id: 'e40', subjectId: 's1b', teacherId: 't13', classId: 'c3', timeSlotId: 'ts3', day: 'Thursday', room: 'B22' },
  { id: 'e41', subjectId: 's2b', teacherId: 't14', classId: 'c3', timeSlotId: 'ts3', day: 'Friday', room: 'B22' },
  { id: 'e42', subjectId: 's3b', teacherId: 't15', classId: 'c3', timeSlotId: 'ts3', day: 'Saturday', room: 'B22' },
  
  { id: 'e43', subjectId: 's7', teacherId: 't16', classId: 'c4', timeSlotId: 'ts3', day: 'Monday', room: 'R124' },
  { id: 'e44', subjectId: 's8', teacherId: 't17', classId: 'c4', timeSlotId: 'ts3', day: 'Tuesday', room: 'R124' },
  { id: 'e45', subjectId: 's9', teacherId: 't18', classId: 'c4', timeSlotId: 'ts3', day: 'Wednesday', room: 'R124' },
  
  { id: 'e46', subjectId: 's7b', teacherId: 't1', classId: 'c5', timeSlotId: 'ts3', day: 'Thursday', room: 'R125' },
  { id: 'e47', subjectId: 's8b', teacherId: 't2', classId: 'c5', timeSlotId: 'ts3', day: 'Friday', room: 'R125' },
  { id: 'e48', subjectId: 's9b', teacherId: 't3', classId: 'c5', timeSlotId: 'ts3', day: 'Saturday', room: 'R125' },
  
  { id: 'e49', subjectId: 's10', teacherId: 't4', classId: 'c2', timeSlotId: 'ts3', day: 'Monday', room: 'R3' },
  { id: 'e50', subjectId: 's11', teacherId: 't5', classId: 'c6', timeSlotId: 'ts3', day: 'Tuesday', room: 'R105' },
  { id: 'e51', subjectId: 's12', teacherId: 't6', classId: 'c7', timeSlotId: 'ts3', day: 'Wednesday', room: 'B15' },
  { id: 'e52', subjectId: 's13', teacherId: 't7', classId: 'c8', timeSlotId: 'ts3', day: 'Thursday', room: 'B25' },
  { id: 'e53', subjectId: 's14', teacherId: 't8', classId: 'c9', timeSlotId: 'ts3', day: 'Friday', room: 'B16' },
  { id: 'e54', subjectId: 's15', teacherId: 't9', classId: 'c10', timeSlotId: 'ts3', day: 'Saturday', room: 'R136' },

  // Period 4 (11:15-12:15) - ALL DEPARTMENTS
  { id: 'e55', subjectId: 's4', teacherId: 't1b', classId: 'c1', timeSlotId: 'ts4', day: 'Monday', room: 'B21' },
  { id: 'e56', subjectId: 's5', teacherId: 't2b', classId: 'c1', timeSlotId: 'ts4', day: 'Tuesday', room: 'B21' },
  { id: 'e57', subjectId: 's6', teacherId: 't3b', classId: 'c1', timeSlotId: 'ts4', day: 'Wednesday', room: 'B21' },
  
  { id: 'e58', subjectId: 's4b', teacherId: 't10', classId: 'c3', timeSlotId: 'ts4', day: 'Thursday', room: 'B22' },
  { id: 'e59', subjectId: 's5b', teacherId: 't11', classId: 'c3', timeSlotId: 'ts4', day: 'Friday', room: 'B22' },
  { id: 'e60', subjectId: 's6b', teacherId: 't12', classId: 'c3', timeSlotId: 'ts4', day: 'Saturday', room: 'B22' },
  
  { id: 'e61', subjectId: 's10', teacherId: 't4b', classId: 'c4', timeSlotId: 'ts4', day: 'Monday', room: 'R124' },
  { id: 'e62', subjectId: 's11', teacherId: 't5b', classId: 'c4', timeSlotId: 'ts4', day: 'Tuesday', room: 'R124' },
  { id: 'e63', subjectId: 's12', teacherId: 't6b', classId: 'c4', timeSlotId: 'ts4', day: 'Wednesday', room: 'R124' },
  
  { id: 'e64', subjectId: 's10b', teacherId: 't13', classId: 'c5', timeSlotId: 'ts4', day: 'Thursday', room: 'R125' },
  { id: 'e65', subjectId: 's11b', teacherId: 't14', classId: 'c5', timeSlotId: 'ts4', day: 'Friday', room: 'R125' },
  { id: 'e66', subjectId: 's12b', teacherId: 't15', classId: 'c5', timeSlotId: 'ts4', day: 'Saturday', room: 'R125' },
  
  { id: 'e67', subjectId: 's13', teacherId: 't7b', classId: 'c2', timeSlotId: 'ts4', day: 'Monday', room: 'R3' },
  { id: 'e68', subjectId: 's14', teacherId: 't8b', classId: 'c6', timeSlotId: 'ts4', day: 'Tuesday', room: 'R105' },
  { id: 'e69', subjectId: 's15', teacherId: 't9b', classId: 'c7', timeSlotId: 'ts4', day: 'Wednesday', room: 'B15' },
  { id: 'e70', subjectId: 's16', teacherId: 't16', classId: 'c8', timeSlotId: 'ts4', day: 'Thursday', room: 'B25' },
  { id: 'e71', subjectId: 's17', teacherId: 't17', classId: 'c9', timeSlotId: 'ts4', day: 'Friday', room: 'B16' },
  { id: 'e72', subjectId: 's1', teacherId: 't18', classId: 'c10', timeSlotId: 'ts4', day: 'Saturday', room: 'R136' },

  // Period 5 (12:15-1:15) - ALL DEPARTMENTS
  { id: 'e73', subjectId: 's1', teacherId: 't1', classId: 'c1', timeSlotId: 'ts5', day: 'Monday', room: 'B21' },
  { id: 'e74', subjectId: 's2', teacherId: 't2', classId: 'c1', timeSlotId: 'ts5', day: 'Tuesday', room: 'B21' },
  { id: 'e75', subjectId: 's3', teacherId: 't3', classId: 'c1', timeSlotId: 'ts5', day: 'Wednesday', room: 'B21' },
  
  { id: 'e76', subjectId: 's1b', teacherId: 't1b', classId: 'c3', timeSlotId: 'ts5', day: 'Thursday', room: 'B22' },
  { id: 'e77', subjectId: 's2b', teacherId: 't2b', classId: 'c3', timeSlotId: 'ts5', day: 'Friday', room: 'B22' },
  { id: 'e78', subjectId: 's3b', teacherId: 't3b', classId: 'c3', timeSlotId: 'ts5', day: 'Saturday', room: 'B22' },
  
  { id: 'e79', subjectId: 's7', teacherId: 't7', classId: 'c4', timeSlotId: 'ts5', day: 'Monday', room: 'R124' },
  { id: 'e80', subjectId: 's8', teacherId: 't8', classId: 'c4', timeSlotId: 'ts5', day: 'Tuesday', room: 'R124' },
  { id: 'e81', subjectId: 's9', teacherId: 't9', classId: 'c4', timeSlotId: 'ts5', day: 'Wednesday', room: 'R124' },
  
  { id: 'e82', subjectId: 's7b', teacherId: 't7b', classId: 'c5', timeSlotId: 'ts5', day: 'Thursday', room: 'R125' },
  { id: 'e83', subjectId: 's8b', teacherId: 't8b', classId: 'c5', timeSlotId: 'ts5', day: 'Friday', room: 'R125' },
  { id: 'e84', subjectId: 's9b', teacherId: 't9b', classId: 'c5', timeSlotId: 'ts5', day: 'Saturday', room: 'R125' },
  
  { id: 'e85', subjectId: 's10', teacherId: 't10', classId: 'c2', timeSlotId: 'ts5', day: 'Monday', room: 'R3' },
  { id: 'e86', subjectId: 's11', teacherId: 't11', classId: 'c6', timeSlotId: 'ts5', day: 'Tuesday', room: 'R105' },
  { id: 'e87', subjectId: 's12', teacherId: 't12', classId: 'c7', timeSlotId: 'ts5', day: 'Wednesday', room: 'B15' },
  { id: 'e88', subjectId: 's13', teacherId: 't13', classId: 'c8', timeSlotId: 'ts5', day: 'Thursday', room: 'B25' },
  { id: 'e89', subjectId: 's14', teacherId: 't14', classId: 'c9', timeSlotId: 'ts5', day: 'Friday', room: 'B16' },
  { id: 'e90', subjectId: 's15', teacherId: 't15', classId: 'c10', timeSlotId: 'ts5', day: 'Saturday', room: 'R136' },

  // Period 6 (1:30-2:30) - ALL DEPARTMENTS
  { id: 'e91', subjectId: 's4', teacherId: 't4', classId: 'c1', timeSlotId: 'ts6', day: 'Monday', room: 'B21' },
  { id: 'e92', subjectId: 's5', teacherId: 't5', classId: 'c1', timeSlotId: 'ts6', day: 'Tuesday', room: 'B21' },
  { id: 'e93', subjectId: 's6', teacherId: 't6', classId: 'c1', timeSlotId: 'ts6', day: 'Wednesday', room: 'B21' },
  
  { id: 'e94', subjectId: 's4b', teacherId: 't4b', classId: 'c3', timeSlotId: 'ts6', day: 'Thursday', room: 'B22' },
  { id: 'e95', subjectId: 's5b', teacherId: 't5b', classId: 'c3', timeSlotId: 'ts6', day: 'Friday', room: 'B22' },
  { id: 'e96', subjectId: 's6b', teacherId: 't6b', classId: 'c3', timeSlotId: 'ts6', day: 'Saturday', room: 'B22' },
  
  { id: 'e97', subjectId: 's10', teacherId: 't16', classId: 'c4', timeSlotId: 'ts6', day: 'Monday', room: 'R124' },
  { id: 'e98', subjectId: 's11', teacherId: 't17', classId: 'c4', timeSlotId: 'ts6', day: 'Tuesday', room: 'R124' },
  { id: 'e99', subjectId: 's12', teacherId: 't18', classId: 'c4', timeSlotId: 'ts6', day: 'Wednesday', room: 'R124' },
  
  { id: 'e100', subjectId: 's10b', teacherId: 't10b', classId: 'c5', timeSlotId: 'ts6', day: 'Thursday', room: 'R125' },
  { id: 'e101', subjectId: 's11b', teacherId: 't11b', classId: 'c5', timeSlotId: 'ts6', day: 'Friday', room: 'R125' },
  { id: 'e102', subjectId: 's12b', teacherId: 't12b', classId: 'c5', timeSlotId: 'ts6', day: 'Saturday', room: 'R125' },
  
  { id: 'e103', subjectId: 's13', teacherId: 't1', classId: 'c2', timeSlotId: 'ts6', day: 'Monday', room: 'R3' },
  { id: 'e104', subjectId: 's14', teacherId: 't2', classId: 'c6', timeSlotId: 'ts6', day: 'Tuesday', room: 'R105' },
  { id: 'e105', subjectId: 's15', teacherId: 't3', classId: 'c7', timeSlotId: 'ts6', day: 'Wednesday', room: 'B15' },
  { id: 'e106', subjectId: 's16', teacherId: 't7', classId: 'c8', timeSlotId: 'ts6', day: 'Thursday', room: 'B25' },
  { id: 'e107', subjectId: 's17', teacherId: 't8', classId: 'c9', timeSlotId: 'ts6', day: 'Friday', room: 'B16' },
  { id: 'e108', subjectId: 's1', teacherId: 't9', classId: 'c10', timeSlotId: 'ts6', day: 'Saturday', room: 'R136' },

  // Period 7 (2:30-3:30) - ALL DEPARTMENTS
  { id: 'e109', subjectId: 's1', teacherId: 't10', classId: 'c1', timeSlotId: 'ts7', day: 'Monday', room: 'B21' },
  { id: 'e110', subjectId: 's2', teacherId: 't11', classId: 'c1', timeSlotId: 'ts7', day: 'Tuesday', room: 'B21' },
  { id: 'e111', subjectId: 's3', teacherId: 't12', classId: 'c1', timeSlotId: 'ts7', day: 'Wednesday', room: 'B21' },
  
  { id: 'e112', subjectId: 's1b', teacherId: 't13', classId: 'c3', timeSlotId: 'ts7', day: 'Thursday', room: 'B22' },
  { id: 'e113', subjectId: 's2b', teacherId: 't14', classId: 'c3', timeSlotId: 'ts7', day: 'Friday', room: 'B22' },
  { id: 'e114', subjectId: 's3b', teacherId: 't15', classId: 'c3', timeSlotId: 'ts7', day: 'Saturday', room: 'B22' },
  
  { id: 'e115', subjectId: 's7', teacherId: 't16', classId: 'c4', timeSlotId: 'ts7', day: 'Monday', room: 'R124' },
  { id: 'e116', subjectId: 's8', teacherId: 't17', classId: 'c4', timeSlotId: 'ts7', day: 'Tuesday', room: 'R124' },
  { id: 'e117', subjectId: 's9', teacherId: 't18', classId: 'c4', timeSlotId: 'ts7', day: 'Wednesday', room: 'R124' },
  
  { id: 'e118', subjectId: 's7b', teacherId: 't1', classId: 'c5', timeSlotId: 'ts7', day: 'Thursday', room: 'R125' },
  { id: 'e119', subjectId: 's8b', teacherId: 't2', classId: 'c5', timeSlotId: 'ts7', day: 'Friday', room: 'R125' },
  { id: 'e120', subjectId: 's9b', teacherId: 't3', classId: 'c5', timeSlotId: 'ts7', day: 'Saturday', room: 'R125' },
  
  { id: 'e121', subjectId: 's10', teacherId: 't4', classId: 'c2', timeSlotId: 'ts7', day: 'Monday', room: 'R3' },
  { id: 'e122', subjectId: 's11', teacherId: 't5', classId: 'c6', timeSlotId: 'ts7', day: 'Tuesday', room: 'R105' },
  { id: 'e123', subjectId: 's12', teacherId: 't6', classId: 'c7', timeSlotId: 'ts7', day: 'Wednesday', room: 'B15' },
  { id: 'e124', subjectId: 's13', teacherId: 't7', classId: 'c8', timeSlotId: 'ts7', day: 'Thursday', room: 'B25' },
  { id: 'e125', subjectId: 's14', teacherId: 't8', classId: 'c9', timeSlotId: 'ts7', day: 'Friday', room: 'B16' },
  { id: 'e126', subjectId: 's15', teacherId: 't9', classId: 'c10', timeSlotId: 'ts7', day: 'Saturday', room: 'R136' },
];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
