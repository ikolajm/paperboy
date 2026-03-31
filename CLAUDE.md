# News Digest — CLAUDE.md

## What This Is
A prompt-chain–driven daily digest covering news and podcasts. No
application code. Claude reads these markdown files in sequence, fetches
live content via web search, and writes output as markdown files.

All configuration lives in `config/config.json` — topics, fetch guidance,
RSS feeds, podcast shows, trending sections, and source endpoints. One file.

`config/credentials.json` (gitignored) holds credentials:
- **TMDB** API key + read access token — structured movie/TV data

---

## Entry Points

### 1. Daily Digest Run
> "Run the daily digest"

Claude walks the full chain (stages 00–07) and writes:
- `digests/YYYY-MM-DD/digest.md` — your morning read
- `digests/YYYY-MM-DD/digest-index.md` — lookup table for deep dives

### 2. News Deep Dive (on demand)
> "Go deeper on SPRT-01"
> "More on TECH-03"
> "Deep dive on yesterday's SPRT-02"
> "Go deeper on ENT-02"

Runs DEEP-DIVE-NEWS. Writes to `deep-dives/[ID].md`.

### 3. Podcast Deep Dive (on demand)
> "Go deeper on POD-02"
> "Transcript for POD-01"
> "Get me the transcript for yesterday's POD-03"
> "What did [show] talk about in POD-01"

Runs DEEP-DIVE-PODCAST. Writes to `deep-dives/[ID].md`
with full organised transcript, timestamps, and video link.

### 4. Flash Check (on demand, real-time)
> "Quick check my feeds"
> "Live NBA scores"
> "Quick look at F1"
> "What's going on with [topic]"

Runs FLASH-CHECK. No files written — output is inline and conversational.
Draws from the same config (topics, feeds, ESPN endpoints) as the daily digest.
Three sub-modes routed automatically from the query:
- **Live scores** — ESPN scoreboard for games happening now
- **Topic lookup** — Tier 1 fetch for a single named topic; IDs assigned so you can
  say "go deeper on [ID]" and the deep-dive stage will handle it
- **Freeform topic** — topic not in config triggers an unconstrained web search

### 5. Sports Deep Dive (planned)
On-demand odds analysis and stat comparisons are a planned feature.
Not yet implemented.

---

## Full Context Chain
See `context/CONTEXT.md` for the complete stage list.

---

## Output Structure

```
digests/
└── 2026-03-18/
    ├── digest.md               ← What you read
    ├── digest-index.md         ← Chain lookup table
    └── deep-dives/
        ├── SPRT-01.md          ← News deep dive, written on demand
        ├── POD-02.md           ← Podcast transcript, written on demand
        └── TECH-03.md
```

---

## ID Prefixes

News topic prefixes are declared via the `"category"` field in each topic in
`config/config.json`. Multiple topics share a prefix when they belong to the
same category — they draw from one shared ID sequence per day.

| Prefix | Category | Deep-Dive |
|--------|----------|-----------|
| `SPRT` | Sports (all sports topics) | yes |
| `TECH` | Technology (AI models, coding tools, creative AI) | yes |
| `ENT` | Entertainment (movies, streaming) | yes |
| `POP` | Popular Now | yes |
| `NOISE` | In the Noise | never |
| `POD` | Podcast episode | yes |
| `POL` | US Politics | yes |
| _(none)_ | Sports scores — rendered from scores_log, not indexed | never |

To add a new topic category, add a new entry to the `topics` object in
`config/config.json` with `"category": "YOUR_CODE"` — available immediately.

---

## Key Principles
- **Tier 1 always on daily runs.** Headlines, snippets, episode titles.
  Full content is only fetched on-demand via deep dive.
- **IDs are date-scoped.** POD-01 on March 18 ≠ POD-01 on March 19.
  Reference past items by saying "yesterday's POD-01" or give the date.
- **Watch topics surface briefly.** 2–3 stories in On Your Radar. `points_of_interest` guides what to look for, not whether stories appear.
- **NOISE is never deep-dived.** By design.
- **Structured endpoints first.** Google News RSS, ESPN JSON API, and
  TMDB API are the primary sources. Per-topic RSS supplements where
  stable. Web search is a last resort.
- **One config file.** `config/config.json` holds everything — topics,
  fetch guidance, RSS feeds, podcast shows, trending sections, and
  ESPN/TMDB endpoint config. Edit it directly.
  `credentials.json` (gitignored) holds TMDB API key.
- **Sports scores are not stories.** They live in a `scores_log`, skip
  the filter pipeline, and are never indexed or deep-dived.
- **Upcoming games have odds.** `upcoming_games_log` holds today's
  scheduled games with spread, O/U, moneyline, and broadcast data.
  Watch-priority games are flagged for "On the Slate" rendering.
- **Entertainment is deep-dive eligible.** ENT-* stories can be explored
  the same as any news story.
