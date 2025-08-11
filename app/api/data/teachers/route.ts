import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'teachers.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const teachers = JSON.parse(fileContent);
    
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error reading teachers.json:', error);
    return NextResponse.json({ error: 'Failed to load teachers data' }, { status: 500 });
  }
}
