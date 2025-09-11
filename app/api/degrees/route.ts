import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('programId');
  try {
    const degrees = await prisma.degree.findMany({
      where: programId ? { programId: Number(programId) } : undefined,
      orderBy: { name: 'asc' },
      include: { program: true },
    });
    return NextResponse.json(degrees);
  } catch (error) {
    console.error('Error fetching degrees:', error);
    return NextResponse.json({ error: 'Failed to fetch degrees' }, { status: 500 });
  }
}


