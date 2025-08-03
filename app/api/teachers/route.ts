import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory already exists or other error
  }
}

// GET - Read teachers
export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(TEACHERS_FILE, 'utf8');
      return NextResponse.json(JSON.parse(data));
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error reading teachers:', error);
    return NextResponse.json({ error: 'Failed to read teachers' }, { status: 500 });
  }
}

// POST - Write teachers
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const teachers = await request.json();
    await fs.writeFile(TEACHERS_FILE, JSON.stringify(teachers, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing teachers:', error);
    return NextResponse.json({ error: 'Failed to write teachers' }, { status: 500 });
  }
}
