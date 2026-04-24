/**
 * Assemble entertainment section from TMDB results.
 * Splits into active (movies/streaming) and upcoming based on release dates.
 * Items with future release dates are routed to upcoming regardless of source endpoint.
 */

import type { PaperboyConfig } from "../../shared/types/config.js";
import type {
  MovieEntry, StreamingEntry, UpcomingEntry, EntertainmentSection,
} from "../../shared/types/digest.js";
import type { TmdbEntry, TmdbResult } from "../fetch-tmdb.js";
import { TMDB_GENRES } from "../../shared/types/sources/tmdb.js";
import { IdCounter } from "./ids.js";

function mapGenres(genreIds?: number[]): string[] | undefined {
  if (!genreIds || genreIds.length === 0) return undefined;
  const names = genreIds.map(id => TMDB_GENRES[id]).filter(Boolean);
  return names.length > 0 ? names : undefined;
}

function isFutureDate(dateStr: string | undefined, cutoffDays: number): boolean {
  if (!dateStr) return false;
  const release = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + cutoffDays);
  return release > now && release <= cutoff;
}

function isPastOrCurrent(dateStr: string | undefined): boolean {
  if (!dateStr) return true; // no date = assume released
  return new Date(dateStr + "T00:00:00") <= new Date();
}

export function assembleEntertainment(
  tmdbResult: TmdbResult,
  config: PaperboyConfig,
  ids: IdCounter,
): EntertainmentSection {
  const tmdb = config.entertainment.tmdb;
  const cutoffDays = tmdb.upcoming_cutoff_days;

  const movies: MovieEntry[] = [];
  const streaming: StreamingEntry[] = [];
  const upcoming: UpcomingEntry[] = [];
  const seenTitles = new Set<string>();

  function seen(title: string): boolean {
    const key = title.toLowerCase();
    if (seenTitles.has(key)) return true;
    seenTitles.add(key);
    return false;
  }

  // --- Process movie endpoints ---
  for (const ep of tmdb.movie_endpoints) {
    const entries = tmdbResult[ep];
    if (!Array.isArray(entries)) continue;
    for (const e of entries as TmdbEntry[]) {
      if (seen(e.title)) continue;

      if (isFutureDate(e.release_date, cutoffDays) && upcoming.length < tmdb.max_upcoming) {
        upcoming.push(toUpcoming(e, ids, "movie"));
      } else if (isPastOrCurrent(e.release_date) && movies.length < tmdb.max_movies) {
        movies.push(toMovie(e, ids));
      }
    }
  }

  // --- Process streaming endpoints ---
  for (const ep of tmdb.streaming_endpoints) {
    const entries = tmdbResult[ep];
    if (!Array.isArray(entries)) continue;
    for (const e of entries as TmdbEntry[]) {
      if (seen(e.title)) continue;

      if (isFutureDate(e.first_air_date, cutoffDays) && upcoming.length < tmdb.max_upcoming) {
        upcoming.push(toUpcoming(e, ids, "tv"));
      } else if (isPastOrCurrent(e.first_air_date) && streaming.length < tmdb.max_streaming) {
        streaming.push(toStreaming(e, ids));
      }
    }
  }

  // --- Process dedicated upcoming endpoints ---
  for (const ep of tmdb.upcoming_endpoints) {
    const entries = tmdbResult[ep];
    if (!Array.isArray(entries)) continue;
    for (const e of entries as TmdbEntry[]) {
      if (upcoming.length >= tmdb.max_upcoming) break;
      if (seen(e.title)) continue;

      const releaseDate = e.release_date || e.first_air_date;
      if (!isFutureDate(releaseDate, cutoffDays)) continue;

      const mediaType = e.release_date ? "movie" : "tv";
      upcoming.push(toUpcoming(e, ids, mediaType));
    }
  }

  return { movies, streaming, upcoming };
}

// --- Converters ---

function toMovie(e: TmdbEntry, ids: IdCounter): MovieEntry {
  const movie: MovieEntry = {
    id: ids.next("ENT"),
    tmdb_id: e.tmdb_id,
    title: e.title,
    overview: e.overview,
    release_date: e.release_date || "",
    vote_average: e.vote_average,
    deep_dive_eligible: true,
  };
  if (e.vote_count) movie.vote_count = e.vote_count;
  if (e.poster_url) movie.poster_url = e.poster_url;
  if (e.backdrop_url) movie.backdrop_url = e.backdrop_url;
  if (e.watch_providers && e.watch_providers.length > 0) {
    movie.watch_providers = e.watch_providers;
  }
  const genres = mapGenres(e.genre_ids);
  if (genres) movie.genres = genres;
  return movie;
}

function toStreaming(e: TmdbEntry, ids: IdCounter): StreamingEntry {
  const show: StreamingEntry = {
    id: ids.next("ENT"),
    tmdb_id: e.tmdb_id,
    title: e.title,
    overview: e.overview,
    vote_average: e.vote_average,
    first_air_date: e.first_air_date,
    deep_dive_eligible: true,
  };
  if (e.vote_count) show.vote_count = e.vote_count;
  if (e.poster_url) show.poster_url = e.poster_url;
  if (e.backdrop_url) show.backdrop_url = e.backdrop_url;
  if (e.watch_providers && e.watch_providers.length > 0) {
    show.watch_providers = e.watch_providers;
  }
  const genres = mapGenres(e.genre_ids);
  if (genres) show.genres = genres;
  return show;
}

function toUpcoming(e: TmdbEntry, ids: IdCounter, mediaType: "movie" | "tv"): UpcomingEntry {
  const entry: UpcomingEntry = {
    id: ids.next("ENT"),
    tmdb_id: e.tmdb_id,
    title: e.title,
    overview: e.overview,
    release_date: e.release_date || e.first_air_date || "",
    vote_average: e.vote_average,
    media_type: mediaType,
    deep_dive_eligible: true,
  };
  if (e.vote_count) entry.vote_count = e.vote_count;
  if (e.poster_url) entry.poster_url = e.poster_url;
  if (e.backdrop_url) entry.backdrop_url = e.backdrop_url;
  const genres = mapGenres(e.genre_ids);
  if (genres) entry.genres = genres;
  return entry;
}
