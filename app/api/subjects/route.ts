import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch subjects by semesterId from query string
export async function GET(request: import('next/server').NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const where = semesterId ? { semesterId: Number(semesterId) } : {};
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        semester: true,
      },
      orderBy: { code: 'asc' }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
