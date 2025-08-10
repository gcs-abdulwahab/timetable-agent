// Types for our timetable data
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean; // Indicates if the department offers BS degree programs
  bsSemesterAvailability?: {
    offeredLevels?: number[];
    excludedLevels?: number[];
  };
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
  departmentId: string; // Department that offers this subject in their curriculum
  semesterLevel: number; // 1-8 for BS programs
  isCore: boolean; // Core vs Elective
  isMajor?: boolean; // Major (taught by same department) vs Minor (taught by other departments) - optional for backwards compatibility
  teachingDepartmentIds?: string[]; // Department(s) that actually teach this subject - optional for backwards compatibility
  semesterId?: string; // Which semester this subject belongs to (sem1, sem3, sem5, sem7)
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
  hasProjector?: boolean; // Default: false (only rooms "2" and "3" should have projector)
  hasAC?: boolean; // Default: false (only rooms "2" and "3" should have AC)
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
  { id: 'd18', name: 'Islamic Studies', shortName: 'Islamic Studies', offersBSDegree: true, bsSemesterAvailability: { excludedLevels: [1, 3, 5] } },
  { id: 'd22', name: 'Botany', shortName: 'Botany', offersBSDegree: true, bsSemesterAvailability: { excludedLevels: [1] } },
  { id: 'd23', name: 'Islamyat', shortName: 'Islamyat', offersBSDegree: true, bsSemesterAvailability: { excludedLevels: [1, 3, 5] } },
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
  { id: 't71', name: 'Dr. Jane Doe', shortName: 'Dr. Jane Doe', departmentId: 'd20' },
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
  { id: 'cs101', name: 'Programming Fundamentals', shortName: 'Prog Fund', code: 'CS-101', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 1, isCore: true, isMajor: true, teachingDepartmentIds: ['d6'], semesterId: 'sem1' },
  { id: 'cs102', name: 'Mathematics I', shortName: 'Math I', code: 'MATH-101', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'cs103', name: 'English I', shortName: 'Eng I', code: 'ENG-101', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'cs104', name: 'Introduction to Computing', shortName: 'Intro CS', code: 'CS-102', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'cs105', name: 'Computer Programming Lab', shortName: 'CS Lab', code: 'CS-103', creditHours: 1, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  
  // Semester 3
  { id: 'cs301', name: 'Data Structures', shortName: 'DS', code: 'CS-301', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'cs302', name: 'Database Systems', shortName: 'Database', code: 'CS-302', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'cs303', name: 'Computer Networks', shortName: 'Networks', code: 'CS-303', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'cs304', name: 'Web Development', shortName: 'Web Dev', code: 'CS-304', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'cs305', name: 'Software Engineering', shortName: 'SE', code: 'CS-305', creditHours: 3, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  
  // Semester 5
  { id: 'cs501', name: 'Artificial Intelligence', shortName: 'AI', code: 'CS-501', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'cs502', name: 'Machine Learning', shortName: 'ML', code: 'CS-502', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'cs503', name: 'Operating Systems', shortName: 'OS', code: 'CS-503', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'cs504', name: 'Computer Graphics', shortName: 'Graphics', code: 'CS-504', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'cs505', name: 'Cyber Security', shortName: 'Security', code: 'CS-505', creditHours: 3, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  
  // Semester 7
  { id: 'cs701', name: 'Distributed Systems', shortName: 'Distributed', code: 'CS-701', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'cs702', name: 'Cloud Computing', shortName: 'Cloud', code: 'CS-702', creditHours: 3, color: 'bg-gray-150', departmentId: 'd6', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'cs703', name: 'Mobile App Development', shortName: 'Mobile Dev', code: 'CS-703', creditHours: 3, color: 'bg-gray-200', departmentId: 'd6', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'cs704', name: 'Blockchain Technology', shortName: 'Blockchain', code: 'CS-704', creditHours: 3, color: 'bg-gray-250', departmentId: 'd6', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'cs705', name: 'Project Management', shortName: 'PM', code: 'CS-705', creditHours: 3, color: 'bg-gray-300', departmentId: 'd6', semesterLevel: 7, isCore: true, semesterId: 'sem7' },

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

  // Business Administration Department (d20) - 5 subjects per semester
  // Semester 1
  { id: 'bba101', name: 'Subject A', shortName: 'Subject A', code: 'BBA-101', creditHours: 3, color: 'bg-blue-100', departmentId: 'd20', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'bba102', name: 'Business Communication', shortName: 'Bus Comm', code: 'BBA-102', creditHours: 3, color: 'bg-blue-150', departmentId: 'd20', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'bba103', name: 'Introduction to Business', shortName: 'Intro Bus', code: 'BBA-103', creditHours: 3, color: 'bg-blue-200', departmentId: 'd20', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'bba104', name: 'Principles of Management', shortName: 'Mgmt', code: 'BBA-104', creditHours: 3, color: 'bg-blue-250', departmentId: 'd20', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'bba105', name: 'Business Mathematics', shortName: 'Bus Math', code: 'BBA-105', creditHours: 3, color: 'bg-blue-300', departmentId: 'd20', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  
  // Semester 3
  { id: 'bba201', name: 'Subject B', shortName: 'Subject B', code: 'BBA-201', creditHours: 3, color: 'bg-blue-100', departmentId: 'd20', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bba202', name: 'Marketing Management', shortName: 'Marketing', code: 'BBA-202', creditHours: 3, color: 'bg-blue-150', departmentId: 'd20', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bba203', name: 'Financial Management', shortName: 'Finance', code: 'BBA-203', creditHours: 3, color: 'bg-blue-200', departmentId: 'd20', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bba204', name: 'Human Resource Management', shortName: 'HRM', code: 'BBA-204', creditHours: 3, color: 'bg-blue-250', departmentId: 'd20', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bba205', name: 'Operations Management', shortName: 'Operations', code: 'BBA-205', creditHours: 3, color: 'bg-blue-300', departmentId: 'd20', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  
  // Semester 5
  { id: 'bba501', name: 'Subject C', shortName: 'Subject C', code: 'BBA-501', creditHours: 3, color: 'bg-blue-100', departmentId: 'd20', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'bba502', name: 'International Business', shortName: 'Intl Bus', code: 'BBA-502', creditHours: 3, color: 'bg-blue-150', departmentId: 'd20', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'bba503', name: 'Business Ethics', shortName: 'Ethics', code: 'BBA-503', creditHours: 2, color: 'bg-blue-200', departmentId: 'd20', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'bba504', name: 'Strategic Management', shortName: 'Strategy', code: 'BBA-504', creditHours: 3, color: 'bg-blue-250', departmentId: 'd20', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'bba505', name: 'Entrepreneurship', shortName: 'Entrepreneur', code: 'BBA-505', creditHours: 3, color: 'bg-blue-300', departmentId: 'd20', semesterLevel: 5, isCore: true, semesterId: 'sem5' },

  // Botany Department (d22) - Semester 3 subjects
  { id: 'bot_geng201', name: 'General English', shortName: 'Gen Eng', code: 'GENG-201', creditHours: 3, color: 'bg-lime-100', departmentId: 'd22', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bot_gict201', name: 'General Information & Communication Technology', shortName: 'Gen ICT', code: 'GICT-201', creditHours: 3, color: 'bg-lime-150', departmentId: 'd22', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bot_gpst201', name: 'General Pakistan Studies', shortName: 'Gen PST', code: 'GPST-201', creditHours: 3, color: 'bg-lime-200', departmentId: 'd22', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bot_205', name: 'Botany Core Subject 205', shortName: 'Bot 205', code: 'BOT-205', creditHours: 3, color: 'bg-lime-250', departmentId: 'd22', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bot_201', name: 'Botany Core Subject 201', shortName: 'Bot 201', code: 'BOT-201', creditHours: 3, color: 'bg-lime-300', departmentId: 'd22', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'bot_203', name: 'Botany Core Subject 203', shortName: 'Bot 203', code: 'BOT-203', creditHours: 3, color: 'bg-lime-350', departmentId: 'd22', semesterLevel: 3, isCore: true, semesterId: 'sem3' },

  // Political Science Department (d11) - 5 subjects per semester
  // Semester 1
  { id: 'pols101', name: 'Introduction to Political Science', shortName: 'Intro Pols', code: 'POLS-101', creditHours: 3, color: 'bg-green-100', departmentId: 'd11', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'pols102', name: 'Political Theory', shortName: 'Pol Theory', code: 'POLS-102', creditHours: 3, color: 'bg-green-150', departmentId: 'd11', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'pols103', name: 'Comparative Politics', shortName: 'Comp Pol', code: 'POLS-103', creditHours: 3, color: 'bg-green-200', departmentId: 'd11', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'pols104', name: 'Constitutional Law', shortName: 'Const Law', code: 'POLS-104', creditHours: 3, color: 'bg-green-250', departmentId: 'd11', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  { id: 'pols105', name: 'Public Administration', shortName: 'Pub Admin', code: 'POLS-105', creditHours: 3, color: 'bg-green-300', departmentId: 'd11', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
  
  // Semester 3
  { id: '3078', name: 'Contemporary Critical Thinking Issues II', shortName: 'Critical Thinking II', code: 'POLS-301', creditHours: 3, color: 'bg-green-100', departmentId: 'd11', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'pols302', name: 'International Relations', shortName: 'Intl Relations', code: 'POLS-302', creditHours: 3, color: 'bg-green-150', departmentId: 'd11', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'pols303', name: 'Political Economy', shortName: 'Pol Economy', code: 'POLS-303', creditHours: 3, color: 'bg-green-200', departmentId: 'd11', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'pols304', name: 'Research Methods', shortName: 'Research', code: 'POLS-304', creditHours: 3, color: 'bg-green-250', departmentId: 'd11', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  { id: 'pols305', name: 'Human Rights', shortName: 'Human Rights', code: 'POLS-305', creditHours: 3, color: 'bg-green-300', departmentId: 'd11', semesterLevel: 3, isCore: true, semesterId: 'sem3' },
  
  // Semester 5
  { id: 'pols501', name: 'Advanced Political Theory', shortName: 'Adv Pol Theory', code: 'POLS-501', creditHours: 3, color: 'bg-green-100', departmentId: 'd11', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'pols502', name: 'Public Policy Analysis', shortName: 'Policy Analysis', code: 'POLS-502', creditHours: 3, color: 'bg-green-150', departmentId: 'd11', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'pols503', name: 'Diplomacy and Foreign Policy', shortName: 'Diplomacy', code: 'POLS-503', creditHours: 3, color: 'bg-green-200', departmentId: 'd11', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'pols504', name: 'Political Sociology', shortName: 'Pol Sociology', code: 'POLS-504', creditHours: 3, color: 'bg-green-250', departmentId: 'd11', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  { id: 'pols505', name: 'Democracy and Governance', shortName: 'Democracy', code: 'POLS-505', creditHours: 3, color: 'bg-green-300', departmentId: 'd11', semesterLevel: 5, isCore: true, semesterId: 'sem5' },
  
  // Semester 7
  { id: 'pols701', name: 'Advanced International Relations', shortName: 'Adv Intl Relations', code: 'POLS-701', creditHours: 3, color: 'bg-green-100', departmentId: 'd11', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'pols702', name: 'Thesis Research', shortName: 'Thesis', code: 'POLS-702', creditHours: 6, color: 'bg-green-150', departmentId: 'd11', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'pols703', name: 'Contemporary Global Issues', shortName: 'Global Issues', code: 'POLS-703', creditHours: 3, color: 'bg-green-200', departmentId: 'd11', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'pols704', name: 'Political Leadership', shortName: 'Leadership', code: 'POLS-704', creditHours: 3, color: 'bg-green-250', departmentId: 'd11', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  { id: 'pols705', name: 'Seminar in Political Science', shortName: 'Seminar', code: 'POLS-705', creditHours: 3, color: 'bg-green-300', departmentId: 'd11', semesterLevel: 7, isCore: true, semesterId: 'sem7' },
  
  // Test subject for unknown semester fallback
  { id: 'test101', name: 'Test Subject', shortName: 'Test', code: 'TEST-101', creditHours: 3, color: 'bg-gray-100', departmentId: 'd6', semesterLevel: 1, isCore: true, semesterId: 'sem1' },
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
  // Intermediate Program Rooms (with R- prefix)
  { id: 'r-6', name: 'R-6', capacity: 50, type: 'Classroom', building: 'Intermediate Block A', floor: 1, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-7', name: 'R-7', capacity: 50, type: 'Classroom', building: 'Intermediate Block A', floor: 1, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-8', name: 'R-8', capacity: 50, type: 'Classroom', building: 'Intermediate Block A', floor: 1, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-9', name: 'R-9', capacity: 50, type: 'Classroom', building: 'Intermediate Block A', floor: 1, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-10', name: 'R-10', capacity: 50, type: 'Classroom', building: 'Intermediate Block A', floor: 1, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-11', name: 'R-11', capacity: 50, type: 'Classroom', building: 'Intermediate Block A', floor: 1, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-27', name: 'R-27', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-28', name: 'R-28', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-32', name: 'R-32', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-33', name: 'R-33', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-34', name: 'R-34', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-35', name: 'R-35', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-36', name: 'R-36', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-37', name: 'R-37', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-38', name: 'R-38', capacity: 50, type: 'Classroom', building: 'Intermediate Block B', floor: 2, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-39', name: 'R-39', capacity: 50, type: 'Classroom', building: 'Intermediate Block C', floor: 3, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-40', name: 'R-40', capacity: 50, type: 'Classroom', building: 'Intermediate Block C', floor: 3, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-44', name: 'R-44', capacity: 50, type: 'Classroom', building: 'Intermediate Block C', floor: 3, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-45', name: 'R-45', capacity: 50, type: 'Classroom', building: 'Intermediate Block C', floor: 3, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-71', name: 'R-71', capacity: 50, type: 'Classroom', building: 'Intermediate Block D', floor: 4, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-72', name: 'R-72', capacity: 50, type: 'Classroom', building: 'Intermediate Block D', floor: 4, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-76', name: 'R-76', capacity: 50, type: 'Classroom', building: 'Intermediate Block D', floor: 4, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-95', name: 'R-95', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-96', name: 'R-96', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-97', name: 'R-97', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-98', name: 'R-98', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-100', name: 'R-100', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-101', name: 'R-101', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-102', name: 'R-102', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },
  { id: 'r-103', name: 'R-103', capacity: 50, type: 'Classroom', building: 'Intermediate Block E', floor: 5, hasProjector: true, hasAC: true, description: 'Intermediate classroom', programTypes: ['Inter'], availableForOtherDepartments: false },

  // BS Program Rooms - B-series rooms
  { id: 'b-11', name: 'B11', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-12', name: 'B12', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-13', name: 'B13', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-14', name: 'B14', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-15', name: 'B15', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-17', name: 'B17', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-18', name: 'B18', capacity: 60, type: 'Classroom', building: 'BS Block A', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-21', name: 'B21', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-22', name: 'B22', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-23', name: 'B23', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-24', name: 'B24', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-25', name: 'B25', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-26', name: 'B26', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'b-27', name: 'B27', capacity: 60, type: 'Classroom', building: 'BS Block B', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },

  // BS Program Rooms - Numeric series
  { id: 'bs-1', name: '1', capacity: 60, type: 'Classroom', building: 'BS Block C', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-2', name: '2', capacity: 60, type: 'Classroom', building: 'BS Block C', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-3', name: '3', capacity: 60, type: 'Classroom', building: 'BS Block C', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-7', name: '7', capacity: 60, type: 'Classroom', building: 'BS Block C', floor: 1, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-62', name: '62', capacity: 60, type: 'Classroom', building: 'BS Block D', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-63', name: '63', capacity: 60, type: 'Classroom', building: 'BS Block D', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-64', name: '64', capacity: 60, type: 'Classroom', building: 'BS Block D', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-78', name: '78', capacity: 60, type: 'Classroom', building: 'BS Block D', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-79', name: '79', capacity: 60, type: 'Classroom', building: 'BS Block D', floor: 2, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-104', name: '104', capacity: 60, type: 'Classroom', building: 'BS Block E', floor: 3, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-105', name: '105', capacity: 60, type: 'Classroom', building: 'BS Block E', floor: 3, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-106', name: '106', capacity: 60, type: 'Classroom', building: 'BS Block E', floor: 3, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-111', name: '111', capacity: 60, type: 'Classroom', building: 'BS Block E', floor: 3, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-112', name: '112', capacity: 60, type: 'Classroom', building: 'BS Block E', floor: 3, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-123', name: '123', capacity: 60, type: 'Classroom', building: 'BS Block E', floor: 3, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-121', name: '121', capacity: 60, type: 'Classroom', building: 'BS Block F', floor: 4, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-124', name: '124', capacity: 60, type: 'Classroom', building: 'BS Block F', floor: 4, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-128', name: '128', capacity: 60, type: 'Classroom', building: 'BS Block F', floor: 4, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-132', name: '132', capacity: 60, type: 'Classroom', building: 'BS Block F', floor: 4, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-135', name: '135', capacity: 60, type: 'Classroom', building: 'BS Block F', floor: 4, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true },
  { id: 'bs-136', name: '136', capacity: 60, type: 'Classroom', building: 'BS Block F', floor: 4, hasProjector: true, hasAC: true, description: 'BS program classroom', programTypes: ['BS'], availableForOtherDepartments: true }
];

  // Computer Science Department Classes
  // Semester 1 (Fall 2024)
// Timetable entries are now managed through the allocations.json file
// This export is kept for backward compatibility and initial fallback data
export const timetableEntries: TimetableEntry[] = [];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper functions for semester availability
export const getSemesterLevel = (semOrId: string | Semester): number => {
  const sem = typeof semOrId === 'string' ? semesters.find(s => s.id === semOrId) : semOrId;
  if (!sem) return NaN;
  const m = sem.name ? sem.name.match(/\d+/) : null;
  return m ? parseInt(m[0], 10) : NaN;
};

export const departmentOffersInSemester = (dept: Department, semOrId: string | Semester): boolean => {
  if (!dept.offersBSDegree) return false;
  const level = getSemesterLevel(semOrId);
  if (!Number.isFinite(level)) {
    // Fallback: if semester level cannot be parsed, do not filter out the department
    return dept.offersBSDegree;
  }
  const av = dept.bsSemesterAvailability;
  if (av && Array.isArray(av.offeredLevels) && av.offeredLevels.length) {
    return av.offeredLevels.includes(level);
  }
  if (av && Array.isArray(av.excludedLevels) && av.excludedLevels.length) {
    return !av.excludedLevels.includes(level);
  }
  // Default: if availability not specified, allow all semesters for BS departments
  return dept.offersBSDegree;
};

export const getActiveDepartmentsForSemester = (semOrId: string | Semester): Department[] => {
  return departments.filter(d => departmentOffersInSemester(d, semOrId));
};

// Semester availability normalization utilities
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Returns offered levels array for a department by normalizing bsSemesterAvailability.
 * - If offeredLevels exists, use it.
 * - Else if excludedLevels exists, offered levels are LEVELS minus excludedLevels.
 * - Else if offersBSDegree true, return all LEVELS; otherwise return empty array.
 */
export const getOfferedLevelsForDept = (dept: Department): number[] => {
  const availability = dept.bsSemesterAvailability;
  
  // If offeredLevels exists, use it
  if (availability?.offeredLevels && Array.isArray(availability.offeredLevels)) {
    return [...availability.offeredLevels];
  }
  
  // Else if excludedLevels exists, offered levels are LEVELS minus excludedLevels
  if (availability?.excludedLevels && Array.isArray(availability.excludedLevels)) {
    return LEVELS.filter(level => !availability.excludedLevels!.includes(level));
  }
  
  // Else if offersBSDegree true, return all LEVELS; otherwise return empty array
  return dept.offersBSDegree ? [...LEVELS] : [];
};

/**
 * Returns the updated department object with bsSemesterAvailability.offeredLevels set to the provided array
 * and removes excludedLevels to standardize storage going forward.
 */
export const setOfferedLevelsForDept = (dept: Department, offeredLevels: number[]): Department => {
  return {
    ...dept,
    bsSemesterAvailability: {
      offeredLevels: [...offeredLevels]
      // excludedLevels is intentionally omitted to remove it
    }
  };
};

/**
 * Counts subjects for given departmentId and semester level.
 */
export const countSubjectsForDeptLevel = (departmentId: string, semesterLevel: number): number => {
  return subjects.filter(subject => 
    subject.departmentId === departmentId && subject.semesterLevel === semesterLevel
  ).length;
};

/**
 * Computes the next offeredLevels array when a level is toggled.
 * If the level is currently offered, it will be removed.
 * If the level is not currently offered, it will be added.
 */
export const computeNextOfferedLevels = (dept: Department, toggledLevel: number): number[] => {
  const currentLevels = getOfferedLevelsForDept(dept);
  
  if (currentLevels.includes(toggledLevel)) {
    // Remove the level
    return currentLevels.filter(level => level !== toggledLevel);
  } else {
    // Add the level
    return [...currentLevels, toggledLevel].sort((a, b) => a - b);
  }
};

/**
 * Checks if a department has any subjects across all levels or any offered levels configured.
 * Used for warning when toggling offersBSDegree off.
 */
export const departmentHasSubjectsOrLevels = (dept: Department): boolean => {
  const hasSubjects = subjects.some(subject => subject.departmentId === dept.id);
  const currentLevels = getOfferedLevelsForDept(dept);
  const hasConfiguredLevels = currentLevels.length > 0;
  
  return hasSubjects || hasConfiguredLevels;
};
