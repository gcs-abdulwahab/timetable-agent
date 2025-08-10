import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

// Force Node.js runtime to guarantee access to Node APIs
export const runtime = 'nodejs';

const dataDir = path.join(process.cwd(), 'data');
const subjectsFile = path.join(dataDir, 'subjects.json');

export async function GET() {
  try {
    const data = await fs.readFile(subjectsFile, 'utf8');
    const subjects = JSON.parse(data);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error reading subjects:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const subjects = await request.json();
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    // Safe write strategy: write to temp file, then rename
    const tempFile = path.join(dataDir, 'subjects.tmp.json');
    const jsonData = JSON.stringify(subjects, null, 2);
    
    // Create timestamped backup if original file exists
    try {
      await fs.access(subjectsFile);
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const backupFile = path.join(dataDir, `subjects.${timestamp}.json`);
      await fs.copyFile(subjectsFile, backupFile);
    } catch (error) {
      // Original file doesn't exist, which is fine for first write
    }
    
    // Write to temporary file first
    await fs.writeFile(tempFile, jsonData);
    
    // Atomically rename temp file to final destination
    await fs.rename(tempFile, subjectsFile);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subjects:', error);
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(path.join(dataDir, 'subjects.tmp.json'));
    } catch {
      // Ignore cleanup errors
    }
    
    return NextResponse.json(
      { error: 'Failed to save subjects' },
      { status: 500 }
    );
  }
}
