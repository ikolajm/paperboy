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
import { enrichAllGames } from "../scores/enrich.js";

// --- Story count ---

function countStories(sections: DigestSections): number {
  let count = 0;
  count += sections.popular_today.length;
  for (const loc of sections.local.locations) count += loc.stories.length;
  for (const t of sections.for_you) count += t.stories.length;
  for (const t of sections.on_your_radar) count += t.stories.length;
  count += sections.podcasts.length;
  count += sections.opinions.length;
  count += sections.entertainment.movies.length;
  count += sections.entertainment.streaming.length;
  count += sections.entertainment.upcoming.length;
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

  // Inject standings into team info on all games (recaps + schedule)
  const standingsMap = new Map<string, { seed: number; gamesBehind: string; streak: string; clinch: string }>();
  for (const s of scores.team_sports.standings) {
    for (const group of s.groups) {
      for (const team of group.teams) {
        standingsMap.set(`${s.sport}:${team.abbreviation}`, {
          seed: team.seed,
          gamesBehind: team.gamesBehind,
          streak: team.streak,
          clinch: team.clinch,
        });
      }
    }
  }

  function injectStandings(sport: string, team: { abbreviation: string; seed?: number; gamesBehind?: string; streak?: string; clinch?: string }) {
    const standing = standingsMap.get(`${sport}:${team.abbreviation}`);
    if (standing) {
      team.seed = standing.seed;
      team.gamesBehind = standing.gamesBehind;
      team.streak = standing.streak;
      team.clinch = standing.clinch;
    }
  }

  for (const recap of scores.team_sports.recaps) {
    for (const game of recap.games) {
      injectStandings(recap.sport, game.home);
      injectStandings(recap.sport, game.away);
    }
  }
  for (const sched of scores.team_sports.schedule) {
    for (const game of sched.games) {
      injectStandings(sched.sport, game.home);
      injectStandings(sched.sport, game.away);
    }
  }

  // Enrich all games (recaps + schedule) with summary endpoint data
  const allGameSets = [
    ...scores.team_sports.recaps,
    ...scores.team_sports.schedule,
  ];
  const enrichments = await enrichAllGames(allGameSets);
  let enrichedCount = 0;
  for (const recap of scores.team_sports.recaps) {
    for (const game of recap.games) {
      const enrichment = enrichments.get(game.id);
      if (enrichment) {
        game.enrichment = enrichment;
        enrichedCount++;
      }
    }
  }
  for (const sched of scores.team_sports.schedule) {
    for (const game of sched.games) {
      const enrichment = enrichments.get(game.id);
      if (enrichment) {
        game.enrichment = enrichment;
        enrichedCount++;
      }
    }
  }
  if (enrichedCount > 0) {
    console.log(`  ✓ Enriched ${enrichedCount} games with summary data`);
  }

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

  const dateStr = targetDate.toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
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
