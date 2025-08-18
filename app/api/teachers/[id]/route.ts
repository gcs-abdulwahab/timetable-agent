import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET a single teacher by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a teacher by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updatedTeacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        name: data.name,
        shortName: data.shortName,
        designation: data.designation,
        departmentId: data.departmentId,
      },
    });
    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a teacher by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id:string } }
) {
  try {
    await prisma.teacher.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2003') {
        return NextResponse.json({ error: 'Cannot delete teacher. They might be assigned to a timetable entry.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
