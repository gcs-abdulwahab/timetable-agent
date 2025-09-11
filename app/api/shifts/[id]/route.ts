import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Get shift by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

    console.log('------------------------------------------------------------------------------------')
  try {
    console.log('Request params:', params); 
    const id = Number(params.id);
    console.log('Parsed id:', id);
    if (!id) {
      console.log('No id provided');
      return NextResponse.json({ error: 'Shift ID is required' }, { status: 400 });
    }
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        institution: true,
      },
    });
    console.log('Query result:', shift);
    if (!shift) {
      console.log('Shift not found');
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }
    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error fetching shift:', error);
    return NextResponse.json({ error: 'Failed to fetch shift' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
