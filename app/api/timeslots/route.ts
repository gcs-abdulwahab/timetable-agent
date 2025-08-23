import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// POST - Add a new time slot to the database
export async function POST(req: NextRequest) {
  try {
    const { start, end, period } = await req.json();
    if (!start || !end || typeof period !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newSlot = await prisma.timeSlot.create({
      data: {
        start: new Date(start),
        end: new Date(end),
        period,
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
    // Convert DateTime objects to time strings
    const formattedSlots = timeSlots.map(slot => ({
      ...slot,
      start: slot.start.toTimeString().slice(0, 5),
      end: slot.end.toTimeString().slice(0, 5)
    }));
    return NextResponse.json(formattedSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

