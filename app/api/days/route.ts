import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all days from database
export async function GET() {
  try {
    const days = await prisma.day.findMany({
      orderBy: { dayCode: 'asc' }
    });
    return NextResponse.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new day
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newDay = await prisma.day.create({
      data,
    });
    return NextResponse.json(newDay, { status: 201 });
  } catch (error) {
    console.error('Error creating day:', error);
    return NextResponse.json({ error: 'Failed to create day' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update an existing day
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Day ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const updatedDay = await prisma.day.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(updatedDay);
  } catch (error) {
    console.error('Error updating day:', error);
    return NextResponse.json({ error: 'Failed to update day' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a day
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Day ID is required' }, { status: 400 });
    }

    await prisma.day.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Day deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting day:', error);
    return NextResponse.json({ error: 'Failed to delete day' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
