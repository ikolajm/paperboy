/**
 * Entertainment types — movies and streaming from TMDB.
 */

export interface MovieEntry {
  id: string;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  genres?: string[];
  deep_dive_eligible: boolean;
}

export interface StreamingEntry {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  poster_url?: string;
  genres?: string[];
  first_air_date?: string;
  deep_dive_eligible: boolean;
}

export interface EntertainmentSection {
  movies: MovieEntry[];
  streaming: StreamingEntry[];
}
