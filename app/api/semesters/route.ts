import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

export const runtime = 'nodejs';
const prisma = new PrismaClient();

// ✅ GET - Fetch all semesters
export async function GET() {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: [{ name: 'asc' }] // no year/term ordering now
    });
    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST - Bulk update or create semesters
export async function POST(request: NextRequest) {
  try {
    const semesters = await request.json();

    const updatePromises = semesters.map((semester: any) =>
      prisma.semester.upsert({
        where: { id: semester.id },
        update: {
          name: semester.name,
          code: semester.code,
          isActive: semester.isActive,
        },
        create: {
          id: semester.id,
          name: semester.name,
          code: semester.code,
          isActive: semester.isActive,
        },
      })
    );

    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating semesters:', error);
    return NextResponse.json({ error: 'Failed to update semesters' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ PATCH - Edit a single semester
export async function PATCH(request: NextRequest) {
  try {
    const semester = await request.json();
    if (!semester.id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const updated = await prisma.semester.update({
      where: { id: semester.id },
      data: {
        name: semester.name,  
        code: semester.code,
        isActive: semester.isActive,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error editing semester:', error);
    return NextResponse.json({ error: 'Failed to edit semester' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ DELETE - Remove a semester
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.semester.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return NextResponse.json({ error: 'Failed to delete semester' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
