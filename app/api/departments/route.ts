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

export async function POST(request: NextRequest) {
  try {
    const { id, name, shortName, offersBSDegree, bsSemesterAvailability } = await request.json();

    if (!name || !shortName) {
      return NextResponse.json({ error: "Name and Short Name are required" }, { status: 400 });
    }

    // If ID exists, update; else create new department
    const department = await prisma.department.upsert({
      where: { id: id || "" }, // empty string prevents Prisma error
      update: {
        name,
        shortName,
        offersBSDegree: offersBSDegree ?? false,
        bsSemesterAvailability: bsSemesterAvailability ?? [],
      },
      create: {
        id: id || "", // Provide id for creation
        name,
        shortName,
        offersBSDegree: offersBSDegree ?? false,
        bsSemesterAvailability: bsSemesterAvailability ?? [],
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error adding/updating department:", error);
    return NextResponse.json({ error: "Failed to add or update department" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}