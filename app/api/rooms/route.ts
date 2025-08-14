import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all rooms from database
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Add or update rooms in database
export async function POST(request: NextRequest) {
  try {
    const rooms = await request.json();
    
    // Update each room in the database
    const updatePromises = rooms.map((room: any) =>
      prisma.room.upsert({
        where: { id: room.id },
        update: {
          name: room.name,
          capacity: room.capacity,
          type: room.type,
          building: room.building,
          floor: room.floor,
          hasProjector: room.hasProjector,
          hasAC: room.hasAC,
          description: room.description,
          programTypes: room.programTypes,
          primaryDepartmentId: room.primaryDepartmentId,
          availableForOtherDepartments: room.availableForOtherDepartments,
        },
        create: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          type: room.type,
          building: room.building,
          floor: room.floor,
          hasProjector: room.hasProjector,
          hasAC: room.hasAC,
          description: room.description,
          programTypes: room.programTypes,
          primaryDepartmentId: room.primaryDepartmentId,
          availableForOtherDepartments: room.availableForOtherDepartments,
        },
      })
    );
    
    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating rooms:', error);
    return NextResponse.json({ error: 'Failed to update rooms' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update an existing room
export async function PUT(request: NextRequest) {
  try {
    const updatedRoom = await request.json();
    
    const room = await prisma.room.update({
      where: { id: updatedRoom.id },
      data: {
        name: updatedRoom.name,
        capacity: updatedRoom.capacity,
        type: updatedRoom.type,
        building: updatedRoom.building,
        floor: updatedRoom.floor,
        hasProjector: updatedRoom.hasProjector,
        hasAC: updatedRoom.hasAC,
        description: updatedRoom.description,
        programTypes: updatedRoom.programTypes,
        primaryDepartmentId: updatedRoom.primaryDepartmentId,
        availableForOtherDepartments: updatedRoom.availableForOtherDepartments,
      },
    });
    
    return NextResponse.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
    
    await prisma.room.delete({
      where: { id: roomId }
    });
    
    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
