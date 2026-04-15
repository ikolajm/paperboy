import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

const REPO_ROOT = join(process.cwd(), '..');

/**
 * Reads a digest markdown file for a given date.
 */
export async function getDigest(date: string): Promise<string | null> {
  try {
    const path = join(REPO_ROOT, 'digests', date, 'digest.md');
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Reads a deep-dive markdown file by ID.
 */
export async function getDeepDive(date: string, id: string): Promise<string | null> {
  try {
    const path = join(REPO_ROOT, 'digests', date, 'deep-dives', `${id}.md`);
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Lists all available digest dates, newest first.
 */
export async function listDigestDates(): Promise<string[]> {
  try {
    const digestsDir = join(REPO_ROOT, 'digests');
    const entries = await readdir(digestsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
