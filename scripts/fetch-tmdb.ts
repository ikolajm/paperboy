/**
 * Fetch entertainment data from TMDB API endpoints in parallel.
 *
 * Tier 1: List endpoints (trending, popular, discover) — bulk fetch.
 * Tier 2: Per-item watch provider enrichment (optional).
 *
 * Usage:
 *   npx tsx scripts/fetch-tmdb.ts config/config.json config/credentials.json
 *
 * Importable:
 *   import { fetchTmdb } from './fetch-tmdb.js';
 */

import { readFileSync } from "node:fs";
import type { PaperboyConfig, Credentials } from "../shared/types/config.js";
import type { WatchProvider } from "../shared/types/entertainment.js";

// --- Types ---

export interface TmdbEntry {
  tmdb_id: number;
  title: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  backdrop_url?: string;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  watch_providers?: WatchProvider[];
}

export type TmdbResult = Record<string, TmdbEntry[] | { status: "fetch_error"; error: string }>;

// --- Utilities ---

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";
const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w92";

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

// --- Tier 1: List parsing ---

function parseResults(data: unknown, maxResults: number): TmdbEntry[] {
  const items = (data as Record<string, unknown[]>)?.results ?? [];
  const entries: TmdbEntry[] = [];

  for (const item of items) {
    const raw = item as Record<string, unknown>;
    const title = (raw.title || raw.name || "") as string;
    const overview = (raw.overview || "") as string;

    const entry: TmdbEntry = {
      tmdb_id: (raw.id as number) ?? 0,
      title,
      overview,
      vote_average: (raw.vote_average as number) ?? 0,
    };

    if (raw.vote_count) entry.vote_count = raw.vote_count as number;
    if (raw.poster_path) entry.poster_url = `${TMDB_IMAGE_BASE}${raw.poster_path}`;
    if (raw.backdrop_path) entry.backdrop_url = `${TMDB_BACKDROP_BASE}${raw.backdrop_path}`;
    if (Array.isArray(raw.genre_ids) && raw.genre_ids.length > 0) {
      entry.genre_ids = raw.genre_ids as number[];
    }
    if (raw.release_date) entry.release_date = raw.release_date as string;
    if (raw.first_air_date) entry.first_air_date = raw.first_air_date as string;
    if (raw.media_type) entry.media_type = raw.media_type as "movie" | "tv";

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

// --- Tier 2: Watch provider enrichment ---

async function fetchWatchProviders(
  tmdbId: number,
  mediaType: "movie" | "tv",
  baseUrl: string,
  apiKey: string,
): Promise<WatchProvider[]> {
  try {
    const url = `${baseUrl}/${mediaType}/${tmdbId}/watch/providers`;
    const data = await fetchJson(url, apiKey) as Record<string, unknown>;
    const results = data.results as Record<string, unknown> | undefined;
    if (!results) return [];

    const us = results.US as Record<string, unknown> | undefined;
    if (!us) return [];

    // Prefer flatrate (subscription), fall back to ads or buy
    const providers = (us.flatrate || us.ads || us.buy) as Array<Record<string, unknown>> | undefined;
    if (!providers) return [];

    return providers.slice(0, 4).map((p) => ({
      provider_name: (p.provider_name as string) || "",
      logo_url: p.logo_path ? `${TMDB_LOGO_BASE}${p.logo_path}` : "",
    }));
  } catch {
    return [];
  }
}

async function enrichWithProviders(
  entries: TmdbEntry[],
  mediaType: "movie" | "tv",
  baseUrl: string,
  apiKey: string,
): Promise<void> {
  const promises = entries.map(async (entry) => {
    entry.watch_providers = await fetchWatchProviders(
      entry.tmdb_id,
      mediaType,
      baseUrl,
      apiKey,
    );
  });
  await Promise.all(promises);
}

// --- Public API ---

export async function fetchTmdb(config: PaperboyConfig, credentials: Credentials): Promise<TmdbResult> {
  const tmdb = config.entertainment.tmdb;
  const apiKey = credentials.tmdb.api_key;

  if (!tmdb.base_url || !apiKey) {
    return { _error: { status: "fetch_error", error: "Missing TMDB base_url or api_key" } };
  }

  // Determine max per endpoint based on which list it belongs to
  const movieSet = new Set(tmdb.movie_endpoints);
  const streamingSet = new Set(tmdb.streaming_endpoints);
  const upcomingSet = new Set(tmdb.upcoming_endpoints);

  const promises = Object.entries(tmdb.endpoints).map(([name, path]) => {
    const max = movieSet.has(name) ? tmdb.max_movies
      : streamingSet.has(name) ? tmdb.max_streaming
      : upcomingSet.has(name) ? tmdb.max_upcoming
      : 10;
    return fetchEndpoint(name, `${tmdb.base_url}${path}`, apiKey, max);
  });

  const settled = await Promise.all(promises);
  const results: TmdbResult = {};
  const seenTitles = new Set<string>();

  for (const [name, data] of settled) {
    if (Array.isArray(data)) {
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

  // Tier 2: Enrich with watch providers if enabled
  if (tmdb.enrich_watch_providers) {
    const movieEntries: TmdbEntry[] = [];
    const tvEntries: TmdbEntry[] = [];

    for (const [name, data] of Object.entries(results)) {
      if (!Array.isArray(data)) continue;
      if (movieSet.has(name)) movieEntries.push(...data);
      else if (streamingSet.has(name)) tvEntries.push(...data);
    }

    await Promise.all([
      movieEntries.length > 0
        ? enrichWithProviders(movieEntries, "movie", tmdb.base_url, apiKey)
        : Promise.resolve(),
      tvEntries.length > 0
        ? enrichWithProviders(tvEntries, "tv", tmdb.base_url, apiKey)
        : Promise.resolve(),
    ]);
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
