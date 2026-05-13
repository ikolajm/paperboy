/**
 * Fetch standings per sport from ESPN standings endpoint.
 * One call per sport, returns conference/division standings.
 */

import type { SportStandings, StandingsGroup, StandingsTeam } from "../../shared/types/standings.js";
import { fetchEspn, SPORT_PATHS } from "./shared.js";
import { F1_GRID_2026 } from "./f1.js";

/**
 * Display overrides for F1 team colors. Applied after F1_GRID_2026 lookup
 * to handle cases where the brand color is visually problematic at our
 * display sizes (e.g. Williams' actual brand color is pure white, harsh
 * in both themes).
 */
const F1_TEAM_COLOR_OVERRIDES: Record<string, string> = {
  Williams: "64C4FF", // Brand FFFFFF too light at display sizes
};

/** Reverse-lookup of team → color, derived from F1_GRID_2026 + overrides. */
function buildF1TeamColors(): Map<string, string> {
  const map = new Map<string, string>();
  for (const { team, color } of Object.values(F1_GRID_2026)) {
    if (!team) continue;
    map.set(team, F1_TEAM_COLOR_OVERRIDES[team] ?? color);
  }
  return map;
}

const STANDINGS_BASE = "https://site.api.espn.com/apis/v2/sports";

/**
 * Sports for which ESPN provides usable standings via the standings endpoint.
 * College sports return weirdly shaped or empty responses — keep them off
 * this list even though `SPORT_PATHS` knows their paths for enrichment.
 */
const STANDINGS_SUPPORTED = new Set(["NBA", "NHL", "MLB", "NFL"]);

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
  if (!STANDINGS_SUPPORTED.has(sport)) return null;
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
      .filter(s => STANDINGS_SUPPORTED.has(s))
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

    const teamColors = buildF1TeamColors();
    const groups: StandingsGroup[] = [];

    for (const child of children) {
      const groupName = (child.name || "") as string;
      const standings = child.standings as Record<string, unknown> | undefined;
      const entries = standings?.entries as Array<Record<string, unknown>> | undefined;
      if (!entries) continue;

      const teams: StandingsTeam[] = entries.map((entry, index) => {
        const stats = entry.stats as Array<Record<string, string>> | undefined ?? [];
        const rank = parseInt(parseStat(stats, "RK"), 10) || (index + 1);
        const pointsStr = parseStat(stats, "PTS") || "0";
        const pointsNum = parseInt(pointsStr, 10) || 0;

        // Driver standings have `athlete`, constructor standings have `team`.
        const athlete = entry.athlete as Record<string, unknown> | undefined;
        const team = entry.team as Record<string, unknown> | undefined;
        const flag = athlete?.flag as Record<string, string> | undefined;

        // Resolve team color via teamColors map (canonical brand colors from
        // F1_GRID_2026 with display overrides applied). Both driver rows and
        // constructor rows go through the same map.
        const driverName = (athlete?.displayName || "") as string;
        const teamName = (team?.displayName || "") as string;
        const lookupTeam = athlete ? (F1_GRID_2026[driverName]?.team ?? "") : teamName;
        const teamColor = teamColors.get(lookupTeam);

        return {
          displayName: driverName || teamName,
          abbreviation: (athlete?.abbreviation || team?.abbreviation || "") as string,
          logo: flag?.href || "",
          seed: rank,
          wins: 0,
          losses: 0,
          gamesBehind: "-",
          streak: "",
          clinch: "",
          differential: "",
          points: pointsNum,
          teamColor,
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
