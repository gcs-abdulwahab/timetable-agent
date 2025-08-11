import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'designations.json');

export async function GET() {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const designations = JSON.parse(fileContent);
    return NextResponse.json(designations);
  } catch (error) {
    console.error('Error reading designations:', error);
    return NextResponse.json({ error: 'Failed to load designations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const designations = await request.json();
    fs.writeFileSync(DATA_FILE, JSON.stringify(designations, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving designations:', error);
    return NextResponse.json({ error: 'Failed to save designations' }, { status: 500 });
  }
}
