/**
 * Team sports score types — shared across NBA, NHL, MLB, NFL, College.
 */

import type { GameEnrichment } from "./enrichment.js";

export interface TeamInfo {
  displayName: string;
  abbreviation: string;
  logo: string;
  color?: string;
  alternateColor?: string;
  records: Record<string, string>;
  seed?: number;
  gamesBehind?: string;
  streak?: string;
  clinch?: string;
}

export interface GameLeader {
  category: string;
  shortName: string;
  athlete: string;
  athleteId?: string;
  jersey?: string;
  position?: string;
  displayValue: string;
}

export interface FeaturedPitcher {
  role: "win" | "loss" | "save";
  name: string;
  athleteId?: string;
  jersey?: string;
  record?: string;
  era?: string;
  stats?: Record<string, string>;
}

export interface CompletedGame {
  id: string;
  home: TeamInfo;
  away: TeamInfo;
  homeScore: number;
  awayScore: number;
  status: string;
  headline: string;
  notes: string[];
  venue: string;
  broadcasts: string[];
  leaders: GameLeader[];
  linescores: { home: number[]; away: number[] };
  /** MLB only: hits and errors per team */
  hitsErrors?: { home: { hits: number; errors: number }; away: { hits: number; errors: number } };
  /** MLB only: winning, losing, saving pitchers */
  pitchers?: FeaturedPitcher[];
  enrichment?: GameEnrichment;
}

export interface ScheduledGame {
  id: string;
  home: TeamInfo;
  away: TeamInfo;
  startTime: string;
  startTimeUTC: string;
  broadcasts: string[];
  notes: string[];
  venue: string;
  enrichment?: GameEnrichment;
}

export interface SportRecaps {
  sport: string;
  date: string;
  status: "games_played" | "no_games" | "playoffs" | "fetch_error";
  seasonType: number;
  games: CompletedGame[];
  error?: string;
}

export interface SportSchedule {
  sport: string;
  date: string;
  games: ScheduledGame[];
  error?: string;
}
