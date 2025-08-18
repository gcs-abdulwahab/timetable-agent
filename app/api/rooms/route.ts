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
    const room = await request.json();
    if (!room || typeof room !== 'object' || Array.isArray(room)) {
      return NextResponse.json({ error: 'Invalid room data' }, { status: 400 });
    }
    await prisma.room.upsert({
      where: { id: room.id ?? 0 },
      update: {
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        building: room.building,
        floor: room.floor,
        hasProjector: room.hasProjector,
        hasAC: room.hasAC,
        description: room.description,
        primaryDepartmentId: room.primaryDepartmentId,
        availableForOtherDepartments: room.availableForOtherDepartments,
      },
      create: {
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        building: room.building,
        floor: room.floor,
        hasProjector: room.hasProjector,
        hasAC: room.hasAC,
        description: room.description,
        primaryDepartmentId: room.primaryDepartmentId,
        availableForOtherDepartments: room.availableForOtherDepartments,
      },
    });
    return NextResponse.json({ success: true });
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
    const idInt = parseInt(roomId, 10);
    if (isNaN(idInt)) {
      return NextResponse.json({ error: 'Room ID must be an integer' }, { status: 400 });
    }
    await prisma.room.delete({
      where: { id: idInt }
    });
    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
