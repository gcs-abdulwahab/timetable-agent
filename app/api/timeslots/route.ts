import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  period: number;
}

const timeslotsFilePath = path.join(process.cwd(), 'data', 'timeslots.json');

// Helper function to read timeslots from JSON file
function readTimeSlots(): TimeSlot[] {
  try {
    const fileContents = fs.readFileSync(timeslotsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading timeslots file:', error);
    return [];
  }
}

// Helper function to write timeslots to JSON file
function writeTimeSlots(timeslots: TimeSlot[]): boolean {
  try {
    fs.writeFileSync(timeslotsFilePath, JSON.stringify(timeslots, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing timeslots file:', error);
    return false;
  }
}

// GET - Fetch all timeslots
export async function GET() {
  try {
    const timeslots = readTimeSlots();
    return NextResponse.json(timeslots);
  } catch (error) {
    console.error('Error fetching timeslots:', error);
    return NextResponse.json({ error: 'Failed to fetch timeslots' }, { status: 500 });
  }
}

// POST - Add a new timeslot
export async function POST(request: NextRequest) {
  try {
    const newTimeSlot = await request.json();
    const timeslots = readTimeSlots();
    
    // Check if timeslot with same ID already exists
    if (timeslots.some((ts: TimeSlot) => ts.id === newTimeSlot.id)) {
      return NextResponse.json({ error: 'A timeslot with this ID already exists' }, { status: 400 });
    }

    // Add the new timeslot
    const updatedTimeSlots = [...timeslots, newTimeSlot];
    
    if (writeTimeSlots(updatedTimeSlots)) {
      return NextResponse.json(newTimeSlot);
    } else {
      return NextResponse.json({ error: 'Failed to save timeslot' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding timeslot:', error);
    return NextResponse.json({ error: 'Failed to add timeslot' }, { status: 500 });
  }
}

// PUT - Update an existing timeslot
export async function PUT(request: NextRequest) {
  try {
    const updatedTimeSlot = await request.json();
    const timeslots = readTimeSlots();
    
    const timeslotIndex = timeslots.findIndex((ts: TimeSlot) => ts.id === updatedTimeSlot.id);
    
    if (timeslotIndex === -1) {
      return NextResponse.json({ error: 'Timeslot not found' }, { status: 404 });
    }

    // Update the timeslot
    timeslots[timeslotIndex] = updatedTimeSlot;
    
    if (writeTimeSlots(timeslots)) {
      return NextResponse.json(updatedTimeSlot);
    } else {
      return NextResponse.json({ error: 'Failed to update timeslot' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating timeslot:', error);
    return NextResponse.json({ error: 'Failed to update timeslot' }, { status: 500 });
  }
}

// DELETE - Delete a timeslot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeslotId = searchParams.get('id');

    if (!timeslotId) {
      return NextResponse.json({ error: 'Timeslot ID is required' }, { status: 400 });
    }

    const timeslots = readTimeSlots();
    const updatedTimeSlots = timeslots.filter((ts: TimeSlot) => ts.id !== timeslotId);

    if (updatedTimeSlots.length === timeslots.length) {
      return NextResponse.json({ error: 'Timeslot not found' }, { status: 404 });
    }

    if (writeTimeSlots(updatedTimeSlots)) {
      return NextResponse.json({ message: 'Timeslot deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete timeslot' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting timeslot:', error);
    return NextResponse.json({ error: 'Failed to delete timeslot' }, { status: 500 });
  }
}
