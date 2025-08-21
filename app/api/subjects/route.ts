import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

// Force Node.js runtime to guarantee access to Node APIs
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET - Fetch all subjects from database
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        department: true,
        semester: true,
      },
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

// POST - Create a new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.code || !body.departmentId || !body.semesterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const subject = await prisma.subject.create({
      data: {
        name: body.name,
        code: body.code,
        creditHours: body.creditHours ?? 3,
        departmentId: body.departmentId,
        semesterId: body.semesterId,
        isCore: body.isCore ?? false,
        color: body.color ?? '#2196f3', // default blue
        semesterLevel: body.semesterLevel ?? 1, // default level
      },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update an existing subject
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }
    const body = await request.json();
    const subject = await prisma.subject.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: body.name,
        code: body.code,
        creditHours: body.creditHours ?? 3,
        departmentId: body.departmentId,
        semesterId: body.semesterId,
        isCore: body.isCore ?? false,
        color: body.color ?? '#2196f3',
        semesterLevel: body.semesterLevel ?? 1,
      },
    });
    return NextResponse.json(subject, { status: 200 });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}



// DELETE - Delete a subject
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    await prisma.subject.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Subject deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
