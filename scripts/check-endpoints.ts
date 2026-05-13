/**
 * Check every configured endpoint for reachability.
 *
 * Walks config.json and pings every RSS feed, ESPN scoreboard URL,
 * and TMDB endpoint, reporting HTTP status per source grouped by section.
 *
 * Use this when the daily digest starts producing fetch_error warnings —
 * it pinpoints which feed broke without re-running the full pipeline.
 *
 * Usage:
 *   npm run check-endpoints
 *   npx tsx scripts/check-endpoints.ts [path/to/config.json]
 *
 * TMDB endpoints are skipped if config/credentials.json is absent.
 * Exits non-zero if any endpoint fails (CI-friendly).
 */

import { readFileSync } from "node:fs";
import type { PaperboyConfig, Credentials } from "../shared/types/config.js";

interface CheckResult {
  label: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
  elapsedMs: number;
}

interface CategoryGroup {
  name: string;
  items: { label: string; url: string }[];
}

// --- HTTP check ---

async function checkUrl(label: string, url: string, timeout = 10000): Promise<CheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Paperboy/1.0" },
      signal: controller.signal,
    });
    return {
      label, url, ok: resp.ok, status: resp.status,
      elapsedMs: Date.now() - start,
    };
  } catch (err) {
    return {
      label, url, ok: false,
      error: err instanceof Error ? err.message : String(err),
      elapsedMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timer);
  }
}

// --- Config loading ---

function loadConfig(path: string): PaperboyConfig {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function loadCredentials(): Credentials | null {
  try {
    return JSON.parse(readFileSync("config/credentials.json", "utf-8"));
  } catch {
    return null;
  }
}

// --- Group construction ---

function buildGroups(config: PaperboyConfig, credentials: Credentials | null): CategoryGroup[] {
  const groups: CategoryGroup[] = [];

  groups.push({
    name: "Popular Today",
    items: config.popular_today.feeds.map(f => ({ label: f.label, url: f.rss })),
  });

  groups.push({
    name: "Local News",
    items: config.local_news.locations.map((loc) => ({
      label: loc.label, url: loc.rss,
    })),
  });

  groups.push({
    name: "Topics",
    items: Object.entries(config.topics).flatMap(([name, t]) =>
      t.rss.map((url, i) => ({
        label: t.rss.length > 1 ? `${name} [${i}]` : name,
        url,
      }))
    ),
  });

  groups.push({
    name: "Scores",
    items: Object.entries(config.scores).map(([name, sc]) => ({
      label: name, url: sc.url,
    })),
  });

  // Health check pings every podcast feed regardless of release_schedule.
  groups.push({
    name: "Podcasts",
    items: Object.entries(config.podcasts.shows).map(([name, show]) => ({
      label: name, url: show.rss,
    })),
  });

  groups.push({
    name: "Opinions",
    items: config.opinions.feeds.map((url, i) => ({
      label: `feed ${i + 1}`, url,
    })),
  });

  if (credentials) {
    const apiKey = credentials.tmdb.api_key;
    const base = config.entertainment.tmdb.base_url;
    groups.push({
      name: "TMDB",
      items: Object.entries(config.entertainment.tmdb.endpoints).map(([name, path]) => {
        const separator = path.includes("?") ? "&" : "?";
        return { label: name, url: `${base}${path}${separator}api_key=${apiKey}` };
      }),
    });
  }

  return groups;
}

// --- Output ---

function printGroup(group: CategoryGroup, results: CheckResult[]): { ok: number; failed: number } {
  console.log(`\n${group.name} (${results.length})`);
  let ok = 0;
  let failed = 0;
  const maxLabel = Math.max(...results.map(r => r.label.length), 8);

  for (const r of results) {
    const symbol = r.ok ? "✓" : "✗";
    const detail = r.ok ? String(r.status) : (r.error?.slice(0, 60) ?? "unknown");
    const padded = r.label.padEnd(maxLabel);
    console.log(`  ${symbol} ${padded}  ${detail}  (${r.elapsedMs}ms)`);
    if (r.ok) ok++; else failed++;
  }

  // Surface failed URLs at end of group (URLs hidden on success to keep output clean).
  for (const r of results) {
    if (!r.ok) console.log(`      ↳ ${r.url}`);
  }

  return { ok, failed };
}

// --- Main ---

async function main() {
  const configPath = process.argv[2] || "config/config.json";
  const start = Date.now();

  const config = loadConfig(configPath);
  const credentials = loadCredentials();
  const tmdbNote = credentials ? "TMDB included" : "TMDB skipped — no credentials.json";

  console.log(`Checking endpoints from ${configPath} (${tmdbNote})...`);

  const groups = buildGroups(config, credentials);
  const groupResults = await Promise.all(groups.map(g =>
    Promise.all(g.items.map(item => checkUrl(item.label, item.url)))
  ));

  let totalOk = 0;
  let totalFailed = 0;
  for (let i = 0; i < groups.length; i++) {
    const { ok, failed } = printGroup(groups[i], groupResults[i]);
    totalOk += ok;
    totalFailed += failed;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const summary = totalFailed === 0
    ? `\n✓ All ${totalOk} endpoints OK · ${elapsed}s`
    : `\n✗ ${totalFailed} failed, ${totalOk} OK · ${elapsed}s`;
  console.log(summary);

  if (totalFailed > 0) process.exit(1);
}

main().catch(err => {
  console.error("Endpoint check failed:", err);
  process.exit(1);
});
