# Deep Dive: Podcast

## Purpose
Fetch a full organised transcript for a podcast episode identified by POD-ID.
Write a structured deep-dive file the user can read instead of listening,
with timestamps to jump to specific moments if they prefer.

This stage runs independently — never part of the daily chain.

---

## Entry Trigger
User says something like:
- "Go deeper on POD-02"
- "Transcript for POD-01"
- "Get me the transcript for yesterday's POD-03"
- "What did [show] talk about in POD-01"

---

## Step 1 — Resolve the Episode

Parse the POD-ID and date from the user's message.
Default to today's date if no date specified.

Read `digests/YYYY-MM-DD/digest-index.md` and find the POD-* row.

Extract:
- Episode title (Title column)
- Show name (Source/Show column)
- Episode URL (URL column — the show's own page)
- YouTube URL (YouTube column — use directly if not `—`)
- Transcript page URL (Transcript column — use directly if not `—`; this
  is the `transcript_hint` stored by FETCH-PODCASTS from config.json)

If the ID is not found → tell the user and suggest checking the date.

Check if `digests/YYYY-MM-DD/deep-dives/[ID].md` already exists.
If yes → tell the user and ask if they want a refresh.

---

## Step 2 — Locate the Transcript

Work through the transcript source priority from
`podcasts.settings.deep_dive.transcript_sources` in `config/config.json`.
Default order: native → youtube_captions → show_notes.

### Source A: Native transcript
If the Transcript column from the index is not `—`, fetch that URL directly
— do not search. This is a pre-resolved transcript page from config.json.

If the Transcript column is `—`, search: `[show name] [episode title] transcript`
and also try the episode URL directly — many shows publish transcripts
on the same page as the episode.

If a native transcript is found: use it. It is the highest quality source.
Skip sources B and C.

### Source B: YouTube captions
If the YouTube column from the index is not `—`, fetch that URL directly
— do not search for a YouTube link. YouTube auto-captions are available
on most podcast episodes uploaded to YouTube.

Fetch approach:
1. Fetch the YouTube page at the stored URL
2. Look for caption/transcript data in the page
3. Alternatively search: `[show name] [episode title] youtube transcript`
   and look for third-party transcript services (e.g. Podscribe, Castmagic,
   Tactiq) that may have already processed it

YouTube captions will be a continuous text stream without speaker labels.
Do your best to infer speaker changes from context and question/answer patterns.

### Source C: Show notes
Fetch the episode URL and extract the show notes body.
This is not a transcript — it is a summary written by the show.
Note clearly in the output that this is show notes, not a transcript.

### Nothing found
If all sources fail, write the deep dive using the episode description
from the RSS entry and note that no transcript was available.

---

## Step 3 — Process the Transcript

Once raw transcript content is obtained:

### Clean
- Remove timestamps formatting artifacts if present
- Remove filler words if they clutter reading (um, uh, you know)
  but preserve them in direct quotes where they add character
- Fix obvious transcription errors where the meaning is clear

### Segment
Divide the transcript into logical segments by topic.
Each segment gets a header describing what's being discussed.
Aim for 5–10 segments per hour of content.

### Speaker labels
If `speaker_labels: true` in config:
- Label each speaker as "[Host]:" or "[Guest]:" at minimum
- Use names once they're established in the conversation
- If multiple guests, label by name once identified

### Timestamps
If `include_timestamps: true` in config and timestamps are available
in the source:
- Preserve them inline: `[42:18]`
- Collect the most significant ones into a "Jump To" table at the top

---

## Step 4 — Write the Deep Dive File

Write to: `digests/YYYY-MM-DD/deep-dives/[POD-ID].md`

```markdown
# [Episode Title]

**Show:** [Show Name]
**ID:** [POD-ID]
**Published:** [Date]
**Duration:** [e.g. 1h 42m]
**Episode page:** [URL]
**YouTube:** [URL if available, else omit]
**Transcript source:** [native / youtube_captions / show_notes / none]

---

## Jump To
_Timestamps worth knowing about_

| Time | Topic |
|------|-------|
| 00:00 | Introduction / context |
| 14:32 | [Significant topic] |
| 58:10 | [Another topic] |
| 1:22:40 | [Closing topic] |

[Omit this table if no timestamps available]

---

## What They Actually Argued
_The substance, not just the topics_

[3–5 paragraphs on the positions taken, what was debated, what conclusions
were reached. This is not a topic list — it's an account of the intellectual
content. What did each person actually claim?]

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

...

---
_[← Back to digest](../digest.md)_
```

---

## Step 5 — Confirm to User

Tell the user:
- File written to `deep-dives/[ID].md`
- Which transcript source was used
- If the source was show notes rather than a real transcript, be clear
  about that — don't present a summary as a transcript
- Surface 1–2 of the most interesting exchanges directly in chat so
  the user gets immediate value without opening the file
