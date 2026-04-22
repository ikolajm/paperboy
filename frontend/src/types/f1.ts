import type { DateString, Timestamp } from "./common";

export interface F1Driver {
  name?: string;
  position?: number;
  team?: string;
}

export interface F1Session {
  type: string;
  status: string;
  drivers: F1Driver[];
  headline: string;
}

export interface F1Weekend {
  id: string;
  eventName: string;
  circuit: string;
  city: string;
  date: Timestamp;
  sessions: F1Session[];
}

export interface F1Recaps {
  sport: "F1";
  date: DateString;
  status: "race_completed" | "no_race";
  weekends: F1Weekend[];
}

export interface F1Schedule {
  sport: "F1";
  date: DateString;
  weekends: F1Weekend[];
}

export interface F1Section {
  recaps: F1Recaps;
  schedule: F1Schedule;
}
