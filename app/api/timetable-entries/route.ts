// DELETE handler for deleting a timetable entry by id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
    }
    await prisma.timetableEntry.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';
import type { Day } from '../../types/Day';

const prisma = new PrismaClient();

// Minimal local types matching Prisma model for validation in this API route
type TimetableEntryUpdateShape = {
  id: number;
  timeSlotId?: number;
  dayIds?: number[];
  roomId?: number;
};

// Minimal local types matching Prisma model for validation in this API route
type TimetableEntryCreateShape = {
  subjectId: number;
  teacherId?: number;
  timeSlotId: number;
  dayId: number;
  roomId: number;
  semesterId?: number | null;
  departmentId?: number | null;
  [k: string]: unknown;
};

export async function GET() {
  try {
    const entries = await prisma.timetableEntry.findMany({
      include: { subject: { select: { id: true, semesterId: true, departmentId: true } } },
    });

    // Normalize response so consumers can read semesterId/departmentId derived from subject
    const mapped = entries.map((e: Record<string, unknown>) => {
      const subject = (e.subject as Record<string, unknown> | undefined) ?? undefined;
      const semesterId = subject ? (subject['semesterId'] as number | undefined) : (e['semesterId'] as number | undefined);
      const departmentId = subject ? (subject['departmentId'] as number | undefined) : (e['departmentId'] as number | undefined);
      return {
        ...e,
        semesterId,
        departmentId,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching timetable entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}


// PUT handler for updating timeslot, dayIds, and roomId of a single entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
  const { id, timeSlotId, dayIds, roomId, updatedDays, teacherId } = body as TimetableEntryUpdateShape & { updatedDays?: Day[], teacherId?: number };
    if (!id) {
      return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
    }

    // Only update provided fields
  const updateData: Record<string, unknown> = {};
  if (typeof timeSlotId === 'number') updateData.timeSlotId = timeSlotId;
  if (typeof teacherId === 'number') updateData.teacherId = teacherId;
    // Prefer updatedDays if provided, else dayIds
    if (Array.isArray(updatedDays)) {
      updateData.dayIds = updatedDays;
    } else if (Array.isArray(dayIds)) {
      updateData.dayIds = dayIds;
    }
    if (typeof roomId === 'number') updateData.roomId = roomId;

    const updated = await prisma.timetableEntry.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}


// POST handler for creating a single TimetableEntry
export async function POST(request: NextRequest) {
  try {
    const entry = await request.json();
    console.log('Received entry payload:', entry);
    // Validate required fields
    if (!entry.subjectId || !entry.timeSlotId || !entry.roomId) {
      console.log('Missing required fields:', { subjectId: entry.subjectId, timeSlotId: entry.timeSlotId, roomId: entry.roomId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const dataToCreate = {
      subjectId: entry.subjectId,
      timeSlotId: entry.timeSlotId,
      roomId: entry.roomId,
      ...(entry.teacherId !== undefined ? { teacherId: entry.teacherId } : {}),
      ...(entry.dayIds !== undefined ? { dayIds: entry.dayIds } : {}),
    };
    console.log('Data to create:', dataToCreate);
    try {
      const created = await prisma.timetableEntry.create({ data: dataToCreate });
      console.log('Created entry:', created);
      return NextResponse.json(created);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    return NextResponse.json({ error: 'Failed to create entry', details: error }, { status: 500 });
  }
}
