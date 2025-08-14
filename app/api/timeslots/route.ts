import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all time slots from database
export async function GET() {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { period: 'asc' }
    });
    return NextResponse.json(timeSlots);
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
    const timeSlots = await request.json();
    
    // Handle both single object and array of objects
    const slotsArray = Array.isArray(timeSlots) ? timeSlots : [timeSlots];
    
    // Update each time slot in the database
    const updatePromises = slotsArray.map((slot: any) =>
      prisma.timeSlot.upsert({
        where: { id: slot.id },
        update: {
          start: slot.start,
          end: slot.end,
          period: slot.period,
        },
        create: {
          id: slot.id,
          start: slot.start,
          end: slot.end,
          period: slot.period,
        },
      })
    );
    
    const results = await Promise.all(updatePromises);
    return NextResponse.json(Array.isArray(timeSlots) ? { success: true } : results[0]);
  } catch (error) {
    console.error('Error updating time slots:', error);
    return NextResponse.json({ error: 'Failed to update time slots' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
