/**
 * Entertainment types — movies and streaming from TMDB.
 */

export interface WatchProvider {
  provider_name: string;
  logo_url: string;
}

export interface MovieEntry {
  id: string;
  tmdb_id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  backdrop_url?: string;
  genres?: string[];
  watch_providers?: WatchProvider[];
  deep_dive_eligible: boolean;
}

export interface StreamingEntry {
  id: string;
  tmdb_id: number;
  title: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  backdrop_url?: string;
  genres?: string[];
  first_air_date?: string;
  watch_providers?: WatchProvider[];
  deep_dive_eligible: boolean;
}

export interface UpcomingEntry {
  id: string;
  tmdb_id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  backdrop_url?: string;
  genres?: string[];
  media_type: 'movie' | 'tv';
  deep_dive_eligible: boolean;
}

export interface EntertainmentSection {
  movies: MovieEntry[];
  streaming: StreamingEntry[];
  upcoming: UpcomingEntry[];
}
