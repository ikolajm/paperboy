/**
 * UFC/MMA score parsing.
 *
 * UFC is fundamentally different from team sports:
 * - Events are fight cards with multiple bouts (competitions)
 * - Competitors are individual fighters (athlete), not teams
 * - Each bout has a weight class and round count
 * - No linescores — results are win/loss with method
 *
 * ESPN only shows the next upcoming event on the default scoreboard.
 * Date-based queries for past events return empty. Recaps rely on
 * the event still being on the scoreboard in "post" state.
 */

import {
  parseVenue, parseBroadcasts, parseStartTime, parseHeadline,
  getStatusDetail, getGameState,
} from "./shared.js";

import type { FightResult, FightCard } from "../../shared/types/digest.js";

// --- Parsing ---

function parseFighter(competitor: Record<string, unknown>): { name: string; record: string; winner: boolean } {
  const athlete = (competitor.athlete || {}) as Record<string, unknown>;
  const records = competitor.records as Array<{ type: string; summary: string }> | undefined;
  const totalRecord = records?.find(r => r.type === "total")?.summary || "";

  return {
    name: (athlete.displayName || athlete.shortName || "Unknown") as string,
    record: totalRecord,
    winner: !!competitor.winner,
  };
}

function parseCompletedFights(event: Record<string, unknown>): FightCard | null {
  const comps = event.competitions as Array<Record<string, unknown>> | undefined;
  if (!comps?.length) return null;

  const fights: FightResult[] = [];

  for (const comp of comps) {
    if (getGameState({ competitions: [comp] } as unknown as Record<string, unknown>) !== "post") continue;

    const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;
    if (!competitors || competitors.length < 2) continue;

    const f1 = parseFighter(competitors[0]);
    const f2 = parseFighter(competitors[1]);

    const weightClass = (comp.type as Record<string, unknown>)?.abbreviation as string || "";
    const rounds = ((comp.format as Record<string, unknown>)?.regulation as Record<string, unknown>)?.periods as number || 3;

    fights.push({
      id: comp.id as string || "",
      fighter1: f1,
      fighter2: f2,
      weightClass,
      rounds,
      method: getStatusDetail({ competitions: [comp] } as unknown as Record<string, unknown>),
      headline: parseHeadline(comp),
    });
  }

  if (fights.length === 0) return null;

  const firstComp = comps[0];
  const dateStr = (firstComp.date || event.date || "") as string;
  const { formatted, utc } = parseStartTime(dateStr);

  return {
    id: event.id as string || "",
    eventName: (event.name || event.shortName || "UFC Event") as string,
    venue: parseVenue(firstComp),
    broadcasts: parseBroadcasts(firstComp),
    startTime: formatted,
    startTimeUTC: utc,
    fights,
  };
}

function parseScheduledCard(event: Record<string, unknown>): FightCard | null {
  const comps = event.competitions as Array<Record<string, unknown>> | undefined;
  if (!comps?.length) return null;

  // Check if any bout is still pre
  const hasPre = comps.some(c =>
    getGameState({ competitions: [c] } as unknown as Record<string, unknown>) === "pre"
  );
  if (!hasPre) return null;

  const fights: FightResult[] = [];
  for (const comp of comps) {
    const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;
    if (!competitors || competitors.length < 2) continue;

    const f1 = parseFighter(competitors[0]);
    const f2 = parseFighter(competitors[1]);
    const weightClass = (comp.type as Record<string, unknown>)?.abbreviation as string || "";
    const rounds = ((comp.format as Record<string, unknown>)?.regulation as Record<string, unknown>)?.periods as number || 3;

    fights.push({
      id: comp.id as string || "",
      fighter1: f1,
      fighter2: f2,
      weightClass,
      rounds,
      method: "",
      headline: "",
    });
  }

  const firstComp = comps[0];
  const dateStr = (firstComp.date || event.date || "") as string;
  const { formatted, utc } = parseStartTime(dateStr);

  return {
    id: event.id as string || "",
    eventName: (event.name || event.shortName || "UFC Event") as string,
    venue: parseVenue(firstComp),
    broadcasts: parseBroadcasts(firstComp),
    startTime: formatted,
    startTimeUTC: utc,
    fights,
  };
}

// --- Public API (matches team sport interface pattern) ---

export function parseCompletedEvents(data: unknown): FightCard[] {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const cards: FightCard[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    const card = parseCompletedFights(evt);
    if (card) cards.push(card);
  }

  return cards;
}

export function parseScheduledEvents(data: unknown): FightCard[] {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const cards: FightCard[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    const card = parseScheduledCard(evt);
    if (card) cards.push(card);
  }

  return cards;
}

