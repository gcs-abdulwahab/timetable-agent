import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

// Force Node.js runtime to guarantee access to Node APIs
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET - Fetch all subjects from database
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Update subjects in database
export async function POST(request: NextRequest) {
  try {
    const subjects = await request.json();
    
    // Update each subject in the database
    const updatePromises = subjects.map((subject: any) =>
      prisma.subject.upsert({
        where: { id: subject.id },
        update: {
          name: subject.name,
          code: subject.code,
          creditHours: subject.creditHours,
          color: subject.color,
          departmentId: subject.departmentId,
          semesterLevel: subject.semesterLevel,
          isCore: subject.isCore,
          semesterId: subject.semesterId,
        },
        create: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          creditHours: subject.creditHours,
          color: subject.color,
          departmentId: subject.departmentId,
          semesterLevel: subject.semesterLevel,
          isCore: subject.isCore,
          semesterId: subject.semesterId,
        },
      })
    );
    
    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subjects:', error);
    return NextResponse.json({ error: 'Failed to update subjects' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
