/**
 * F1/Racing types — drivers, sessions, race weekends.
 */

export interface DriverResult {
  position: number;
  name: string;
  team: string;
  flag: string;
  winner: boolean;
}

export interface SessionResult {
  type: string;
  status: string;
  drivers: DriverResult[];
  headline: string;
}

export interface RaceWeekend {
  id: string;
  eventName: string;
  circuit: string;
  city: string;
  date: string;
  sessions: SessionResult[];
}

export interface F1Recaps {
  sport: "F1";
  date: string;
  status: "race_completed" | "no_race" | "canceled" | "fetch_error";
  weekends: RaceWeekend[];
  error?: string;
}

export interface F1Schedule {
  sport: "F1";
  date: string;
  weekends: RaceWeekend[];
  error?: string;
}
