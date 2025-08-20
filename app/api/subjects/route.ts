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
    const data = await request.json();
    const newSubject = await prisma.subject.create({
      data,
    });
    return NextResponse.json(newSubject, { status: 201 });
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

    const data = await request.json();
    const updatedSubject = await prisma.subject.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(updatedSubject);
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
