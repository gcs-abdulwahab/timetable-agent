import { NextRequest, NextResponse } from 'next/server';
import { readJsonArray, writeJsonArray } from '@/app/lib/fsJson';

const FILE = 'teachers.json';

export async function GET() {
  try {
    const teachers = await readJsonArray(FILE);
    return NextResponse.json(teachers);
  } catch (err) {
    console.error('Error reading teachers:', err);
    return NextResponse.json({ error: 'Failed to read teachers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const teachers = await request.json();
    await writeJsonArray(FILE, teachers);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing teachers:', err);
    return NextResponse.json({ error: 'Failed to write teachers' }, { status: 500 });
  }
}
