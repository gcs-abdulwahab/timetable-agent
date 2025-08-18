import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create institution GCS
  const institution = await prisma.institution.upsert({
    where: { code: 'GCS' },
    update: { name: 'GCS', code: 'GCS', address: 'GCS Main Campus' },
    create: { name: 'GCS', code: 'GCS', address: 'GCS Main Campus' },
  });

  // Add days for GCS institution
  const days = [
    { name: 'Monday', shortName: 'Mon', dayCode: 1, isActive: true, workingHours: '08:00-16:00', institutionId: institution.id },
    { name: 'Tuesday', shortName: 'Tue', dayCode: 2, isActive: true, workingHours: '08:00-16:00', institutionId: institution.id },
    { name: 'Wednesday', shortName: 'Wed', dayCode: 3, isActive: true, workingHours: '08:00-16:00', institutionId: institution.id },
    { name: 'Thursday', shortName: 'Thu', dayCode: 4, isActive: true, workingHours: '08:00-16:00', institutionId: institution.id },
    { name: 'Friday', shortName: 'Fri', dayCode: 5, isActive: true, workingHours: '08:00-16:00', institutionId: institution.id },
    { name: 'Saturday', shortName: 'Sat', dayCode: 6, isActive: true, workingHours: '08:00-16:00', institutionId: institution.id },
  ];
  for (const day of days) {
    await prisma.day.upsert({
      where: { dayCode: day.dayCode },
      update: day,
      create: day,
    });
  }


  // create 10 demo Rooms with primaryDepartmentId
  // Get first department for demo association
  const firstDepartment = await prisma.department.findFirst({ where: { institutionId: institution.id } });
  const primaryDepartmentId = firstDepartment ? firstDepartment.id : null;
  const rooms = [
    { name: 'CR-101', capacity: 40, type: 'Classroom', building: 'Main Block', floor: 1, hasProjector: true, hasAC: false, description: 'Main classroom for BS program', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId },
    { name: 'Lab-A', capacity: 25, type: 'Laboratory', building: 'Science Block', floor: 2, hasProjector: false, hasAC: true, description: 'Chemistry lab', institutionId: institution.id, availableForOtherDepartments: false, primaryDepartmentId },
    { name: 'Auditorium', capacity: 100, type: 'Auditorium', building: 'Auditorium Block', floor: 1, hasProjector: true, hasAC: true, description: 'Large hall for events', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId },
    { name: 'CR-102', capacity: 35, type: 'Classroom', building: 'Main Block', floor: 1, hasProjector: false, hasAC: true, description: 'Second classroom', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId },
    { name: 'Lab-B', capacity: 20, type: 'Laboratory', building: 'Science Block', floor: 2, hasProjector: true, hasAC: false, description: 'Physics lab', institutionId: institution.id, availableForOtherDepartments: false, primaryDepartmentId },
    { name: 'Conference Room', capacity: 15, type: 'Conference', building: 'Admin Block', floor: 3, hasProjector: true, hasAC: true, description: 'Meeting room', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId },
    { name: 'CR-201', capacity: 30, type: 'Classroom', building: 'Main Block', floor: 2, hasProjector: false, hasAC: false, description: 'Upstairs classroom', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId },
    { name: 'Lab-C', capacity: 18, type: 'Laboratory', building: 'Science Block', floor: 3, hasProjector: false, hasAC: true, description: 'Biology lab', institutionId: institution.id, availableForOtherDepartments: false, primaryDepartmentId },
    { name: 'CR-202', capacity: 32, type: 'Classroom', building: 'Main Block', floor: 2, hasProjector: true, hasAC: true, description: 'Classroom with projector', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId },
    { name: 'CR-301', capacity: 28, type: 'Classroom', building: 'Main Block', floor: 3, hasProjector: false, hasAC: false, description: 'Third floor classroom', institutionId: institution.id, availableForOtherDepartments: true, primaryDepartmentId }
  ];
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: room,
      create: room,
    });
  }

  //  Create Departments
// Create Departments
const departments = [
  { name: 'BBA', shortName: 'BBA', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Biotechnology', shortName: 'Biotech', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Botany', shortName: 'Botany', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Economics', shortName: 'Econ', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Education', shortName: 'Edu', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'English', shortName: 'Eng', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'BS CS', shortName: 'CS', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Geography', shortName: 'Geo', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Statistics', shortName: 'Stats', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Physics', shortName: 'Physics', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Mathematics', shortName: 'Math', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Mass Com', shortName: 'MassCom', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Political Science', shortName: 'PolSci', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Sociology', shortName: 'Socio', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Psychology', shortName: 'Psy', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Chemistry', shortName: 'Chem', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Urdu', shortName: 'Urdu', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
  { name: 'Zoology', shortName: 'Zoo', offersBSDegree: true, bsSemesterAvailability: ['Fall', 'Spring'], institutionId: institution.id },
];

for (const department of departments) {
  await prisma.department.upsert({
    where: { shortName: department.shortName },
    update: department,
    create: department,
  });
}



  //  create eight semesters  where odd semester are active and others are not   by default it is active
  const semesters = [];
  for (let i = 1; i <= 8; i++) {
    semesters.push({
      name: `Semester ${i}`,
      isActive: i % 2 === 1,
      institutionId: institution.id,
    });
  }
  for (const semester of semesters) {
    await prisma.semester.upsert({
      where: { name: semester.name },
      update: semester,
      create: semester,
    });
  }







}

main().finally(() => prisma.$disconnect());
