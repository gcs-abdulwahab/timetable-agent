import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export function jsonPath(file: string) {
  return path.join(DATA_DIR, file);
}

export async function readJsonArray<T>(file: string): Promise<T[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(jsonPath(file), 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeJsonArray<T>(file: string, data: T[]) {
  await ensureDataDir();
  await fs.writeFile(jsonPath(file), JSON.stringify(data, null, 2), 'utf8');
}
