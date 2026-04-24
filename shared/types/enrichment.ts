/**
 * Game enrichment types — data from ESPN summary endpoint.
 * Collected once at digest time, reused in Scores tab and Live tab context.
 */

// --- Team stats (game-level) ---

export interface TeamStatLine {
  name: string;           // "fieldGoalPct"
  label: string;          // "Field Goal %"
  abbreviation: string;   // "FG%"
  displayValue: string;   // "45.2"
}

export interface TeamStatsBlock {
  team: string;
  abbreviation: string;
  stats: TeamStatLine[];
}

// --- Player stats (box score) ---

export interface PlayerStatLine {
  name: string;
  headshot?: string;
  position?: string;
  jersey?: string;
  starter: boolean;
  stats: string[];        // values matching labels order
}

export interface TeamPlayerStats {
  team: string;
  abbreviation: string;
  labels: string[];       // ["MIN", "PTS", "REB", "AST", ...]
  players: PlayerStatLine[];
}

// --- Season leaders ---

export interface SeasonLeader {
  category: string;       // "Points Per Game"
  shortName: string;      // "PPG"
  athlete: string;        // "J. Tatum"
  headshot?: string;
  displayValue: string;   // "28.5"
}

export interface TeamSeasonLeaders {
  team: string;
  abbreviation: string;
  leaders: SeasonLeader[];
}

// --- Season series / matchup history ---

export interface SeriesGame {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  winner: string;
}

export interface SeasonSeries {
  title: string;          // "Regular Season Series"
  summary: string;        // "Series tied 2-2"
  games: SeriesGame[];
}

// --- Last 5 games (recent form) ---

export interface RecentGame {
  opponent: string;
  score: string;          // "105-94"
  result: string;         // "W" or "L"
}

export interface TeamRecentForm {
  team: string;
  abbreviation: string;
  games: RecentGame[];
}

// --- Injuries ---

export interface InjuredPlayer {
  name: string;
  headshot?: string;
  position?: string;
  jersey?: string;
  status: string;         // "Out", "Day-To-Day", "Questionable"
  injuryType: string;     // "Knee", "Abdomen"
  detail?: string;        // "Surgery", "Soreness"
  returnDate?: string;
}

export interface TeamInjuries {
  team: string;
  abbreviation: string;
  injuries: InjuredPlayer[];
}

// --- Article recap ---

export interface GameArticle {
  headline: string;
  description: string;
}

// --- Full enrichment container ---

export interface GameEnrichment {
  /** ISO timestamp of when summary data was fetched */
  enriched_at: string;
  /** Data source attribution */
  source: "ESPN";

  teamStats: TeamStatsBlock[];
  playerStats: TeamPlayerStats[];
  seasonLeaders: TeamSeasonLeaders[];
  seasonSeries: SeasonSeries[];
  lastFiveGames: TeamRecentForm[];
  injuries: TeamInjuries[];
  article: GameArticle | null;
  venueImage: string | null;
}
