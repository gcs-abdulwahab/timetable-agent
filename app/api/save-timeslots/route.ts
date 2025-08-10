import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const timeSlots = await request.json();
    
    // Validate the data structure
    if (!Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Invalid data format: expected array' },
        { status: 400 }
      );
    }

    // Validate each time slot object
    for (const slot of timeSlots) {
      if (!slot.id || !slot.start || !slot.end || typeof slot.period !== 'number') {
        return NextResponse.json(
          { error: 'Invalid time slot object: missing required fields' },
          { status: 400 }
        );
      }
    }

    const filePath = join(process.cwd(), 'public', 'data', 'timeslots.json');
    writeFileSync(filePath, JSON.stringify(timeSlots, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving time slots:', error);
    return NextResponse.json(
      { error: 'Failed to save time slots' },
      { status: 500 }
    );
  }
}
