import type { StoryId, DateString } from "./common";

/** Base story shape shared across popular_today, for_you, on_your_radar, local */
export interface Story {
  id: StoryId;
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
  trending?: boolean;
  deep_dive_eligible?: boolean;
  google_news_redirect?: boolean;
}

/** A tracked topic with its stories — used in for_you (active) and on_your_radar (passive) */
export interface TopicGroup {
  topic: string;
  category: string;
  mode: "active" | "passive";
  stories: Story[];
  calendar_event: CalendarEvent | null;
  cross_refs: CrossRef[];
  quiet?: boolean;
}

export interface CalendarEvent {
  label: string;
  date: DateString;
  days_away: number;
}

export interface CrossRef {
  show: string;
  episode_title: string;
  published: DateString;
}

/** popular_today is grouped into sub-feeds */
export interface PopularToday {
  top_stories: Story[];
  world: Story[];
  nation: Story[];
}

/** Location-grouped local news */
export interface LocalSection {
  locations: LocalLocation[];
}

export interface LocalLocation {
  label: string;
  stories: Story[];
}

/** Opinion/editorial piece — source is author name */
export interface Opinion {
  id: StoryId;
  title: string;
  url: string;
  snippet: string;
  source: string;
}
