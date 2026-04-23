/**
 * Editorial content types — stories, topics, popular, local, opinions.
 */

// --- Related coverage (Google News) ---

export interface RelatedArticle {
  headline: string;
  url: string;
  outlet: string;
}

// --- Core story types ---

export interface Story {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  source_url?: string;
  author?: string;
  date: string;
  deep_dive_eligible: boolean;
  google_news_redirect?: boolean;
  related_articles?: RelatedArticle[];
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

// --- Popular Today ---

export interface PopularStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  source_url?: string;
  date?: string;
  deep_dive_eligible: boolean;
  google_news_redirect?: boolean;
  related_articles?: RelatedArticle[];
}

/** Consolidated, deduped list of top stories from all Google News editorial feeds. */
export type PopularTodaySection = PopularStory[];

// --- Local ---

export interface LocalStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  source_url?: string;
  date?: string;
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
  source_url?: string;
  date?: string;
}
