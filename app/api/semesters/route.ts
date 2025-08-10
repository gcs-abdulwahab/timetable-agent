import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

// Force Node.js runtime to guarantee access to Node APIs
export const runtime = 'nodejs';

const dataDir = path.join(process.cwd(), 'data');
const semestersFile = path.join(dataDir, 'semesters.json');

export async function GET() {
  try {
    const data = await fs.readFile(semestersFile, 'utf8');
    const semesters = JSON.parse(data);
    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error reading semesters:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const semesters = await request.json();
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    await fs.writeFile(semestersFile, JSON.stringify(semesters, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving semesters:', error);
    return NextResponse.json(
      { error: 'Failed to save semesters' },
      { status: 500 }
    );
  }
}