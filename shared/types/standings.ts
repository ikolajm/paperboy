/**
 * Standings types — conference/division standings per sport.
 * Fetched once at digest time from ESPN standings endpoint.
 */

export interface StandingsTeam {
  displayName: string;
  abbreviation: string;
  logo: string;
  seed: number;
  wins: number;
  losses: number;
  otLosses?: number;       // NHL only
  gamesBehind: string;     // "-" for leader, "4" for 4 games back
  streak: string;          // "W3", "L1"
  clinch: string;          // "z"=conf #1, "y"=playoff, "xp"=play-in, etc.
  pointsFor?: number;
  pointsAgainst?: number;
  differential: string;    // "+8.2", "-1.7"
}

export interface StandingsGroup {
  name: string;            // "Eastern Conference", "American League"
  teams: StandingsTeam[];
}

export interface SportStandings {
  sport: string;
  groups: StandingsGroup[];
  fetched_at: string;      // ISO timestamp
}
