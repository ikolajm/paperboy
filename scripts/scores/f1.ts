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

function parseDrivers(competitors: Array<Record<string, unknown>>): DriverResult[] {
  return competitors.map(c => {
    const athlete = (c.athlete || {}) as Record<string, unknown>;
    const team = (c.team || {}) as Record<string, unknown>;
    const flag = athlete.flag as Record<string, string> | undefined;

    return {
      position: (c.order as number) || 0,
      name: (athlete.displayName || athlete.shortName || "Unknown") as string,
      team: (team.displayName || team.abbreviation || "") as string,
      flag: flag?.alt || "",
      winner: !!c.winner,
    };
  });
}

function parseSession(comp: Record<string, unknown>): SessionResult {
  const type = (comp.type as Record<string, unknown>)?.abbreviation as string || "Unknown";
  const status = ((comp.status as Record<string, unknown>)?.type as Record<string, unknown>)?.detail as string || "";
  const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;

  return {
    type,
    status,
    drivers: competitors ? parseDrivers(competitors) : [],
    headline: parseHeadline(comp),
  };
}

export function parseRaceWeekend(event: Record<string, unknown>): RaceWeekend {
  const comps = event.competitions as Array<Record<string, unknown>> | undefined;
  const sessions: SessionResult[] = [];

  if (comps) {
    for (const comp of comps) {
      sessions.push(parseSession(comp));
    }
  }

  // Circuit info lives at event level, not competition level
  const circuit = event.circuit as Record<string, unknown> | undefined;
  const circuitAddress = circuit?.address as Record<string, string> | undefined;

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

