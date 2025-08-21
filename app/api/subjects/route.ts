import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ Validate required fields
    if (!body.name || !body.code || !body.departmentId || !body.semesterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ subjectDepartments must be an array (optional)
    if (body.subjectDepartments && !Array.isArray(body.subjectDepartments)) {
      return NextResponse.json({ error: 'subjectDepartments must be an array' }, { status: 400 });
    }

    // ✅ Create subject with integer array for departments
    const subject = await prisma.subject.create({
      data: {
        name: body.name,
        code: body.code,
        creditHours: body.creditHours ?? 3,
        departmentId: body.departmentId, // main department
        semesterId: body.semesterId,
        isCore: body.isCore ?? false,
        subjectDepartments: body.subjectDepartments ?? [], // PostgreSQL int[] array
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
// End of API methods


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


// PUT - Update a subject
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, code, creditHours, departmentId, semesterId, isCore, subjectDepartments } = body;
    if (!id || !name || !code || !departmentId || !semesterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (subjectDepartments && !Array.isArray(subjectDepartments)) {
      return NextResponse.json({ error: 'subjectDepartments must be an array' }, { status: 400 });
    }
    // Update subject
    const updated = await prisma.subject.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        code,
        creditHours: creditHours ?? 3,
        departmentId,
        semesterId,
        isCore: isCore ?? false,
        subjectDepartments: subjectDepartments ?? [],
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }

