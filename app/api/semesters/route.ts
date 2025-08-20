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

// POST - Create a new semester
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newSemester = await prisma.semester.create({
      data,
    });
    return NextResponse.json(newSemester, { status: 201 });
  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json({ error: 'Failed to create semester' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update an existing semester
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const updatedSemester = await prisma.semester.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(updatedSemester);
  } catch (error) {
    console.error('Error updating semester:', error);
    return NextResponse.json({ error: 'Failed to update semester' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a semester
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
    }

    await prisma.semester.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Semester deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return NextResponse.json({ error: 'Failed to delete semester' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
