/**
 * Podcast deep-dive generation orchestration:
 *   resolve episode from digest → acquire transcript/show-notes → synthesize → write .md
 *
 * Mirrors generate.ts (news) but with the podcast gather path: there are no related
 * articles to fan out over — a podcast deep dive is one episode, and the work is
 * getting its text (fetch-transcript.ts). The synthesize-and-write tail is shared.
 */

import { getDigest } from "@/lib/digest";
import { acquireTranscript } from "@/lib/deep-dive/fetch-transcript";
import {
  DeepDiveError,
  MIN_SNIPPET_CHARS,
  synthesizeAndWrite,
  type GenerateResult,
} from "@/lib/deep-dive/shared";
import {
  buildPodcastPrompt,
  type PodcastDeepDiveInput,
} from "@/lib/deep-dive/podcast-prompt";

/**
 * Generate (or regenerate) a podcast deep-dive markdown file for one episode.
 *
 * Throws DeepDiveError for caller-facing failures (not found, ineligible, nothing to
 * synthesize, synthesis error) so the route can map them to status codes.
 */
export async function generatePodcastDeepDive(
  date: string,
  id: string
): Promise<GenerateResult> {
  const digest = await getDigest(date);
  if (!digest) {
    throw new DeepDiveError(`No digest found for ${date}.`, "not-found");
  }

  const episode = digest.sections.podcasts.find((p) => p.id === id);
  if (!episode) {
    throw new DeepDiveError(
      `Podcast ${id} not found in ${date}'s digest. IDs are date-scoped.`,
      "not-found"
    );
  }
  if (episode.deep_dive_eligible === false) {
    throw new DeepDiveError(`Podcast ${id} is not flagged deep-dive-eligible.`, "ineligible");
  }

  const acquired = await acquireTranscript(episode.episode_url, episode.transcript_url);
  console.info(`[deep-dive] ${id}: transcript source=${acquired.source} (${acquired.wordCount} words)`);

  // Guide mode runs from the snippet alone — only block when even that is too thin.
  if (acquired.source === "none" && episode.snippet.trim().length < MIN_SNIPPET_CHARS) {
    throw new DeepDiveError(
      `No transcript or show notes found for ${id}, and its snippet is too thin to synthesize.`,
      "no-content"
    );
  }

  const input: PodcastDeepDiveInput = {
    id,
    show: episode.show,
    title: episode.title,
    duration: episode.duration,
    published: episode.date,
    episodeUrl: episode.episode_url,
    snippet: episode.snippet,
    fetchedAt: new Date().toISOString(),
    source: acquired.source,
    transcriptText: acquired.text,
  };

  return synthesizeAndWrite(date, id, buildPodcastPrompt(input), {
    fetched: acquired.source === "none" ? 0 : 1,
    attempted: 1,
  });
}
