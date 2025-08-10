import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const days = await request.json();
    
    // Validate the data structure
    if (!Array.isArray(days)) {
      return NextResponse.json(
        { error: 'Invalid data format: expected array' },
        { status: 400 }
      );
    }

    // Validate each day object
    for (const day of days) {
      if (!day.id || !day.name || typeof day.active !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid day object: missing required fields' },
          { status: 400 }
        );
      }
    }

    const filePath = join(process.cwd(), 'public', 'data', 'days.json');
    writeFileSync(filePath, JSON.stringify(days, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving days:', error);
    return NextResponse.json(
      { error: 'Failed to save days' },
      { status: 500 }
    );
  }
}
