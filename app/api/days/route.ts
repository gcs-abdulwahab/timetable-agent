import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all days from database
export async function GET() {
  try {
    const days = await prisma.day.findMany({
      orderBy: { dayCode: 'asc' }
    });
    return NextResponse.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Update days in database
export async function POST(request: NextRequest) {
  try {
    const { id, isActive } = await request.json();
    await prisma.day.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating day:', error);
    return NextResponse.json({ error: 'Failed to update day' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
