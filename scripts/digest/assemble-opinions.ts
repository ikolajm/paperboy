/**
 * Assemble opinion/editorial entries from RSS results.
 */

import type { PaperboyConfig } from "../../shared/types/config.js";
import type { RssEntry, OpinionEntry } from "../../shared/types/digest.js";
import { filterEntries } from "./filter.js";
import { IdCounter } from "./ids.js";

function rssToOpinion(entry: RssEntry, id: string): OpinionEntry {
  return {
    id,
    title: entry.title,
    url: entry.url || null,
    snippet: entry.snippet,
    source: entry.source,
    source_url: entry.source_url,
    date: entry.date || undefined,
    related_articles: entry.related_articles,
  };
}

export function assembleOpinions(
  results: Record<string, RssEntry[]>,
  config: PaperboyConfig,
  ids: IdCounter,
): OpinionEntry[] {
  const allEntries: RssEntry[] = [];

  for (let i = 0; i < config.opinions.feeds.length; i++) {
    const key = `OPN_${i}`;
    const entries = results[key] ?? [];
    allEntries.push(...entries);
  }

  return filterEntries(allEntries)
    .slice(0, config.opinions.max_stories)
    .map(e => rssToOpinion(e, ids.next("OPN")));
}
