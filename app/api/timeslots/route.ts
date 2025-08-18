import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

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

// POST - Update time slots in database
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Convert time strings to DateTime objects
    const timeToDate = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };
    
    const result = await prisma.timeSlot.upsert({
      where: { 
        id: data.id || 0 
      },
      update: {
        start: timeToDate(data.start),
        end: timeToDate(data.end),
        period: data.period,
      },
      create: {
        start: timeToDate(data.start),
        end: timeToDate(data.end),
        period: data.period,
      },
    });

    return NextResponse.json({
      ...result,
      start: result.start.toTimeString().slice(0, 5),
      end: result.end.toTimeString().slice(0, 5),
    });
  } catch (error) {
    console.error('Error updating time slots:', error);
    return NextResponse.json({ error: 'Failed to update time slots' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
