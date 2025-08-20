import { PrismaClient } from '../../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const entries = await prisma.timetableEntry.findMany({ include: { subject: true } });
  const total = entries.length;
  const missingSubject = entries.filter(e => !e.subject).map(e => e.id);
  const missingSemester = entries.filter(e => !e.subject || e.subject.semesterId === null || e.subject.semesterId === undefined).map(e => ({ id: e.id, subjectId: e.subjectId }));
  const missingDepartment = entries.filter(e => !e.subject || e.subject.departmentId === null || e.subject.departmentId === undefined).map(e => ({ id: e.id, subjectId: e.subjectId }));

  console.log('Total timetable entries:', total);
  console.log('Entries with missing subject count:', missingSubject.length);
  if (missingSubject.length) console.log('Sample missingSubject IDs:', missingSubject.slice(0, 10));
  console.log('Entries where subject.semesterId is missing count:', missingSemester.length);
  if (missingSemester.length) console.log('Sample:', missingSemester.slice(0, 10));
  console.log('Entries where subject.departmentId is missing count:', missingDepartment.length);
  if (missingDepartment.length) console.log('Sample:', missingDepartment.slice(0, 10));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
