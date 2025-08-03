import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { departments, teachers } from '../../components/data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEPARTMENTS_FILE = path.join(DATA_DIR, 'departments.json');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory already exists or other error
  }
}

// POST - Initialize data files with default data
export async function POST() {
  try {
    await ensureDataDir();
    
    // Write departments
    await fs.writeFile(DEPARTMENTS_FILE, JSON.stringify(departments, null, 2));
    
    // Write teachers
    await fs.writeFile(TEACHERS_FILE, JSON.stringify(teachers, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data files initialized successfully',
      departments: departments.length,
      teachers: teachers.length
    });
  } catch (error) {
    console.error('Error initializing data:', error);
    return NextResponse.json({ error: 'Failed to initialize data' }, { status: 500 });
  }
}
