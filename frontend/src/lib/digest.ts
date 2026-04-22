import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { Digest } from "@/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

const DIGEST_ROOT = process.env.DIGEST_PATH
  ? path.resolve(process.env.DIGEST_PATH)
  : path.join(REPO_ROOT, "digests");

/** List all available digest dates, most recent first */
export async function getDigestDates(): Promise<string[]> {
  try {
    const entries = await readdir(DIGEST_ROOT, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
      .map((e) => e.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

/** Read digest.json for a specific date. Returns null if not found. */
export async function getDigest(date: string): Promise<Digest | null> {
  const filePath = path.join(DIGEST_ROOT, date, "digest.json");
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Digest;
  } catch {
    return null;
  }
}

/** Read the most recent digest that has a digest.json */
export async function getLatestDigest(): Promise<Digest | null> {
  const dates = await getDigestDates();
  for (const date of dates) {
    const digest = await getDigest(date);
    if (digest) return digest;
  }
  return null;
}

/** Read a deep-dive markdown file by ID for a given date. Returns null if not found. */
export async function getDeepDive(
  date: string,
  id: string
): Promise<{ id: string; content: string } | null> {
  const filePath = path.join(DIGEST_ROOT, date, "deep-dives", `${id}.md`);
  try {
    const content = await readFile(filePath, "utf-8");
    return { id, content };
  } catch {
    return null;
  }
}

/** List deep-dive IDs available for a given date */
export async function getDeepDiveIds(date: string): Promise<string[]> {
  const dirPath = path.join(DIGEST_ROOT, date, "deep-dives");
  try {
    const entries = await readdir(dirPath);
    return entries
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}
