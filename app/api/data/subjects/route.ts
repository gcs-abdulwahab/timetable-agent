import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'subjects.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const subjects = JSON.parse(fileContent);
    
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error reading subjects.json:', error);
    return NextResponse.json({ error: 'Failed to load subjects data' }, { status: 500 });
  }
}
