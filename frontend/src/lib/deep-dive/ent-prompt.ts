/**
 * Entertainment (ENT) deep-dive prompt builder.
 *
 * Framing: a spoiler-free "should I watch this" decision aid, not a dossier. Leads with
 * scores + where-to-watch, then premise / cast / reception. Everything is grounded in
 * the TMDB + OMDb data gathered in fetch-tmdb.ts — the one fabrication risk is reviews,
 * so the prompt is strict: synthesize reception ONLY from the supplied review text and
 * scores, never invent quotes or critic consensus.
 */

import type { EntDetail } from "@/lib/deep-dive/fetch-tmdb";

export interface EntDeepDiveInput {
  id: string;
  /** ISO timestamp for the file's Fetched: field. */
  fetchedAt: string;
  detail: EntDetail;
}

function scoreLines(d: EntDetail): string {
  const lines: string[] = [];
  if (d.tmdbScore != null) {
    lines.push(`- TMDB: ${d.tmdbScore.toFixed(1)}/10${d.tmdbVotes ? ` (${d.tmdbVotes.toLocaleString()} votes)` : ""}`);
  }
  if (d.omdb?.imdb) lines.push(`- IMDb: ${d.omdb.imdb}`);
  if (d.omdb?.rottenTomatoes) lines.push(`- Rotten Tomatoes: ${d.omdb.rottenTomatoes}`);
  if (d.omdb?.metacritic) lines.push(`- Metacritic: ${d.omdb.metacritic}`);
  return lines.length ? lines.join("\n") : "- (no scores available)";
}

function reviewBlock(d: EntDetail): string {
  if (!d.reviews.length) {
    return "(No user reviews were returned by TMDB. Do NOT invent reviews or a critical consensus — base the Reception section only on the numeric scores above, and say plainly if reception can't be characterised.)";
  }
  return d.reviews
    .map((r, i) => `Review ${i + 1} — by ${r.author}:\n${r.content}`)
    .join("\n\n");
}

export function buildEntPrompt(input: EntDeepDiveInput): string {
  const d = input.detail;
  const kindLabel = d.kind === "movie" ? "film" : "TV series";

  const facts = [
    `Title: ${d.title}`,
    d.tagline ? `Tagline: ${d.tagline}` : null,
    `Type: ${kindLabel}`,
    d.genres.length ? `Genres: ${d.genres.join(", ")}` : null,
    d.releaseDate ? `${d.kind === "movie" ? "Released" : "First aired"}: ${d.releaseDate}` : null,
    d.runtime ? `Runtime: ${d.runtime}${d.kind === "tv" ? " per episode" : ""}` : null,
    d.certification ? `Rated: ${d.certification}` : null,
    d.director ? `${d.kind === "movie" ? "Director" : "Created by"}: ${d.director}` : null,
    d.cast.length ? `Cast: ${d.cast.join(", ")}` : null,
    d.kind === "tv" && d.seasons ? `Seasons: ${d.seasons}${d.episodes ? `, ${d.episodes} episodes` : ""}` : null,
    d.kind === "tv" && d.status ? `Status: ${d.status}` : null,
    d.kind === "tv" && d.networks.length ? `Network: ${d.networks.join(", ")}` : null,
    d.keywords.length ? `Themes/keywords: ${d.keywords.join(", ")}` : null,
    d.recommendations.length ? `If you liked this (TMDB): ${d.recommendations.join(", ")}` : null,
    d.omdb?.awards ? `Awards: ${d.omdb.awards}` : null,
    d.omdb?.boxOffice ? `Box office: ${d.omdb.boxOffice}` : null,
    d.trailerUrl ? `Trailer: ${d.trailerUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const whereToWatch = d.kind === "tv" && d.networks.length ? d.networks.join(", ") : null;

  return `You are writing a spoiler-free "should I watch this?" deep-dive for a personal media dashboard. Synthesize the TMDB + OMDb data below into ONE clean markdown document that helps the reader decide whether to watch this ${kindLabel} — scores and availability first, then premise, who made it, and how it was received.

## Title data
${facts}

## Official overview (TMDB)
${d.overview || "(none provided)"}

## Scores
${scoreLines(d)}

## User reviews (TMDB)
${reviewBlock(d)}

## Rules
- Ground every claim in the data above. Do NOT invent cast, scores, quotes, reviews, or a critical consensus.
- **Spoiler-free.** Describe the premise and hook, never the plot's twists or ending.
- The "Reception" section synthesizes ONLY the scores and the supplied user reviews. If reviews are absent, characterise reception from the numeric scores alone and say so.
- "The Pitch" may use your general background knowledge of the genre/talent for context, but keep it background — do not assert specific plot facts not in the data.
- Plain, neutral prose. A short, scannable page beats a padded one.

## Output
Output ONLY the markdown below — no preamble, no code fences. Use this exact structure:

# ${d.title}${d.releaseDate ? ` (${d.releaseDate.slice(0, 4)})` : ""}

**ID:** ${input.id}
**Type:** ${d.kind === "movie" ? "Film" : "TV series"}${d.genres.length ? ` · ${d.genres.join(", ")}` : ""}
${d.director ? `**${d.kind === "movie" ? "Director" : "Creator"}:** ${d.director}` : ""}
${d.cast.length ? `**Starring:** ${d.cast.slice(0, 4).join(", ")}` : ""}
**Fetched:** ${input.fetchedAt}

---

## Scores at a Glance

${scoreLines(d)}

## Where to Watch

[${whereToWatch ? `Network: ${whereToWatch}. ` : ""}Note the streaming/rental providers if known, else say availability wasn't available in the data. One or two lines.]

## The Pitch

[2-3 spoiler-free paragraphs: the premise, the hook, the tone, and who it's for. Drawn from the overview, genres, and talent.]

## Who Made It

[A short paragraph on the key cast and ${d.kind === "movie" ? "director" : "creator"} and what they're known for.]

## Reception

[2-3 paragraphs synthesizing the scores and any supplied reviews — how it landed with audiences/critics. No invented quotes or consensus.]
${d.recommendations.length ? "\n## If You Like This\n\n[One line listing the TMDB recommendations as related titles.]\n" : ""}${d.trailerUrl ? `\n## Trailer\n\n[${d.trailerUrl}]\n` : ""}`;
}
