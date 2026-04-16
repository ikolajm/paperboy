# Fetch Podcasts

## Purpose
Check for new podcast episodes from shows the user follows.
Populate the story registry with podcast entries.

Read the `podcasts.settings` and `podcasts.shows` sections from
`config/config.json` before starting. All RSS feeds, release schedules,
and transcript hints live there.

---

## Part A: Shows You Follow

For each show in the `shows` list:

### Step 1 — Check release schedule

Read the `release_schedule` field from config.json for this show.
Determine today's day of the week, then decide whether to fetch:

| Schedule value | Fetch on |
|----------------|----------|
| `daily` | Every day |
| `weekdays` | Monday–Friday |
| `weekly_monday` | Monday only |
| `mon_wed_fri` | Monday, Wednesday, Friday |
| `mon_thu` | Monday, Thursday |
| _(absent)_ | Every day (always check) |

**If today is NOT a release day for this show:** skip it entirely.
Do not fetch the RSS feed. Do not add anything to the registry.
Move to the next show.

**If today IS a release day:** proceed to Step 2.

### Step 2 — Batch fetch all eligible show RSS feeds
After filtering by release schedule (Step 1), collect all eligible shows'
RSS URLs and **batch fetch them in a single call**:
```
echo '[
  {"label": "Up First", "url": "https://feeds.npr.org/510318/podcast.xml", "max": 1},
  {"label": "BBC Global", "url": "https://podcasts.files.bbci.co.uk/p02nq0gn.rss", "max": 1}
]' | python3 scripts/fetch_rss.py --batch -
```
This fetches all eligible shows' RSS feeds in parallel. Parse the JSON
output per label to extract the latest episode for each show.

Also note the `transcript_page` value from config.json (may be `null`).
This will be stored on the registry entry as `transcript_hint` so DEEP-DIVE-PODCAST
can fetch transcripts directly instead of searching.

_Note: video-api.wsj.com/podcast/rss/wsj/the-journal (WSJ's "The Journal") is blocked by the Claude Code WebFetch tool — if its label returns a fetch_error, fall back to web search for the latest episode._

If a show is not in config.json (e.g. a newly added show): search
`[show name] podcast RSS feed`. Locate the feed URL via the show's website
or Apple Podcasts page.

If the show can't be found, note it as unresolvable and move on;
do not abort the stage.

### Step 3 — Parse the latest episode (single episode)
From the batch results, read the **1 most recent episode** per show only.

The episode must be published within the schedule's freshness window:
- `daily` / `weekdays`: within 24 hours
- `weekly_*`: within 7 days
- `mon_wed_fri` / `mon_thu`: within 3 days
- _(no schedule)_: within 7 days

If the most recent episode falls outside the freshness window, the show
has nothing new. Skip it — do not add a placeholder to the registry.

Collect:
- Episode title
- Publish date
- Episode description / show notes (this is Tier 1 content)
- Duration (from `<itunes:duration>` if present in RSS)
- Episode URL — the show's own page for this specific episode, not the
  show homepage. If the RSS `<link>` points to the show homepage or is
  missing, search `"[show name]" "[episode title]"` to find the episode
  page. If the search fails, write `—` rather than linking to the show
  homepage.
- YouTube URL — resolve in order:
  1. Check show notes text for a direct YouTube link.
  2. If not found, and the show has a `youtube_channel` in config.json,
     search `"[episode title]" site:youtube.com` or
     `[youtube_channel URL] [episode title]`.
  3. If still not found, fall back to: `[show name] [episode title] youtube`.

  **Important:** the YouTube URL must be a specific video
  (`youtube.com/watch?v=...`). Never use a channel homepage
  (`youtube.com/@ChannelName`) as an episode URL — if you can only find
  the channel, write `—` instead.

  If context budget is tight, resolve YouTube URLs only for episodes
  whose show has a `youtube_channel` in config.

### Step 4 — Add to registry
Add the qualifying episode as a POD-* entry.

```
id:           POD-01
title:        [episode title]
show:         [show name]
published:    [date]
duration:     [e.g. 1h 42m, or null if unavailable]
description:  [first 2-3 sentences of show notes]
episode_url:      [show's own page]
youtube_url:      [if found]
rss_url:          [the feed URL]
transcript_hint:  [transcript_page from config.json, or null]
relationship:     followed               ← marks this as a show you follow
outlet:           [show name, e.g. "The Daily"]
source:           [RSS feed URL fetched, e.g. "https://feeds.simplecast.com/Sl5CSM3S"]
```

### Step 5 — Cross-reference scan (lightweight)

Before discarding the RSS feed data, scan the **last 5 episode titles
and first sentence of each description** from the feed. Match them
against today's story registry — specifically, compare against:
- Headlines of stories already in the registry
- `search_terms` arrays from each topic in config.json

If a recent episode (published within the last 7 days, and **not** the
current episode from Step 3) clearly matches a topic, store a lightweight
cross-reference in working context:

```
cross_refs = [
  {
    show: "Lex Fridman Podcast",
    episode_title: "Jensen Huang: NVIDIA",
    published: "2026-03-23",
    matched_topic: "AI Models & Agents"
  }
]
```

**Cross-references are not stories.** They do NOT get POD-IDs, are NOT
added to the story registry, and do NOT appear in the digest index.
They are rendering hints for WRITE — a one-line note under the matched
topic section:

```
🎙️ _Related: **Lex Fridman** covered this in "Jensen Huang: NVIDIA" (Mar 23)_
```

This scan is essentially free — the RSS data is already in memory from
Step 3. No additional HTTP requests. No YouTube resolution. No transcript
fetching. Just keyword matching on metadata we already have.

If no cross-references are found, that's fine. Move on.

---

## ID assignment
Prefix: `POD`
Sequential across all followed episodes fetched this run.
Example: `POD-01`, `POD-02`, `POD-03`

With the 1-episode cap and schedule filtering, expect 5–8 POD entries
on any given day (not all 9 shows release every day).

---

## Output
Story registry is now complete with all content types:
- News stories (FETCH-NEWS, FILTER, and POPULAR)
- Entertainment + scores (FETCH-ENTERTAINMENT)
- Podcast episodes: POD-* (this stage)
- Podcast cross-references in working context (for WRITE)

Proceed to the next stage in the chain.
