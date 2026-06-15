/**
 * Entertainment (ENT) deep-dive gather: TMDB title detail + OMDb critic scores.
 *
 * Unlike news/podcasts there's no URL to scrape — ENT entries carry a `tmdb_id`, so
 * the gather is a structured API call that basically never fails. One TMDB request
 * (append_to_response) yields cast/crew, where-to-watch, trailer, keywords,
 * recommendations, certification, and the IMDb id; one optional OMDb request keyed by
 * that IMDb id adds the cross-platform critic scores (RT / Metacritic / IMDb) that
 * TMDB's own `vote_average` can't give.
 *
 * Fail-soft: the OMDb half is skipped silently when no key is configured or the title
 * isn't found, and sparse/absent TMDB reviews are normal. The synthesis prompt is told
 * what's missing so it never fabricates.
 */

import { loadCredentials } from "@/lib/deep-dive/credentials";

const TMDB_BASE = "https://api.themoviedb.org/3";
const OMDB_BASE = "https://www.omdbapi.com/";
const TIMEOUT_MS = 15000;
/** Cap reviews + truncate each — TMDB user reviews run long and vary wildly in quality. */
const MAX_REVIEWS = 3;
const MAX_REVIEW_CHARS = 1200;
const MAX_CAST = 6;
const MAX_KEYWORDS = 8;
const MAX_RECOMMENDATIONS = 6;

/** Log prefix — makes silent degradation of the two external APIs greppable. */
const LOG = "[deep-dive/tmdb]";

export type EntKind = "movie" | "tv";

export interface OmdbRatings {
  imdb: string | null; // "7.1/10"
  rottenTomatoes: string | null; // "82%"
  metacritic: string | null; // "74/100"
  rated: string | null; // "PG-13"
  awards: string | null;
  boxOffice: string | null;
}

export interface EntReview {
  author: string;
  content: string;
}

export interface EntDetail {
  kind: EntKind;
  title: string;
  tagline: string | null;
  overview: string;
  releaseDate: string | null;
  runtime: string | null; // "2h 8m" / "52m"
  genres: string[];
  director: string | null;
  cast: string[];
  certification: string | null; // US rating from TMDB
  tmdbScore: number | null;
  tmdbVotes: number | null;
  trailerUrl: string | null;
  keywords: string[];
  recommendations: string[];
  reviews: EntReview[]; // TMDB user reviews (may be empty)
  imdbId: string | null;
  // TV-only
  seasons: number | null;
  episodes: number | null;
  networks: string[];
  status: string | null; // "Returning Series" / "Ended"
  omdb: OmdbRatings | null;
}

/**
 * Fetch JSON with a timeout. Fails soft (returns null) but never *silently* — logs at
 * the seam so a TMDB/OMDb outage or a changed response shape is greppable, not invisible
 * (the lesson the article-fetch resolver already learned).
 */
async function timedJson<T>(url: string, label: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.warn(`${LOG} ${label} HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`${LOG} ${label} fetch error: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function minutesToLabel(min: number | undefined | null): string | null {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

// --- TMDB response shapes (only the fields we read) ---

interface TmdbCrew { job: string; name: string }
interface TmdbCastMember { name: string; order?: number }
interface TmdbVideo { type: string; site: string; key: string }
interface TmdbNamed { name?: string; title?: string }
interface TmdbReview { author: string; content: string }
interface TmdbReleaseDate { certification?: string }
interface TmdbReleaseResult { iso_3166_1: string; release_dates?: TmdbReleaseDate[] }
interface TmdbContentRating { iso_3166_1: string; rating?: string }

interface TmdbDetailResponse {
  title?: string;
  name?: string;
  tagline?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres?: { name: string }[];
  vote_average?: number;
  vote_count?: number;
  imdb_id?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  networks?: { name: string }[];
  status?: string;
  created_by?: { name: string }[];
  credits?: { cast?: TmdbCastMember[]; crew?: TmdbCrew[] };
  aggregate_credits?: { cast?: TmdbCastMember[] };
  videos?: { results?: TmdbVideo[] };
  keywords?: { keywords?: TmdbNamed[]; results?: TmdbNamed[] };
  recommendations?: { results?: TmdbNamed[] };
  reviews?: { results?: TmdbReview[] };
  release_dates?: { results?: TmdbReleaseResult[] };
  content_ratings?: { results?: TmdbContentRating[] };
  external_ids?: { imdb_id?: string };
}

function pickTrailer(videos?: TmdbVideo[]): string | null {
  if (!videos?.length) return null;
  const yt = videos.filter((v) => v.site === "YouTube");
  const trailer = yt.find((v) => v.type === "Trailer") ?? yt.find((v) => v.type === "Teaser") ?? yt[0];
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

function pickCertification(data: TmdbDetailResponse, kind: EntKind): string | null {
  if (kind === "movie") {
    const us = data.release_dates?.results?.find((r) => r.iso_3166_1 === "US");
    const cert = us?.release_dates?.map((d) => d.certification).find((c) => c && c.trim());
    return cert ?? null;
  }
  const us = data.content_ratings?.results?.find((r) => r.iso_3166_1 === "US");
  return us?.rating?.trim() || null;
}

function names(items: TmdbNamed[] | undefined, limit: number): string[] {
  return (items ?? []).map((i) => i.title ?? i.name ?? "").filter(Boolean).slice(0, limit);
}

/** Parse OMDb's response into our flat ratings shape. Returns null when not found. */
function parseOmdb(data: OmdbResponse | null): OmdbRatings | null {
  if (!data || data.Response !== "True") return null;
  // Substring/case-insensitive match — don't hard-depend on OMDb's exact Source labels
  // ("Rotten Tomatoes", "Metacritic"); a label tweak shouldn't silently drop a score.
  const find = (needle: string) =>
    data.Ratings?.find((r) => r.Source?.toLowerCase().includes(needle))?.Value ?? null;
  const imdb = data.imdbRating && data.imdbRating !== "N/A"
    ? `${data.imdbRating}/10${data.imdbVotes && data.imdbVotes !== "N/A" ? ` (${data.imdbVotes} votes)` : ""}`
    : null;
  const metacritic = find("metacritic") ?? (data.Metascore && data.Metascore !== "N/A" ? `${data.Metascore}/100` : null);
  const clean = (v: string | undefined) => (v && v !== "N/A" ? v : null);
  return {
    imdb,
    rottenTomatoes: find("rotten tomatoes"),
    metacritic,
    rated: clean(data.Rated),
    awards: clean(data.Awards),
    boxOffice: clean(data.BoxOffice),
  };
}

interface OmdbResponse {
  Response: string;
  Ratings?: { Source: string; Value: string }[];
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Rated?: string;
  Awards?: string;
  BoxOffice?: string;
}

async function fetchOmdb(imdbId: string): Promise<OmdbRatings | null> {
  const key = loadCredentials().omdb?.api_key;
  if (!key) return null; // OMDb is an optional enrichment — no key, no critic scores.
  const url = `${OMDB_BASE}?i=${encodeURIComponent(imdbId)}&tomatoes=true&apikey=${encodeURIComponent(key)}`;
  const ratings = parseOmdb(await timedJson<OmdbResponse>(url, `OMDb ${imdbId}`));
  if (!ratings) {
    console.warn(`${LOG} OMDb ${imdbId}: no record / unparseable response`);
    return null;
  }
  // Make it observable *which* scores actually parsed — "OMDb responded" (omdb=yes) is
  // not the same as "RT/Metacritic landed". A label-match miss surfaces here, not silently.
  const parsed = [
    ratings.imdb && "imdb",
    ratings.rottenTomatoes && "rt",
    ratings.metacritic && "metacritic",
  ].filter(Boolean);
  console.info(`${LOG} OMDb ${imdbId}: parsed ${parsed.join("+") || "none"}`);
  return ratings;
}

/**
 * Fetch full ENT detail for a title. Returns null only when the TMDB detail call
 * itself fails (bad id / network) — every enrichment beyond it is fail-soft.
 */
export async function fetchEntDetail(kind: EntKind, tmdbId: number): Promise<EntDetail | null> {
  const key = loadCredentials().tmdb?.api_key;
  if (!key) return null;

  const append =
    kind === "movie"
      ? "credits,reviews,videos,keywords,recommendations,release_dates,external_ids"
      : "aggregate_credits,credits,reviews,videos,keywords,recommendations,content_ratings,external_ids";
  const url = `${TMDB_BASE}/${kind}/${tmdbId}?api_key=${encodeURIComponent(key)}&language=en-US&append_to_response=${append}`;

  const data = await timedJson<TmdbDetailResponse>(url, `${kind}/${tmdbId}`);
  if (!data) return null;

  const cast = (data.aggregate_credits?.cast ?? data.credits?.cast ?? [])
    .map((c) => c.name)
    .filter(Boolean)
    .slice(0, MAX_CAST);
  const director =
    kind === "movie"
      ? data.credits?.crew?.find((c) => c.job === "Director")?.name ?? null
      : data.created_by?.[0]?.name ?? null;
  const runtime = minutesToLabel(kind === "movie" ? data.runtime : data.episode_run_time?.[0]);
  const keywords = names(kind === "movie" ? data.keywords?.keywords : data.keywords?.results, MAX_KEYWORDS);
  const reviews = (data.reviews?.results ?? []).slice(0, MAX_REVIEWS).map((r) => ({
    author: r.author,
    content: r.content.length > MAX_REVIEW_CHARS ? `${r.content.slice(0, MAX_REVIEW_CHARS)}…` : r.content,
  }));
  const imdbId = data.imdb_id ?? data.external_ids?.imdb_id ?? null;

  return {
    kind,
    title: data.title ?? data.name ?? "(untitled)",
    tagline: data.tagline?.trim() || null,
    overview: data.overview ?? "",
    releaseDate: data.release_date ?? data.first_air_date ?? null,
    runtime,
    genres: (data.genres ?? []).map((g) => g.name),
    director,
    cast,
    certification: pickCertification(data, kind),
    tmdbScore: typeof data.vote_average === "number" ? data.vote_average : null,
    tmdbVotes: typeof data.vote_count === "number" ? data.vote_count : null,
    trailerUrl: pickTrailer(data.videos?.results),
    keywords,
    recommendations: names(data.recommendations?.results, MAX_RECOMMENDATIONS),
    reviews,
    imdbId,
    seasons: data.number_of_seasons ?? null,
    episodes: data.number_of_episodes ?? null,
    networks: (data.networks ?? []).map((n) => n.name),
    status: kind === "tv" ? data.status ?? null : null,
    omdb: imdbId ? await fetchOmdb(imdbId) : null,
  };
}
