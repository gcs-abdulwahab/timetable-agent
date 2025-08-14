import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/semesters/toggle - Toggle between odd/even semester activation
export async function POST(request: NextRequest) {
  try {
    const { mode } = await request.json();
    
    if (!mode || !['odd', 'even'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be either "odd" or "even"' },
        { status: 400 }
      );
    }

    // First, deactivate all semesters
    await prisma.semester.updateMany({
      data: { isActive: false }
    });

    // Then activate the requested semesters
    if (mode === 'odd') {
      // Activate odd semesters (1, 3, 5, 7)
      await prisma.semester.updateMany({
        where: {
          id: { in: ['sem1', 'sem3', 'sem5', 'sem7'] }
        },
        data: { isActive: true }
      });
    } else {
      // Activate even semesters (2, 4, 6, 8)
      await prisma.semester.updateMany({
        where: {
          id: { in: ['sem2', 'sem4', 'sem6', 'sem8'] }
        },
        data: { isActive: true }
      });
    }

    // Get updated semesters
    const semesters = await prisma.semester.findMany({
      orderBy: { name: 'asc' }
    });

    const activeSemesters = semesters.filter(s => s.isActive);

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${mode} semesters`,
      mode,
      activeSemesters: activeSemesters.map(s => ({
        id: s.id,
        name: s.name,
        term: s.term,
        year: s.year
      })),
      totalSemesters: semesters.length,
      activeSemesterCount: activeSemesters.length
    });

  } catch (error) {
    console.error('Error toggling semesters:', error);
    return NextResponse.json(
      { error: 'Failed to toggle semesters' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/semesters/toggle - Get current semester activation status
export async function GET() {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { name: 'asc' }
    });

    const activeSemesters = semesters.filter(s => s.isActive);
    const activeIds = activeSemesters.map(s => s.id);
    
    // Determine current mode
    const oddIds = ['sem1', 'sem3', 'sem5', 'sem7'];
    const evenIds = ['sem2', 'sem4', 'sem6', 'sem8'];
    
    let currentMode = 'mixed';
    if (activeIds.every(id => oddIds.includes(id)) && activeIds.length === 4) {
      currentMode = 'odd';
    } else if (activeIds.every(id => evenIds.includes(id)) && activeIds.length === 4) {
      currentMode = 'even';
    }

    return NextResponse.json({
      success: true,
      currentMode,
      semesters: semesters.map(s => ({
        id: s.id,
        name: s.name,
        term: s.term,
        year: s.year,
        isActive: s.isActive
      })),
      activeSemesters: activeSemesters.map(s => ({
        id: s.id,
        name: s.name,
        term: s.term,
        year: s.year
      })),
      totalSemesters: semesters.length,
      activeSemesterCount: activeSemesters.length
    });

  } catch (error) {
    console.error('Error getting semester status:', error);
    return NextResponse.json(
      { error: 'Failed to get semester status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
