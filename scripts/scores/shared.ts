/**
 * Shared utilities for per-sport score modules.
 *
 * Provides ESPN API fetching, date handling, and common types
 * that all sport modules build on.
 */

// --- Types ---

export interface TeamInfo {
  displayName: string;
  abbreviation: string;
  logo: string;
  records: Record<string, string>;  // e.g. { total: "45-37", home: "23-18", road: "22-19" }
}

export interface GameLeader {
  category: string;     // e.g. "Points", "Goals", "Passing"
  shortName: string;    // e.g. "Pts", "G", "PASS"
  athlete: string;      // e.g. "T. Maxey"
  displayValue: string; // e.g. "31 PTS, 6 AST"
}

export interface CompletedGame {
  id: string;
  home: TeamInfo;
  away: TeamInfo;
  homeScore: number;
  awayScore: number;
  status: string;          // "Final", "Final/OT", "Final/SO", etc.
  headline: string;        // recap text from ESPN
  notes: string[];         // context like "NBA Play-In - East", "Round 1 - Game 3"
  venue: string;
  leaders: GameLeader[];
  linescores: { home: number[]; away: number[] };
}

export interface ScheduledGame {
  id: string;
  home: TeamInfo;
  away: TeamInfo;
  startTime: string;       // formatted ET time
  startTimeUTC: string;    // ISO string
  broadcasts: string[];
  notes: string[];
  venue: string;
}

export interface SportRecaps {
  sport: string;
  date: string;
  status: "games_played" | "no_games" | "playoffs" | "fetch_error";
  seasonType: number;
  games: CompletedGame[];
  error?: string;
}

export interface SportSchedule {
  sport: string;
  date: string;
  games: ScheduledGame[];
  error?: string;
}

// --- ESPN API fetch ---

export async function fetchEspn(url: string, timeout = 15000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Paperboy/1.0" },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

// --- Common parsing helpers ---

export function parseTeamInfo(competitor: Record<string, unknown>): TeamInfo {
  const team = (competitor.team || {}) as Record<string, unknown>;
  const records: Record<string, string> = {};

  const recordsArr = competitor.records as Array<{ type: string; summary: string }> | undefined;
  if (recordsArr) {
    for (const r of recordsArr) {
      // ESPN uses "ytd" for hockey, "total" for most others
      const key = r.type === "ytd" ? "total" : r.type;
      records[key] = r.summary;
    }
  }

  return {
    displayName: (team.displayName || team.shortDisplayName || team.name || "Unknown") as string,
    abbreviation: (team.abbreviation || "???") as string,
    logo: (team.logo || "") as string,
    records,
  };
}

/** Categories to exclude — ESPN internal ratings, not real stats */
const EXCLUDED_LEADER_CATEGORIES = new Set([
  "rating", "rat", "mlb", "mlb rating",
]);

export function parseLeaders(competitor: Record<string, unknown>): GameLeader[] {
  const leaders: GameLeader[] = [];
  const seen = new Set<string>();
  const leaderCategories = competitor.leaders as Array<Record<string, unknown>> | undefined;

  if (!leaderCategories) return leaders;

  for (const category of leaderCategories) {
    const shortName = ((category.shortDisplayName || category.abbreviation || "") as string);
    const categoryName = ((category.displayName || category.name || "") as string);

    // Skip ESPN internal rating categories
    if (EXCLUDED_LEADER_CATEGORIES.has(shortName.toLowerCase()) ||
        EXCLUDED_LEADER_CATEGORIES.has(categoryName.toLowerCase())) {
      continue;
    }

    // Dedup by shortName within a single team's leaders
    if (seen.has(shortName)) continue;
    seen.add(shortName);

    const topLeader = (category.leaders as Array<Record<string, unknown>>)?.[0];
    if (!topLeader) continue;

    const athlete = topLeader.athlete as Record<string, unknown> | undefined;
    leaders.push({
      category: categoryName,
      shortName,
      athlete: (athlete?.shortName || athlete?.displayName || "") as string,
      displayValue: (topLeader.displayValue || "") as string,
    });
  }

  return leaders;
}

export function parseVenue(comp: Record<string, unknown>): string {
  const venue = comp.venue as Record<string, unknown> | undefined;
  if (!venue) return "";
  const address = venue.address as Record<string, string> | undefined;
  const parts = [venue.fullName as string];
  if (address?.city) parts.push(address.city);
  if (address?.state) parts.push(address.state);
  return parts.filter(Boolean).join(", ");
}

export function parseNotes(comp: Record<string, unknown>): string[] {
  const notes = comp.notes as Array<{ headline?: string; type?: string }> | undefined;
  if (!notes) return [];
  return notes.map(n => n.headline || "").filter(Boolean);
}

export function parseHeadline(comp: Record<string, unknown>): string {
  const headlines = comp.headlines as Array<{ shortLinkText?: string; description?: string }> | undefined;
  if (!headlines?.[0]) return "";
  // Prefer shortLinkText (complete sentence) over description (often truncated by ESPN)
  const text = headlines[0].shortLinkText || headlines[0].description || "";
  // Clean up the leading "— " that ESPN sometimes prepends
  return text.replace(/^—\s*/, "").trim();
}

export function parseBroadcasts(comp: Record<string, unknown>): string[] {
  const broadcasts = comp.broadcasts as Array<{ names?: string[] }> | undefined;
  if (!broadcasts) return [];
  const names: string[] = [];
  for (const b of broadcasts) {
    if (b.names) names.push(...b.names);
  }
  return names;
}

export function parseStartTime(dateStr: string): { formatted: string; utc: string } {
  if (!dateStr) return { formatted: "", utc: "" };

  try {
    const dt = new Date(dateStr);
    const formatted = dt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    }) + " ET";

    return { formatted, utc: dt.toISOString() };
  } catch {
    return { formatted: dateStr, utc: dateStr };
  }
}

export function getStatusDetail(event: Record<string, unknown>): string {
  const comp = (event.competitions as Array<Record<string, unknown>>)?.[0];
  const statusType = (comp?.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
  if (statusType?.detail) return statusType.detail as string;

  // Fallback to event-level status
  const eventStatus = (event.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
  return (eventStatus?.detail || "") as string;
}

export function getGameState(event: Record<string, unknown>): string {
  const comp = (event.competitions as Array<Record<string, unknown>>)?.[0];
  const statusType = (comp?.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
  if (statusType?.state) return statusType.state as string;

  const eventStatus = (event.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
  return (eventStatus?.state || "") as string;
}

export function getSeasonType(event: Record<string, unknown>): number {
  return (event.season as Record<string, unknown>)?.type as number || 2;
}

// --- Date utilities ---

export function getYesterdayDateStr(targetDate: Date): string {
  const yesterday = new Date(targetDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Get a date range string for ESPN API queries.
 * Some sports (UFC, F1) need range queries — single date returns empty.
 * Format: YYYYMMDD-YYYYMMDD
 */
export function getDateRangeStr(targetDate: Date, daysBefore: number, daysAfter: number): string {
  const start = new Date(targetDate);
  start.setDate(start.getDate() - daysBefore);
  const end = new Date(targetDate);
  end.setDate(end.getDate() + daysAfter);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  return `${fmt(start)}-${fmt(end)}`;
}

export function formatDateDisplay(targetDate: Date, offsetDays = 0): string {
  const d = new Date(targetDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
