/**
 * Formula 1 score parsing.
 *
 * F1 is fundamentally different from team sports:
 * - Events are race weekends with 5 sessions (FP1, FP2, FP3, Qualifying, Race)
 * - Competitors are individual drivers with team associations
 * - Results are position-based, not score-based
 * - No linescores — finishing order is the result
 *
 * ESPN scoreboard returns the current/next event. Date queries
 * use the race weekend date range, not individual days.
 */

import {
  parseHeadline, parseBroadcasts,
  getGameState,
} from "./shared.js";

import type { DriverResult, SessionResult, RaceWeekend } from "../../shared/types/digest.js";

// --- Parsing ---

import type { F1TeamInfo } from "./standings.js";

/**
 * 2026 F1 grid: driver name → team + color.
 * Sourced from ESPN core API (vehicle.manufacturer + vehicle.teamColor).
 * Refresh at season start or if mid-season driver swaps occur.
 */
const F1_GRID_2026: Record<string, { team: string; color: string }> = {
  "George Russell":    { team: "Mercedes",      color: "00D2BE" },
  "Kimi Antonelli":    { team: "Mercedes",      color: "00D2BE" },
  "Charles Leclerc":   { team: "Ferrari",       color: "DC0000" },
  "Lewis Hamilton":    { team: "Ferrari",       color: "DC0000" },
  "Lando Norris":      { team: "McLaren",       color: "FF8700" },
  "Oscar Piastri":     { team: "McLaren",       color: "FF8700" },
  "Max Verstappen":    { team: "Red Bull",      color: "00327D" },
  "Isack Hadjar":      { team: "Red Bull",      color: "00327D" },
  "Oliver Bearman":    { team: "Haas",          color: "5A5A5A" },
  "Esteban Ocon":      { team: "Haas",          color: "5A5A5A" },
  "Arvid Lindblad":    { team: "Racing Bulls",  color: "6692FF" },
  "Liam Lawson":       { team: "Racing Bulls",  color: "6692FF" },
  "Gabriel Bortoleto": { team: "Audi",          color: "FF2D00" },
  "Nico Hülkenberg":   { team: "Audi",          color: "FF2D00" },
  "Pierre Gasly":      { team: "Alpine",        color: "FFF500" },
  "Franco Colapinto":  { team: "Alpine",        color: "FFF500" },
  "Alexander Albon":   { team: "Williams",      color: "FFFFFF" },
  "Carlos Sainz":      { team: "Williams",      color: "FFFFFF" },
  "Sergio Pérez":      { team: "Cadillac",      color: "A2AAAD" },
  "Valtteri Bottas":   { team: "Cadillac",      color: "A2AAAD" },
  "Lance Stroll":      { team: "Aston Martin",  color: "006F62" },
  "Fernando Alonso":   { team: "Aston Martin",  color: "006F62" },
};

/** Also accept team lookup from standings fetch as runtime override */
let _teamLookup: Map<string, F1TeamInfo> = new Map();

export function setF1TeamLookup(lookup: Map<string, F1TeamInfo>) {
  _teamLookup = lookup;
}

function parseDrivers(competitors: Array<Record<string, unknown>>): DriverResult[] {
  return competitors.map(c => {
    const athlete = (c.athlete || {}) as Record<string, unknown>;
    const team = (c.team || {}) as Record<string, unknown>;
    const flag = athlete.flag as Record<string, string> | undefined;

    const driverName = (athlete.displayName || athlete.shortName || "Unknown") as string;
    const scoreBoardTeam = (team.displayName || team.abbreviation || "") as string;

    // Priority: scoreboard team → static grid → teams endpoint
    const gridEntry = F1_GRID_2026[driverName];
    const teamName = scoreBoardTeam || gridEntry?.team || "";
    const teamColor = gridEntry?.color || _teamLookup.get(teamName)?.color;

    return {
      position: (c.order as number) || 0,
      name: driverName,
      team: teamName,
      teamColor,
      flag: flag?.alt || "",
      flagUrl: flag?.href,
      winner: !!c.winner,
    };
  });
}

/**
 * Circuit city → IANA timezone. Covers the 2026 F1 calendar.
 * Refresh if new circuits are added.
 */
const CIRCUIT_TIMEZONES: Record<string, string> = {
  'Melbourne': 'Australia/Melbourne',
  'Shanghai': 'Asia/Shanghai',
  'Suzuka': 'Asia/Tokyo',
  'Sakhir': 'Asia/Bahrain',
  'Jeddah': 'Asia/Riyadh',
  'Miami': 'America/New_York',
  'Imola': 'Europe/Rome',
  'Monte Carlo': 'Europe/Monaco',
  'Monaco': 'Europe/Monaco',
  'Barcelona': 'Europe/Madrid',
  'Montreal': 'America/Toronto',
  'Spielberg': 'Europe/Vienna',
  'Silverstone': 'Europe/London',
  'Spa': 'Europe/Brussels',
  'Spa-Francorchamps': 'Europe/Brussels',
  'Budapest': 'Europe/Budapest',
  'Zandvoort': 'Europe/Amsterdam',
  'Monza': 'Europe/Rome',
  'Baku': 'Asia/Baku',
  'Singapore': 'Asia/Singapore',
  'Austin': 'America/Chicago',
  'Mexico City': 'America/Mexico_City',
  'São Paulo': 'America/Sao_Paulo',
  'Sao Paulo': 'America/Sao_Paulo',
  'Las Vegas': 'America/Los_Angeles',
  'Lusail': 'Asia/Qatar',
  'Abu Dhabi': 'Asia/Dubai',
  'Yas Island': 'Asia/Dubai',
};

let _venueTimezone: string | undefined;

function getLocalDate(utcDateStr: string): string {
  if (!utcDateStr) return '';
  try {
    const d = new Date(utcDateStr);
    return d.toLocaleDateString('en-CA', { timeZone: _venueTimezone ?? 'UTC' });
  } catch {
    return utcDateStr.slice(0, 10);
  }
}

function parseSession(comp: Record<string, unknown>): SessionResult {
  const type = (comp.type as Record<string, unknown>)?.abbreviation as string || "Unknown";
  const date = (comp.date as string) || "";
  const status = ((comp.status as Record<string, unknown>)?.type as Record<string, unknown>)?.detail as string || "";
  const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;

  return {
    type,
    date,
    localDate: getLocalDate(date),
    status,
    drivers: competitors ? parseDrivers(competitors) : [],
    headline: parseHeadline(comp),
  };
}

export function parseRaceWeekend(event: Record<string, unknown>): RaceWeekend {
  // Circuit info lives at event level, not competition level
  const circuit = event.circuit as Record<string, unknown> | undefined;
  const circuitAddress = circuit?.address as Record<string, string> | undefined;

  // Set venue timezone before parsing sessions so localDate is correct
  const city = circuitAddress?.city ?? '';
  _venueTimezone = CIRCUIT_TIMEZONES[city];

  const comps = event.competitions as Array<Record<string, unknown>> | undefined;
  const sessions: SessionResult[] = [];

  if (comps) {
    for (const comp of comps) {
      sessions.push(parseSession(comp));
    }
  }

  return {
    id: event.id as string || "",
    eventName: (event.name || event.shortName || "F1 Event") as string,
    circuit: (circuit?.fullName || "") as string,
    city: [circuitAddress?.city, circuitAddress?.state, circuitAddress?.country].filter(Boolean).join(", "),
    date: (event.date || "") as string,
    sessions,
  };
}

// --- Public API ---

export function parseCompletedWeekends(data: unknown): RaceWeekend[] {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const weekends: RaceWeekend[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    const state = getGameState(evt);

    // Check if the race session is completed (not just practice)
    const comps = evt.competitions as Array<Record<string, unknown>> | undefined;
    const raceSession = comps?.find(c =>
      (c.type as Record<string, unknown>)?.abbreviation === "Race"
    );

    if (!raceSession) continue;

    const raceState = ((raceSession.status as Record<string, unknown>)?.type as Record<string, unknown>)?.state as string;
    const raceDetail = ((raceSession.status as Record<string, unknown>)?.type as Record<string, unknown>)?.detail as string;

    // Skip canceled races
    if (raceDetail === "Canceled") continue;

    if (raceState === "post" || state === "post") {
      weekends.push(parseRaceWeekend(evt));
    }
  }

  return weekends;
}

export function parseScheduledWeekends(data: unknown): RaceWeekend[] {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const weekends: RaceWeekend[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    const state = getGameState(evt);

    if (state === "pre") {
      weekends.push(parseRaceWeekend(evt));
    }
  }

  return weekends;
}

