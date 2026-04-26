/**
 * UFC/MMA types — fighters, fights, event cards.
 */

export interface FighterInfo {
  name: string;
  record: string;
  winner: boolean;
  flagUrl?: string;
  headshot?: string;
  height?: string;
  weight?: string;
  reach?: string;
}

export interface FightStats {
  knockdowns: number;
  totalStrikesLanded: number;
  totalStrikesAttempted: number;
  sigStrikesLanded: number;
  sigStrikesAttempted: number;
  takedownsLanded: number;
  takedownsAttempted: number;
  submissionAttempts: number;
  controlTime: string;         // "2:45"
  /** Significant strikes by target */
  headStrikes: number;
  bodyStrikes: number;
  legStrikes: number;
}

export interface FightResult {
  id: string;
  fighter1: FighterInfo;
  fighter2: FighterInfo;
  weightClass: string;
  rounds: number;
  method: string;               // "KO/TKO", "Submission", "Decision", "Final"
  methodDetail?: string;        // "Punch", "Rear Naked Choke", etc.
  endRound?: number;            // Round the fight ended
  endTime?: string;             // Time in the round (e.g. "2:30")
  cardSegment?: string;         // "Main Card", "Prelims"
  headline: string;
  /** Per-fighter stats — only populated for completed fights */
  fighter1Stats?: FightStats;
  fighter2Stats?: FightStats;
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
