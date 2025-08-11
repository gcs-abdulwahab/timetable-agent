import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const days = await prisma.day.findMany();
    return NextResponse.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updatedDays = await request.json();
    // Here you would update the database with the new days
    // For now, just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating days:', error);
    return NextResponse.json({ error: 'Failed to update days' }, { status: 500 });
  }
}
