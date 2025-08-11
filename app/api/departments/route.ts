import { NextRequest, NextResponse } from 'next/server';
import { readJsonArray, writeJsonArray } from '@/app/lib/fsJson';

const FILE = 'departments.json';

export async function GET() {
  try {
    const departments = await readJsonArray(FILE);
    return NextResponse.json(departments);
  } catch (err) {
    console.error('Error reading departments:', err);
    return NextResponse.json({ error: 'Failed to read departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const departments = await request.json();
    await writeJsonArray(FILE, departments);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing departments:', err);
    return NextResponse.json({ error: 'Failed to write departments' }, { status: 500 });
  }
}
