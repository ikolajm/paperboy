/**
 * Filtering utilities for RSS entries.
 * URL dedup, staleness check, quality floor.
 */

import { normalizeUrl } from "../normalize-url.js";
import type { RssEntry } from "../../shared/types/digest.js";

// --- Staleness ---

export function isStale(dateStr: string, maxHours = 36): boolean {
  if (!dateStr) return false;
  try {
    const pubDate = new Date(dateStr);
    const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
    return hoursAgo > maxHours;
  } catch {
    return false;
  }
}

// --- URL quality ---

const BAD_URL_PATTERNS = [
  /\/tag\//i,
  /\/category\//i,
  /\/search\?/i,
  /\/search\//i,
  /\/author\//i,
];

export function isLowQualityUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes("news.google.com")) return false;
  return BAD_URL_PATTERNS.some(p => p.test(url));
}

// --- URL dedup ---

/**
 * Shared dedup pool for cross-topic deduplication.
 * Topics (for_you + on_your_radar) share one pool so the same story
 * doesn't appear in both AI and Cybersecurity. Popular, local, and
 * opinions maintain their own independent pools.
 */
export class DedupPool {
  private seen = new Set<string>();

  /** Returns true if the URL is new (not seen before). Marks it as seen. */
  claim(url: string): boolean {
    if (!url) return true;
    const normalized = normalizeUrl(url);
    if (this.seen.has(normalized)) return false;
    this.seen.add(normalized);
    return true;
  }
}

export function dedupByUrl(entries: RssEntry[], pool?: DedupPool): RssEntry[] {
  const localPool = pool ?? new DedupPool();
  return entries.filter(entry => localPool.claim(entry.url));
}

// --- Combined filter pipeline ---

export function filterEntries(entries: RssEntry[], maxHours = 36, pool?: DedupPool): RssEntry[] {
  return dedupByUrl(entries, pool)
    .filter(e => !isStale(e.date, maxHours))
    .filter(e => !isLowQualityUrl(e.url));
}
