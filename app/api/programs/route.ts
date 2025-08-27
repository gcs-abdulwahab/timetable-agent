import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - List all programs
export async function GET() {
  try {
    const programs = await prisma.program.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Create a new program
export async function POST(req: NextRequest) {
  const { name, description } = await req.json();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  const program = await prisma.program.create({
    data: { name, description },
  });
  return NextResponse.json(program, { status: 201 });
}

// DELETE - Remove a program by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await prisma.program.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
  }
}

// PUT - Update a program by id
export async function PUT(req: NextRequest) {
  try {
    const { id, name, description } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const updated = await prisma.program.update({
      where: { id: Number(id) },
      data: { name, description },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
  }
}
