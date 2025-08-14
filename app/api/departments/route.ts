import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all departments from database
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Update departments in database
export async function POST(request: NextRequest) {
  try {
    const departments = await request.json();
    
    // Update each department in the database
    const updatePromises = departments.map((dept: any) =>
      prisma.department.upsert({
        where: { id: dept.id },
        update: {
          name: dept.name,
          shortName: dept.shortName,
          offersBSDegree: dept.offersBSDegree,
          bsSemesterAvailability: dept.bsSemesterAvailability,
        },
        create: {
          id: dept.id,
          name: dept.name,
          shortName: dept.shortName,
          offersBSDegree: dept.offersBSDegree,
          bsSemesterAvailability: dept.bsSemesterAvailability,
        },
      })
    );
    
    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating departments:', error);
    return NextResponse.json({ error: 'Failed to update departments' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
