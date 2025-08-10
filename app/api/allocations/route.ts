import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ALLOCATIONS_FILE = path.join(process.cwd(), 'data', 'allocations.json');

export async function GET() {
  try {
    const data = await fs.readFile(ALLOCATIONS_FILE, 'utf8');
    const allocations = JSON.parse(data);
    return NextResponse.json(allocations);
  } catch (error) {
    console.error('Error reading allocations file:', error);
    // Return empty array if file doesn't exist or has error
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const allocations = await request.json();
    
    // Validate that allocations is an array
    if (!Array.isArray(allocations)) {
      return NextResponse.json(
        { error: 'Allocations must be an array' },
        { status: 400 }
      );
    }

    // Ensure the data directory exists
    const dataDir = path.dirname(ALLOCATIONS_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Write the allocations to the file
    await fs.writeFile(ALLOCATIONS_FILE, JSON.stringify(allocations, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, count: allocations.length });
  } catch (error) {
    console.error('Error saving allocations file:', error);
    return NextResponse.json(
      { error: 'Failed to save allocations' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear allocations by writing empty array
    await fs.writeFile(ALLOCATIONS_FILE, '[]', 'utf8');
    return NextResponse.json({ success: true, message: 'Allocations cleared' });
  } catch (error) {
    console.error('Error clearing allocations file:', error);
    return NextResponse.json(
      { error: 'Failed to clear allocations' },
      { status: 500 }
    );
  }
}
