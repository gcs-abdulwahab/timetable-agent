import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - List all shifts for an institution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const where = institutionId ? { institutionId: Number(institutionId) } : {};
    const shifts = await prisma.shift.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create shift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.institutionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const shift = await prisma.shift.create({
      data: {
        name: body.name,
        institutionId: body.institutionId,
      },
    });
    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
