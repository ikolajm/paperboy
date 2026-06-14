/**
 * Single reader for config/credentials.json (gitignored, repo root).
 *
 * Deep-dive generation runs in the Next server (Node runtime), four directories up
 * from here. Each consumer (synthesize.ts → Gemini, fetch-tmdb.ts → TMDB/OMDb) pulls
 * the key it needs; missing keys are normal — the file may not exist, or may only
 * carry some providers — so this never throws, it returns an empty object.
 */

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export interface Credentials {
  tmdb?: { api_key?: string };
  gemini?: { api_key?: string };
  omdb?: { api_key?: string };
}

/** Read + parse credentials.json. Returns {} if absent or unparseable (never throws). */
export function loadCredentials(): Credentials {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // frontend/src/lib/deep-dive → repo root is four up.
    const repoRoot = path.resolve(here, "../../../..");
    return JSON.parse(readFileSync(path.join(repoRoot, "config/credentials.json"), "utf8"));
  } catch {
    return {};
  }
}
