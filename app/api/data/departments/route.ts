import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'departments.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const departments = JSON.parse(fileContent);
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error reading departments.json:', error);
    return NextResponse.json({ error: 'Failed to load departments data' }, { status: 500 });
  }
}
