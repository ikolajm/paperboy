/**
 * Podcast deep-dive prompt builder.
 *
 * Builds the single synthesis prompt and adapts the output shape to what acquisition
 * actually got (fetch-transcript.ts):
 *
 *   - `native`     → a real transcript was published. Output the full
 *                    transcript shape (What They Argued / Key Exchanges / Walkthrough).
 *   - `show_notes` / `none` → no transcript. Output an honest "listening guide" built
 *                    from show notes + snippet, with NO fabricated transcript or quotes.
 *
 * Deferred for V1 (Phase 2.5): YouTube captions and audio→speech-to-text. So the
 * "Jump To" timestamp table is always omitted — Readability text carries no usable
 * timestamps.
 */

import type { TranscriptSource } from "@/lib/deep-dive/fetch-transcript";

export interface PodcastDeepDiveInput {
  id: string;
  show: string;
  title: string;
  duration: string;
  /** Published date string from the digest entry. */
  published: string;
  episodeUrl: string | null;
  /** Short digest snippet — the floor when no transcript/show-notes landed. */
  snippet: string;
  /** ISO timestamp for the file's Fetched: field. */
  fetchedAt: string;
  source: TranscriptSource;
  /** Acquired body (transcript or show notes); null when source === "none". */
  transcriptText: string | null;
}

const SOURCE_LABEL: Record<TranscriptSource, string> = {
  native: "native (published transcript)",
  show_notes: "show_notes (no transcript — episode description)",
  none: "none (no transcript — digest snippet only)",
};

/** The shared metadata header both modes emit. */
function header(input: PodcastDeepDiveInput): string {
  const lines = [
    `# ${input.title}`,
    "",
    `**Show:** ${input.show}`,
    `**ID:** ${input.id}`,
    `**Published:** ${input.published}`,
    `**Duration:** ${input.duration}`,
  ];
  if (input.episodeUrl) lines.push(`**Episode page:** ${input.episodeUrl}`);
  lines.push(`**Transcript source:** ${SOURCE_LABEL[input.source]}`);
  lines.push(`**Fetched:** ${input.fetchedAt}`);
  return lines.join("\n");
}

/** Transcript mode — a real transcript was published; synthesize the spec's shape. */
function transcriptPrompt(input: PodcastDeepDiveInput): string {
  return `You are writing a podcast deep-dive file for a personal news dashboard. A full transcript of this episode was retrieved below. Synthesize it into ONE clean markdown document the reader can read instead of (or alongside) listening.

## Episode
Show: ${input.show}
Title: ${input.title}
Duration: ${input.duration}
Digest snippet: ${input.snippet || "(none)"}

## Transcript (retrieved)
${input.transcriptText}

## Rules
- Ground every claim and quote in the transcript above. Do NOT invent exchanges, quotes, or names.
- Preserve direct quotes and named speakers exactly. Label speakers as [Host], [Guest], or by name once names are established.
- Trim filler (um, uh) when it clutters reading, but keep it inside direct quotes when it adds character.
- Do NOT add a "Jump To" table — this source carries no reliable timestamps.
- Write in plain prose. No editorializing.

## Output
Output ONLY the markdown below — no preamble, no code fences. Use this exact structure:

${header(input)}

---

## What They Actually Argued

[3-5 paragraphs on the positions taken, what was debated, and any conclusions reached. The intellectual content, not a topic list — what did each person actually claim?]

## Key Exchanges

### [Exchange topic]

[Speaker-labeled transcript excerpt worth reading closely]

[Repeat for 3-5 notable exchanges]

## Segment Walkthrough

### [Segment title]

[A few sentences summarizing this stretch of the conversation, in order. 5-10 segments across the episode.]`;
}

/** Guide mode — no transcript; write an honest listening guide, no fabricated quotes. */
function guidePrompt(input: PodcastDeepDiveInput): string {
  const sourceBlock =
    input.source === "show_notes" && input.transcriptText
      ? `## Show notes (retrieved — this is the show's own description, NOT a transcript)\n${input.transcriptText}`
      : "## Available material\nNo transcript or show notes could be retrieved. Work only from the snippet below.";

  return `You are writing a podcast deep-dive file for a personal news dashboard. NO transcript was available for this episode, so you are writing a "listening guide" — an honest orientation to what the episode is about, based only on the material below plus general background. You must NOT fabricate a transcript, quotes, or specific things that were said.

## Episode
Show: ${input.show}
Title: ${input.title}
Duration: ${input.duration}
Digest snippet: ${input.snippet || "(none)"}

${sourceBlock}

## Rules
- Do NOT invent quotes, exchanges, timestamps, or claims about what was specifically said in this episode. No transcript exists — you don't know what was actually said, so never imply you do.
- "What This Episode Covers" describes the likely subject matter from the title/snippet/show-notes — frame it as what the episode is about, not as verbatim content.
- "Why It Matters" should draw fully and specifically on what you know about the topic, the people, and the situation — this is the part that makes the guide worth reading. Concrete, specific background (the history, the stakes, who's involved and why) beats cautious generality.
- Be honest and useful. If material is thin, a shorter guide is correct — don't pad.
- Write in plain prose. No editorializing.

## Output
Output ONLY the markdown below — no preamble, no code fences. Use this exact structure:

${header(input)}

---

> _No transcript was available for this episode. The following is a listening guide based on the episode's show notes and description, not its actual audio._

## What This Episode Covers

[2-4 paragraphs orienting the reader to the subject matter, drawn from the title, snippet, and show notes.]

## Why It Matters

[1-2 paragraphs of background and stakes — who/what is involved and why this topic is worth an episode.]

## Listen For

- [A theme, question, or angle the reader should pay attention to]
- [Another]
- [Another]`;
}

export function buildPodcastPrompt(input: PodcastDeepDiveInput): string {
  return input.source === "native" ? transcriptPrompt(input) : guidePrompt(input);
}
