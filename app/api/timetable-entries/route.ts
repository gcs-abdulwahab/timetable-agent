import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const entries = await prisma.timetableEntry.findMany();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching timetable entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updatedEntries = await request.json();
    // Remove all existing entries (for full replace)
    await prisma.timetableEntry.deleteMany({});
    // Add new entries
    const createPromises = updatedEntries.map((entry: any) =>
      prisma.timetableEntry.create({ data: entry })
    );
    await Promise.all(createPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating timetable entries:', error);
    return NextResponse.json({ error: 'Failed to update entries' }, { status: 500 });
  }
}
