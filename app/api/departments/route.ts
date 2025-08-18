import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// ✅ GET - Fetch all departments
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

// ✅ POST - Add a new department
export async function POST(request: Request) {
  try {
    const { id, name, shortName } = await request.json();

    if (!id || !name || !shortName) {
      return NextResponse.json({ error: 'ID, Name and Short Name are required' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        id,
        name,
        shortName,
        offersBSDegree: true // or set this based on your requirements
      }
    });

    return NextResponse.json(department);
    } catch (error) {
    console.error('Failed to create department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

// ✅ PATCH - Update existing department
export async function PATCH(request: Request) {
  try {
    const { id, name, shortName, offersBSDegree } = await request.json();

    if (!id || !name || !shortName || typeof offersBSDegree !== "boolean") {
      return NextResponse.json({ error: 'ID, Name, Short Name, and offersBSDegree (boolean) are required' }, { status: 400 });
    }

      const department = await prisma.department.update({
        where: { id },
        data: { name, shortName, offersBSDegree }
      });

    return NextResponse.json(department);
  } catch (error) {
    console.error('Failed to update department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

// ✅ DELETE - Remove a department
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.department.delete({
      where: { id } // id is a string
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
