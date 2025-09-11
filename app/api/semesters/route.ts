export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const programId = searchParams.get('programId');
		let where = {};
		if (programId) {
			where = { programId: Number(programId) };
		}
		const semesters = await prisma.semester.findMany({
			where,
			orderBy: [{ name: 'asc' }]
		});
		return NextResponse.json(semesters);
	} catch (error) {
		console.error('Error fetching semesters:', error);
		return NextResponse.json([], { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../lib/generated/prisma';


const prisma = new PrismaClient();

