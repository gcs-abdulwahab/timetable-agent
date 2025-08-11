import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function importData() {
  // Import Departments
  const departments = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/departments.json'), 'utf-8'));
  await prisma.department.deleteMany();
  await prisma.department.createMany({ data: departments });

  // Import Semesters
  const semesters = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/semesters.json'), 'utf-8'));
  await prisma.semester.deleteMany();
  await prisma.semester.createMany({ data: semesters });

  // Import Teachers
  const teachers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/teachers.json'), 'utf-8'));
  await prisma.teacher.deleteMany();
  await prisma.teacher.createMany({ data: teachers });

  // Import Subjects
  const subjects = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/subjects.json'), 'utf-8'));
  await prisma.subject.deleteMany();
  await prisma.subject.createMany({ data: subjects });

  // Import Rooms
  const rooms = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/rooms.json'), 'utf-8'));
  await prisma.room.deleteMany();
  await prisma.room.createMany({ data: rooms });

  // Import TimeSlots
  const timeslots = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/timeslots.json'), 'utf-8'));
  await prisma.timeSlot.deleteMany();
  await prisma.timeSlot.createMany({ data: timeslots });

  console.log('All data imported to SQLite!');
}

importData().finally(() => prisma.$disconnect());
