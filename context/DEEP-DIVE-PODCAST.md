# Deep Dive: Podcast

## Purpose

Fetch a full structured transcript or listening guide for a podcast episode, then write a markdown file the user can read instead of listening (or read alongside, with timestamps to jump to specific moments). This stage runs on demand — never part of the daily digest pipeline.

## Entry trigger

User says something like:
- "Go deeper on POD-02"
- "Transcript for POD-01"
- "Listening guide for POD-03"
- "What did [show] talk about in POD-01"

---

## Step 1 — Resolve the episode

### Parse the ID and date

Extract the POD-ID. If the user references a date, resolve it to `YYYY-MM-DD`; default to today.

### Load the digest

Read `digests/YYYY-MM-DD/digest.json` in full. Locate the episode in `sections.podcasts[]` where `id === <POD-ID>`.

The `PodcastEntry` shape:

```
{
  id, show, title, duration, date, snippet,
  episode_url,       // show's own episode page (may be null)
  image_url,         // optional
  audio_url,         // optional
  youtube_url,       // optional — present if `youtube_channel` is set in config for this show
  transcript_url,    // optional — present if `transcript_page` is set in config for this show
  deep_dive_eligible: boolean
}
```

### Fail-soft cases

- **ID not found** → "I couldn't find [POD-ID] in `digests/[date]/digest.json`. Check the date — IDs are date-scoped."
- **`deep_dive_eligible: false`** → "This episode isn't flagged as deep-dive-eligible."
- **`digests/YYYY-MM-DD/deep-dives/[POD-ID].md` already exists** → tell the user and ask whether they want a refresh.

---

## Step 2 — Locate the transcript

Try sources in this priority order. Stop at the first one that yields a usable transcript:

### Source A — Native transcript

If `transcript_url` is set in the episode, fetch that URL directly. This is a pre-resolved transcript page derived from `podcasts.shows[].transcript_page` in `config/config.json`. It is the highest-quality source — use it and skip B and C.

If `transcript_url` is absent, try fetching `episode_url` directly — many shows publish a transcript on the same page as the episode. A targeted search (`[show name] [episode title] transcript`) is also fair game.

### Source B — YouTube captions

If `youtube_url` is set in the episode, fetch the YouTube page and look for caption/transcript data. As a fallback, search for third-party transcript services (Podscribe, Castmagic, Tactiq) that may have already processed it: `[show name] [episode title] youtube transcript`.

YouTube auto-captions are a continuous stream without speaker labels — infer speaker changes from context and question/answer patterns.

### Source C — Show notes / fallback summary

If both A and B fail, fetch `episode_url` and extract the show-notes body. This is **not** a transcript — it's a summary written by the show. Mark it clearly as such in the output.

If all three fail, write the deep dive from the `snippet` in the digest entry and explicitly note that no transcript was available.

---

## Step 3 — Process the content

Once raw transcript content is in hand:

### Clean

- Remove transcription formatting artifacts (stray HTML, timestamp lines that don't add value)
- Trim filler words (um, uh, you know) where they clutter reading, **but preserve them inside direct quotes** when they add character
- Fix obvious transcription errors only where the corrected meaning is unambiguous

### Segment

Divide the transcript into logical segments by topic. Each segment gets a header describing the discussion. Aim for 5–10 segments per hour of content.

### Speaker labels

Label speakers as `[Host]:`, `[Guest]:`, or by name once names are established in the conversation. For multi-guest episodes, distinguish guests by name.

### Timestamps

If timestamps are available in the source, preserve them inline in the format `[42:18]`. Collect the most significant ones into a "Jump To" table at the top of the output.

If no timestamps are available, omit the Jump To table entirely.

---

## Step 4 — Write the deep-dive file

Write to `digests/YYYY-MM-DD/deep-dives/[POD-ID].md`:

```markdown
# [Episode Title]

**Show:** [Show name from `show` field]
**ID:** [POD-ID]
**Published:** [`date` field]
**Duration:** [`duration` field — e.g. "1h 42m"]
**Episode page:** [`episode_url` if present, else omit]
**YouTube:** [`youtube_url` if present, else omit]
**Transcript source:** [native / youtube_captions / show_notes / none]

---

## Jump To
_Timestamps worth knowing about_

| Time | Topic |
|------|-------|
| 00:00 | Introduction / context |
| 14:32 | [Significant topic] |
| 58:10 | [Another topic] |

[Omit this section entirely if no timestamps were available]

---

## What They Actually Argued
_The substance, not just the topics_

[3–5 paragraphs on the positions taken, what was debated, what conclusions were reached. This is not a topic list — it's an account of the intellectual content. What did each person actually claim?]

---

## Key Exchanges
_Moments worth reading closely_

### [Exchange topic]

[Relevant transcript excerpt, speaker-labeled, with timestamp if available]

[Repeat for 3–5 notable exchanges]

---

## Full Transcript

### [Segment title] [00:00]
[Host]: [text]
[Guest]: [text]
...

### [Segment title] [14:32]
[text continues]
```

---

## Step 5 — Confirm to user

After writing:
- Confirm the file path
- State which transcript source was used
- If the source was show notes rather than a real transcript, say so clearly — don't present a summary as a transcript
- Surface 1–2 of the most interesting exchanges directly in chat so the user gets immediate value without opening the file
