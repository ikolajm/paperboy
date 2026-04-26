/**
 * Daily digest entry point.
 *
 * Loads config, runs the pipeline, writes digest.json.
 *
 * Usage:
 *   npx tsx scripts/run-digest.ts [--date YYYY-MM-DD]
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PaperboyConfig, Credentials } from "../shared/types/config.js";
import { runPipeline } from "./digest/pipeline.js";

// --- Config ---

function loadConfig(): PaperboyConfig {
  return JSON.parse(readFileSync("config/config.json", "utf-8"));
}

function loadCredentials(): Credentials | null {
  try {
    return JSON.parse(readFileSync("config/credentials.json", "utf-8"));
  } catch {
    return null;
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
  const outDir = join("digests", dateStr);
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
