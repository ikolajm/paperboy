/**
 * Canonical types for the Paperboy digest pipeline.
 * Used by both scripts/ and frontend/.
 */

// --- Core story types ---

export interface Story {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  date: string;
  deep_dive_eligible: boolean;
  google_news_redirect?: boolean;
  stale?: boolean;
}

export interface CalendarEvent {
  label: string;
  date: string;
  days_away: number;
}

export interface CrossRef {
  show: string;
  episode_title: string;
  published: string;
}

// --- Topic sections ---

export interface TopicSection {
  topic: string;
  category: string;
  mode: "active" | "passive";
  stories: Story[];
  calendar_event: CalendarEvent | null;
  cross_refs: CrossRef[];
  quiet?: boolean;
}

// --- Scores (from per-sport modules) ---

export interface TeamInfo {
  displayName: string;
  abbreviation: string;
  logo: string;
  records: Record<string, string>;
}

export interface GameLeader {
  category: string;
  shortName: string;
  athlete: string;
  displayValue: string;
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
  leaders: GameLeader[];
  linescores: { home: number[]; away: number[] };
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

// --- UFC/MMA ---

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

// --- F1/Racing ---

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

// --- Entertainment ---

export interface MovieEntry {
  id: string;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  deep_dive_eligible: boolean;
}

export interface StreamingEntry {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  first_air_date?: string;
  deep_dive_eligible: boolean;
}

export interface EntertainmentSection {
  movies: MovieEntry[];
  streaming: StreamingEntry[];
}

// --- Podcasts ---

export interface PodcastEntry {
  id: string;
  show: string;
  title: string;
  duration: string;
  date: string;
  snippet: string;
  episode_url: string | null;
  deep_dive_eligible: boolean;
}

// --- Popular Today ---

export interface PopularStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  deep_dive_eligible: boolean;
  google_news_redirect?: boolean;
}

export interface PopularTodaySection {
  top_stories: PopularStory[];
  world: PopularStory[];
  nation: PopularStory[];
}

// --- Local ---

export interface LocalStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  google_news_redirect?: boolean;
}

export interface LocalLocation {
  label: string;
  stories: LocalStory[];
}

export interface LocalSection {
  locations: LocalLocation[];
}

// --- Opinions ---

export interface OpinionEntry {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
}

// --- Deep Dives ---

export interface DeepDiveRef {
  id: string;
  file: string;
  title: string;
}

// --- Top-level digest ---

export interface DigestMeta {
  date: string;
  day_of_week: string;
  story_count: number;
  run_mode: "initial";
  last_run: string;
}

export interface ScoresSection {
  /** Team sports (NBA, NHL, MLB, NFL, College) */
  team_sports: {
    recaps: SportRecaps[];
    schedule: SportSchedule[];
  };
  /** UFC/MMA fight cards */
  ufc: {
    recaps: UfcRecaps;
    schedule: UfcSchedule;
  };
  /** F1 race weekends */
  f1: {
    recaps: F1Recaps;
    schedule: F1Schedule;
  };
}

export interface DigestSections {
  popular_today: PopularTodaySection;
  local: LocalSection;
  for_you: TopicSection[];
  on_your_radar: TopicSection[];
  scores: ScoresSection;
  entertainment: EntertainmentSection;
  podcasts: PodcastEntry[];
  opinions: OpinionEntry[];
}

export interface Digest {
  meta: DigestMeta;
  sections: DigestSections;
  deep_dives: DeepDiveRef[];
}

// --- Script-internal types ---

export interface RssEntry {
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
  duration?: string;
  google_news_redirect?: boolean;
}

export interface RssBatchItem {
  label: string;
  url: string;
  max: number;
}

export type RssBatchResult = Record<string, RssEntry[] | { status: "fetch_error"; error: string }>;
