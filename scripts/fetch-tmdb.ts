/**
 * Fetch entertainment data from TMDB API endpoints in parallel.
 *
 * Reads config.json for endpoint paths and credentials.json for API key.
 * Fetches all configured endpoints concurrently and outputs structured JSON.
 *
 * Usage:
 *   npx tsx scripts/fetch-tmdb.ts config/config.json config/credentials.json
 *
 * Importable:
 *   import { fetchTmdb } from './fetch-tmdb.js';
 */

import { readFileSync } from "node:fs";
import type { PaperboyConfig, Credentials } from "../shared/types/config.js";

// --- Types ---

export interface TmdbEntry {
  title: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
}

export type TmdbResult = Record<string, TmdbEntry[] | { status: "fetch_error"; error: string }>;

// --- Utilities ---

function truncate(text: string, maxLen = 200): string {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen - 3) + "...";
}

// --- Fetching ---

async function fetchJson(url: string, apiKey: string, timeout = 15000): Promise<unknown> {
  const separator = url.includes("?") ? "&" : "?";
  const fullUrl = `${url}${separator}api_key=${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(fullUrl, {
      headers: { "User-Agent": "Paperboy/1.0" },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

function parseResults(data: unknown, maxResults: number): TmdbEntry[] {
  const items = (data as Record<string, unknown[]>)?.results ?? [];
  const entries: TmdbEntry[] = [];

  for (const item of items) {
    const raw = item as Record<string, unknown>;
    const title = (raw.title || raw.name || "") as string;
    const overview = (raw.overview || "") as string;

    const entry: TmdbEntry = {
      title,
      overview,
      vote_average: (raw.vote_average as number) ?? 0,
    };

    if (raw.vote_count) entry.vote_count = raw.vote_count as number;
    if (raw.poster_path) entry.poster_url = `${TMDB_IMAGE_BASE}${raw.poster_path}`;
    if (Array.isArray(raw.genre_ids) && raw.genre_ids.length > 0) {
      entry.genre_ids = raw.genre_ids as number[];
    }
    if (raw.release_date) entry.release_date = raw.release_date as string;
    if (raw.first_air_date) entry.first_air_date = raw.first_air_date as string;

    entries.push(entry);
    if (entries.length >= maxResults) break;
  }

  return entries;
}

async function fetchEndpoint(
  name: string,
  url: string,
  apiKey: string,
  maxResults: number,
): Promise<[string, TmdbEntry[] | { status: "fetch_error"; error: string }]> {
  try {
    const data = await fetchJson(url, apiKey);
    const entries = parseResults(data, maxResults);
    return [name, entries];
  } catch (err) {
    return [name, {
      status: "fetch_error",
      error: err instanceof Error ? err.message : String(err),
    }];
  }
}

// --- Public API ---

export async function fetchTmdb(config: PaperboyConfig, credentials: Credentials): Promise<TmdbResult> {
  const tmdb = config.entertainment.tmdb;
  const apiKey = credentials.tmdb.api_key;

  if (!tmdb.base_url || !apiKey) {
    return { _error: { status: "fetch_error", error: "Missing TMDB base_url or api_key" } };
  }

  const maxMap: Record<string, number> = {
    now_playing: tmdb.max_movies,
    upcoming: tmdb.max_movies,
    trending_movies: tmdb.max_movies,
    trending_tv: tmdb.max_streaming,
    on_the_air: tmdb.max_streaming,
  };

  const promises = Object.entries(tmdb.endpoints).map(([name, path]) =>
    fetchEndpoint(name, `${tmdb.base_url}${path}`, apiKey, maxMap[name] ?? 4)
  );

  const settled = await Promise.all(promises);
  const results: TmdbResult = {};
  const seenTitles = new Set<string>();

  for (const [name, data] of settled) {
    if (Array.isArray(data)) {
      // Dedup across endpoints — keep first occurrence of each title
      const deduped = data.filter((entry) => {
        const key = entry.title.toLowerCase();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      });
      results[name] = deduped;
    } else {
      results[name] = data;
    }
  }

  return results;
}

// --- CLI entry point ---

async function main() {
  if (process.argv.length < 4) {
    console.error("Usage: npx tsx scripts/fetch-tmdb.ts <config.json> <credentials.json>");
    process.exit(1);
  }

  const config: PaperboyConfig = JSON.parse(readFileSync(process.argv[2], "utf-8"));
  const credentials: Credentials = JSON.parse(readFileSync(process.argv[3], "utf-8"));

  const results = await fetchTmdb(config, credentials);
  console.log(JSON.stringify(results, null, 2));
}

const isMain = process.argv[1]?.endsWith("fetch-tmdb.ts") ||
               process.argv[1]?.endsWith("fetch-tmdb.js");
if (isMain) {
  main();
}
