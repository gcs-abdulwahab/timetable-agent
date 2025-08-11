import { NextRequest, NextResponse } from 'next/server';
import { readJsonArray, writeJsonArray } from '@/app/lib/fsJson';

const FILE = 'subjects.json';

export async function GET() {
  try {
    const subjects = await readJsonArray(FILE);
    return NextResponse.json(subjects);
  } catch (err) {
    console.error('Error reading subjects:', err);
    return NextResponse.json({ error: 'Failed to read subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const subjects = await request.json();
    await writeJsonArray(FILE, subjects);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing subjects:', err);
    return NextResponse.json({ error: 'Failed to write subjects' }, { status: 500 });
  }
}
