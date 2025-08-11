import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const slots = await prisma.timeSlot.findMany();
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updatedSlots = await request.json();
    // Here you would update the database with the new slots
    // For now, just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating time slots:', error);
    return NextResponse.json({ error: 'Failed to update slots' }, { status: 500 });
  }
}
