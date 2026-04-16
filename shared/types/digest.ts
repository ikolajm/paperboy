/**
 * Canonical types for the Paperboy digest pipeline.
 * These match the digest.json schema defined in context/WRITE.md.
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
  trending: boolean;
  deep_dive_eligible: boolean;
  url_resolved?: boolean;
  stale?: boolean;
  low_yield?: boolean;
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

// --- Section types ---

export interface TopicSection {
  topic: string;
  category: string;
  mode: "active" | "passive";
  stories: Story[];
  calendar_event: CalendarEvent | null;
  cross_refs: CrossRef[];
  quiet?: boolean;
}

export interface GameScore {
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  notable: string | null;
  followed?: boolean;
}

export interface SportScores {
  name: string;
  status: "games_played" | "no_games" | "out_of_season" | "playoffs";
  games: GameScore[];
}

export interface ScoresSection {
  date: string;
  sports: SportScores[];
}

export interface GameOdds {
  spread: string;
  over_under: number | string;
  home_ml?: number;
  away_ml?: number;
}

export interface UpcomingGame {
  home_team?: string;
  away_team?: string;
  event_name?: string;
  is_mma?: boolean;
  start_time: string;
  broadcast: string[];
  odds: GameOdds | null;
  watch_priority: boolean;
}

export interface SportUpcoming {
  name: string;
  date: string;
  games: UpcomingGame[];
}

export interface UpcomingSection {
  date: string;
  sports: SportUpcoming[];
}

export interface MovieEntry {
  id: string;
  title: string;
  snippet: string;
  release_date: string;
  vote_average: number;
  deep_dive_eligible: boolean;
}

export interface StreamingEntry {
  id: string;
  title: string;
  snippet: string;
  vote_average: number;
  deep_dive_eligible: boolean;
}

export interface EntertainmentSection {
  movies: MovieEntry[];
  streaming: StreamingEntry[];
}

export interface PodcastEntry {
  id: string;
  show: string;
  title: string;
  duration: string;
  date: string;
  snippet: string;
  episode_url: string | null;
  youtube_url: string | null;
  deep_dive_eligible: boolean;
}

export interface PopularStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  deep_dive_eligible: boolean;
}

export interface LocalStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
}

export interface LocalLocation {
  label: string;
  stories: LocalStory[];
}

export interface LocalSection {
  locations: LocalLocation[];
}

export interface OpinionEntry {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
}

export interface PopularTodaySection {
  top_stories: PopularStory[];
  world: PopularStory[];
  nation: PopularStory[];
}

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
  run_mode: "initial" | "refresh" | "full_rerun";
  last_run: string;
}

export interface DigestSections {
  for_you: TopicSection[];
  on_your_radar: TopicSection[];
  scores: ScoresSection | null;
  upcoming: UpcomingSection | null;
  entertainment: EntertainmentSection;
  podcasts: PodcastEntry[];
  opinions: OpinionEntry[];
  popular_today: PopularTodaySection;
  local: LocalSection;
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
