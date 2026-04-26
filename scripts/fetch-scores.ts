/**
 * Fetch sports scores and schedules from ESPN scoreboard API.
 *
 * Handles three distinct sport types:
 * - Team sports (NBA, NHL, MLB, NFL, College) → CompletedGame / ScheduledGame
 * - UFC/MMA → FightCard with individual bouts
 * - F1 → RaceWeekend with sessions and driver positions
 *
 * Usage:
 *   npx tsx scripts/fetch-scores.ts config/config.json [YYYY-MM-DD]
 *
 * Importable:
 *   import { fetchAllScores } from './fetch-scores.js';
 */

import { readFileSync } from "node:fs";
import type { PaperboyConfig, ScoreConfig } from "../shared/types/config.js";
import type {
  SportRecaps, SportSchedule,
  UfcRecaps, UfcSchedule,
  F1Recaps, F1Schedule,
  ScoresSection,
} from "../shared/types/digest.js";
import {
  fetchEspn, getTodayDateStr, getYesterdayDateStr, getDateRangeStr, formatDateDisplay,
} from "./scores/shared.js";
import { fetchAllStandings, fetchF1Teams, fetchF1Standings } from "./scores/standings.js";

// Team sport modules
import * as nba from "./scores/nba.js";
import * as nhl from "./scores/nhl.js";
import * as mlb from "./scores/mlb.js";
import * as nfl from "./scores/nfl.js";
import * as collegeBball from "./scores/college-basketball.js";
import * as collegeFball from "./scores/college-football.js";

// Event-based sport modules
import { parseCompletedEvents, parseScheduledEvents } from "./scores/ufc.js";
import { parseCompletedWeekends, parseScheduledWeekends, parseRaceWeekend, setF1TeamLookup } from "./scores/f1.js";

// --- Team sport module registry ---

interface TeamSportModule {
  parseCompletedGames: (data: unknown) => import("./scores/shared.js").CompletedGame[];
  parseScheduledGames: (data: unknown, targetDate: Date) => import("./scores/shared.js").ScheduledGame[];
  detectSeasonStatus: (data: unknown) => { status: "games_played" | "no_games" | "playoffs"; seasonType: number };
}

const TEAM_SPORT_MODULES: Record<string, TeamSportModule> = {
  "NBA": nba,
  "NHL": nhl,
  "MLB": mlb,
  "NFL": nfl,
  "College Basketball": collegeBball,
  "College Football": collegeFball,
};

// --- Fetch team sport ---

async function fetchTeamSport(
  sportName: string,
  config: ScoreConfig,
  targetDate: Date,
): Promise<{ recaps: SportRecaps; schedule: SportSchedule }> {
  const mod = TEAM_SPORT_MODULES[sportName];
  const url = config.url!;
  const yesterdayStr = getYesterdayDateStr(targetDate);
  const yesterdayDisplay = formatDateDisplay(targetDate, -1);
  const todayDisplay = formatDateDisplay(targetDate);

  let recaps: SportRecaps = {
    sport: sportName, date: yesterdayDisplay, status: "no_games", seasonType: 2, games: [],
  };
  let schedule: SportSchedule = {
    sport: sportName, date: todayDisplay, games: [],
  };

  if (!mod) return { recaps, schedule };

  if (config.recaps) {
    try {
      const data = await fetchEspn(`${url}?dates=${yesterdayStr}`);
      const { status, seasonType } = mod.detectSeasonStatus(data);
      const games = mod.parseCompletedGames(data);
      recaps = {
        sport: sportName, date: yesterdayDisplay,
        status: games.length > 0 ? status : "no_games",
        seasonType, games,
      };
    } catch (err) {
      recaps = {
        sport: sportName, date: yesterdayDisplay, status: "fetch_error",
        seasonType: 2, games: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (config.schedule) {
    try {
      const todayStr = getTodayDateStr(targetDate);
      const data = await fetchEspn(`${url}?dates=${todayStr}`);
      const games = mod.parseScheduledGames(data, targetDate);
      schedule = { sport: sportName, date: todayDisplay, games };
    } catch (err) {
      schedule = {
        sport: sportName, date: todayDisplay, games: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return { recaps, schedule };
}

// --- Fetch UFC ---

async function fetchUfc(
  config: ScoreConfig,
  targetDate: Date,
): Promise<{ recaps: UfcRecaps; schedule: UfcSchedule }> {
  const url = config.url!;
  const todayDisplay = formatDateDisplay(targetDate);

  let recaps: UfcRecaps = {
    sport: "UFC", date: todayDisplay, status: "no_events", cards: [],
  };
  let schedule: UfcSchedule = {
    sport: "UFC", date: todayDisplay, cards: [],
  };

  if (config.recaps) {
    try {
      const dateRange = getDateRangeStr(targetDate, 7, 0);
      const data = await fetchEspn(`${url}?dates=${dateRange}`);
      const cards = parseCompletedEvents(data);
      recaps = {
        sport: "UFC", date: todayDisplay,
        status: cards.length > 0 ? "events_completed" : "no_events",
        cards,
      };
    } catch (err) {
      recaps = {
        sport: "UFC", date: todayDisplay, status: "fetch_error", cards: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (config.schedule) {
    try {
      const dateRange = getDateRangeStr(targetDate, 0, 14);
      const data = await fetchEspn(`${url}?dates=${dateRange}`);
      const cards = parseScheduledEvents(data);
      schedule = { sport: "UFC", date: todayDisplay, cards };
    } catch (err) {
      schedule = {
        sport: "UFC", date: todayDisplay, cards: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return { recaps, schedule };
}

// --- Fetch F1 ---

async function fetchF1(
  config: ScoreConfig,
  targetDate: Date,
): Promise<{ recaps: F1Recaps; schedule: F1Schedule }> {
  const url = config.url!;
  const todayDisplay = formatDateDisplay(targetDate);

  // Fetch team lookup first (1 call) so driver results get team + color
  const teamLookup = await fetchF1Teams();
  setF1TeamLookup(teamLookup);

  let recaps: F1Recaps = {
    sport: "F1", date: todayDisplay, status: "no_race", weekends: [],
  };
  let schedule: F1Schedule = {
    sport: "F1", date: todayDisplay, weekends: [],
  };

  if (config.recaps) {
    try {
      const dateRange = getDateRangeStr(targetDate, 14, 0);
      const data = await fetchEspn(`${url}?dates=${dateRange}`);
      const weekends = parseCompletedWeekends(data);
      recaps = {
        sport: "F1", date: todayDisplay,
        status: weekends.length > 0 ? "race_completed" : "no_race",
        weekends,
      };
    } catch (err) {
      recaps = {
        sport: "F1", date: todayDisplay, status: "fetch_error", weekends: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (config.schedule) {
    try {
      const dateRange = getDateRangeStr(targetDate, 0, 21);
      const data = await fetchEspn(`${url}?dates=${dateRange}`);
      const weekends = parseScheduledWeekends(data);
      schedule = { sport: "F1", date: todayDisplay, weekends };
    } catch (err) {
      schedule = {
        sport: "F1", date: todayDisplay, weekends: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return { recaps, schedule };
}

// --- Public API ---

export async function fetchAllScores(config: PaperboyConfig, targetDate?: Date): Promise<ScoresSection> {
  const date = targetDate ?? new Date();

  // Separate sport types
  const teamSports: [string, ScoreConfig][] = [];
  let ufcConfig: ScoreConfig | null = null;
  let f1Config: ScoreConfig | null = null;

  for (const [name, scoreConfig] of Object.entries(config.scores)) {
    if (name === "UFC") ufcConfig = scoreConfig;
    else if (name === "F1") f1Config = scoreConfig;
    else teamSports.push([name, scoreConfig]);
  }

  // Fetch all in parallel
  const sportNames = teamSports.map(([name]) => name);
  const [teamResults, ufcResult, f1Result, teamStandings, f1Standings] = await Promise.all([
    Promise.all(teamSports.map(([name, cfg]) => fetchTeamSport(name, cfg, date))),
    ufcConfig ? fetchUfc(ufcConfig, date) : null,
    f1Config ? fetchF1(f1Config, date) : null,
    fetchAllStandings(sportNames),
    f1Config ? fetchF1Standings() : null,
  ]);

  const standings = [...teamStandings, ...(f1Standings ? [f1Standings] : [])];

  return {
    team_sports: {
      recaps: teamResults.map(r => r.recaps),
      schedule: teamResults.map(r => r.schedule).filter(s => s.games.length > 0),
      standings,
    },
    ufc: ufcResult ?? {
      recaps: { sport: "UFC", date: formatDateDisplay(date), status: "no_events", cards: [] },
      schedule: { sport: "UFC", date: formatDateDisplay(date), cards: [] },
    },
    f1: f1Result ?? {
      recaps: { sport: "F1", date: formatDateDisplay(date), status: "no_race", weekends: [] },
      schedule: { sport: "F1", date: formatDateDisplay(date), weekends: [] },
    },
  };
}

// --- CLI entry point ---

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: npx tsx scripts/fetch-scores.ts <config.json> [YYYY-MM-DD]");
    process.exit(1);
  }

  const config: PaperboyConfig = JSON.parse(readFileSync(process.argv[2], "utf-8"));

  let targetDate = new Date();
  if (process.argv[3]) {
    targetDate = new Date(process.argv[3] + "T12:00:00");
  }

  const results = await fetchAllScores(config, targetDate);
  console.log(JSON.stringify(results, null, 2));
}

const isMain = process.argv[1]?.endsWith("fetch-scores.ts") ||
               process.argv[1]?.endsWith("fetch-scores.js");
if (isMain) {
  main();
}
