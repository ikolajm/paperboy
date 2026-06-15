/**
 * Fetch sports scores and schedules from ESPN scoreboard API.
 *
 * Handles team sports (NBA, NHL, MLB, NFL, College) → CompletedGame / ScheduledGame.
 * Individual-athlete sports (UFC, F1) are intentionally out of scope — ESPN's
 * scoreboard doesn't package them cleanly (no historical date queries, roster
 * staleness); see README "Known limitations".
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
  ScoresSection,
} from "../shared/types/digest.js";
import {
  fetchEspn, getTodayDateStr, getYesterdayDateStr, formatDateDisplay,
} from "./scores/shared.js";
import { fetchAllStandings } from "./scores/standings.js";

// Team sport modules
import * as nba from "./scores/nba.js";
import * as nhl from "./scores/nhl.js";
import * as mlb from "./scores/mlb.js";
import * as nfl from "./scores/nfl.js";
import * as collegeBball from "./scores/college-basketball.js";
import * as collegeFball from "./scores/college-football.js";

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
  const url = config.url;
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

// --- Public API ---

export async function fetchAllScores(config: PaperboyConfig, targetDate?: Date): Promise<ScoresSection> {
  const date = targetDate ?? new Date();

  // Only team sports are fetched; any individual-athlete config entries (UFC/F1)
  // are ignored — they aren't cleanly packaged by ESPN's scoreboard API.
  const teamSports: [string, ScoreConfig][] = Object.entries(config.scores).filter(
    ([name]) => name in TEAM_SPORT_MODULES,
  );

  const sportNames = teamSports.map(([name]) => name);
  const [teamResults, teamStandings] = await Promise.all([
    Promise.all(teamSports.map(([name, cfg]) => fetchTeamSport(name, cfg, date))),
    fetchAllStandings(sportNames),
  ]);

  return {
    team_sports: {
      recaps: teamResults.map(r => r.recaps),
      schedule: teamResults.map(r => r.schedule).filter(s => s.games.length > 0),
      standings: teamStandings,
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
