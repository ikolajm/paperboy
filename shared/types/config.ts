/**
 * Typed interface for config/config.json (v3).
 *
 * Key changes from v2:
 * - Scores separated from topics (own section with per-sport toggles)
 * - popular_today replaces popular_now (subsections: top_stories, world, nation)
 * - in_the_noise dropped entirely (Google Trends removed)
 * - news_url dropped (ESPN RSS used instead)
 * - exclude_patterns dropped (TMDB-only, no filtering needed)
 */

// --- Topics (news feeds only) ---

export interface TopicConfig {
  category: string;
  mode: "active" | "passive";
  rss: string[];
}

// --- Scores (ESPN scoreboard endpoints + display toggles) ---

export interface ScoreConfig {
  /** ESPN scoreboard API URL */
  url: string;
  /** Show yesterday's results */
  recaps: boolean;
  /** Show today's upcoming games */
  schedule: boolean;
  /** Show betting odds for upcoming games */
  odds: boolean;
}

// --- Podcasts ---

export interface PodcastShow {
  rss: string;
  release_schedule?: "daily" | "weekdays" | "weekly_monday" | "mon_wed_fri" | "mon_thu";
  /** Agent-only: used for YouTube URL resolution in deep dives */
  youtube_channel?: string;
  /** Agent-only: used for transcript fetching in deep dives */
  transcript_page?: string;
}

// --- Popular Today (replaces Popular Now + In the Noise) ---

export interface PopularFeed {
  /** Display label for the subsection (e.g. "Top Stories", "World", "Nation"). */
  label: string;
  rss: string;
  max: number;
}

export interface PopularTodayConfig {
  /** Editorial feeds for the Headlines tier. Add or remove entries to flex the sections. */
  feeds: PopularFeed[];
}

// --- Entertainment ---

export type TmdbEndpoints = Record<string, string>;

// --- Local News ---

export interface LocalNewsLocation {
  label: string;
  rss: string;
}

// --- Top-level config ---

export interface PaperboyConfig {
  version: number;

  /**
   * IANA timezone used for the digest's `day_of_week` field.
   * Defaults to "America/New_York" if absent.
   * NOTE: sport-specific `startTime` formatting in scripts/scores/shared.ts
   * is currently hardcoded to ET — threading this through every sport
   * parser is a future refactor.
   */
  display_timezone?: string;

  topics: Record<string, TopicConfig>;

  scores: Record<string, ScoreConfig>;

  podcasts: {
    shows: Record<string, PodcastShow>;
  };

  opinions: {
    _note?: string;
    feeds: string[];
    max_stories: number;
  };

  popular_today: PopularTodayConfig;

  local_news: {
    max_stories_per_location: number;
    locations: LocalNewsLocation[];
  };

  entertainment: {
    tmdb: {
      base_url: string;
      endpoints: TmdbEndpoints;
      movie_endpoints: string[];
      streaming_endpoints: string[];
      upcoming_endpoints: string[];
      max_movies: number;
      max_streaming: number;
      max_upcoming: number;
      upcoming_cutoff_days: number;
      enrich_watch_providers?: boolean;
    };
  };
}

// --- Credentials (separate file, gitignored) ---

export interface TmdbCredentials {
  api_key: string;
}

export interface Credentials {
  _note?: string;
  tmdb: TmdbCredentials;
}
