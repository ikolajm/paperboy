/**
 * Game enrichment via ESPN summary endpoint.
 *
 * Fetches detailed game data (box score, injuries, series, etc.)
 * for completed games. One call per game, all data in one response.
 *
 * Endpoint: /apis/site/v2/sports/{sport}/{league}/summary?event={gameId}
 */

import type {
  GameEnrichment,
  TeamStatsBlock,
  TeamPlayerStats,
  PlayerStatLine,
  TeamSeasonLeaders,
  SeasonLeader,
  SeasonSeries,
  SeriesGame,
  TeamRecentForm,
  RecentGame,
  TeamInjuries,
  InjuredPlayer,
  GameArticle,
} from "../../shared/types/enrichment.js";
import { fetchEspn } from "./shared.js";

// --- Sport-to-ESPN path mapping ---

const SPORT_PATHS: Record<string, string> = {
  "NBA": "basketball/nba",
  "NHL": "hockey/nhl",
  "MLB": "baseball/mlb",
  "NFL": "football/nfl",
  "College Basketball": "basketball/mens-college-basketball",
  "College Football": "football/college-football",
};

const SUMMARY_BASE = "https://site.api.espn.com/apis/site/v2/sports";

// --- Main enrichment function ---

export async function enrichGame(
  gameId: string,
  sport: string,
): Promise<GameEnrichment | null> {
  const sportPath = SPORT_PATHS[sport];
  if (!sportPath) return null;

  const url = `${SUMMARY_BASE}/${sportPath}/summary?event=${gameId}`;

  try {
    const data = await fetchEspn(url) as Record<string, unknown>;

    return {
      enriched_at: new Date().toISOString(),
      source: "ESPN",
      teamStats: parseTeamStats(data),
      playerStats: parsePlayerStats(data),
      seasonLeaders: parseSeasonLeaders(data),
      seasonSeries: parseSeasonSeries(data),
      lastFiveGames: parseLastFiveGames(data),
      injuries: parseInjuries(data),
      article: parseArticle(data),
      venueImage: parseVenueImage(data),
    };
  } catch (err) {
    console.warn(`  ⚠ Enrichment failed for ${sport} game ${gameId}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

/**
 * Enrich all completed games across all sports.
 * Runs in parallel with per-sport batching to stay under rate limits.
 */
export async function enrichAllGames(
  recaps: Array<{ sport: string; games: Array<{ id: string }> }>,
): Promise<Map<string, GameEnrichment>> {
  const results = new Map<string, GameEnrichment>();

  // Collect all game+sport pairs
  const tasks: Array<{ gameId: string; sport: string }> = [];
  for (const recap of recaps) {
    for (const game of recap.games) {
      tasks.push({ gameId: game.id, sport: recap.sport });
    }
  }

  if (tasks.length === 0) return results;

  // Process in batches of 10 to respect rate limits (40 req / 10s)
  const BATCH_SIZE = 10;
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    const settled = await Promise.all(
      batch.map(async ({ gameId, sport }) => {
        const enrichment = await enrichGame(gameId, sport);
        return { gameId, enrichment };
      }),
    );

    for (const { gameId, enrichment } of settled) {
      if (enrichment) results.set(gameId, enrichment);
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < tasks.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return results;
}

// --- Parsers ---

function parseTeamStats(data: Record<string, unknown>): TeamStatsBlock[] {
  const boxscore = data.boxscore as Record<string, unknown> | undefined;
  if (!boxscore) return [];

  const teams = boxscore.teams as Array<Record<string, unknown>> | undefined;
  if (!teams) return [];

  return teams.map((t) => {
    const team = t.team as Record<string, unknown> | undefined;
    const statistics = t.statistics as Array<Record<string, unknown>> | undefined;

    // ESPN MLB nests stats inside categories (batting.stats[], pitching.stats[]).
    // NBA/NHL have flat stats with displayValue at the top level.
    // Detect nested structure and flatten.
    const flatStats: { name: string; label: string; abbreviation: string; displayValue: string }[] = [];

    for (const s of statistics || []) {
      const nested = s.stats as Array<Record<string, string>> | undefined;
      if (nested && Array.isArray(nested)) {
        // Nested: flatten inner stats (MLB)
        for (const inner of nested) {
          if (inner.displayValue) {
            flatStats.push({
              name: inner.name || "",
              label: inner.displayName || inner.shortDisplayName || "",
              abbreviation: inner.abbreviation || "",
              displayValue: inner.displayValue || "",
            });
          }
        }
      } else {
        // Flat: use directly (NBA, NHL)
        const stat = s as Record<string, string>;
        flatStats.push({
          name: stat.name || "",
          label: stat.label || stat.displayName || "",
          abbreviation: stat.abbreviation || "",
          displayValue: stat.displayValue || "",
        });
      }
    }

    return {
      team: (team?.displayName || "") as string,
      abbreviation: (team?.abbreviation || "") as string,
      stats: flatStats,
    };
  });
}

function parsePlayerStats(data: Record<string, unknown>): TeamPlayerStats[] {
  const boxscore = data.boxscore as Record<string, unknown> | undefined;
  if (!boxscore) return [];

  const playerBlocks = boxscore.players as Array<Record<string, unknown>> | undefined;
  if (!playerBlocks) return [];

  return playerBlocks.map((block) => {
    const team = block.team as Record<string, unknown> | undefined;
    const statGroups = block.statistics as Array<Record<string, unknown>> | undefined;

    const players: PlayerStatLine[] = [];
    let labels: string[] = [];

    if (statGroups) {
      for (const group of statGroups) {
        const groupLabels = group.labels as string[] | undefined;
        if (groupLabels && groupLabels.length > labels.length) {
          labels = groupLabels;
        }

        const athletes = group.athletes as Array<Record<string, unknown>> | undefined;
        if (!athletes) continue;

        for (const a of athletes) {
          const athlete = a.athlete as Record<string, unknown> | undefined;
          const headshot = athlete?.headshot as Record<string, string> | undefined;

          players.push({
            name: (athlete?.displayName || athlete?.shortName || "") as string,
            headshot: headshot?.href,
            position: (athlete?.position as Record<string, string>)?.abbreviation,
            jersey: athlete?.jersey as string | undefined,
            starter: !!(a.starter),
            stats: (a.stats || []) as string[],
          });
        }
      }
    }

    return {
      team: (team?.displayName || "") as string,
      abbreviation: (team?.abbreviation || "") as string,
      labels,
      players,
    };
  });
}

function parseSeasonLeaders(data: Record<string, unknown>): TeamSeasonLeaders[] {
  const rawLeaders = data.leaders;
  if (!rawLeaders) return [];

  // Leaders can be an array or an object keyed by index
  const entries: Array<Record<string, unknown>> = Array.isArray(rawLeaders)
    ? rawLeaders
    : Object.values(rawLeaders as Record<string, unknown>);

  const blocks: TeamSeasonLeaders[] = [];

  for (const block of entries) {
    if (!block || !block.team) continue;

    const team = block.team as Record<string, unknown>;
    const leaderCats = block.leaders as Array<Record<string, unknown>> | undefined;

    const parsed: SeasonLeader[] = [];
    if (leaderCats) {
      for (const cat of leaderCats) {
        const topLeaders = cat.leaders as Array<Record<string, unknown>> | undefined;
        const top = topLeaders?.[0];
        if (!top) continue;

        const athlete = top.athlete as Record<string, unknown> | undefined;
        const headshot = athlete?.headshot as Record<string, string> | undefined;

        const categoryName = (cat.displayName || cat.name || "") as string;
        parsed.push({
          category: categoryName,
          shortName: (cat.shortDisplayName || cat.abbreviation || categoryName) as string,
          athlete: (athlete?.displayName || athlete?.shortName || "") as string,
          headshot: headshot?.href,
          displayValue: (top.displayValue || "") as string,
        });
      }
    }

    blocks.push({
      team: (team.displayName || "") as string,
      abbreviation: (team.abbreviation || "") as string,
      leaders: parsed,
    });
  }

  return blocks;
}

function parseSeasonSeries(data: Record<string, unknown>): SeasonSeries[] {
  const series = data.seasonseries as Array<Record<string, unknown>> | undefined;
  if (!series || series.length === 0) return [];

  return series.map((s) => {
    const events = s.events as Array<Record<string, unknown>> | undefined;

  const games: SeriesGame[] = [];
  if (events) {
    for (const evt of events) {
      if (evt.status !== "post") continue; // only completed games

      // Summary endpoint uses competitors directly on events (not nested in competitions)
      const competitors = evt.competitors as Array<Record<string, unknown>> | undefined;
      if (!competitors || competitors.length < 2) continue;

      const home = competitors.find(c => c.homeAway === "home") || competitors[0];
      const away = competitors.find(c => c.homeAway === "away") || competitors[1];
      const homeTeam = home.team as Record<string, unknown> | undefined;
      const awayTeam = away.team as Record<string, unknown> | undefined;

      const homeScore = parseInt(home.score as string, 10) || 0;
      const awayScore = parseInt(away.score as string, 10) || 0;

      games.push({
        date: (evt.date || "") as string,
        homeTeam: (homeTeam?.abbreviation || "") as string,
        awayTeam: (awayTeam?.abbreviation || "") as string,
        homeScore,
        awayScore,
        winner: homeScore > awayScore
          ? (homeTeam?.abbreviation || "") as string
          : (awayTeam?.abbreviation || "") as string,
      });
    }
  }

    return {
      title: (s.title || s.seriesLabel || "") as string,
      summary: (s.summary || s.shortSummary || "") as string,
      games,
    };
  });
}

function parseLastFiveGames(data: Record<string, unknown>): TeamRecentForm[] {
  const lastFive = data.lastFiveGames as Array<Record<string, unknown>> | undefined;
  if (!lastFive) return [];

  return lastFive.map((block) => {
    const team = block.team as Record<string, unknown> | undefined;
    const events = block.events as Array<Record<string, unknown>> | undefined;

    const games: RecentGame[] = [];
    if (events) {
      for (const evt of events) {
        const opponent = evt.opponent as Record<string, unknown> | undefined;
        games.push({
          opponent: (opponent?.displayName || opponent?.abbreviation || "") as string,
          score: (evt.score || "") as string,
          result: (evt.gameResult || "") as string,
        });
      }
    }

    return {
      team: (team?.displayName || "") as string,
      abbreviation: (team?.abbreviation || "") as string,
      games,
    };
  });
}

function parseInjuries(data: Record<string, unknown>): TeamInjuries[] {
  const injuries = data.injuries as Array<Record<string, unknown>> | undefined;
  if (!injuries) return [];

  return injuries.map((block) => {
    const team = block.team as Record<string, unknown> | undefined;
    const injuryList = block.injuries as Array<Record<string, unknown>> | undefined;

    const parsed: InjuredPlayer[] = [];
    if (injuryList) {
      for (const inj of injuryList) {
        const athlete = inj.athlete as Record<string, unknown> | undefined;
        const headshot = athlete?.headshot as Record<string, string> | undefined;
        const position = athlete?.position as Record<string, string> | undefined;
        const injType = inj.type as Record<string, string> | undefined;
        const details = inj.details as Record<string, unknown> | undefined;

        const player: InjuredPlayer = {
          name: (athlete?.displayName || athlete?.fullName || "") as string,
          status: (inj.status || injType?.description || "") as string,
          injuryType: (details?.type || "") as string,
        };

        if (headshot?.href) player.headshot = headshot.href;
        if (position?.abbreviation) player.position = position.abbreviation;
        if (athlete?.jersey) player.jersey = athlete.jersey as string;
        if (details?.detail) player.detail = details.detail as string;
        if (details?.returnDate) player.returnDate = details.returnDate as string;

        parsed.push(player);
      }
    }

    return {
      team: (team?.displayName || "") as string,
      abbreviation: (team?.abbreviation || "") as string,
      injuries: parsed,
    };
  });
}

function parseArticle(data: Record<string, unknown>): GameArticle | null {
  const article = data.article as Record<string, unknown> | undefined;
  if (!article) return null;

  const headline = (article.headline || "") as string;
  const description = (article.description || "") as string;

  if (!headline && !description) return null;

  return { headline, description };
}

function parseVenueImage(data: Record<string, unknown>): string | null {
  const gameInfo = data.gameInfo as Record<string, unknown> | undefined;
  if (!gameInfo) return null;

  const venue = gameInfo.venue as Record<string, unknown> | undefined;
  if (!venue) return null;

  const images = venue.images as Array<Record<string, unknown>> | undefined;
  if (!images || images.length === 0) return null;

  return (images[0].href || null) as string | null;
}
