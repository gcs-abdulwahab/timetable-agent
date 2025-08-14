import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all teachers from database
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Update teachers in database
export async function POST(request: NextRequest) {
  try {
    const teachers = await request.json();
    
    // Update each teacher in the database
    const updatePromises = teachers.map((teacher: any) =>
      prisma.teacher.upsert({
        where: { id: teacher.id },
        update: {
          name: teacher.name,
          shortName: teacher.shortName,
          departmentId: teacher.departmentId,
          designation: teacher.designation,
        },
        create: {
          id: teacher.id,
          name: teacher.name,
          shortName: teacher.shortName,
          departmentId: teacher.departmentId,
          designation: teacher.designation,
        },
      })
    );
    
    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating teachers:', error);
    return NextResponse.json({ error: 'Failed to update teachers' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
