import { PrismaClient } from '../../../lib/generated/prisma';

import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const shiftId = searchParams.get('shiftId');
	if (!shiftId) {
		return NextResponse.json({ error: 'shiftId is required' }, { status: 400 });
	}
	try {
		const programs = await prisma.program.findMany({
			where: { shiftId: Number(shiftId) },
		});
		return NextResponse.json(programs);
	} catch (error) {
		console.error('Error fetching programs by shiftId:', error);
		return NextResponse.json([], { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
}
