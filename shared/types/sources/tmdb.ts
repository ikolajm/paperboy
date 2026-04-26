/**
 * TMDB API — raw source schemas
 *
 * NOT used at runtime. Documents what the API returns.
 *
 * Used by: Entertainment section (movies + streaming/TV).
 * Base URL: https://api.themoviedb.org/3
 *
 * Image base URL: https://image.tmdb.org/t/p/{size}{path}
 * Poster sizes: w92, w154, w185, w342, w500, w780, original
 * Backdrop sizes: w300, w780, w1280, original
 *
 * Last audited: 2026-04-22
 */

// ---------------------------------------------------------------------------
// Movie list item
// ---------------------------------------------------------------------------

/**
 * TMDB movie — returned by /movie/now_playing, /movie/upcoming,
 * /trending/movie/week endpoints.
 */
export interface TmdbMovieResult {
  id: number;                     // TMDB movie ID
  title: string;                  // English title
  original_title: string;         // Original language title
  original_language: string;      // ISO 639-1, e.g. "en"
  overview: string;               // Synopsis, typically 200–400 chars
  release_date: string;           // "YYYY-MM-DD"
  vote_average: number;           // 0–10 scale (1 decimal)
  vote_count: number;             // Number of ratings
  popularity: number;             // TMDB popularity score (higher = more popular)

  // Images
  poster_path: string | null;     // e.g. "/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg"
                                  // Full URL: https://image.tmdb.org/t/p/w342/eJGWx...
  backdrop_path: string | null;   // Wider image for backgrounds/headers

  // Classification
  genre_ids: number[];            // Array of genre IDs (see GENRE_MAP below)
  adult: boolean;
  video: boolean;                 // Has associated video content
}

// ---------------------------------------------------------------------------
// TV show list item
// ---------------------------------------------------------------------------

/**
 * TMDB TV show — returned by /trending/tv/week, /tv/on_the_air
 */
export interface TmdbTvResult {
  id: number;
  name: string;                   // Show title (TV uses `name`, not `title`)
  original_name: string;
  original_language: string;
  overview: string;
  first_air_date: string;         // "YYYY-MM-DD" (series premiere)
  vote_average: number;
  vote_count: number;
  popularity: number;

  // Images
  poster_path: string | null;
  backdrop_path: string | null;

  // Classification
  genre_ids: number[];
  media_type: string;             // "tv" (present in trending endpoints)
  origin_country: string[];       // ISO 3166-1, e.g. ["US"]
  adult: boolean;
}

// ---------------------------------------------------------------------------
// Genre ID → name mapping
// ---------------------------------------------------------------------------

/** Static genre lookup. Covers both movie and TV IDs. */
export const TMDB_GENRES: Record<number, string> = {
  // Movie genres
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  // TV-only genres
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

// ---------------------------------------------------------------------------
// Extraction summary
// ---------------------------------------------------------------------------

// CURRENTLY EXTRACTED → MovieEntry / StreamingEntry:
//   title / name     ← title (movies) or name (TV)
//   overview         ← overview, truncated to 200 chars
//   vote_average     ← vote_average
//   release_date     ← release_date (movies only)
//   first_air_date   ← first_air_date (TV only)
//
// CURRENTLY DISCARDED:
//   poster_path      — movie/show poster image (trivial to add)
//   backdrop_path    — wider image for hero/header use
//   genre_ids        — genre classification (mapping above)
//   popularity       — separate signal from vote_average
//   vote_count       — credibility of the rating
//   id               — TMDB's own ID (could enable linking to TMDB page)
//   origin_country   — TV only
//   media_type       — TV only (from trending endpoints)
//   original_title/name, original_language
//
// PROPOSED ADDITIONS (Phase 6.4):
//   poster_url       ← https://image.tmdb.org/t/p/w342 + poster_path
//   genres[]         ← genre_ids mapped through TMDB_GENRES
//   runtime          ← requires detail endpoint call (not in list response)
