/**
 * Assemble entertainment section from TMDB results.
 * Splits into movies (now_playing, trending, upcoming) and streaming (trending_tv, on_the_air).
 */

import type { PaperboyConfig } from "../../shared/types/config.js";
import type { MovieEntry, StreamingEntry, EntertainmentSection } from "../../shared/types/digest.js";
import type { TmdbEntry, TmdbResult } from "../fetch-tmdb.js";
import { IdCounter } from "./ids.js";

export function assembleEntertainment(
  tmdbResult: TmdbResult,
  config: PaperboyConfig,
  ids: IdCounter,
): EntertainmentSection {
  const maxMovies = config.entertainment.tmdb.max_movies;
  const maxStreaming = config.entertainment.tmdb.max_streaming;

  const movieEndpoints = ["now_playing", "trending_movies", "upcoming"];
  const streamingEndpoints = ["trending_tv", "on_the_air"];

  const movies: MovieEntry[] = [];
  const streaming: StreamingEntry[] = [];

  for (const ep of movieEndpoints) {
    const entries = tmdbResult[ep];
    if (!Array.isArray(entries)) continue;
    for (const e of entries as TmdbEntry[]) {
      if (movies.length >= maxMovies) break;
      movies.push({
        id: ids.next("ENT"),
        title: e.title,
        overview: e.overview,
        release_date: e.release_date || "",
        vote_average: e.vote_average,
        deep_dive_eligible: true,
      });
    }
  }

  for (const ep of streamingEndpoints) {
    const entries = tmdbResult[ep];
    if (!Array.isArray(entries)) continue;
    for (const e of entries as TmdbEntry[]) {
      if (streaming.length >= maxStreaming) break;
      streaming.push({
        id: ids.next("ENT"),
        title: e.title,
        overview: e.overview,
        vote_average: e.vote_average,
        first_air_date: e.first_air_date,
        deep_dive_eligible: true,
      });
    }
  }

  return { movies, streaming };
}
