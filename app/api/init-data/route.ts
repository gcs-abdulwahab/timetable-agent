import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILES = ['departments.json', 'teachers.json', 'subjects.json', 'semesters.json'];

async function ensureFile(file: string) {
  const full = path.join(DATA_DIR, file);
  try {
    await fs.access(full);
  } catch {
    await fs.writeFile(full, '[]', 'utf8');
  }
}

export async function POST() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await Promise.all(FILES.map(ensureFile));

    // Report counts
    const counts = {};
    for (const f of FILES) {
      const raw = await fs.readFile(path.join(DATA_DIR, f), 'utf8');
      const arr = JSON.parse(raw);
      counts[f] = Array.isArray(arr) ? arr.length : 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Data files are present',
      counts
    });
  } catch (err) {
    console.error('Error initializing data:', err);
    return NextResponse.json({ error: 'Failed to initialize data' }, { status: 500 });
  }
}
