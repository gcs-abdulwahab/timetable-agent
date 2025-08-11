import { NextRequest, NextResponse } from 'next/server';
import { readJsonArray, writeJsonArray } from '@/app/lib/fsJson';

const FILE = 'semesters.json';

export async function GET() {
  try {
    const semesters = await readJsonArray(FILE);
    return NextResponse.json(semesters);
  } catch (err) {
    console.error('Error reading semesters:', err);
    return NextResponse.json({ error: 'Failed to read semesters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const semesters = await request.json();
    await writeJsonArray(FILE, semesters);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing semesters:', err);
    return NextResponse.json({ error: 'Failed to write semesters' }, { status: 500 });
  }
}
