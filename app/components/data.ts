// Types for our timetable data
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean; // Indicates if the department offers BS degree programs
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: 'Spring' | 'Fall';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  shortName?: string;
  departmentId: string;
  designation?: string;
  contactNumber?: string;
  email?: string;
  dateOfBirth?: string;
  seniority?: number;
  cnic?: string;
  personnelNumber?: string;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  code: string; // Course code like CS-101, MATH-201, etc.
  creditHours: number;
  color: string;
  departmentId: string;
  semesterLevel: number; // 1-8 for BS programs
  isCore: boolean; // Core vs Elective
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  period: number;
}

export interface Room {
  id: string;
  name: string; // Unique room name like "CS-Lab1", "R-101", etc.
  capacity: number; // Number of students the room can accommodate
  type?: 'Classroom' | 'Laboratory' | 'Auditorium' | 'Conference' | 'Other';
  building?: string;
  floor?: number;
  hasProjector?: boolean;
  hasAC?: boolean;
  description?: string;
  programTypes: ('Inter' | 'BS')[]; // Which programs can use this room
  primaryDepartmentId?: string; // Primary department for BS rooms
  availableForOtherDepartments?: boolean; // Can other departments use this room
}

export interface TimetableEntry {
  id: string;
  semesterId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  day: string;
  room?: string;
  note?: string;
  endTimeSlotId?: string; // For spanning multiple periods (e.g., labs)
  isLab?: boolean; // Flag to identify lab sessions
}

// Sample data
export const semesters: Semester[] = [
  {
    id: 'sem1',
    name: 'Semester 1',
    year: 2024,
    term: 'Fall',
    isActive: true,
    startDate: '2024-09-01',
    endDate: '2024-12-20'
  },
  {
    id: 'sem3',
    name: 'Semester 3',
    year: 2025,
    term: 'Spring',
    isActive: true,
    startDate: '2025-01-15',
    endDate: '2025-05-15'
  },
  {
    id: 'sem5',
    name: 'Semester 5',
    year: 2025,
    term: 'Fall',
    isActive: true,
    startDate: '2025-09-01',
    endDate: '2025-12-20'
  },
  {
    id: 'sem7',
    name: 'Semester 7',
    year: 2026,
    term: 'Spring',
    isActive: true,
    startDate: '2026-01-15',
    endDate: '2026-05-15'
  }
];

export const departments: Department[] = [
  { id: 'd1', name: 'Biotechnology', shortName: 'Biotech', offersBSDegree: true },
  { id: 'd20', name: 'Business Administration', shortName: 'BBA', offersBSDegree: true },
  { id: 'd2', name: 'Chemistry', shortName: 'Chemistry', offersBSDegree: true },
  { id: 'd6', name: 'Computer Science', shortName: 'CS', offersBSDegree: true },
  { id: 'd3', name: 'Economics', shortName: 'Economics', offersBSDegree: true },
  { id: 'd4', name: 'Education', shortName: 'Education', offersBSDegree: true },
  { id: 'd5', name: 'English', shortName: 'English', offersBSDegree: true },
  { id: 'd7', name: 'Geography', shortName: 'Geography', offersBSDegree: true },
  { id: 'd17', name: 'History', shortName: 'History', offersBSDegree: false },
  { id: 'd18', name: 'Islamic Studies', shortName: 'Islamic Studies', offersBSDegree: true },
  { id: 'd8', name: 'Mass Communication', shortName: 'Mass Com', offersBSDegree: true },
  { id: 'd9', name: 'Mathematics', shortName: 'Mathematics', offersBSDegree: true },
  { id: 'd19', name: 'Philosophy', shortName: 'Philosophy', offersBSDegree: false },
  { id: 'd10', name: 'Physics', shortName: 'Physics', offersBSDegree: true },
  { id: 'd11', name: 'Political Science', shortName: 'Pol Science', offersBSDegree: true },
  { id: 'd13', name: 'Psychology', shortName: 'Psychology', offersBSDegree: true },
  { id: 'd12', name: 'Sociology', shortName: 'Sociology', offersBSDegree: true },
  { id: 'd14', name: 'Statistics', shortName: 'Statistics', offersBSDegree: true },
  { id: 'd15', name: 'Urdu', shortName: 'Urdu', offersBSDegree: true },
  { id: 'd16', name: 'Zoology', shortName: 'Zoology', offersBSDegree: true },
];

export const teachers: Teacher[] = [
  // Unassigned/TBA teacher
  { id: 'unassigned', name: 'To Be Assigned', shortName: 'TBA', departmentId: 'all' },
  
  // Computer Science Department (d6)
  { id: 't1', name: 'Ejaz Ahmad', shortName: 'Ejaz Ahmad', departmentId: 'd6' },
  { id: 't2', name: 'Sadaf Siddique', shortName: 'Sadaf Siddique', departmentId: 'd6' },
  { id: 't3', name: 'Abdul Wahab', shortName: 'Abdul Wahab', departmentId: 'd6' },
  { id: 't4', name: 'Muhammad Zeeshan', shortName: 'Muhammad Zeeshan', departmentId: 'd6' },
  { id: 't5', name: 'Naureen', shortName: 'Naureen', departmentId: 'd6' },
  
  // Chemistry Department (d2) - Complete Faculty List
  { id: 't6', name: 'Dr. Hafiz Muhammad Farooq', shortName: 'Dr. H.M. Farooq', departmentId: 'd2' },
  { id: 't7', name: 'Dr. Qamar Subhani', shortName: 'Dr. Q. Subhani', departmentId: 'd2' },
  { id: 't8', name: 'Dr. M. Monim ul Mahboob', shortName: 'Dr. M.M. Mahboob', departmentId: 'd2' },
  { id: 't9', name: 'Aamir Niaz', shortName: 'Aamir Niaz', departmentId: 'd2' },
  { id: 't10', name: 'Zahid Sharif', shortName: 'Zahid Sharif', departmentId: 'd2' },
  { id: 't11', name: 'Muhammad Arshad Bhatti', shortName: 'M.A. Bhatti', departmentId: 'd2' },
  { id: 't12', name: 'Asif Masaud Khurum', shortName: 'A.M. Khurum', departmentId: 'd2' },
  { id: 't13', name: 'Iftikhar Ahmad', shortName: 'Iftikhar Ahmad', departmentId: 'd2' },
  { id: 't14', name: 'Muhammad Zafarullah Bhatti', shortName: 'M.Z. Bhatti', departmentId: 'd2' },
  { id: 't15', name: 'Anfas Ahmad', shortName: 'Anfas Ahmad', departmentId: 'd2' },
  { id: 't16', name: 'Naveed Asalm Dogar', shortName: 'N.A. Dogar', departmentId: 'd2' },
  { id: 't17', name: 'Dr. Tariq Mehmood', shortName: 'Dr. T. Mehmood', departmentId: 'd2' },
  { id: 't18', name: 'Dr. Iftikhar Hussain', shortName: 'Dr. I. Hussain', departmentId: 'd2' },
  { id: 't19', name: 'Dr. Abdul Rauf', shortName: 'Dr. A. Rauf', departmentId: 'd2' },
  { id: 't20', name: 'Dr. Abida Hassan', shortName: 'Dr. A. Hassan', departmentId: 'd2' },
  { id: 't21', name: 'Munawar Ali', shortName: 'Munawar Ali', departmentId: 'd2' },
  { id: 't22', name: 'Dr. Muhammad Waheed Mushtaq', shortName: 'Dr. M.W. Mushtaq', departmentId: 'd2' },
  { id: 't23', name: 'Dr. Adeel Ahmad Hassan', shortName: 'Dr. A.A. Hassan', departmentId: 'd2' },
  { id: 't24', name: 'Sajjad Hussain', shortName: 'Sajjad Hussain', departmentId: 'd2' },
  
  // Economics Department (d3) - Complete Faculty List
  { id: 't25', name: 'Dr. M. Khalid Rashid', shortName: 'Dr. M.K. Rashid', departmentId: 'd3' },
  { id: 't26', name: 'Muhammad Tariq', shortName: 'Muhammad Tariq', departmentId: 'd3' },
  { id: 't27', name: 'Iftikhar Ahmad', shortName: 'Iftikhar Ahmad', departmentId: 'd3' },
  { id: 't28', name: 'Muhammad Tanveer', shortName: 'Muhammad Tanveer', departmentId: 'd3' },
  { id: 't29', name: 'Atiq-ur-Rerhman', shortName: 'Atiq-ur-Rerhman', departmentId: 'd3' },
  { id: 't30', name: 'Muhammad Rehan Hameed', shortName: 'M.R. Hameed', departmentId: 'd3' },
  { id: 't31', name: 'Ghulam Farid', shortName: 'Ghulam Farid', departmentId: 'd3' },
  { id: 't32', name: 'Fahim Abbas', shortName: 'Fahim Abbas', departmentId: 'd3' },
  { id: 't33', name: 'Aneesa Razaq', shortName: 'Aneesa Razaq', departmentId: 'd3' },
  { id: 't34', name: 'Naveed Munir', shortName: 'Naveed Munir', departmentId: 'd3' },
  { id: 't35', name: 'Maaz Anis', shortName: 'Maaz Anis', departmentId: 'd3' },
  { id: 't36', name: 'Naseem Akhtar', shortName: 'Naseem Akhtar', departmentId: 'd3' },
  
  // English Department (d5) - Complete Faculty List
  { id: 't37', name: 'Ayub Munir', shortName: 'Ayub Munir', departmentId: 'd5' },
  { id: 't38', name: 'Asif Shaheen', shortName: 'Asif Shaheen', departmentId: 'd5' },
  { id: 't39', name: 'Nighat Iftekhar', shortName: 'Nighat Iftekhar', departmentId: 'd5' },
  { id: 't40', name: 'Saleem Ahsan', shortName: 'Saleem Ahsan', departmentId: 'd5' },
  { id: 't41', name: 'Rana Yousaf', shortName: 'Rana Yousaf', departmentId: 'd5' },
  { id: 't42', name: 'Nosheen Jafar', shortName: 'Nosheen Jafar', departmentId: 'd5' },
  { id: 't43', name: 'Dr. Nazir Ahmed', shortName: 'Dr. N. Ahmed', departmentId: 'd5' },
  { id: 't44', name: 'Mubashir Sadiq', shortName: 'Mubashir Sadiq', departmentId: 'd5' },
  { id: 't45', name: 'Imran Khan', shortName: 'Imran Khan', departmentId: 'd5' },
  { id: 't46', name: 'M. Talha', shortName: 'M. Talha', departmentId: 'd5' },
  { id: 't47', name: 'Shehryar', shortName: 'Shehryar', departmentId: 'd5' },
  { id: 't48', name: 'Nabeel Minhas', shortName: 'Nabeel Minhas', departmentId: 'd5' },
  { id: 't49', name: 'Hafsa Khan', shortName: 'Hafsa Khan', departmentId: 'd5' },
  { id: 't50', name: 'Hamza Sultan', shortName: 'Hamza Sultan', departmentId: 'd5' },
  
  // Geography Department (d7) - Complete Faculty List
  { id: 't51', name: 'Dr. Muhammad Ghous', shortName: 'Dr. M. Ghous', departmentId: 'd7' },
  { id: 't52', name: 'Muhammad Sohail', shortName: 'Muhammad Sohail', departmentId: 'd7' },
  { id: 't53', name: 'Kiran Hamayon', shortName: 'Kiran Hamayon', departmentId: 'd7' },
  
  // Biotechnology Department (d1)
  { id: 't73', name: 'Dr. Zia Ur Rehman', shortName: 'Dr. Zia Ur Rehman', departmentId: 'd1' },
  { id: 't74', name: 'Adnan Khalid', shortName: 'Adnan Khalid', departmentId: 'd1' },
  { id: 't75', name: 'Atiqa Wajid', shortName: 'Atiqa Wajid', departmentId: 'd1' },
  { id: 't76', name: 'Dr. Adil Abbas', shortName: 'Dr. Adil Abbas', departmentId: 'd1' },
  
  // Mathematics Department (d9)
  { id: 't56', name: 'Dr. M Tanveer', shortName: 'Dr. M Tanveer', departmentId: 'd9' },
  { id: 't85', name: 'Dr. Naveed Akhtar', shortName: 'Dr. Naveed Akhtar', departmentId: 'd9' },
  { id: 't86', name: 'M. Arshed Rashed', shortName: 'M. Arshed Rashed', departmentId: 'd9' },
  { id: 't87', name: 'Ahmad Saleem', shortName: 'Ahmad Saleem', departmentId: 'd9' },
  { id: 't88', name: 'Dr. Qaisar Mehmood', shortName: 'Dr. Qaisar Mehmood', departmentId: 'd9' },
  { id: 't89', name: 'Tariq Sharif', shortName: 'Tariq Sharif', departmentId: 'd9' },
  { id: 't90', name: 'Muhammad Ikram', shortName: 'Muhammad Ikram', departmentId: 'd9' },
  { id: 't91', name: 'Javed Ali', shortName: 'Javed Ali', departmentId: 'd9' },
  { id: 't92', name: 'Dr. Imran Nadeem', shortName: 'Dr. Imran Nadeem', departmentId: 'd9' },
  { id: 't93', name: 'Imama Zehra', shortName: 'Imama Zehra', departmentId: 'd9' },
  { id: 't94', name: 'Malka Shahbano', shortName: 'Malka Shahbano', departmentId: 'd9' },
  { id: 't95', name: 'Abdul Aziz', shortName: 'Abdul Aziz', departmentId: 'd9' },
  { id: 't96', name: 'Ayesha Liaqat', shortName: 'Ayesha Liaqat', departmentId: 'd9' },
  
  // Physics Department (d10)
  { id: 't57', name: 'Dr. Zafar', shortName: 'Dr. Zafar', departmentId: 'd10' },
  { id: 't97', name: 'Dr. Muhammad Saleem', shortName: 'Dr. Muhammad Saleem', departmentId: 'd10' },
  { id: 't98', name: 'Dr. Abdul Rashid', shortName: 'Dr. Abdul Rashid', departmentId: 'd10' },
  { id: 't99', name: 'Ms. Noreen Azam', shortName: 'Ms. Noreen Azam', departmentId: 'd10' },
  { id: 't100', name: 'M. Tariq Shaikh', shortName: 'M. Tariq Shaikh', departmentId: 'd10' },
  { id: 't101', name: 'Ms. Majida Ch.', shortName: 'Ms. Majida Ch.', departmentId: 'd10' },
  { id: 't102', name: 'Jamil Ahmad', shortName: 'Jamil Ahmad', departmentId: 'd10' },
  { id: 't103', name: 'Dr. Muhammad Zubair', shortName: 'Dr. Muhammad Zubair', departmentId: 'd10' },
  { id: 't104', name: 'Dr. Jamil Sadique', shortName: 'Dr. Jamil Sadique', departmentId: 'd10' },
  { id: 't105', name: 'M. Attiqus Salam', shortName: 'M. Attiqus Salam', departmentId: 'd10' },
  { id: 't106', name: 'Saeed Ahmad Pal', shortName: 'Saeed Ahmad Pal', departmentId: 'd10' },
  { id: 't107', name: 'Nadeem Ahmad', shortName: 'Nadeem Ahmad', departmentId: 'd10' },
  { id: 't108', name: 'Dr. Waris Ali', shortName: 'Dr. Waris Ali', departmentId: 'd10' },
  { id: 't109', name: 'Zahid Niazi', shortName: 'Zahid Niazi', departmentId: 'd10' },
  { id: 't110', name: 'Abid Hussain', shortName: 'Abid Hussain', departmentId: 'd10' },
  { id: 't111', name: 'Muhammad Asghar', shortName: 'Muhammad Asghar', departmentId: 'd10' },
  { id: 't112', name: 'M. Salman Azhar', shortName: 'M. Salman Azhar', departmentId: 'd10', designation: 'Lecturer' },
  { id: 't113', name: 'Muhammad Ismail', shortName: 'Muhammad Ismail', departmentId: 'd10', designation: 'Lecturer' },
  { id: 't114', name: 'Dr. Saba Masood', shortName: 'Dr. Saba Masood', departmentId: 'd10', designation: 'Lecturer' },
  { id: 't115', name: 'Rabia Mehboob', shortName: 'Rabia Mehboob', departmentId: 'd10', designation: 'Lecturer' },
  { id: 't116', name: 'Bilal Bhatti', shortName: 'Bilal Bhatti', departmentId: 'd10', designation: 'Lecturer' },
  
  // Political Science Department (d11)
  { id: 't125', name: 'Dr. Rehman Gul Khan', shortName: 'Dr. Rehman Khan', departmentId: 'd11', designation: 'Associate Professor & HOD' },
  { id: 't126', name: 'Mujeeb Ul Islam', shortName: 'Mujeeb Islam', departmentId: 'd11', designation: 'Associate Professor' },
  { id: 't127', name: 'Dr. Muneera Sultana', shortName: 'Dr. Muneera', departmentId: 'd11', designation: 'Associate Professor' },
  { id: 't128', name: 'Abdul Rasheed', shortName: 'Abdul Rasheed', departmentId: 'd11', designation: 'Assistant Professor' },
  { id: 't129', name: 'Qamar Abbas', shortName: 'Qamar Abbas', departmentId: 'd11', designation: 'Assistant Professor' },
  { id: 't130', name: 'Khushbakhat Bajwa', shortName: 'Khushbakhat', departmentId: 'd11', designation: 'Assistant Professor' },
  { id: 't131', name: 'Qasim Ali', shortName: 'Qasim Ali', departmentId: 'd11', designation: 'Assistant Professor' },
  { id: 't132', name: 'Dr. Raza Taimoor', shortName: 'Dr. Raza', departmentId: 'd11', designation: 'Professor' },
  { id: 't133', name: 'Muneer Bhatti', shortName: 'Muneer Bhatti', departmentId: 'd11', designation: 'Assistant Professor' },
  
  // Statistics Department (d14)
  { id: 't59', name: 'Tauq Rashid', shortName: 'Tauq Rashid', departmentId: 'd14' },
  
  // Education Department (d4)
  { id: 't60', name: 'Asif Warraich', shortName: 'Asif Warraich', departmentId: 'd4' },
  
  // Urdu Department (d15)
  { id: 't134', name: 'Dr. Muhammad Naeem', shortName: 'Dr. Muhammad Naeem', departmentId: 'd15', designation: 'Professor & HOD' },
  { id: 't135', name: 'Talat Rashid', shortName: 'Talat Rashid', departmentId: 'd15', designation: 'Associate Professor' },
  { id: 't136', name: 'Dr. Sohail Mumtaz', shortName: 'Dr. Sohail Mumtaz', departmentId: 'd15', designation: 'Associate Professor' },
  { id: 't137', name: 'Dr. Taimoor Hassan', shortName: 'Dr. Taimoor Hassan', departmentId: 'd15', designation: 'Associate Professor' },
  { id: 't138', name: 'Ghulam Sabir', shortName: 'Ghulam Sabir', departmentId: 'd15', designation: 'Associate Professor' },
  { id: 't139', name: 'Muhammad Asif', shortName: 'Muhammad Asif', departmentId: 'd15', designation: 'Assistant Professor' },
  { id: 't140', name: 'Muhammad Asif (2)', shortName: 'Muhammad Asif (2)', departmentId: 'd15', designation: 'Assistant Professor' },
  { id: 't141', name: 'Muhammad Farooq', shortName: 'Muhammad Farooq', departmentId: 'd15', designation: 'Assistant Professor' },
  
  // Zoology Department (d16)
  { id: 't142', name: 'Dr. Naveed Akhtar', shortName: 'Dr. Naveed Akhtar', departmentId: 'd16', designation: 'Professor' },
  { id: 't143', name: 'Dr. Asma Karim', shortName: 'Dr. Asma Karim', departmentId: 'd16', designation: 'Professor' },
  { id: 't144', name: 'Dr. Syed Shahid Imran Bokhari', shortName: 'Dr. S.S.I. Bokhari', departmentId: 'd16', designation: 'Assistant Professor' },
  { id: 't145', name: 'Mariam Zaheer', shortName: 'Mariam Zaheer', departmentId: 'd16', designation: 'Assistant Professor' },
  { id: 't146', name: 'Dr. Muhammad Tariq', shortName: 'Dr. Muhammad Tariq', departmentId: 'd16', designation: 'Assistant Professor' },
  { id: 't147', name: 'Sabir Javed', shortName: 'Sabir Javed', departmentId: 'd16', designation: 'Assistant Professor' },
  { id: 't148', name: 'Bushra Younas', shortName: 'Bushra Younas', departmentId: 'd16', designation: 'Lecturer' },
  { id: 't149', name: 'Qurat-Ul-Ain', shortName: 'Qurat-Ul-Ain', departmentId: 'd16', designation: 'Lecturer' },
  
  // Sociology Department (d12)
  { id: 't63', name: 'CTI', shortName: 'CTI', departmentId: 'd12' },
  
  // Psychology Department (d13)
  { id: 't64', name: 'Qasim Malik', shortName: 'Qasim Malik', departmentId: 'd13' },
  
  // Mass Communication Department (d8)
  { id: 't82', name: 'Dr. Shafayat Ali', shortName: 'Dr. Shafayat Ali', departmentId: 'd8' },
  { id: 't83', name: 'Saiba Ali', shortName: 'Saiba Ali', departmentId: 'd8' },
  { id: 't84', name: 'Nain Tara', shortName: 'Nain Tara', departmentId: 'd8' },
  
  // History Department (d17)
  { id: 't66', name: 'Dr. Ahmed Khan', shortName: 'Dr. Ahmed Khan', departmentId: 'd17' },
  { id: 't67', name: 'Prof. Malik Hassan', shortName: 'Prof. Malik Hassan', departmentId: 'd17' },
  
  // Islamic Studies Department (d18)
  { id: 't68', name: 'Maulana Abdullah', shortName: 'Maulana Abdullah', departmentId: 'd18' },
  
  // Philosophy Department (d19)
  { id: 't69', name: 'Dr. Fatima Ali', shortName: 'Dr. Fatima Ali', departmentId: 'd19' },
  
  // Business Administration Department (d20)
  { id: 't70', name: 'Dr. Hassan Raza', shortName: 'Dr. Hassan Raza', departmentId: 'd20' },
  { id: 't71', name: 'Ms. Ayesha Khan', shortName: 'Ms. Ayesha Khan', departmentId: 'd20' },
  { id: 't72', name: 'Mr. Ali Ahmed', shortName: 'Mr. Ali Ahmed', departmentId: 'd20' },
  { id: 't77', name: 'Shahzada Shahab Khan', shortName: 'Shahzada Shahab Khan', departmentId: 'd20' },
  { id: 't78', name: 'Hifsa Farooq', shortName: 'Hifsa Farooq', departmentId: 'd20' },
  { id: 't79', name: 'Asifa Sohail', shortName: 'Asifa Sohail', departmentId: 'd20' },
  { id: 't80', name: 'Faisal Shehzad', shortName: 'Faisal Shehzad', departmentId: 'd20' },
  { id: 't81', name: 'Sana Shahzad', shortName: 'Sana Shahzad', departmentId: 'd20' }
];

export const subjects: Subject[] = [
  // Computer Science Department (d6) - 5 subjects per semester
  // Semester 1
  { id: 'cs101', name: 'Programming Fundamentals', shortName: 'Prog Fund', code: 'CS-101', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 1, isCore: true },
  { id: 'cs102', name: 'Mathematics I', shortName: 'Math I', code: 'MATH-101', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 1, isCore: true },
  { id: 'cs103', name: 'English I', shortName: 'Eng I', code: 'ENG-101', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 1, isCore: true },
  { id: 'cs104', name: 'Introduction to Computing', shortName: 'Intro CS', code: 'CS-102', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 1, isCore: true },
  { id: 'cs105', name: 'Computer Programming Lab', shortName: 'CS Lab', code: 'CS-103', creditHours: 1, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'cs301', name: 'Data Structures', shortName: 'DS', code: 'CS-301', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 3, isCore: true },
  { id: 'cs302', name: 'Database Systems', shortName: 'Database', code: 'CS-302', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 3, isCore: true },
  { id: 'cs303', name: 'Computer Networks', shortName: 'Networks', code: 'CS-303', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 3, isCore: true },
  { id: 'cs304', name: 'Web Development', shortName: 'Web Dev', code: 'CS-304', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 3, isCore: true },
  { id: 'cs305', name: 'Software Engineering', shortName: 'SE', code: 'CS-305', creditHours: 3, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'cs501', name: 'Artificial Intelligence', shortName: 'AI', code: 'CS-501', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 5, isCore: true },
  { id: 'cs502', name: 'Machine Learning', shortName: 'ML', code: 'CS-502', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 5, isCore: true },
  { id: 'cs503', name: 'Operating Systems', shortName: 'OS', code: 'CS-503', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 5, isCore: true },
  { id: 'cs504', name: 'Computer Graphics', shortName: 'Graphics', code: 'CS-504', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 5, isCore: true },
  { id: 'cs505', name: 'Cyber Security', shortName: 'Security', code: 'CS-505', creditHours: 3, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'cs701', name: 'Distributed Systems', shortName: 'Distributed', code: 'CS-701', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 7, isCore: true },
  { id: 'cs702', name: 'Cloud Computing', shortName: 'Cloud', code: 'CS-702', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 7, isCore: true },
  { id: 'cs703', name: 'Mobile App Development', shortName: 'Mobile Dev', code: 'CS-703', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 7, isCore: true },
  { id: 'cs704', name: 'Blockchain Technology', shortName: 'Blockchain', code: 'CS-704', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 7, isCore: true },
  { id: 'cs705', name: 'Project Management', shortName: 'PM', code: 'CS-705', creditHours: 3, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 7, isCore: true },

  // Chemistry Department (d2) - 5 subjects per semester
  // Semester 1
  { id: 'chem101', name: 'General Chemistry I', shortName: 'Gen Chem I', code: 'CHEM-101', creditHours: 3, color: 'bg-yellow-100', departmentId: 'd2', semesterLevel: 1, isCore: true },
  { id: 'chem102', name: 'Chemistry Lab I', shortName: 'Chem Lab I', code: 'CHEM-102', creditHours: 1, color: 'bg-yellow-150', departmentId: 'd2', semesterLevel: 1, isCore: true },
  { id: 'chem103', name: 'Mathematics for Chemistry', shortName: 'Math Chem', code: 'MATH-111', creditHours: 3, color: 'bg-yellow-200', departmentId: 'd2', semesterLevel: 1, isCore: true },
  { id: 'chem104', name: 'Introduction to Chemistry', shortName: 'Intro Chem', code: 'CHEM-103', creditHours: 3, color: 'bg-yellow-250', departmentId: 'd2', semesterLevel: 1, isCore: true },
  { id: 'chem105', name: 'Chemical Safety', shortName: 'Safety', code: 'CHEM-104', creditHours: 2, color: 'bg-yellow-300', departmentId: 'd2', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'chem301', name: 'Organic Chemistry I', shortName: 'Org Chem I', code: 'CHEM-301', creditHours: 3, color: 'bg-yellow-100', departmentId: 'd2', semesterLevel: 3, isCore: true },
  { id: 'chem302', name: 'Physical Chemistry I', shortName: 'Phy Chem I', code: 'CHEM-302', creditHours: 3, color: 'bg-yellow-150', departmentId: 'd2', semesterLevel: 3, isCore: true },
  { id: 'chem303', name: 'Analytical Chemistry', shortName: 'Anal Chem', code: 'CHEM-303', creditHours: 3, color: 'bg-yellow-200', departmentId: 'd2', semesterLevel: 3, isCore: true },
  { id: 'chem304', name: 'Inorganic Chemistry I', shortName: 'Inorg Chem I', code: 'CHEM-304', creditHours: 3, color: 'bg-yellow-250', departmentId: 'd2', semesterLevel: 3, isCore: true },
  { id: 'chem305', name: 'Chemistry Lab III', shortName: 'Chem Lab III', code: 'CHEM-305', creditHours: 1, color: 'bg-yellow-300', departmentId: 'd2', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'chem501', name: 'Advanced Organic Chemistry', shortName: 'Adv Org', code: 'CHEM-501', creditHours: 3, color: 'bg-yellow-100', departmentId: 'd2', semesterLevel: 5, isCore: true },
  { id: 'chem502', name: 'Biochemistry', shortName: 'Biochem', code: 'CHEM-502', creditHours: 3, color: 'bg-yellow-150', departmentId: 'd2', semesterLevel: 5, isCore: true },
  { id: 'chem503', name: 'Environmental Chemistry', shortName: 'Env Chem', code: 'CHEM-503', creditHours: 3, color: 'bg-yellow-200', departmentId: 'd2', semesterLevel: 5, isCore: true },
  { id: 'chem504', name: 'Industrial Chemistry', shortName: 'Ind Chem', code: 'CHEM-504', creditHours: 3, color: 'bg-yellow-250', departmentId: 'd2', semesterLevel: 5, isCore: true },
  { id: 'chem505', name: 'Research Methods', shortName: 'Research', code: 'CHEM-505', creditHours: 3, color: 'bg-yellow-300', departmentId: 'd2', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'chem701', name: 'Advanced Physical Chemistry', shortName: 'Adv Phy Chem', code: 'CHEM-701', creditHours: 3, color: 'bg-yellow-100', departmentId: 'd2', semesterLevel: 7, isCore: true },
  { id: 'chem702', name: 'Polymer Chemistry', shortName: 'Polymer', code: 'CHEM-702', creditHours: 3, color: 'bg-yellow-150', departmentId: 'd2', semesterLevel: 7, isCore: true },
  { id: 'chem703', name: 'Pharmaceutical Chemistry', shortName: 'Pharma Chem', code: 'CHEM-703', creditHours: 3, color: 'bg-yellow-200', departmentId: 'd2', semesterLevel: 7, isCore: true },
  { id: 'chem704', name: 'Advanced Analytical Methods', shortName: 'Adv Anal', code: 'CHEM-704', creditHours: 3, color: 'bg-yellow-250', departmentId: 'd2', semesterLevel: 7, isCore: true },
  { id: 'chem705', name: 'Chemistry Project', shortName: 'Project', code: 'CHEM-705', creditHours: 3, color: 'bg-yellow-300', departmentId: 'd2', semesterLevel: 7, isCore: true },

  // Economics Department (d3) - 5 subjects per semester
  // Semester 1
  { id: 'econ101', name: 'Principles of Economics', shortName: 'Prin Econ', code: 'ECON-101', creditHours: 3, color: 'bg-purple-100', departmentId: 'd3', semesterLevel: 1, isCore: true },
  { id: 'econ102', name: 'Mathematics for Economics', shortName: 'Math Econ', code: 'MATH-121', creditHours: 3, color: 'bg-purple-150', departmentId: 'd3', semesterLevel: 1, isCore: true },
  { id: 'econ103', name: 'Introduction to Statistics', shortName: 'Intro Stats', code: 'STAT-101', creditHours: 3, color: 'bg-purple-200', departmentId: 'd3', semesterLevel: 1, isCore: true },
  { id: 'econ104', name: 'Business Communication', shortName: 'Bus Comm', code: 'ECON-104', creditHours: 3, color: 'bg-purple-250', departmentId: 'd3', semesterLevel: 1, isCore: true },
  { id: 'econ105', name: 'Introduction to Accounting', shortName: 'Intro Acc', code: 'ECON-105', creditHours: 3, color: 'bg-purple-300', departmentId: 'd3', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'econ301', name: 'Intermediate Microeconomics', shortName: 'Int Micro', code: 'ECON-301', creditHours: 3, color: 'bg-purple-100', departmentId: 'd3', semesterLevel: 3, isCore: true },
  { id: 'econ302', name: 'Intermediate Macroeconomics', shortName: 'Int Macro', code: 'ECON-302', creditHours: 3, color: 'bg-purple-150', departmentId: 'd3', semesterLevel: 3, isCore: true },
  { id: 'econ303', name: 'Econometrics', shortName: 'Econometrics', code: 'ECON-303', creditHours: 3, color: 'bg-purple-200', departmentId: 'd3', semesterLevel: 3, isCore: true },
  { id: 'econ304', name: 'Public Finance', shortName: 'Pub Finance', code: 'ECON-304', creditHours: 3, color: 'bg-purple-250', departmentId: 'd3', semesterLevel: 3, isCore: true },
  { id: 'econ305', name: 'International Economics', shortName: 'Int Econ', code: 'ECON-305', creditHours: 3, color: 'bg-purple-300', departmentId: 'd3', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'econ501', name: 'Development Economics', shortName: 'Dev Econ', code: 'ECON-501', creditHours: 3, color: 'bg-purple-100', departmentId: 'd3', semesterLevel: 5, isCore: true },
  { id: 'econ502', name: 'Monetary Economics', shortName: 'Mon Econ', code: 'ECON-502', creditHours: 3, color: 'bg-purple-150', departmentId: 'd3', semesterLevel: 5, isCore: true },
  { id: 'econ503', name: 'Industrial Organization', shortName: 'Ind Org', code: 'ECON-503', creditHours: 3, color: 'bg-purple-200', departmentId: 'd3', semesterLevel: 5, isCore: true },
  { id: 'econ504', name: 'Labor Economics', shortName: 'Labor Econ', code: 'ECON-504', creditHours: 3, color: 'bg-purple-250', departmentId: 'd3', semesterLevel: 5, isCore: true },
  { id: 'econ505', name: 'Environmental Economics', shortName: 'Env Econ', code: 'ECON-505', creditHours: 3, color: 'bg-purple-300', departmentId: 'd3', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'econ701', name: 'Advanced Econometrics', shortName: 'Adv Econom', code: 'ECON-701', creditHours: 3, color: 'bg-purple-100', departmentId: 'd3', semesterLevel: 7, isCore: true },
  { id: 'econ702', name: 'Game Theory', shortName: 'Game Theory', code: 'ECON-702', creditHours: 3, color: 'bg-purple-150', departmentId: 'd3', semesterLevel: 7, isCore: true },
  { id: 'econ703', name: 'Behavioral Economics', shortName: 'Behav Econ', code: 'ECON-703', creditHours: 3, color: 'bg-purple-200', departmentId: 'd3', semesterLevel: 7, isCore: true },
  { id: 'econ704', name: 'Economic Policy', shortName: 'Econ Policy', code: 'ECON-704', creditHours: 3, color: 'bg-purple-250', departmentId: 'd3', semesterLevel: 7, isCore: true },
  { id: 'econ705', name: 'Research Project', shortName: 'Research', code: 'ECON-705', creditHours: 3, color: 'bg-purple-300', departmentId: 'd3', semesterLevel: 7, isCore: true },

  // English Department (d5) - 5 subjects per semester
  // Semester 1
  { id: 'eng101', name: 'Introduction to Literature', shortName: 'Intro Lit', code: 'ENG-101', creditHours: 3, color: 'bg-indigo-100', departmentId: 'd5', semesterLevel: 1, isCore: true },
  { id: 'eng102', name: 'English Composition I', shortName: 'Comp I', code: 'ENG-102', creditHours: 3, color: 'bg-indigo-150', departmentId: 'd5', semesterLevel: 1, isCore: true },
  { id: 'eng103', name: 'Phonetics and Phonology', shortName: 'Phonetics', code: 'ENG-103', creditHours: 3, color: 'bg-indigo-200', departmentId: 'd5', semesterLevel: 1, isCore: true },
  { id: 'eng104', name: 'Introduction to Linguistics', shortName: 'Intro Ling', code: 'ENG-104', creditHours: 3, color: 'bg-indigo-250', departmentId: 'd5', semesterLevel: 1, isCore: true },
  { id: 'eng105', name: 'Reading Skills', shortName: 'Reading', code: 'ENG-105', creditHours: 2, color: 'bg-indigo-300', departmentId: 'd5', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'eng301', name: 'British Literature I', shortName: 'Brit Lit I', code: 'ENG-301', creditHours: 3, color: 'bg-indigo-100', departmentId: 'd5', semesterLevel: 3, isCore: true },
  { id: 'eng302', name: 'American Literature I', shortName: 'Am Lit I', code: 'ENG-302', creditHours: 3, color: 'bg-indigo-150', departmentId: 'd5', semesterLevel: 3, isCore: true },
  { id: 'eng303', name: 'Syntax and Morphology', shortName: 'Syntax', code: 'ENG-303', creditHours: 3, color: 'bg-indigo-200', departmentId: 'd5', semesterLevel: 3, isCore: true },
  { id: 'eng304', name: 'Poetry Analysis', shortName: 'Poetry', code: 'ENG-304', creditHours: 3, color: 'bg-indigo-250', departmentId: 'd5', semesterLevel: 3, isCore: true },
  { id: 'eng305', name: 'Creative Writing', shortName: 'Creative', code: 'ENG-305', creditHours: 3, color: 'bg-indigo-300', departmentId: 'd5', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'eng501', name: 'Shakespeare Studies', shortName: 'Shakespeare', code: 'ENG-501', creditHours: 3, color: 'bg-indigo-100', departmentId: 'd5', semesterLevel: 5, isCore: true },
  { id: 'eng502', name: 'Modern Literature', shortName: 'Modern Lit', code: 'ENG-502', creditHours: 3, color: 'bg-indigo-150', departmentId: 'd5', semesterLevel: 5, isCore: true },
  { id: 'eng503', name: 'Applied Linguistics', shortName: 'App Ling', code: 'ENG-503', creditHours: 3, color: 'bg-indigo-200', departmentId: 'd5', semesterLevel: 5, isCore: true },
  { id: 'eng504', name: 'Literary Criticism', shortName: 'Lit Crit', code: 'ENG-504', creditHours: 3, color: 'bg-indigo-250', departmentId: 'd5', semesterLevel: 5, isCore: true },
  { id: 'eng505', name: 'Translation Studies', shortName: 'Translation', code: 'ENG-505', creditHours: 3, color: 'bg-indigo-300', departmentId: 'd5', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'eng701', name: 'Postcolonial Literature', shortName: 'Postcolonial', code: 'ENG-701', creditHours: 3, color: 'bg-indigo-100', departmentId: 'd5', semesterLevel: 7, isCore: true },
  { id: 'eng702', name: 'Contemporary Literature', shortName: 'Contemp Lit', code: 'ENG-702', creditHours: 3, color: 'bg-indigo-150', departmentId: 'd5', semesterLevel: 7, isCore: true },
  { id: 'eng703', name: 'Discourse Analysis', shortName: 'Discourse', code: 'ENG-703', creditHours: 3, color: 'bg-indigo-200', departmentId: 'd5', semesterLevel: 7, isCore: true },
  { id: 'eng704', name: 'Advanced Writing', shortName: 'Adv Writing', code: 'ENG-704', creditHours: 3, color: 'bg-indigo-250', departmentId: 'd5', semesterLevel: 7, isCore: true },
  { id: 'eng705', name: 'Thesis Project', shortName: 'Thesis', code: 'ENG-705', creditHours: 3, color: 'bg-indigo-300', departmentId: 'd5', semesterLevel: 7, isCore: true },

  // Mathematics Department (d9) - 5 subjects per semester
  // Semester 1
  { id: 'math101', name: 'Calculus I', shortName: 'Calc I', code: 'MATH-101', creditHours: 3, color: 'bg-red-100', departmentId: 'd9', semesterLevel: 1, isCore: true },
  { id: 'math102', name: 'Algebra', shortName: 'Algebra', code: 'MATH-102', creditHours: 3, color: 'bg-red-150', departmentId: 'd9', semesterLevel: 1, isCore: true },
  { id: 'math103', name: 'Introduction to Geometry', shortName: 'Geometry', code: 'MATH-103', creditHours: 3, color: 'bg-red-200', departmentId: 'd9', semesterLevel: 1, isCore: true },
  { id: 'math104', name: 'Trigonometry', shortName: 'Trig', code: 'MATH-104', creditHours: 3, color: 'bg-red-250', departmentId: 'd9', semesterLevel: 1, isCore: true },
  { id: 'math105', name: 'Mathematical Logic', shortName: 'Logic', code: 'MATH-105', creditHours: 3, color: 'bg-red-300', departmentId: 'd9', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'math301', name: 'Calculus III', shortName: 'Calc III', code: 'MATH-301', creditHours: 3, color: 'bg-red-100', departmentId: 'd9', semesterLevel: 3, isCore: true },
  { id: 'math302', name: 'Linear Algebra', shortName: 'Lin Alg', code: 'MATH-302', creditHours: 3, color: 'bg-red-150', departmentId: 'd9', semesterLevel: 3, isCore: true },
  { id: 'math303', name: 'Discrete Mathematics', shortName: 'Discrete', code: 'MATH-303', creditHours: 3, color: 'bg-red-200', departmentId: 'd9', semesterLevel: 3, isCore: true },
  { id: 'math304', name: 'Probability Theory', shortName: 'Probability', code: 'MATH-304', creditHours: 3, color: 'bg-red-250', departmentId: 'd9', semesterLevel: 3, isCore: true },
  { id: 'math305', name: 'Number Theory', shortName: 'Number', code: 'MATH-305', creditHours: 3, color: 'bg-red-300', departmentId: 'd9', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'math501', name: 'Real Analysis', shortName: 'Real Anal', code: 'MATH-501', creditHours: 3, color: 'bg-red-100', departmentId: 'd9', semesterLevel: 5, isCore: true },
  { id: 'math502', name: 'Abstract Algebra', shortName: 'Abstract', code: 'MATH-502', creditHours: 3, color: 'bg-red-150', departmentId: 'd9', semesterLevel: 5, isCore: true },
  { id: 'math503', name: 'Differential Equations', shortName: 'Diff Eq', code: 'MATH-503', creditHours: 3, color: 'bg-red-200', departmentId: 'd9', semesterLevel: 5, isCore: true },
  { id: 'math504', name: 'Complex Analysis', shortName: 'Complex', code: 'MATH-504', creditHours: 3, color: 'bg-red-250', departmentId: 'd9', semesterLevel: 5, isCore: true },
  { id: 'math505', name: 'Topology', shortName: 'Topology', code: 'MATH-505', creditHours: 3, color: 'bg-red-300', departmentId: 'd9', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'math701', name: 'Advanced Real Analysis', shortName: 'Adv Real', code: 'MATH-701', creditHours: 3, color: 'bg-red-100', departmentId: 'd9', semesterLevel: 7, isCore: true },
  { id: 'math702', name: 'Functional Analysis', shortName: 'Functional', code: 'MATH-702', creditHours: 3, color: 'bg-red-150', departmentId: 'd9', semesterLevel: 7, isCore: true },
  { id: 'math703', name: 'Numerical Analysis', shortName: 'Numerical', code: 'MATH-703', creditHours: 3, color: 'bg-red-200', departmentId: 'd9', semesterLevel: 7, isCore: true },
  { id: 'math704', name: 'Mathematical Modeling', shortName: 'Modeling', code: 'MATH-704', creditHours: 3, color: 'bg-red-250', departmentId: 'd9', semesterLevel: 7, isCore: true },
  { id: 'math705', name: 'Research Seminar', shortName: 'Seminar', code: 'MATH-705', creditHours: 3, color: 'bg-red-300', departmentId: 'd9', semesterLevel: 7, isCore: true },

  // Physics Department (d10) - 5 subjects per semester
  // Semester 1
  { id: 'phys101', name: 'Physics I (Mechanics)', shortName: 'Phys I', code: 'PHYS-101', creditHours: 3, color: 'bg-teal-100', departmentId: 'd10', semesterLevel: 1, isCore: true },
  { id: 'phys102', name: 'Physics Lab I', shortName: 'Phys Lab I', code: 'PHYS-102', creditHours: 1, color: 'bg-teal-150', departmentId: 'd10', semesterLevel: 1, isCore: true },
  { id: 'phys103', name: 'Mathematical Methods', shortName: 'Math Methods', code: 'MATH-131', creditHours: 3, color: 'bg-teal-200', departmentId: 'd10', semesterLevel: 1, isCore: true },
  { id: 'phys104', name: 'Introduction to Physics', shortName: 'Intro Phys', code: 'PHYS-104', creditHours: 3, color: 'bg-teal-250', departmentId: 'd10', semesterLevel: 1, isCore: true },
  { id: 'phys105', name: 'Physics Problem Solving', shortName: 'Problem Sol', code: 'PHYS-105', creditHours: 2, color: 'bg-teal-300', departmentId: 'd10', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'phys301', name: 'Classical Mechanics', shortName: 'Classical', code: 'PHYS-301', creditHours: 3, color: 'bg-teal-100', departmentId: 'd10', semesterLevel: 3, isCore: true },
  { id: 'phys302', name: 'Electromagnetism', shortName: 'EM', code: 'PHYS-302', creditHours: 3, color: 'bg-teal-150', departmentId: 'd10', semesterLevel: 3, isCore: true },
  { id: 'phys303', name: 'Thermodynamics', shortName: 'Thermo', code: 'PHYS-303', creditHours: 3, color: 'bg-teal-200', departmentId: 'd10', semesterLevel: 3, isCore: true },
  { id: 'phys304', name: 'Optics', shortName: 'Optics', code: 'PHYS-304', creditHours: 3, color: 'bg-teal-250', departmentId: 'd10', semesterLevel: 3, isCore: true },
  { id: 'phys305', name: 'Physics Lab III', shortName: 'Phys Lab III', code: 'PHYS-305', creditHours: 1, color: 'bg-teal-300', departmentId: 'd10', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'phys501', name: 'Quantum Mechanics', shortName: 'Quantum', code: 'PHYS-501', creditHours: 3, color: 'bg-teal-100', departmentId: 'd10', semesterLevel: 5, isCore: true },
  { id: 'phys502', name: 'Statistical Mechanics', shortName: 'Stat Mech', code: 'PHYS-502', creditHours: 3, color: 'bg-teal-150', departmentId: 'd10', semesterLevel: 5, isCore: true },
  { id: 'phys503', name: 'Solid State Physics', shortName: 'Solid State', code: 'PHYS-503', creditHours: 3, color: 'bg-teal-200', departmentId: 'd10', semesterLevel: 5, isCore: true },
  { id: 'phys504', name: 'Nuclear Physics', shortName: 'Nuclear', code: 'PHYS-504', creditHours: 3, color: 'bg-teal-250', departmentId: 'd10', semesterLevel: 5, isCore: true },
  { id: 'phys505', name: 'Advanced Lab', shortName: 'Adv Lab', code: 'PHYS-505', creditHours: 2, color: 'bg-teal-300', departmentId: 'd10', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'phys701', name: 'Particle Physics', shortName: 'Particle', code: 'PHYS-701', creditHours: 3, color: 'bg-teal-100', departmentId: 'd10', semesterLevel: 7, isCore: true },
  { id: 'phys702', name: 'Astrophysics', shortName: 'Astro', code: 'PHYS-702', creditHours: 3, color: 'bg-teal-150', departmentId: 'd10', semesterLevel: 7, isCore: true },
  { id: 'phys703', name: 'Condensed Matter', shortName: 'Condensed', code: 'PHYS-703', creditHours: 3, color: 'bg-teal-200', departmentId: 'd10', semesterLevel: 7, isCore: true },
  { id: 'phys704', name: 'Computational Physics', shortName: 'Comp Phys', code: 'PHYS-704', creditHours: 3, color: 'bg-teal-250', departmentId: 'd10', semesterLevel: 7, isCore: true },
  { id: 'phys705', name: 'Research Project', shortName: 'Research', code: 'PHYS-705', creditHours: 3, color: 'bg-teal-300', departmentId: 'd10', semesterLevel: 7, isCore: true },

  // Zoology Department (d16) - 5 subjects per semester
  // Semester 1
  { id: 'zoo101', name: 'General Zoology I', shortName: 'Gen Zoo I', code: 'ZOO-101', creditHours: 3, color: 'bg-green-100', departmentId: 'd16', semesterLevel: 1, isCore: true },
  { id: 'zoo102', name: 'Animal Biology', shortName: 'Animal Bio', code: 'ZOO-102', creditHours: 3, color: 'bg-green-150', departmentId: 'd16', semesterLevel: 1, isCore: true },
  { id: 'zoo103', name: 'Zoology Lab I', shortName: 'Zoo Lab I', code: 'ZOO-103', creditHours: 1, color: 'bg-green-200', departmentId: 'd16', semesterLevel: 1, isCore: true },
  { id: 'zoo104', name: 'Cell Biology', shortName: 'Cell Bio', code: 'BIO-101', creditHours: 3, color: 'bg-green-250', departmentId: 'd16', semesterLevel: 1, isCore: true },
  { id: 'zoo105', name: 'Fundamentals of Chemistry', shortName: 'Fund Chem', code: 'CHEM-101', creditHours: 3, color: 'bg-green-300', departmentId: 'd16', semesterLevel: 1, isCore: true },
  
  // Semester 3
  { id: 'zoo301', name: 'Invertebrate Zoology', shortName: 'Invertebrate', code: 'ZOO-301', creditHours: 3, color: 'bg-green-100', departmentId: 'd16', semesterLevel: 3, isCore: true },
  { id: 'zoo302', name: 'Vertebrate Zoology', shortName: 'Vertebrate', code: 'ZOO-302', creditHours: 3, color: 'bg-green-150', departmentId: 'd16', semesterLevel: 3, isCore: true },
  { id: 'zoo303', name: 'Animal Physiology', shortName: 'Physiology', code: 'ZOO-303', creditHours: 3, color: 'bg-green-200', departmentId: 'd16', semesterLevel: 3, isCore: true },
  { id: 'zoo304', name: 'Genetics', shortName: 'Genetics', code: 'ZOO-304', creditHours: 3, color: 'bg-green-250', departmentId: 'd16', semesterLevel: 3, isCore: true },
  { id: 'zoo305', name: 'Comparative Anatomy', shortName: 'Comp Anat', code: 'ZOO-305', creditHours: 3, color: 'bg-green-300', departmentId: 'd16', semesterLevel: 3, isCore: true },
  
  // Semester 5
  { id: 'zoo501', name: 'Ecology', shortName: 'Ecology', code: 'ZOO-501', creditHours: 3, color: 'bg-green-100', departmentId: 'd16', semesterLevel: 5, isCore: true },
  { id: 'zoo502', name: 'Animal Behavior', shortName: 'Behavior', code: 'ZOO-502', creditHours: 3, color: 'bg-green-150', departmentId: 'd16', semesterLevel: 5, isCore: true },
  { id: 'zoo503', name: 'Molecular Biology', shortName: 'Mol Bio', code: 'ZOO-503', creditHours: 3, color: 'bg-green-200', departmentId: 'd16', semesterLevel: 5, isCore: true },
  { id: 'zoo504', name: 'Developmental Biology', shortName: 'Dev Bio', code: 'ZOO-504', creditHours: 3, color: 'bg-green-250', departmentId: 'd16', semesterLevel: 5, isCore: true },
  { id: 'zoo505', name: 'Parasitology', shortName: 'Parasitology', code: 'ZOO-505', creditHours: 3, color: 'bg-green-300', departmentId: 'd16', semesterLevel: 5, isCore: true },
  
  // Semester 7
  { id: 'zoo701', name: 'Conservation Biology', shortName: 'Conservation', code: 'ZOO-701', creditHours: 3, color: 'bg-green-100', departmentId: 'd16', semesterLevel: 7, isCore: true },
  { id: 'zoo702', name: 'Biostatistics', shortName: 'Biostat', code: 'ZOO-702', creditHours: 3, color: 'bg-green-150', departmentId: 'd16', semesterLevel: 7, isCore: true },
  { id: 'zoo703', name: 'Research Methodology', shortName: 'Research', code: 'ZOO-703', creditHours: 3, color: 'bg-green-200', departmentId: 'd16', semesterLevel: 7, isCore: true },
  { id: 'zoo704', name: 'Wildlife Management', shortName: 'Wildlife', code: 'ZOO-704', creditHours: 3, color: 'bg-green-250', departmentId: 'd16', semesterLevel: 7, isCore: true },
  { id: 'zoo705', name: 'Zoology Thesis', shortName: 'Thesis', code: 'ZOO-705', creditHours: 6, color: 'bg-green-300', departmentId: 'd16', semesterLevel: 7, isCore: true },
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

export const rooms: Room[] = [
  // Computer Science Department Rooms
  { id: 'cs-lab1', name: 'CS-Lab1', capacity: 40, type: 'Laboratory', building: 'Computer Science Block', floor: 1, hasProjector: true, hasAC: true, description: 'Programming Lab with latest computers', programTypes: ['BS'], primaryDepartmentId: 'd6', availableForOtherDepartments: false },
  { id: 'cs-lab2', name: 'CS-Lab2', capacity: 35, type: 'Laboratory', building: 'Computer Science Block', floor: 1, hasProjector: true, hasAC: true, description: 'Advanced Programming Lab', programTypes: ['BS'], primaryDepartmentId: 'd6', availableForOtherDepartments: false },
  { id: 'cs-lab3', name: 'CS-Lab3', capacity: 30, type: 'Laboratory', building: 'Computer Science Block', floor: 2, hasProjector: true, hasAC: false, description: 'Network Lab', programTypes: ['BS'], primaryDepartmentId: 'd6', availableForOtherDepartments: true },
  
  // General Classrooms - Available for both Inter and BS
  { id: 'r-101', name: 'R-101', capacity: 60, type: 'Classroom', building: 'Main Academic Block', floor: 1, hasProjector: true, hasAC: true, description: 'Large classroom for lectures', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'r-102', name: 'R-102', capacity: 50, type: 'Classroom', building: 'Main Academic Block', floor: 1, hasProjector: true, hasAC: true, description: 'Medium-sized classroom', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'r-103', name: 'R-103', capacity: 40, type: 'Classroom', building: 'Main Academic Block', floor: 1, hasProjector: false, hasAC: false, description: 'Basic classroom', programTypes: ['Inter'], availableForOtherDepartments: true },
  { id: 'r-201', name: 'R-201', capacity: 70, type: 'Classroom', building: 'Main Academic Block', floor: 2, hasProjector: true, hasAC: true, description: 'Large lecture hall', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'r-202', name: 'R-202', capacity: 45, type: 'Classroom', building: 'Main Academic Block', floor: 2, hasProjector: true, hasAC: false, description: 'Standard classroom', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'r-301', name: 'R-301', capacity: 55, type: 'Classroom', building: 'Main Academic Block', floor: 3, hasProjector: true, hasAC: true, description: 'Classroom with modern facilities', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'r-401', name: 'R-401', capacity: 35, type: 'Classroom', building: 'Main Academic Block', floor: 4, hasProjector: false, hasAC: false, description: 'Small classroom for seminars', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  
  // Chemistry Department Rooms
  { id: 'chem-301', name: 'Chem-301', capacity: 50, type: 'Classroom', building: 'Science Block', floor: 3, hasProjector: true, hasAC: true, description: 'Chemistry lecture hall', programTypes: ['BS'], primaryDepartmentId: 'd2', availableForOtherDepartments: true },
  { id: 'chem-lab1', name: 'Chem-Lab1', capacity: 25, type: 'Laboratory', building: 'Science Block', floor: 3, hasProjector: false, hasAC: true, description: 'General Chemistry Lab with fume hoods', programTypes: ['BS'], primaryDepartmentId: 'd2', availableForOtherDepartments: false },
  { id: 'chem-lab2', name: 'Chem-Lab2', capacity: 20, type: 'Laboratory', building: 'Science Block', floor: 3, hasProjector: false, hasAC: true, description: 'Organic Chemistry Lab', programTypes: ['BS'], primaryDepartmentId: 'd2', availableForOtherDepartments: false },
  
  // Physics Department Rooms
  { id: 'phys-201', name: 'Phys-201', capacity: 60, type: 'Classroom', building: 'Science Block', floor: 2, hasProjector: true, hasAC: true, description: 'Physics lecture hall', programTypes: ['BS'], primaryDepartmentId: 'd10', availableForOtherDepartments: true },
  { id: 'phys-lab1', name: 'Phys-Lab1', capacity: 30, type: 'Laboratory', building: 'Science Block', floor: 2, hasProjector: false, hasAC: false, description: 'General Physics Lab', programTypes: ['BS'], primaryDepartmentId: 'd10', availableForOtherDepartments: false },
  
  // Mathematics Department Rooms
  { id: 'math-101', name: 'Math-101', capacity: 80, type: 'Classroom', building: 'Mathematics Block', floor: 1, hasProjector: true, hasAC: true, description: 'Large mathematics lecture hall', programTypes: ['Inter', 'BS'], primaryDepartmentId: 'd9', availableForOtherDepartments: true },
  { id: 'math-201', name: 'Math-201', capacity: 50, type: 'Classroom', building: 'Mathematics Block', floor: 2, hasProjector: true, hasAC: false, description: 'Mathematics classroom', programTypes: ['Inter', 'BS'], primaryDepartmentId: 'd9', availableForOtherDepartments: true },
  
  // English Department Rooms
  { id: 'eng-101', name: 'Eng-101', capacity: 40, type: 'Classroom', building: 'Humanities Block', floor: 1, hasProjector: true, hasAC: true, description: 'English language lab', programTypes: ['Inter', 'BS'], primaryDepartmentId: 'd5', availableForOtherDepartments: true },
  { id: 'eng-201', name: 'Eng-201', capacity: 35, type: 'Classroom', building: 'Humanities Block', floor: 2, hasProjector: false, hasAC: false, description: 'Literature classroom', programTypes: ['Inter'], primaryDepartmentId: 'd5', availableForOtherDepartments: true },
  
  // Economics Department Rooms
  { id: 'econ-301', name: 'Econ-301', capacity: 65, type: 'Classroom', building: 'Business Block', floor: 3, hasProjector: true, hasAC: true, description: 'Economics lecture hall', programTypes: ['BS'], primaryDepartmentId: 'd3', availableForOtherDepartments: true },
  
  // Inter-specific Rooms
  { id: 'inter-hall1', name: 'Inter Hall 1', capacity: 120, type: 'Classroom', building: 'Intermediate Block', floor: 1, hasProjector: true, hasAC: true, description: 'Large hall for intermediate classes', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'inter-hall2', name: 'Inter Hall 2', capacity: 100, type: 'Classroom', building: 'Intermediate Block', floor: 1, hasProjector: true, hasAC: false, description: 'Inter examination hall', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'inter-lab1', name: 'Inter Lab 1', capacity: 40, type: 'Laboratory', building: 'Intermediate Block', floor: 2, hasProjector: false, hasAC: false, description: 'Basic computer lab for intermediate', programTypes: ['Inter'], availableForOtherDepartments: false },
  
  // Special Purpose Rooms
  { id: 'auditorium', name: 'Main Auditorium', capacity: 200, type: 'Auditorium', building: 'Main Block', floor: 0, hasProjector: true, hasAC: true, description: 'Large auditorium for events and seminars', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'conf-room1', name: 'Conference Room 1', capacity: 20, type: 'Conference', building: 'Administrative Block', floor: 2, hasProjector: true, hasAC: true, description: 'Meeting room for faculty', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true },
  { id: 'library-hall', name: 'Library Hall', capacity: 100, type: 'Other', building: 'Library Block', floor: 1, hasProjector: false, hasAC: true, description: 'Study hall in library', programTypes: ['Inter', 'BS'], availableForOtherDepartments: true }
];

  // Computer Science Department Classes
  // Semester 1 (Fall 2024)
export const timetableEntries: TimetableEntry[] = [
  // ========= SEMESTER 1 COURSES - CREDIT HOUR BASED SCHEDULING =========
  
  // Computer Science - Semester 1 (3-credit courses = Monday-Tuesday-Wednesday, 1-credit labs = varies)
  // Section A: First three days (Monday-Tuesday-Wednesday)
  // Programming Fundamentals (3 credits) - Days 1-3
  { id: 'cs_s1_prog_1', semesterId: 'sem1', subjectId: 'cs101', teacherId: 't1', timeSlotId: 'ts1', day: 'Monday', room: 'CS-Lab1' },
  { id: 'cs_s1_prog_2', semesterId: 'sem1', subjectId: 'cs101', teacherId: 't1', timeSlotId: 'ts1', day: 'Tuesday', room: 'CS-Lab1' },
  { id: 'cs_s1_prog_3', semesterId: 'sem1', subjectId: 'cs101', teacherId: 't1', timeSlotId: 'ts1', day: 'Wednesday', room: 'CS-Lab1' },
  
  // Mathematics I (3 credits) - Days 1-3
  { id: 'cs_s1_math_1', semesterId: 'sem1', subjectId: 'cs102', teacherId: 't85', timeSlotId: 'ts2', day: 'Monday', room: 'R-101' },
  { id: 'cs_s1_math_2', semesterId: 'sem1', subjectId: 'cs102', teacherId: 't85', timeSlotId: 'ts2', day: 'Tuesday', room: 'R-101' },
  { id: 'cs_s1_math_3', semesterId: 'sem1', subjectId: 'cs102', teacherId: 't85', timeSlotId: 'ts2', day: 'Wednesday', room: 'R-101' },
  
  // English I (3 credits) - Days 1-3
  { id: 'cs_s1_eng_1', semesterId: 'sem1', subjectId: 'cs103', teacherId: 't37', timeSlotId: 'ts3', day: 'Monday', room: 'R-102' },
  { id: 'cs_s1_eng_2', semesterId: 'sem1', subjectId: 'cs103', teacherId: 't37', timeSlotId: 'ts3', day: 'Tuesday', room: 'R-102' },
  { id: 'cs_s1_eng_3', semesterId: 'sem1', subjectId: 'cs103', teacherId: 't37', timeSlotId: 'ts3', day: 'Wednesday', room: 'R-102' },

  // Section B: Last three days (Thursday-Friday-Saturday)
  // Programming Fundamentals (3 credits) - Days 4-6
  { id: 'cs_s1b_prog_1', semesterId: 'sem1', subjectId: 'cs101', teacherId: 't2', timeSlotId: 'ts1', day: 'Thursday', room: 'CS-Lab2' },
  { id: 'cs_s1b_prog_2', semesterId: 'sem1', subjectId: 'cs101', teacherId: 't2', timeSlotId: 'ts1', day: 'Friday', room: 'CS-Lab2' },
  { id: 'cs_s1b_prog_3', semesterId: 'sem1', subjectId: 'cs101', teacherId: 't2', timeSlotId: 'ts1', day: 'Saturday', room: 'CS-Lab2' },

  // Chemistry - Semester 1 (3-credit courses = Days 1-3, 1-credit labs = varies)
  // Section A: First three days
  // General Chemistry I (3 credits) - Days 1-3
  { id: 'chem_s1_gen_1', semesterId: 'sem1', subjectId: 'chem101', teacherId: 't6', timeSlotId: 'ts1', day: 'Monday', room: 'Chem-301' },
  { id: 'chem_s1_gen_2', semesterId: 'sem1', subjectId: 'chem101', teacherId: 't6', timeSlotId: 'ts1', day: 'Tuesday', room: 'Chem-301' },
  { id: 'chem_s1_gen_3', semesterId: 'sem1', subjectId: 'chem101', teacherId: 't6', timeSlotId: 'ts1', day: 'Wednesday', room: 'Chem-301' },
  
  // Chemistry Lab I (1 credit) - Wednesday only
  { id: 'chem_s1_lab_1', semesterId: 'sem1', subjectId: 'chem102', teacherId: 't7', timeSlotId: 'ts2', day: 'Wednesday', room: 'Chem-Lab1', isLab: true },
  
  // Mathematics for Chemistry (3 credits) - Days 1-3
  { id: 'chem_s1_math_1', semesterId: 'sem1', subjectId: 'chem103', teacherId: 't85', timeSlotId: 'ts3', day: 'Monday', room: 'R-201' },
  { id: 'chem_s1_math_2', semesterId: 'sem1', subjectId: 'chem103', teacherId: 't85', timeSlotId: 'ts3', day: 'Tuesday', room: 'R-201' },
  { id: 'chem_s1_math_3', semesterId: 'sem1', subjectId: 'chem103', teacherId: 't85', timeSlotId: 'ts3', day: 'Wednesday', room: 'R-201' },

  // Economics - Semester 1 (3-credit courses = Days 1-3)
  // Section A: First three days
  // Principles of Economics (3 credits) - Days 1-3
  { id: 'econ_s1_prin_1', semesterId: 'sem1', subjectId: 'econ101', teacherId: 't25', timeSlotId: 'ts4', day: 'Monday', room: 'R-301' },
  { id: 'econ_s1_prin_2', semesterId: 'sem1', subjectId: 'econ101', teacherId: 't25', timeSlotId: 'ts4', day: 'Tuesday', room: 'R-301' },
  { id: 'econ_s1_prin_3', semesterId: 'sem1', subjectId: 'econ101', teacherId: 't25', timeSlotId: 'ts4', day: 'Wednesday', room: 'R-301' },
  
  // Mathematics for Economics (3 credits) - Days 1-3
  { id: 'econ_s1_math_1', semesterId: 'sem1', subjectId: 'econ102', teacherId: 't85', timeSlotId: 'ts5', day: 'Monday', room: 'R-302' },
  { id: 'econ_s1_math_2', semesterId: 'sem1', subjectId: 'econ102', teacherId: 't85', timeSlotId: 'ts5', day: 'Tuesday', room: 'R-302' },
  { id: 'econ_s1_math_3', semesterId: 'sem1', subjectId: 'econ102', teacherId: 't85', timeSlotId: 'ts5', day: 'Wednesday', room: 'R-302' },

  // ========= SEMESTER 5 COURSES - CREDIT HOUR BASED SCHEDULING =========
  
  // Computer Science - Semester 5 (Advanced courses)
  // Section A: First three days
  // Software Engineering (3 credits) - Days 1-3
  { id: 'cs_s5_se_1', semesterId: 'sem1', subjectId: 'cs501', teacherId: 't3', timeSlotId: 'ts4', day: 'Monday', room: 'CS-401' },
  { id: 'cs_s5_se_2', semesterId: 'sem1', subjectId: 'cs501', teacherId: 't3', timeSlotId: 'ts4', day: 'Tuesday', room: 'CS-401' },
  { id: 'cs_s5_se_3', semesterId: 'sem1', subjectId: 'cs501', teacherId: 't3', timeSlotId: 'ts4', day: 'Wednesday', room: 'CS-401' },
  
  // Database Systems (3 credits) - Days 1-3
  { id: 'cs_s5_db_1', semesterId: 'sem1', subjectId: 'cs502', teacherId: 't4', timeSlotId: 'ts5', day: 'Monday', room: 'CS-402' },
  { id: 'cs_s5_db_2', semesterId: 'sem1', subjectId: 'cs502', teacherId: 't4', timeSlotId: 'ts5', day: 'Tuesday', room: 'CS-402' },
  { id: 'cs_s5_db_3', semesterId: 'sem1', subjectId: 'cs502', teacherId: 't4', timeSlotId: 'ts5', day: 'Wednesday', room: 'CS-402' },
  
  // Computer Networks (3 credits) - Days 1-3
  { id: 'cs_s5_net_1', semesterId: 'sem1', subjectId: 'cs503', teacherId: 't5', timeSlotId: 'ts6', day: 'Monday', room: 'CS-403' },
  { id: 'cs_s5_net_2', semesterId: 'sem1', subjectId: 'cs503', teacherId: 't5', timeSlotId: 'ts6', day: 'Tuesday', room: 'CS-403' },
  { id: 'cs_s5_net_3', semesterId: 'sem1', subjectId: 'cs503', teacherId: 't5', timeSlotId: 'ts6', day: 'Wednesday', room: 'CS-403' },
  
  // Operating Systems Lab (1 credit) - Friday only
  { id: 'cs_s5_os_lab', semesterId: 'sem1', subjectId: 'cs504', teacherId: 't6', timeSlotId: 'ts7', day: 'Friday', room: 'CS-Lab3', isLab: true },

  // Chemistry - Semester 5 (Advanced courses)
  // Section A: First three days  
  // Physical Chemistry (3 credits) - Days 1-3
  { id: 'chem_s5_phys_1', semesterId: 'sem1', subjectId: 'chem501', teacherId: 't10', timeSlotId: 'ts4', day: 'Monday', room: 'Chem-501' },
  { id: 'chem_s5_phys_2', semesterId: 'sem1', subjectId: 'chem501', teacherId: 't10', timeSlotId: 'ts4', day: 'Tuesday', room: 'Chem-501' },
  { id: 'chem_s5_phys_3', semesterId: 'sem1', subjectId: 'chem501', teacherId: 't10', timeSlotId: 'ts4', day: 'Wednesday', room: 'Chem-501' },
  
  // Analytical Chemistry (3 credits) - Days 1-3
  { id: 'chem_s5_anal_1', semesterId: 'sem1', subjectId: 'chem502', teacherId: 't11', timeSlotId: 'ts5', day: 'Monday', room: 'Chem-502' },
  { id: 'chem_s5_anal_2', semesterId: 'sem1', subjectId: 'chem502', teacherId: 't11', timeSlotId: 'ts5', day: 'Tuesday', room: 'Chem-502' },
  { id: 'chem_s5_anal_3', semesterId: 'sem1', subjectId: 'chem502', teacherId: 't11', timeSlotId: 'ts5', day: 'Wednesday', room: 'Chem-502' },
  
  // Instrumental Analysis (2 credits) - Days 1-2
  { id: 'chem_s5_inst_1', semesterId: 'sem1', subjectId: 'chem503', teacherId: 't12', timeSlotId: 'ts6', day: 'Monday', room: 'Chem-503' },
  { id: 'chem_s5_inst_2', semesterId: 'sem1', subjectId: 'chem503', teacherId: 't12', timeSlotId: 'ts6', day: 'Tuesday', room: 'Chem-503' },
  
  // Advanced Chemistry Lab (1 credit) - Thursday only
  { id: 'chem_s5_adv_lab', semesterId: 'sem1', subjectId: 'chem504', teacherId: 't13', timeSlotId: 'ts7', day: 'Thursday', room: 'Chem-Lab2', isLab: true },

  // Economics - Semester 5 (Advanced courses)
  // Section A: First three days
  // International Economics (3 credits) - Days 1-3
  { id: 'econ_s5_intl_1', semesterId: 'sem1', subjectId: 'econ501', teacherId: 't27', timeSlotId: 'ts4', day: 'Monday', room: 'R-501' },
  { id: 'econ_s5_intl_2', semesterId: 'sem1', subjectId: 'econ501', teacherId: 't27', timeSlotId: 'ts4', day: 'Tuesday', room: 'R-501' },
  { id: 'econ_s5_intl_3', semesterId: 'sem1', subjectId: 'econ501', teacherId: 't27', timeSlotId: 'ts4', day: 'Wednesday', room: 'R-501' },
  
  // Development Economics (3 credits) - Days 1-3
  { id: 'econ_s5_dev_1', semesterId: 'sem1', subjectId: 'econ502', teacherId: 't28', timeSlotId: 'ts5', day: 'Monday', room: 'R-502' },
  { id: 'econ_s5_dev_2', semesterId: 'sem1', subjectId: 'econ502', teacherId: 't28', timeSlotId: 'ts5', day: 'Tuesday', room: 'R-502' },
  { id: 'econ_s5_dev_3', semesterId: 'sem1', subjectId: 'econ502', teacherId: 't28', timeSlotId: 'ts5', day: 'Wednesday', room: 'R-502' },
  
  // Econometrics (2 credits) - Days 1-2
  { id: 'econ_s5_econom_1', semesterId: 'sem1', subjectId: 'econ503', teacherId: 't29', timeSlotId: 'ts6', day: 'Monday', room: 'R-503' },
  { id: 'econ_s5_econom_2', semesterId: 'sem1', subjectId: 'econ503', teacherId: 't29', timeSlotId: 'ts6', day: 'Tuesday', room: 'R-503' },

  // English - Semester 5 (Advanced courses)
  // Section A: First three days
  // Contemporary Literature (3 credits) - Days 1-3
  { id: 'eng_s5_contemp_1', semesterId: 'sem1', subjectId: 'eng501', teacherId: 't40', timeSlotId: 'ts4', day: 'Monday', room: 'R-601' },
  { id: 'eng_s5_contemp_2', semesterId: 'sem1', subjectId: 'eng501', teacherId: 't40', timeSlotId: 'ts4', day: 'Tuesday', room: 'R-601' },
  { id: 'eng_s5_contemp_3', semesterId: 'sem1', subjectId: 'eng501', teacherId: 't40', timeSlotId: 'ts4', day: 'Wednesday', room: 'R-601' },
  
  // Literary Criticism (3 credits) - Days 1-3
  { id: 'eng_s5_crit_1', semesterId: 'sem1', subjectId: 'eng502', teacherId: 't41', timeSlotId: 'ts5', day: 'Monday', room: 'R-602' },
  { id: 'eng_s5_crit_2', semesterId: 'sem1', subjectId: 'eng502', teacherId: 't41', timeSlotId: 'ts5', day: 'Tuesday', room: 'R-602' },
  { id: 'eng_s5_crit_3', semesterId: 'sem1', subjectId: 'eng502', teacherId: 't41', timeSlotId: 'ts5', day: 'Wednesday', room: 'R-602' },
  
  // Creative Writing (2 credits) - Days 1-2
  { id: 'eng_s5_creative_1', semesterId: 'sem1', subjectId: 'eng503', teacherId: 't42', timeSlotId: 'ts6', day: 'Monday', room: 'R-603' },
  { id: 'eng_s5_creative_2', semesterId: 'sem1', subjectId: 'eng503', teacherId: 't42', timeSlotId: 'ts6', day: 'Tuesday', room: 'R-603' },

  // Mathematics - Semester 5 (Advanced courses)
  // Section A: First three days
  // Real Analysis (3 credits) - Days 1-3
  { id: 'math_s5_real_1', semesterId: 'sem1', subjectId: 'math501', teacherId: 't60', timeSlotId: 'ts4', day: 'Monday', room: 'R-701' },
  { id: 'math_s5_real_2', semesterId: 'sem1', subjectId: 'math501', teacherId: 't60', timeSlotId: 'ts4', day: 'Tuesday', room: 'R-701' },
  { id: 'math_s5_real_3', semesterId: 'sem1', subjectId: 'math501', teacherId: 't60', timeSlotId: 'ts4', day: 'Wednesday', room: 'R-701' },
  
  // Abstract Algebra (3 credits) - Days 1-3
  { id: 'math_s5_abstract_1', semesterId: 'sem1', subjectId: 'math502', teacherId: 't61', timeSlotId: 'ts5', day: 'Monday', room: 'R-702' },
  { id: 'math_s5_abstract_2', semesterId: 'sem1', subjectId: 'math502', teacherId: 't61', timeSlotId: 'ts5', day: 'Tuesday', room: 'R-702' },
  { id: 'math_s5_abstract_3', semesterId: 'sem1', subjectId: 'math502', teacherId: 't61', timeSlotId: 'ts5', day: 'Wednesday', room: 'R-702' },
  
  // Numerical Methods (2 credits) - Days 1-2
  { id: 'math_s5_numerical_1', semesterId: 'sem1', subjectId: 'math503', teacherId: 't62', timeSlotId: 'ts6', day: 'Monday', room: 'R-703' },
  { id: 'math_s5_numerical_2', semesterId: 'sem1', subjectId: 'math503', teacherId: 't62', timeSlotId: 'ts6', day: 'Tuesday', room: 'R-703' },

  // Physics - Semester 5 (Advanced courses)
  // Section A: First three days
  // Quantum Mechanics (3 credits) - Days 1-3
  { id: 'phys_s5_quantum_1', semesterId: 'sem1', subjectId: 'phys501', teacherId: 't100', timeSlotId: 'ts4', day: 'Monday', room: 'Physics-501' },
  { id: 'phys_s5_quantum_2', semesterId: 'sem1', subjectId: 'phys501', teacherId: 't100', timeSlotId: 'ts4', day: 'Tuesday', room: 'Physics-501' },
  { id: 'phys_s5_quantum_3', semesterId: 'sem1', subjectId: 'phys501', teacherId: 't100', timeSlotId: 'ts4', day: 'Wednesday', room: 'Physics-501' },
  
  // Thermodynamics (3 credits) - Days 1-3
  { id: 'phys_s5_thermo_1', semesterId: 'sem1', subjectId: 'phys502', teacherId: 't101', timeSlotId: 'ts5', day: 'Monday', room: 'Physics-502' },
  { id: 'phys_s5_thermo_2', semesterId: 'sem1', subjectId: 'phys502', teacherId: 't101', timeSlotId: 'ts5', day: 'Tuesday', room: 'Physics-502' },
  { id: 'phys_s5_thermo_3', semesterId: 'sem1', subjectId: 'phys502', teacherId: 't101', timeSlotId: 'ts5', day: 'Wednesday', room: 'Physics-502' },
  
  // Solid State Physics (2 credits) - Days 1-2
  { id: 'phys_s5_solid_1', semesterId: 'sem1', subjectId: 'phys503', teacherId: 't102', timeSlotId: 'ts6', day: 'Monday', room: 'Physics-503' },
  { id: 'phys_s5_solid_2', semesterId: 'sem1', subjectId: 'phys503', teacherId: 't102', timeSlotId: 'ts6', day: 'Tuesday', room: 'Physics-503' },
  
  // Advanced Physics Lab (1 credit) - Thursday only
  { id: 'phys_s5_adv_lab', semesterId: 'sem1', subjectId: 'phys504', teacherId: 't103', timeSlotId: 'ts7', day: 'Thursday', room: 'Physics-Lab2', isLab: true },

  // Business Administration - Semester 5 (Advanced courses)
  // Section A: First three days
  // Strategic Management (3 credits) - Days 1-3
  { id: 'bba_s5_strategy_1', semesterId: 'sem1', subjectId: 'bba501', teacherId: 't70', timeSlotId: 'ts4', day: 'Monday', room: 'BBA-501' },
  { id: 'bba_s5_strategy_2', semesterId: 'sem1', subjectId: 'bba501', teacherId: 't70', timeSlotId: 'ts4', day: 'Tuesday', room: 'BBA-501' },
  { id: 'bba_s5_strategy_3', semesterId: 'sem1', subjectId: 'bba501', teacherId: 't70', timeSlotId: 'ts4', day: 'Wednesday', room: 'BBA-501' },
  
  // International Business (3 credits) - Days 1-3
  { id: 'bba_s5_intl_1', semesterId: 'sem1', subjectId: 'bba502', teacherId: 't71', timeSlotId: 'ts5', day: 'Monday', room: 'BBA-502' },
  { id: 'bba_s5_intl_2', semesterId: 'sem1', subjectId: 'bba502', teacherId: 't71', timeSlotId: 'ts5', day: 'Tuesday', room: 'BBA-502' },
  { id: 'bba_s5_intl_3', semesterId: 'sem1', subjectId: 'bba502', teacherId: 't71', timeSlotId: 'ts5', day: 'Wednesday', room: 'BBA-502' },
  
  // Business Ethics (2 credits) - Days 1-2
  { id: 'bba_s5_ethics_1', semesterId: 'sem1', subjectId: 'bba503', teacherId: 't72', timeSlotId: 'ts6', day: 'Monday', room: 'BBA-503' },
  { id: 'bba_s5_ethics_2', semesterId: 'sem1', subjectId: 'bba503', teacherId: 't72', timeSlotId: 'ts6', day: 'Tuesday', room: 'BBA-503' },

  // ========= CONFLICT ENTRIES - INTENTIONALLY ADDED FOR TESTING =========

  // TEACHER CONFLICT 1: Teacher 't1' double-booked on Monday 8:00-9:00
  // Already has: cs_s1_prog_1 at ts1 (8:00-9:00) on Monday
  { id: 'conflict_teacher_1', semesterId: 'sem1', subjectId: 'cs102', teacherId: 't1', timeSlotId: 'ts1', day: 'Monday', room: 'R-401', note: 'CONFLICT: Teacher t1 also teaching cs_s1_prog_1 at same time' },

  // TEACHER CONFLICT 2: Teacher 't85' triple-booked on Monday 9:00-10:00
  // Already has multiple entries at ts2 (9:00-10:00) on Monday
  { id: 'conflict_teacher_2a', semesterId: 'sem1', subjectId: 'math101', teacherId: 't85', timeSlotId: 'ts2', day: 'Monday', room: 'R-501', note: 'CONFLICT: Teacher t85 also teaching cs_s1_math_1, chem_s1_math_1, econ_s1_math_1 at same time' },
  { id: 'conflict_teacher_2b', semesterId: 'sem1', subjectId: 'phys101', teacherId: 't85', timeSlotId: 'ts2', day: 'Monday', room: 'R-502', note: 'CONFLICT: Teacher t85 also teaching multiple courses at same time' },

  // ROOM CONFLICT 1: Room 'CS-Lab1' double-booked on Monday 8:00-9:00
  // Already has: cs_s1_prog_1 at ts1 (8:00-9:00) on Monday
  { id: 'conflict_room_1', semesterId: 'sem1', subjectId: 'phys101', teacherId: 't57', timeSlotId: 'ts1', day: 'Monday', room: 'CS-Lab1', note: 'CONFLICT: Room CS-Lab1 also booked for cs_s1_prog_1 at same time' },

  // ROOM CONFLICT 2: Room 'R-301' triple-booked on Monday
  // Already has: econ_s1_prin_1 at ts4 (11:15-12:15) on Monday
  { id: 'conflict_room_2a', semesterId: 'sem1', subjectId: 'bba101', teacherId: 't70', timeSlotId: 'ts4', day: 'Monday', room: 'R-301', note: 'CONFLICT: Room R-301 also booked for econ_s1_prin_1 at same time' },
  { id: 'conflict_room_2b', semesterId: 'sem1', subjectId: 'eng101', teacherId: 't37', timeSlotId: 'ts4', day: 'Monday', room: 'R-301', note: 'CONFLICT: Room R-301 also triple-booked' },

  // TEACHER CONFLICT 3: Teacher 't37' double-booked on Monday
  // Already has: cs_s1_eng_1 at ts3 (10:00-11:00) on Monday
  { id: 'conflict_teacher_3', semesterId: 'sem1', subjectId: 'math102', teacherId: 't37', timeSlotId: 'ts3', day: 'Monday', room: 'R-601', note: 'CONFLICT: Teacher t37 also teaching cs_s1_eng_1 at same time' },

  // ROOM CONFLICT 3: Room 'Chem-301' double-booked on Monday
  // Already has: chem_s1_gen_1 at ts1 (8:00-9:00) on Monday
  { id: 'conflict_room_3', semesterId: 'sem1', subjectId: 'phys102', teacherId: 't99', timeSlotId: 'ts1', day: 'Monday', room: 'Chem-301', note: 'CONFLICT: Room Chem-301 also booked for chem_s1_gen_1 at same time', isLab: true },

  // COMPLEX CONFLICT: Both teacher and room conflict
  // Teacher 't6' and Room 'CS-Lab1' both conflicted
  { id: 'conflict_complex_1', semesterId: 'sem1', subjectId: 'chem201', teacherId: 't6', timeSlotId: 'ts1', day: 'Monday', room: 'CS-Lab1', note: 'COMPLEX CONFLICT: Teacher t6 teaching chem_s1_gen_1, Room CS-Lab1 also booked for cs_s1_prog_1' },

  // ========= DEMONSTRATION ENTRIES FOR DAY DISPLAY FORMATTING =========
  
  // BBA course demonstration - showing consecutive days (1-3) pattern
  { id: 'demo_consecutive_1', semesterId: 'sem1', subjectId: 'bba101', teacherId: 't78', timeSlotId: 'ts7', day: 'Monday', room: 'Demo-101' },
  { id: 'demo_consecutive_2', semesterId: 'sem1', subjectId: 'bba101', teacherId: 't78', timeSlotId: 'ts7', day: 'Tuesday', room: 'Demo-101' },
  { id: 'demo_consecutive_3', semesterId: 'sem1', subjectId: 'bba101', teacherId: 't78', timeSlotId: 'ts7', day: 'Wednesday', room: 'Demo-101' },

  // Math course demonstration - showing non-consecutive days (2,5) pattern
  { id: 'demo_non_consecutive_1', semesterId: 'sem1', subjectId: 'math101', teacherId: 't56', timeSlotId: 'ts7', day: 'Tuesday', room: 'Demo-201' },
  { id: 'demo_non_consecutive_2', semesterId: 'sem1', subjectId: 'math101', teacherId: 't56', timeSlotId: 'ts7', day: 'Friday', room: 'Demo-201' },

  // Physics course demonstration - showing single day (3) pattern
  { id: 'demo_single_day', semesterId: 'sem1', subjectId: 'phys101', teacherId: 't57', timeSlotId: 'ts7', day: 'Wednesday', room: 'Demo-301' },
];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
