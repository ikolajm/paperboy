/**
 * Digest pipeline orchestration.
 * Fetches all data sources in parallel, applies filtering,
 * and assembles the complete Digest object.
 */

import type { PaperboyConfig, Credentials } from "../../shared/types/config.js";
import type { Digest, DigestMeta, DigestSections, ScoresSection, RssEntry } from "../../shared/types/digest.js";
import { fetchBatch } from "../fetch-rss.js";
import { fetchTmdb } from "../fetch-tmdb.js";
import { fetchAllScores } from "../fetch-scores.js";
import { buildFeedBatch } from "./feeds.js";
import { IdCounter } from "./ids.js";
import { assemblePopularToday, assembleLocal } from "./assemble-popular.js";
import { assembleTopics } from "./assemble-topics.js";
import { assemblePodcasts } from "./assemble-podcasts.js";
import { assembleOpinions } from "./assemble-opinions.js";
import { assembleEntertainment } from "./assemble-entertainment.js";

// --- Story count ---

function countStories(sections: DigestSections): number {
  let count = 0;
  count += sections.popular_today.top_stories.length;
  count += sections.popular_today.world.length;
  count += sections.popular_today.nation.length;
  for (const loc of sections.local.locations) count += loc.stories.length;
  for (const t of sections.for_you) count += t.stories.length;
  for (const t of sections.on_your_radar) count += t.stories.length;
  count += sections.podcasts.length;
  count += sections.opinions.length;
  count += sections.entertainment.movies.length;
  count += sections.entertainment.streaming.length;
  return count;
}

// --- Pipeline ---

export interface PipelineResult {
  digest: Digest;
  warnings: string[];
}

export async function runPipeline(
  config: PaperboyConfig,
  credentials: Credentials | null,
  targetDate: Date,
): Promise<PipelineResult> {
  const warnings: string[] = [];

  // Build feed batch
  const feedBatch = buildFeedBatch(config, targetDate);

  // Fetch everything in parallel
  const [rssResults, scores, tmdbResult] = await Promise.all([
    fetchBatch(feedBatch),
    fetchAllScores(config, targetDate),
    credentials ? fetchTmdb(config, credentials) : Promise.resolve({}),
  ]);

  // Extract successful RSS results, collect warnings for failures
  const rssData: Record<string, RssEntry[]> = {};
  for (const [label, data] of Object.entries(rssResults)) {
    if (Array.isArray(data)) {
      rssData[label] = data;
    } else {
      warnings.push(`RSS fetch error [${label}]: ${data.error}`);
    }
  }

  if (!credentials) {
    warnings.push("No credentials.json — TMDB entertainment data unavailable");
  }

  // Assemble sections
  const ids = new IdCounter();

  const popularToday = assemblePopularToday(rssData, ids);
  const local = assembleLocal(rssData, config, ids);
  const { forYou, onYourRadar } = assembleTopics(rssData, config, ids);
  const podcasts = assemblePodcasts(rssData, config, targetDate, ids);
  const opinions = assembleOpinions(rssData, config, ids);
  const entertainment = assembleEntertainment(tmdbResult, config, ids);

  const sections: DigestSections = {
    popular_today: popularToday,
    local,
    for_you: forYou,
    on_your_radar: onYourRadar,
    scores,
    entertainment,
    podcasts,
    opinions,
  };

  const dateStr = targetDate.toISOString().slice(0, 10);
  const dayOfWeek = targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });

  const meta: DigestMeta = {
    date: dateStr,
    day_of_week: dayOfWeek,
    story_count: countStories(sections),
    run_mode: "initial",
    last_run: new Date().toISOString(),
  };

  return {
    digest: { meta, sections, deep_dives: [] },
    warnings,
  };
}
