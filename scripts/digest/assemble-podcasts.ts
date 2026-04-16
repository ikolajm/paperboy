/**
 * Assemble podcast entries from RSS results.
 * Applies schedule-based freshness windows.
 */

import type { PaperboyConfig } from "../../shared/types/config.js";
import type { RssEntry, PodcastEntry } from "../../shared/types/digest.js";
import { shouldFetchPodcast } from "./feeds.js";
import { isStale } from "./filter.js";
import { IdCounter } from "./ids.js";

/** Freshness window in hours based on release schedule */
function maxFreshnessHours(schedule?: string): number {
  switch (schedule) {
    case "daily":
    case "weekdays":
      return 48;
    case "weekly_monday":
      return 168;  // 7 days
    case "mon_wed_fri":
    case "mon_thu":
      return 72;   // 3 days
    default:
      return 168;
  }
}

export function assemblePodcasts(
  results: Record<string, RssEntry[]>,
  config: PaperboyConfig,
  targetDate: Date,
  ids: IdCounter,
): PodcastEntry[] {
  const podcasts: PodcastEntry[] = [];

  for (const [name, show] of Object.entries(config.podcasts.shows)) {
    if (!shouldFetchPodcast(show, targetDate)) continue;

    const key = `POD_${name}`;
    const entries = results[key] ?? [];
    const latest = entries[0];
    if (!latest) continue;

    // Check freshness based on show's release schedule
    if (isStale(latest.date, maxFreshnessHours(show.release_schedule))) continue;

    podcasts.push({
      id: ids.next("POD"),
      show: name,
      title: latest.title,
      duration: latest.duration || "",
      date: latest.date,
      snippet: latest.snippet,
      episode_url: latest.url || null,
      deep_dive_eligible: true,
    });
  }

  return podcasts;
}
