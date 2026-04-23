/**
 * Assemble Popular Today and Local News sections from RSS results.
 */

import type { PaperboyConfig } from "../../shared/types/config.js";
import type {
  RssEntry, PopularStory, PopularTodaySection,
  LocalStory, LocalLocation, LocalSection,
} from "../../shared/types/digest.js";
import { isLowQualityUrl } from "./filter.js";
import { IdCounter } from "./ids.js";

function rssToPopularStory(entry: RssEntry, id: string): PopularStory {
  return {
    id,
    title: entry.title,
    url: entry.url || null,
    snippet: entry.snippet,
    source: entry.source,
    source_url: entry.source_url,
    date: entry.date || undefined,
    deep_dive_eligible: true,
    google_news_redirect: entry.google_news_redirect,
    related_articles: entry.related_articles,
  };
}

function rssToLocalStory(entry: RssEntry, id: string): LocalStory {
  return {
    id,
    title: entry.title,
    url: entry.url || null,
    snippet: entry.snippet,
    source: entry.source,
    source_url: entry.source_url,
    date: entry.date || undefined,
    google_news_redirect: entry.google_news_redirect,
  };
}

export function assemblePopularToday(
  results: Record<string, RssEntry[]>,
  ids: IdCounter,
): PopularTodaySection {
  const convert = (key: string) => {
    const entries = results[key] ?? [];
    return entries
      .filter(e => !isLowQualityUrl(e.url))
      .map(e => rssToPopularStory(e, ids.next("POP")));
  };

  return {
    top_stories: convert("POP_top"),
    world: convert("POP_world"),
    nation: convert("POP_nation"),
  };
}

export function assembleLocal(
  results: Record<string, RssEntry[]>,
  config: PaperboyConfig,
  ids: IdCounter,
): LocalSection {
  const locations: LocalLocation[] = [];

  for (const loc of config.local_news.locations) {
    const key = `LOCAL_${loc.label}`;
    const entries = results[key] ?? [];
    const stories = entries
      .filter(e => !isLowQualityUrl(e.url))
      .map(e => rssToLocalStory(e, ids.next("POP")));

    if (stories.length > 0) {
      locations.push({ label: loc.label, stories });
    }
  }

  return { locations };
}
