/**
 * Podcast transcript acquisition for deep-dive generation (Phase 2, hybrid).
 *
 * Tries the dedicated transcript page (when present) then the episode page, runs
 * Readability, and classifies the result by length: a real transcript runs to
 * thousands of words; episode pages usually yield only a few hundred words of show
 * notes. The synthesis prompt adapts to which we got.
 *
 * Scoped by the digest data available: two other transcript sources are deferred for
 * V1 because the digest can't feed them — `youtube_url` is a *channel* URL (no episode
 * captions to fetch) and audio→speech-to-text over `audio_url` is a deferred tier (see
 * docs/DEFERRED.md "Podcast Audio Transcription"). So V1 = on-page text only, failing
 * soft to a show-notes "listening guide" when no transcript is published.
 */

import { fetchAndExtract } from "@/lib/deep-dive/fetch-article";

/** Which kind of text we managed to acquire — drives the prompt's output contract. */
export type TranscriptSource = "native" | "show_notes" | "none";

export interface AcquiredTranscript {
  source: TranscriptSource;
  /** Extracted body — full transcript or show-notes text; null when nothing usable landed. */
  text: string | null;
  /** Word count of `text`; 0 when none. */
  wordCount: number;
  /** The page the content came from (transcript_url / episode_url); null when none. */
  sourceUrl: string | null;
}

/** At/above this, the extracted body reads as a real transcript, not show notes. */
const TRANSCRIPT_MIN_WORDS = 1500;
/** Below this, even show notes are too thin to beat the digest snippet. */
const SHOW_NOTES_MIN_WORDS = 50;

const LOG = "[deep-dive/transcript]";

/**
 * Acquire the best available text for a podcast episode.
 *
 * Priority: `transcript_url` (dedicated transcript page, when present) → `episode_url`.
 * Returns the longest usable extraction, classified `native` (≥ transcript floor) or
 * `show_notes`, or `none` when nothing clears the show-notes floor. Never throws —
 * each candidate fails soft and is skipped.
 */
export async function acquireTranscript(
  episodeUrl: string | null,
  transcriptUrl: string | null | undefined
): Promise<AcquiredTranscript> {
  const candidates = [transcriptUrl, episodeUrl].filter((u): u is string => !!u);

  let best: AcquiredTranscript = { source: "none", text: null, wordCount: 0, sourceUrl: null };

  for (const url of candidates) {
    const extracted = await fetchAndExtract(url);
    if (!extracted.ok) {
      console.warn(`${LOG} ${extracted.reason} for ${url}`);
      continue;
    }
    if (extracted.wordCount > best.wordCount) {
      best = {
        source: extracted.wordCount >= TRANSCRIPT_MIN_WORDS ? "native" : "show_notes",
        text: extracted.text,
        wordCount: extracted.wordCount,
        sourceUrl: url,
      };
    }
    // A real transcript is the top of the chain — no need to try the episode page too.
    if (best.source === "native") break;
  }

  if (best.wordCount < SHOW_NOTES_MIN_WORDS) {
    return { source: "none", text: null, wordCount: 0, sourceUrl: null };
  }
  return best;
}
