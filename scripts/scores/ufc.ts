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
  getStatusDetail, getGameState, fetchEspn,
} from "./shared.js";

import type { FightResult, FightCard, FighterInfo } from "../../shared/types/digest.js";

// --- Parsing ---

function parseFighter(competitor: Record<string, unknown>): FighterInfo {
  const athlete = (competitor.athlete || {}) as Record<string, unknown>;
  const flag = athlete.flag as Record<string, string> | undefined;
  const records = competitor.records as Array<{ type: string; summary: string }> | undefined;
  const totalRecord = records?.find(r => r.type === "total")?.summary || "";

  return {
    name: (athlete.displayName || athlete.shortName || "Unknown") as string,
    record: totalRecord,
    winner: !!competitor.winner,
    flagUrl: flag?.href,
  };
}

/** Fetch method of victory from the core API status endpoint */
async function fetchFightMethod(eventId: string, fightId: string): Promise<{
  method: string;
  methodDetail?: string;
  endRound?: number;
  endTime?: string;
}> {
  try {
    const data = await fetchEspn(
      `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/${eventId}/competitions/${fightId}/status`
    ) as Record<string, unknown>;

    const result = data.result as Record<string, unknown> | undefined;
    const period = data.period as number | undefined;
    const displayClock = data.displayClock as string | undefined;

    return {
      method: (result?.shortDisplayName || result?.displayName || "Final") as string,
      methodDetail: (result?.description || result?.displayDescription) as string | undefined,
      endRound: period,
      endTime: displayClock,
    };
  } catch {
    return { method: "Final" };
  }
}

async function parseCompletedFights(event: Record<string, unknown>): Promise<FightCard | null> {
  const comps = event.competitions as Array<Record<string, unknown>> | undefined;
  if (!comps?.length) return null;

  const eventId = event.id as string || "";
  const fights: FightResult[] = [];

  // Parse all fights first, then batch-fetch methods
  const pendingFights: { fight: FightResult; comp: Record<string, unknown> }[] = [];

  for (const comp of comps) {
    if (getGameState({ competitions: [comp] } as unknown as Record<string, unknown>) !== "post") continue;

    const competitors = comp.competitors as Array<Record<string, unknown>> | undefined;
    if (!competitors || competitors.length < 2) continue;

    const f1 = parseFighter(competitors[0]);
    const f2 = parseFighter(competitors[1]);

    const weightClass = (comp.type as Record<string, unknown>)?.abbreviation as string || "";
    const rounds = ((comp.format as Record<string, unknown>)?.regulation as Record<string, unknown>)?.periods as number || 3;
    const status = comp.status as Record<string, unknown> | undefined;
    const cardSegment = (comp.cardSegment as Record<string, unknown>)?.description as string | undefined;

    const fight: FightResult = {
      id: comp.id as string || "",
      fighter1: f1,
      fighter2: f2,
      weightClass,
      rounds,
      method: getStatusDetail({ competitions: [comp] } as unknown as Record<string, unknown>),
      endRound: (status?.period as number) || undefined,
      endTime: (status?.displayClock as string) || undefined,
      cardSegment,
      headline: parseHeadline(comp),
    };

    pendingFights.push({ fight, comp });
  }

  if (pendingFights.length === 0) return null;

  // Fetch methods in parallel (13 calls for a full card)
  const methods = await Promise.all(
    pendingFights.map(({ fight }) => fetchFightMethod(eventId, fight.id))
  );

  for (let i = 0; i < pendingFights.length; i++) {
    const fight = pendingFights[i].fight;
    const m = methods[i];
    fight.method = m.method;
    fight.methodDetail = m.methodDetail;
    if (m.endRound) fight.endRound = m.endRound;
    if (m.endTime) fight.endTime = m.endTime;
    fights.push(fight);
  }

  const firstComp = comps[0];
  const dateStr = (firstComp.date || event.date || "") as string;
  const { formatted, utc } = parseStartTime(dateStr);

  return {
    id: eventId,
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

export async function parseCompletedEvents(data: unknown): Promise<FightCard[]> {
  const events = (data as Record<string, unknown[]>)?.events ?? [];
  const cards: FightCard[] = [];

  for (const event of events) {
    const evt = event as Record<string, unknown>;
    const card = await parseCompletedFights(evt);
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

