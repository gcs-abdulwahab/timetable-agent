import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

function makeErrorResponse(err: unknown, attempted?: unknown) {
  const eRec = (err && typeof err === 'object') ? (err as Record<string, unknown>) : {};
  const base = {
    name: typeof eRec.name === 'string' ? eRec.name : 'Error',
    message: typeof eRec.message === 'string' ? eRec.message : String(err),
    code: typeof eRec.code === 'string' ? eRec.code : undefined,
    meta: eRec.meta,
    stack: process.env.NODE_ENV === 'development' && typeof eRec.stack === 'string' ? eRec.stack : undefined,
  };
  return NextResponse.json({ error: base.message, details: base, attempted }, { status: 500 });
}

export async function GET() {
  try {
    const entries = await prisma.timetableEntry.findMany();
    return NextResponse.json(entries);
  } catch (_err) {
    console.error('GET /api/allocations error:', _err);
    return makeErrorResponse(_err);
  } finally {
    await prisma.$disconnect();
  }
}

// Type for timetable entry input
type TimetableEntryInput = {
  subjectId: number;
  teacherId: number;
  timeSlotId: number;
  dayId: number;
  roomId: number;
};

// Function to validate and normalize a single entry
function normalizeEntry(entry: TimetableEntryInput) {
  const data = {
    subjectId: entry.subjectId,
    teacherId: entry.teacherId,
    timeSlotId: entry.timeSlotId,
    dayId: entry.dayId,
    roomId: entry.roomId
  };

  if (!Number.isFinite(data.subjectId)) throw new Error('Invalid subjectId');
  if (!Number.isFinite(data.teacherId)) throw new Error('Invalid teacherId');
  if (!Number.isFinite(data.timeSlotId)) throw new Error('Invalid timeSlotId');
  if (!Number.isFinite(data.dayId)) throw new Error('Invalid dayId');
  if (!Number.isFinite(data.roomId)) throw new Error('Invalid roomId');

  return data;
}

// POST endpoint for adding a single entry
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
    console.log('POST /api/allocations received:', JSON.stringify(body, null, 2));

    // Only accept single objects, not arrays
    if (Array.isArray(body)) {
      return NextResponse.json({ 
        error: 'Arrays are not accepted. Send a single entry only.' 
      }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ 
        error: 'Invalid entry format. Must be a single object.' 
      }, { status: 400 });
    }

    // Reject if input contains an id field
    if ('id' in body) {
      return NextResponse.json({ 
        error: 'New entries should not include an id field.' 
      }, { status: 400 });
    }

    try {
      const data = normalizeEntry(body as TimetableEntryInput);
      const entry = await prisma.timetableEntry.create({ data });
      return NextResponse.json({ 
        success: true, 
        entry 
      }, { status: 201 });
    } catch (err) {
      console.error('Failed to create entry:', err);
      return makeErrorResponse(err, body);
    }
  } catch (err) {
    console.error('POST /api/allocations error:', err);
    return makeErrorResponse(err, body);
  } finally {
    await prisma.$disconnect();
  }
}
