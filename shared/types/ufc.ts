/**
 * UFC/MMA types — fighters, fights, event cards.
 */

export interface FighterInfo {
  name: string;
  record: string;
  winner: boolean;
}

export interface FightResult {
  id: string;
  fighter1: FighterInfo;
  fighter2: FighterInfo;
  weightClass: string;
  rounds: number;
  method: string;
  headline: string;
}

export interface FightCard {
  id: string;
  eventName: string;
  venue: string;
  broadcasts: string[];
  startTime: string;
  startTimeUTC: string;
  fights: FightResult[];
}

export interface UfcRecaps {
  sport: "UFC";
  date: string;
  status: "events_completed" | "no_events" | "fetch_error";
  cards: FightCard[];
  error?: string;
}

export interface UfcSchedule {
  sport: "UFC";
  date: string;
  cards: FightCard[];
  error?: string;
}
