/**
 * Entertainment (ENT) deep-dive generation orchestration:
 *   resolve title from digest → fetch TMDB+OMDb detail → synthesize → write .md
 *
 * Mirrors the news/podcast generators. The gather here is a structured API call
 * (fetch-tmdb.ts) rather than a scrape, and the kind (movie vs tv) is decided by which
 * entertainment section the ID resolves in — movies → movie, streaming → tv, upcoming →
 * the entry's own media_type. The synthesize+write tail is shared.
 */

import type { Digest } from "@/types";
import { getDigest } from "@/lib/digest";
import { fetchEntDetail, type EntKind } from "@/lib/deep-dive/fetch-tmdb";
import {
  DeepDiveError,
  synthesizeAndWrite,
  type GenerateResult,
} from "@/lib/deep-dive/shared";
import { buildEntPrompt, type EntDeepDiveInput } from "@/lib/deep-dive/ent-prompt";

interface ResolvedEnt {
  tmdbId: number;
  kind: EntKind;
  eligible: boolean;
}

/** Find an ENT title by ID across movies/streaming/upcoming and tag its TMDB kind. */
function resolveEnt(
  ent: Digest["sections"]["entertainment"],
  id: string
): ResolvedEnt | null {
  const movie = ent.movies.find((m) => m.id === id);
  if (movie) return { tmdbId: movie.tmdb_id, kind: "movie", eligible: movie.deep_dive_eligible };

  const show = ent.streaming.find((s) => s.id === id);
  if (show) return { tmdbId: show.tmdb_id, kind: "tv", eligible: show.deep_dive_eligible };

  const upcoming = ent.upcoming.find((u) => u.id === id);
  if (upcoming) {
    return { tmdbId: upcoming.tmdb_id, kind: upcoming.media_type, eligible: upcoming.deep_dive_eligible };
  }
  return null;
}

/**
 * Generate (or regenerate) an entertainment deep-dive markdown file for one title.
 *
 * Throws DeepDiveError for caller-facing failures (not found, ineligible, gather
 * failed, synthesis error) so the route can map them to status codes.
 */
export async function generateEntDeepDive(
  date: string,
  id: string
): Promise<GenerateResult> {
  const digest = await getDigest(date);
  if (!digest) {
    throw new DeepDiveError(`No digest found for ${date}.`, "not-found");
  }

  const resolved = resolveEnt(digest.sections.entertainment, id);
  if (!resolved) {
    throw new DeepDiveError(
      `Title ${id} not found in ${date}'s digest. IDs are date-scoped.`,
      "not-found"
    );
  }
  if (resolved.eligible === false) {
    throw new DeepDiveError(`Title ${id} is not flagged deep-dive-eligible.`, "ineligible");
  }

  const detail = await fetchEntDetail(resolved.kind, resolved.tmdbId);
  if (!detail) {
    throw new DeepDiveError(
      `Couldn't fetch TMDB detail for ${id} (tmdb_id ${resolved.tmdbId}). Check the TMDB key.`,
      "no-content"
    );
  }
  console.info(
    `[deep-dive] ${id}: ${resolved.kind} tmdb=${resolved.tmdbId}, omdb=${detail.omdb ? "yes" : "no"}, reviews=${detail.reviews.length}`
  );

  const input: EntDeepDiveInput = { id, fetchedAt: new Date().toISOString(), detail };

  return synthesizeAndWrite(date, id, buildEntPrompt(input), { fetched: 1, attempted: 1 });
}
