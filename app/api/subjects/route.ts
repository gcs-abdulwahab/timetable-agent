import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const subjectsFile = path.join(dataDir, 'subjects.json');

export async function GET() {
  try {
    const data = await fs.readFile(subjectsFile, 'utf8');
    const subjects = JSON.parse(data);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error reading subjects:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const subjects = await request.json();
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    await fs.writeFile(subjectsFile, JSON.stringify(subjects, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subjects:', error);
    return NextResponse.json(
      { error: 'Failed to save subjects' },
      { status: 500 }
    );
  }
}