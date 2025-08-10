import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { Room } from '../../components/data';

const roomsFilePath = path.join(process.cwd(), 'data', 'rooms.json');

// Helper function to read rooms from JSON file
function readRooms(): Room[] {
  try {
    const fileContents = fs.readFileSync(roomsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading rooms file:', error);
    return [];
  }
}

// Helper function to write rooms to JSON file
function writeRooms(rooms: Room[]): boolean {
  try {
    fs.writeFileSync(roomsFilePath, JSON.stringify(rooms, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing rooms file:', error);
    return false;
  }
}

// GET - Fetch all rooms
export async function GET() {
  try {
    const rooms = readRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST - Add a new room
export async function POST(request: NextRequest) {
  try {
    const newRoom = await request.json();
    const rooms = readRooms();
    
    // Check if room with same name already exists
    if (rooms.some((room: Room) => room.name.toLowerCase() === newRoom.name.toLowerCase())) {
      return NextResponse.json({ error: 'A room with this name already exists' }, { status: 400 });
    }
    
    // Generate ID if not provided
    if (!newRoom.id) {
      newRoom.id = `room-${newRoom.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    }
    
    rooms.push(newRoom);
    
    if (writeRooms(rooms)) {
      return NextResponse.json(newRoom, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to save room' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding room:', error);
    return NextResponse.json({ error: 'Failed to add room' }, { status: 500 });
  }
}

// PUT - Update an existing room
export async function PUT(request: NextRequest) {
  try {
    const updatedRoom = await request.json();
    const rooms = readRooms();
    
    const roomIndex = rooms.findIndex((room: Room) => room.id === updatedRoom.id);
    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    rooms[roomIndex] = updatedRoom;
    
    if (writeRooms(rooms)) {
      return NextResponse.json(updatedRoom);
    } else {
      return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE - Delete a room
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('id');
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }
    
    const rooms = readRooms();
    const filteredRooms = rooms.filter((room: Room) => room.id !== roomId);
    
    if (rooms.length === filteredRooms.length) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    if (writeRooms(filteredRooms)) {
      return NextResponse.json({ message: 'Room deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
