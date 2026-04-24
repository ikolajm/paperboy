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
