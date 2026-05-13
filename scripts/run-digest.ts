/**
 * Daily digest entry point.
 *
 * Loads config, runs the pipeline, writes digest.json.
 *
 * Usage:
 *   npx tsx scripts/run-digest.ts [--date YYYY-MM-DD]
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { PaperboyConfig, Credentials } from "../shared/types/config.js";
import { runPipeline } from "./digest/pipeline.js";

// --- Paths ---
// Resolve from this script's location so `npm run digest` works from any cwd,
// matching the pattern in audit-media-bias.ts / audit-f1.ts.

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const CONFIG_PATH = join(REPO_ROOT, "config", "config.json");
const CREDENTIALS_PATH = join(REPO_ROOT, "config", "credentials.json");
const DIGESTS_ROOT = join(REPO_ROOT, "digests");

// --- Config ---

function loadConfig(): PaperboyConfig {
  let raw: string;
  try {
    raw = readFileSync(CONFIG_PATH, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        "config/config.json not found. Paperboy requires this file — see config/CONFIG-REFERENCE.md.",
      );
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `config/config.json is malformed JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  assertConfigShape(parsed);
  return parsed;
}

const CONFIG_SCHEMA_VERSION = 3;

function assertConfigShape(c: unknown): asserts c is PaperboyConfig {
  if (!c || typeof c !== "object") {
    throw new Error("config/config.json must be a JSON object");
  }
  const cfg = c as Record<string, unknown>;
  if (cfg.version !== CONFIG_SCHEMA_VERSION) {
    throw new Error(
      `config/config.json: version mismatch — file declares ${JSON.stringify(cfg.version)}, code expects ${CONFIG_SCHEMA_VERSION}. See config/CONFIG-REFERENCE.md.`,
    );
  }
  const required = [
    "popular_today", "local_news", "topics",
    "scores", "podcasts", "opinions", "entertainment",
  ];
  for (const key of required) {
    if (!(key in cfg)) {
      throw new Error(
        `config/config.json: missing required field '${key}' — see config/CONFIG-REFERENCE.md`,
      );
    }
  }
  const ent = cfg.entertainment as Record<string, unknown> | undefined;
  if (!ent?.tmdb || typeof ent.tmdb !== "object") {
    throw new Error("config/config.json: 'entertainment.tmdb' is required");
  }
}

function loadCredentials(): Credentials | null {
  let raw: string;
  try {
    raw = readFileSync(CREDENTIALS_PATH, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `config/credentials.json is malformed JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  assertCredentialsShape(parsed);
  return parsed;
}

function assertCredentialsShape(c: unknown): asserts c is Credentials {
  if (!c || typeof c !== "object") {
    throw new Error("config/credentials.json must be a JSON object");
  }
  const cred = c as Record<string, unknown>;
  const tmdb = cred.tmdb as Record<string, unknown> | undefined;
  if (!tmdb || typeof tmdb !== "object") {
    throw new Error(
      "config/credentials.json: 'tmdb' is required — see config/credentials.example.json",
    );
  }
  if (typeof tmdb.api_key !== "string" || !tmdb.api_key) {
    throw new Error("config/credentials.json: 'tmdb.api_key' is required (string)");
  }
}

function getTargetDate(): Date {
  const dateArg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  return dateArg ? new Date(dateArg + "T12:00:00") : new Date();
}

// --- Main ---

async function main() {
  const startTime = Date.now();
  const config = loadConfig();
  const credentials = loadCredentials();
  const targetDate = getTargetDate();
  const dateStr = targetDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone

  console.log(`Building digest for ${dateStr}...`);

  const { digest, warnings } = await runPipeline(config, credentials, targetDate);

  // Log warnings
  for (const w of warnings) {
    console.warn(`  ⚠ ${w}`);
  }

  // Write output
  const outDir = join(DIGESTS_ROOT, dateStr);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, "deep-dives"), { recursive: true });

  const outPath = join(outDir, "digest.json");
  writeFileSync(outPath, JSON.stringify(digest));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const teamScores = digest.sections.scores.team_sports.recaps.filter(r => r.games.length > 0).length;
  const ufcCards = digest.sections.scores.ufc.recaps.cards.length;
  const f1Weekends = digest.sections.scores.f1.recaps.weekends.length;

  console.log(`\nDigest ready — ${outPath}`);
  console.log(`${digest.meta.story_count} stories · ${teamScores} team sports · ${ufcCards} UFC cards · ${f1Weekends} F1 weekends · ${digest.sections.podcasts.length} podcasts · ${elapsed}s`);
}

main().catch(err => {
  console.error("Digest build failed:", err);
  process.exit(1);
});
