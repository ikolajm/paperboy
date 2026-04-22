import type { DateString, Timestamp } from "./common";

export interface Team {
  displayName: string;
  abbreviation: string;
  logo: string;
  records: TeamRecords;
}

export interface TeamRecords {
  total: string;
  home: string;
  road: string;
}

export interface GameLeader {
  category: string;
  shortName: string;
  athlete: string;
  displayValue: string;
}

export interface Game {
  id: string;
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
  status: string;
  headline: string;
  notes: string[];
  venue: string;
  leaders: GameLeader[];
  linescores: {
    home: number[];
    away: number[];
  };
}

export interface TeamSportRecap {
  sport: string;
  date: DateString;
  status: "games_played" | "playoffs" | "no_games" | "out_of_season";
  seasonType?: number;
  games: Game[];
}

export interface ScheduledGame {
  id: string;
  home: Team;
  away: Team;
  startTime: string;
  startTimeUTC: Timestamp;
  broadcast: string[];
  odds?: GameOdds;
  watch_priority?: boolean;
  venue: string;
}

export interface GameOdds {
  spread: string;
  over_under: string;
  moneyline?: string;
}

export interface TeamSports {
  recaps: TeamSportRecap[];
  schedule: ScheduledGame[];
}
