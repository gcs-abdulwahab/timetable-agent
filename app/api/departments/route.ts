import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEPARTMENTS_FILE = path.join(DATA_DIR, 'departments.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory already exists or other error
  }
}

// GET - Read departments
export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(DEPARTMENTS_FILE, 'utf8');
      return NextResponse.json(JSON.parse(data));
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error reading departments:', error);
    return NextResponse.json({ error: 'Failed to read departments' }, { status: 500 });
  }
}

// POST - Write departments
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const departments = await request.json();
    await fs.writeFile(DEPARTMENTS_FILE, JSON.stringify(departments, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing departments:', error);
    return NextResponse.json({ error: 'Failed to write departments' }, { status: 500 });
  }
}
