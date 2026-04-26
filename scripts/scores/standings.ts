/**
 * Fetch standings per sport from ESPN standings endpoint.
 * One call per sport, returns conference/division standings.
 */

import type { SportStandings, StandingsGroup, StandingsTeam } from "../../shared/types/standings.js";
import { fetchEspn } from "./shared.js";

const STANDINGS_BASE = "https://site.api.espn.com/apis/v2/sports";

const SPORT_PATHS: Record<string, string> = {
  "NBA": "basketball/nba",
  "NHL": "hockey/nhl",
  "MLB": "baseball/mlb",
  "NFL": "football/nfl",
};

function parseStat(stats: Array<Record<string, string>>, shortName: string): string {
  return stats.find(s => s.shortDisplayName === shortName)?.displayValue ?? "";
}

function parseStandings(data: unknown, sport: string): SportStandings {
  const root = data as Record<string, unknown>;
  const children = root.children as Array<Record<string, unknown>> | undefined;

  const groups: StandingsGroup[] = [];

  if (children) {
    for (const child of children) {
      const name = (child.name || "") as string;
      const standings = child.standings as Record<string, unknown> | undefined;
      const entries = standings?.entries as Array<Record<string, unknown>> | undefined;

      if (!entries) continue;

      const teams: StandingsTeam[] = entries.map((entry, index) => {
        const team = entry.team as Record<string, unknown> | undefined;
        const stats = entry.stats as Array<Record<string, string>> | undefined ?? [];

        const wins = parseInt(parseStat(stats, "W"), 10) || 0;
        const losses = parseInt(parseStat(stats, "L"), 10) || 0;

        const t: StandingsTeam = {
          displayName: (team?.displayName || "") as string,
          abbreviation: (team?.abbreviation || "") as string,
          logo: (team?.logos as Array<Record<string, string>>)?.[0]?.href ?? "",
          seed: index + 1,
          wins,
          losses,
          gamesBehind: parseStat(stats, "GB") || "-",
          streak: parseStat(stats, "STRK") || "",
          clinch: parseStat(stats, "CLINCH") || "",
          differential: parseStat(stats, "DIFF") || "",
        };

        // NHL has OT losses
        const otl = parseStat(stats, "OTL");
        if (otl) t.otLosses = parseInt(otl, 10) || 0;

        return t;
      });

      groups.push({ name, teams });
    }
  }

  return {
    sport,
    groups,
    fetched_at: new Date().toISOString(),
  };
}

export async function fetchStandings(sport: string): Promise<SportStandings | null> {
  const path = SPORT_PATHS[sport];
  if (!path) return null;

  try {
    const data = await fetchEspn(`${STANDINGS_BASE}/${path}/standings`);
    return parseStandings(data, sport);
  } catch (err) {
    console.warn(`  ⚠ Standings fetch failed for ${sport}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

export async function fetchAllStandings(sports: string[]): Promise<SportStandings[]> {
  const results = await Promise.all(
    sports
      .filter(s => SPORT_PATHS[s])
      .map(s => fetchStandings(s)),
  );
  return results.filter((r): r is SportStandings => r !== null);
}

// --- F1 Standings ---

export interface F1TeamInfo {
  name: string;
  color: string;
}

/** Fetch F1 teams → returns a map of team name → { color } */
export async function fetchF1Teams(): Promise<Map<string, F1TeamInfo>> {
  const map = new Map<string, F1TeamInfo>();
  try {
    const data = await fetchEspn("https://site.api.espn.com/apis/site/v2/sports/racing/f1/teams") as Record<string, unknown>;
    const sports = data.sports as Array<Record<string, unknown>> | undefined;
    const league = sports?.[0]?.leagues as Array<Record<string, unknown>> | undefined;
    const teams = league?.[0]?.teams as Array<Record<string, unknown>> | undefined;

    if (teams) {
      for (const t of teams) {
        const team = t.team as Record<string, unknown>;
        const name = (team.displayName || "") as string;
        const color = (team.color || "777777") as string;
        if (name) map.set(name, { name, color });
      }
    }
  } catch (err) {
    console.warn(`  ⚠ F1 teams fetch failed: ${err instanceof Error ? err.message : err}`);
  }
  return map;
}

/** Fetch F1 driver + constructor standings */
export async function fetchF1Standings(): Promise<SportStandings | null> {
  try {
    const data = await fetchEspn("https://site.api.espn.com/apis/v2/sports/racing/f1/standings") as Record<string, unknown>;
    const children = data.children as Array<Record<string, unknown>> | undefined;
    if (!children) return null;

    const groups: StandingsGroup[] = [];

    for (const child of children) {
      const groupName = (child.name || "") as string;
      const standings = child.standings as Record<string, unknown> | undefined;
      const entries = standings?.entries as Array<Record<string, unknown>> | undefined;
      if (!entries) continue;

      const teams: StandingsTeam[] = entries.map((entry, index) => {
        const stats = entry.stats as Array<Record<string, string>> | undefined ?? [];
        const rank = parseInt(parseStat(stats, "RK"), 10) || (index + 1);
        const points = parseStat(stats, "PTS") || "0";

        // Driver standings have athlete, constructor standings have team
        const athlete = entry.athlete as Record<string, unknown> | undefined;
        const team = entry.team as Record<string, unknown> | undefined;
        const flag = athlete?.flag as Record<string, string> | undefined;

        return {
          displayName: (athlete?.displayName || team?.displayName || "") as string,
          abbreviation: (athlete?.abbreviation || team?.abbreviation || "") as string,
          logo: flag?.href || "",
          seed: rank,
          wins: parseInt(points, 10) || 0, // repurpose wins as points for F1
          losses: 0,
          gamesBehind: "-",
          streak: "",
          clinch: "",
          differential: points,  // store points in differential for display
        };
      });

      groups.push({ name: groupName, teams });
    }

    return {
      sport: "F1",
      groups,
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`  ⚠ F1 standings fetch failed: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}
