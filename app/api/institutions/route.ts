import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - List all institutions
export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      include: { shifts: true }
    });
    return NextResponse.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create institution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const institution = await prisma.institution.create({
      data: {
        name: body.name,
        code: body.code,
      },
    });
    return NextResponse.json(institution, { status: 201 });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json({ error: 'Failed to create institution' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
