import type { DateString, Timestamp } from "./common";

export interface Fighter {
  name: string;
  record: string;
  winner: boolean;
}

export interface Fight {
  id: string;
  fighter1: Fighter;
  fighter2: Fighter;
  weightClass: string;
  rounds: number;
  method: string;
  headline: string;
}

export interface UFCCard {
  id: string;
  eventName: string;
  venue: string;
  broadcasts: string[];
  startTime: string;
  startTimeUTC: Timestamp;
  fights: Fight[];
}

export interface UFCRecaps {
  sport: "UFC";
  date: DateString;
  status: "events_completed" | "no_events";
  cards: UFCCard[];
}

export interface UFCSchedule {
  sport: "UFC";
  date: DateString;
  cards: UFCCard[];
}

export interface UFCSection {
  recaps: UFCRecaps;
  schedule: UFCSchedule;
}
