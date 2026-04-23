/**
 * Podcast types — episodes from RSS feeds.
 */

export interface PodcastEntry {
  id: string;
  show: string;
  title: string;
  duration: string;
  date: string;
  snippet: string;
  episode_url: string | null;
  deep_dive_eligible: boolean;
  image_url?: string;
  audio_url?: string;
  youtube_url?: string;
  transcript_url?: string;
}
