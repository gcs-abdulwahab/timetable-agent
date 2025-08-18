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

// POST - Create a new teacher in the database
export async function POST(request: NextRequest) {
  try {
    const teacherData = await request.json();
    
    const newTeacher = await prisma.teacher.create({
      data: {
        name: teacherData.name,
        shortName: teacherData.shortName,
        departmentId: teacherData.departmentId,
        designation: teacherData.designation,
      },
    });
    
    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    const teacherData = await request.json();
    if (!id && teacherData.id) {
      id = teacherData.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: teacherData.name,
        shortName: teacherData.shortName,
        departmentId: teacherData.departmentId,
        designation: teacherData.designation,
      },
    });

    return NextResponse.json(updatedTeacher, { status: 200 });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => null);
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    await prisma.teacher.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: 'Teacher deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}
