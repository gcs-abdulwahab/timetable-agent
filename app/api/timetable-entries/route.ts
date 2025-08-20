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
  teacherId: number;
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

export async function POST(request: NextRequest) {
  try {
    const updatedEntries = await request.json();

    // Remove all existing entries (for full replace)
    await prisma.timetableEntry.deleteMany({});

    // Ensure each entry has semesterId and departmentId (backfill from subject when missing)
    const createPromises = updatedEntries.map(async (entry: TimetableEntryCreateShape) => {
  const toCreate = { ...entry } as TimetableEntryCreateShape;

      if (toCreate.subjectId && (!('semesterId' in toCreate) || !('departmentId' in toCreate))) {
        const subj = await prisma.subject.findUnique({ where: { id: toCreate.subjectId } });
        if (subj) {
          if (!('semesterId' in toCreate)) toCreate.semesterId = subj.semesterId ?? undefined;
          if (!('departmentId' in toCreate)) toCreate.departmentId = subj.departmentId ?? undefined;
        }
      }

  return prisma.timetableEntry.create({ data: toCreate as unknown as never });
    });

    await Promise.all(createPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating timetable entries:', error);
    return NextResponse.json({ error: 'Failed to update entries' }, { status: 500 });
  }
}

// PUT handler for updating timeslot, dayIds, and roomId of a single entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, timeSlotId, dayIds, roomId, updatedDays } = body as TimetableEntryUpdateShape & { updatedDays?: Day[] };
    if (!id) {
      return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
    }

    // Only update provided fields
    const updateData: Record<string, unknown> = {};
    if (typeof timeSlotId === 'number') updateData.timeSlotId = timeSlotId;
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
