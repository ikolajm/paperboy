/**
 * NHL score parsing.
 *
 * Extracts from ESPN NHL scoreboard:
 * - Completed games: scores, leaders (goals/assists/points), linescores (periods + OT/SO)
 * - Scheduled games: start time, broadcasts, venue
 * - Notable: OT wins, shootout wins, shutouts
 * - Records: W-L-OTL format
 */

import {
  type CompletedGame, type ScheduledGame, type GameLeader,
  parseTeamInfo, parseLeaders, parseVenue, parseNotes,
  parseHeadline, parseBroadcasts, parseStartTime,
  getStatusDetail, getGameState, getSeasonType,
} from "./shared.js";

// --- Completed games ---

function parseNotable(event: Record<string, unknown>, homeScore: number, awayScore: number): string | null {
  const detail = getStatusDetail(event);

  // Shootout
  if (detail.includes("SO")) return "Final/SO";

  // Overtime
  if (detail.includes("OT")) return detail;

  // Shutout
  if (homeScore === 0 || awayScore === 0) return "Shutout";

  // High-scoring game (10+ combined goals)
  if (homeScore + awayScore >= 10) return `${homeScore + awayScore} goals`;

  return null;
}

export function parseCompletedGames(data: unknown): CompletedGame[] {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const games: CompletedGame[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    if (getGameState(evt) !== "post") continue;

    const comp = (evt.competitions as Array<Record<string, unknown>>)?.[0];
    if (!comp) continue;

    const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;
    if (!competitors || competitors.length < 2) continue;

    let home = competitors.find(c => c.homeAway === "home");
    let away = competitors.find(c => c.homeAway === "away");
    if (!home || !away) { home = competitors[0]; away = competitors[1]; }

    const homeScore = parseInt(home.score as string, 10) || 0;
    const awayScore = parseInt(away.score as string, 10) || 0;

    // Linescores (periods — typically 3, plus OT/SO columns)
    const homeLinescores = (home.linescores as Array<{ value: number }> | undefined)?.map(l => l.value) ?? [];
    const awayLinescores = (away.linescores as Array<{ value: number }> | undefined)?.map(l => l.value) ?? [];

    const leaders: GameLeader[] = [
      ...parseLeaders(away),
      ...parseLeaders(home),
    ];

    const notable = parseNotable(evt, homeScore, awayScore);
    const headline = parseHeadline(comp);

    games.push({
      id: evt.id as string,
      home: parseTeamInfo(home),
      away: parseTeamInfo(away),
      homeScore,
      awayScore,
      status: getStatusDetail(evt),
      headline: notable ? `${notable}${headline ? ` — ${headline}` : ""}` : headline,
      notes: parseNotes(comp),
      venue: parseVenue(comp),
      broadcasts: parseBroadcasts(comp),
      leaders,
      linescores: { home: homeLinescores, away: awayLinescores },
    });
  }

  return games;
}

// --- Scheduled games ---

export function parseScheduledGames(data: unknown, targetDate: Date): ScheduledGame[] {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const games: ScheduledGame[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    if (getGameState(evt) !== "pre") continue;

    const comp = (evt.competitions as Array<Record<string, unknown>>)?.[0];
    if (!comp) continue;

    const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;
    if (!competitors || competitors.length < 2) continue;

    let home = competitors.find(c => c.homeAway === "home");
    let away = competitors.find(c => c.homeAway === "away");
    if (!home || !away) { home = competitors[0]; away = competitors[1]; }

    const dateStr = (comp.date || evt.date || "") as string;
    if (dateStr) {
      const gameDate = new Date(dateStr);
      const diffDays = (gameDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) continue;
    }

    const { formatted, utc } = parseStartTime(dateStr);

    games.push({
      id: evt.id as string,
      home: parseTeamInfo(home),
      away: parseTeamInfo(away),
      startTime: formatted,
      startTimeUTC: utc,
      broadcasts: parseBroadcasts(comp),
      notes: parseNotes(comp),
      venue: parseVenue(comp),
    });
  }

  return games;
}

// --- Season type detection ---

export function detectSeasonStatus(data: unknown): { status: "games_played" | "no_games" | "playoffs"; seasonType: number } {
  const events = (data as Record<string, unknown[]>)?.events ?? [];

  if (events.length === 0) return { status: "no_games", seasonType: 2 };

  const firstEvent = events[0] as Record<string, unknown>;
  const seasonType = getSeasonType(firstEvent);

  const hasCompleted = events.some(e => getGameState(e as Record<string, unknown>) === "post");

  if (!hasCompleted) return { status: "no_games", seasonType };
  if (seasonType === 3) return { status: "playoffs", seasonType };

  return { status: "games_played", seasonType };
}
