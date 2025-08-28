import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET() {
  try {
    const degrees = await prisma.degree.findMany({
      orderBy: { name: 'asc' },
          include: { program: true },
    });
    return NextResponse.json(degrees);
  } catch (error) {
    console.error('Error fetching degrees:', error);
    return NextResponse.json({ error: 'Failed to fetch degrees' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  const { name, code, programId } = await req.json();
  if (!name || !programId) {
    return NextResponse.json({ error: 'Name and programId are required.' }, { status: 400 });
  }
  const degree = await prisma.degree.create({
    data: { name, code, programId },
  });
  return NextResponse.json(degree);
}

export async function PUT(req: NextRequest) {
  const { id, name, code, programId } = await req.json();
  if (!id || !name || !programId) {
    return NextResponse.json({ error: 'id, name, and programId are required.' }, { status: 400 });
  }
  const degree = await prisma.degree.update({
    where: { id },
    data: { name, code, programId },
  });
  return NextResponse.json(degree);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }
  await prisma.degree.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
