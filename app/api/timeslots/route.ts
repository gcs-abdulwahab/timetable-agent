import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';
const prisma = new PrismaClient();

// PUT - Update a time slot by id
export async function PUT(req: NextRequest) {
  try {
    const { id, start, end, period, programId } = await req.json();
    if (!id || !start || !end || typeof period !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const updatedSlot = await prisma.timeSlot.update({
      where: { id: Number(id) },
      data: { start, end, period, programId: programId ?? null },
    });
    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json({ error: 'Failed to update time slot' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
// DELETE - Remove a time slot by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await prisma.timeSlot.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return NextResponse.json({ error: 'Failed to delete time slot' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Add a new time slot to the database
export async function POST(req: NextRequest) {
  try {
    const { start, end, period, programId } = await req.json();
    if (!start || !end || typeof period !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newSlot = await prisma.timeSlot.create({
      data: {
        start,
        end,
        period,
        programId: programId ?? null,
      },
    });
    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json({ error: 'Failed to create time slot' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Fetch all time slots from database
export async function GET() {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { period: 'asc' }
    });
    // No conversion needed, start/end are already strings
    return NextResponse.json(timeSlots);
   
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

