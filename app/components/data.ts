// Types for our timetable data
export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree: boolean; // Indicates if the department offers BS degree programs
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
  endTimeSlotId?: string; // For spanning multiple periods (e.g., labs)
  isLab?: boolean; // Flag to identify lab sessions
}

// Sample data
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
  { id: 't54', name: 'Dr. Mehfooz Bhatti', shortName: 'Dr. Mehfooz Bhatti', departmentId: 'd1' },
  { id: 't55', name: 'Dr. Farman Ali', shortName: 'Dr. Farman Ali', departmentId: 'd1' },
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
  { id: 's1', name: 'Biology G1', shortName: 'BBA-101, G1, B21(1-3)', color: 'bg-blue-100', departmentId: 'd1' },
  { id: 's1b', name: 'Biology G2', shortName: 'BBA-101, G2, B22(4-6)', color: 'bg-blue-200', departmentId: 'd1' },
  { id: 's2', name: 'Biotechnology G1', shortName: 'BBA-102, G1, B23(1-3)', color: 'bg-green-100', departmentId: 'd1' },
  { id: 's2b', name: 'Biotechnology G2', shortName: 'BBA-102, G2, B24(4-6)', color: 'bg-green-200', departmentId: 'd1' },
  { id: 's3', name: 'Chemistry', shortName: 'GISL-101, R3(1-2)', color: 'bg-yellow-100', departmentId: 'd2' },
  { id: 's3b', name: 'Chemistry G2', shortName: 'GISL-102, G2, R5(4-6)', color: 'bg-yellow-200', departmentId: 'd2' },
  { id: 's4', name: 'Economics', shortName: 'ECON-104, R-105(1-3)', color: 'bg-purple-100', departmentId: 'd3' },
  { id: 's5', name: 'Education', shortName: 'GISL-101, B11(1-2)', color: 'bg-pink-100', departmentId: 'd4' },
  { id: 's6', name: 'English', shortName: 'ELL-102, R3(1-3)', color: 'bg-indigo-100', departmentId: 'd5' },
  { id: 's7', name: 'Computer Science G1', shortName: 'CS-169, G1, R-124(1-3)', color: 'bg-gray-100', departmentId: 'd6' },
  { id: 's7b', name: 'Computer Science G2', shortName: 'CS-169, G2, R-125(4-6)', color: 'bg-gray-200', departmentId: 'd6' },
  { id: 's7lab', name: 'CS Lab G1', shortName: 'CS-LAB, G1, Lab-1(8-10)', color: 'bg-slate-200', departmentId: 'd6' },
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
  // Lab Session - CS G1 Lab (8:00-10:00) - Friday
  { id: 'elab1', subjectId: 's7lab', teacherId: 't3', classId: 'c1', timeSlotId: 'ts1', endTimeSlotId: 'ts2', day: 'Friday', room: 'Lab-1', isLab: true },
  
  // Period 1 (8:00-9:00) - ALL DEPARTMENTS
  // CS G1 - Monday to Wednesday
  { id: 'e1', subjectId: 's1', teacherId: 't1', classId: 'c1', timeSlotId: 'ts1', day: 'Monday', room: 'B21' },
  { id: 'e2', subjectId: 's2', teacherId: 't2', classId: 'c1', timeSlotId: 'ts1', day: 'Tuesday', room: 'B23' },
  { id: 'e3', subjectId: 's3', teacherId: 't3', classId: 'c1', timeSlotId: 'ts1', day: 'Wednesday', room: 'R3' },
  
  // CS G2 - Thursday to Saturday  
  { id: 'e4', subjectId: 's1b', teacherId: 't1b', classId: 'c3', timeSlotId: 'ts1', day: 'Thursday', room: 'B22' },
  { id: 'e5', subjectId: 's2b', teacherId: 't2b', classId: 'c3', timeSlotId: 'ts1', day: 'Friday', room: 'B24' },
  { id: 'e6', subjectId: 's3b', teacherId: 't3b', classId: 'c3', timeSlotId: 'ts1', day: 'Saturday', room: 'R5' },
  
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
