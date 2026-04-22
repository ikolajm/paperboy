import type { StoryId } from "./common";

export interface Podcast {
  id: StoryId;
  show: string;
  title: string;
  duration: string;
  date: string;
  snippet: string;
  episode_url: string | null;
  youtube_url?: string | null;
  deep_dive_eligible?: boolean;
}
