# Flash Check

## Purpose
Real-time, on-demand fetch for a single topic, sport, or social feed.
This stage is the entry point for quick checks that don't warrant a full
digest run. It is lightweight, conversational, and writes no files.

Read `config/config.json` before routing — the flash check reuses all
configured sources (feeds, ESPN URLs, Bluesky feeds).

---

## Step 1 — Classify the query

Read the user's request and route to one of five sub-modes:

| If the user asked for... | Route to |
|--------------------------|----------|
| Social feeds, Bluesky, "what's trending" | **A — Social feeds** |
| Live or current scores for a sport | **B — Live scores** |
| Movies, streaming, TV, entertainment, "what's out" | **C — Topic lookup** |
| A topic that exists in config.json | **C — Topic lookup** |
| A freeform topic not in config (ad-hoc question) | **D — Freeform topic** |
| Past results, last week, retroactive sweep, recap for a date range | **E — Retroactive** |
| A specific result or score from more than 7 days ago | **D — Freeform topic** |

If the query is ambiguous (e.g. "quick check on MMA" could be social or topic),
default to sub-mode C — topic lookup.

---

## Sub-mode A — Social Feeds

Fetch Bluesky using the same logic as FETCH-SOCIAL, but lighter:

**Bluesky:**
- If `bluesky_token` is set: fetch `getTimeline?limit=10` and pool with general feeds.
- If unauthenticated: fetch each `active` feed in `social.bluesky.general_feeds`
  with `limit=10` each.
- Apply the FETCH-SOCIAL quality bar. Output the best 5–8 posts inline.

**Output format:**
```
── Bluesky ───────────────────────────────────────────
[post text] — @handle
```

No SKY-* IDs assigned. These results are ephemeral and not indexed.

---

## Sub-mode B — Live Scores

Find the sport(s) being asked about. Look them up in `config/config.json` under
`topics` — any topic with `"scores": true` has a `scores_url`.

Fetch each matching `scores_url` **with no date filter** (omit `?dates=`).
The ESPN scoreboard endpoint without a date filter returns live and today's games.

Parse and display:
- Teams, current score or final score
- Game status (live / final / scheduled)
- Quarter/period/half if live

**Odds for scheduled games:** The ESPN scoreboard response embeds betting lines in
`competitions[].odds[]` for upcoming games. This applies to any sport's ESPN scoreboard
response — extract and display if present, silently skip if absent (ESPN does not embed
odds for all sports). When a game's status is `scheduled` (not live or final), extract:
- Spread (e.g. `Michigan -12.5`)
- Over/under total (e.g. `O/U 161.5`)
- Provider name (e.g. `ESPN Bet`)

Do not show odds for games that are live (`in progress`) or finished (`final`) —
lines are irrelevant once a game has started.

**F1 exception:** F1 uses `schedule_url` (not `scores_url`). Fetch `schedule_url` without
date filter to get the current or upcoming race session — same as the Sub-mode E F1 note.

If the user named a sport that isn't configured (no `scores_url` found):
fall back to a web search: `[sport] live scores today`.

**Output format — team sports (basketball, hockey, etc.):**
```
── NCAA Tournament · Saturday March 21 ──────────────────────
(9) Saint Louis vs (1) Michigan  12:10 PM ET  CBS  KeyBank Ctr, Buffalo
  Line: Michigan -12.5 · O/U 161.5 (DraftKings)

── NBA Scores ────────────────────────────────────────────────
Lakers 108 – Celtics 102 (Final)
Nuggets 94 – Warriors 89 (Q3 8:42)
Heat vs Bulls  7:30 PM ET
  Line: Bulls -3.5 · O/U 224.0 (DraftKings)
```

**Output format — MMA fight card:**
MMA events have fight order (main card / prelims) and weight classes instead of
tip times or quarter/period state. ESPN does not embed odds for MMA — omit the
odds line entirely (clean omission, not an error).
```
── UFC Fight Night: Evloev vs. Murphy · Saturday March 22 ──
Venue: UFC Apex, Las Vegas · ESPN+

Main Card
Movsar Evloev vs. Brendan Murphy  (Featherweight)
Mateusz Gamrot vs. Renato Moicano  (Lightweight)

Prelims
[fighter] vs. [fighter]  (Weightclass)
```

No IDs assigned. Scores are never indexed.

---

## Sub-mode C — Topic Lookup (configured topic)

Match the user's request to a topic in `config/config.json`. Partial matches
are fine (e.g. "quick look at F1" → "Formula 1" topic, or the topic containing
"F1" in its name or search_terms).

**ENT routing exception:** If the matched category is `ENT`, or the user asks
about movies/streaming/TV (entertainment is not a `topics` entry — it lives in
the `entertainment` config block), use the `entertainment` config directly
instead of FETCH-NEWS topic logic:

- **Step 0 — TMDB API** (if `tmdb_api_key` is set in credentials.json):
  Fetch from `entertainment.tmdb` endpoints in parallel:
  - `/movie/now_playing` — currently in theaters
  - `/movie/upcoming` — opening in next ~2 weeks
  - `/trending/movie/week` — weekly trending movies
  - `/trending/tv/week` — weekly trending TV
  - `/tv/on_the_air` — currently airing TV shows
  Parse `title`, `release_date`, `vote_average`, `overview` (one sentence).
  Story URL: `https://www.themoviedb.org/movie/{id}` or `/tv/{id}`.

- **Step 1 — RSS:** Fetch `entertainment.movies.rss` + `entertainment.streaming.rss`
  (The Wrap, Deadline) for new releases, reviews, and buzz.

- **Step 2 — Web search fallback:** Only if Steps 0–1 yield fewer than 2 results.
  Search: `movies now playing [current month year]` or `[user's specific query]`.

Apply the FETCH-ENTERTAINMENT quality filter: specific film/show, clear signal
(chart placement, score, or meaningful engagement), not matching
`entertainment.exclude_patterns`. Aim for 5–8 ENT items across movies + streaming.

Assign ENT-* IDs (ENT-01, ENT-02, …). These are live in conversation — user can
say "go deeper on ENT-01" and DEEP-DIVE-NEWS handles it.

**ENT output format:**
```
── Entertainment Flash ───────────────────────────────
Movies
ENT-01 · [title] — TMDB  ★ [vote_average]
  [one-sentence overview]

ENT-02 · [headline] — Deadline
  [snippet]

Streaming
ENT-03 · [show title] — TMDB  ★ [vote_average]
  [one-sentence overview]

ENT-04 · [show title] — TMDB  ★ [vote_average]
  [one-sentence overview]
```

---

**All other categories:** Run a Tier 1 fetch for that topic using FETCH-NEWS logic:
1. Fetch from `rss` feeds if configured.
2. Fall back to web search using `search_terms`.
3. Apply the FETCH-NEWS quality bar: real article URL, last ~36 hours,
   specific headline.

Aim for 3–5 results. Trim snippets to ≤2 sentences.

**ID assignment:** Assign IDs using the topic's `category` prefix, starting
at 01 (flash checks are context-isolated — IDs do not collide with digest IDs).
Example: a flash look at F1 produces SPRT-01, SPRT-02, etc.

These IDs are live in the conversation context. If the user says
"go deeper on SPRT-01", DEEP-DIVE-NEWS handles it and writes `deep-dives/SPRT-01.md`.

**Output format:**
```
── F1 Flash ──────────────────────────────────────────
SPRT-01 · [headline] — [outlet]
  [snippet]

SPRT-02 · [headline] — [outlet]
  [snippet]
```

---

## Sub-mode D — Freeform Topic

The user is asking about something not in config — an ad-hoc topic, something
they're discussing with someone, or a breaking story outside their usual interests.

Run an unconstrained Tier 1 web search:
```
[user's topic] news latest
[user's topic] today
```

Aim for 3–5 results. Apply the same quality bar as FETCH-NEWS (real article,
specific headline, recent).

**ID assignment:** Use prefix `FLASH`. Example: `FLASH-01`, `FLASH-02`.
Same rule applies — user can say "go deeper on FLASH-01" and DEEP-DIVE-NEWS handles it.

**Output format:** same as sub-mode C, with FLASH-* IDs.

---

## Sub-mode E — Retroactive / Historical

### Trigger phrases
"What happened this past week", "last week's scores", "retroactive check",
"recap [sport] from [date range]", "scores from March 13–19", etc.

### Date resolution
- "This past week" → the 7 days ending yesterday (March 13–19, 2026 relative to today March 20)
- "Last X days" → count back X days from yesterday
- Explicit date range → use as given
- **Hard cap: 7 days maximum for a full sweep.** If the resolved range exceeds 7 days,
  cap it at the most recent 7 days and tell the user explicitly — do not silently truncate.
  Say: "Capping to [date]–[date]; for older specific results use Sub-mode D (just ask)."
- For a specific single result beyond 7 days (e.g. "what happened in UFC two weeks ago"),
  do not use Sub-mode E — route to Sub-mode D and run a targeted web search instead.

### Fetching strategy
**Parallelization:** Fetch ALL sport+day combos in a single parallel batch — every sport for
every date in the range simultaneously. There is no need to batch by day; ESPN's public JSON
endpoints are independent GET requests with no shared state. (Max batch: 7 days × 6 sports =
42 requests — well within practical limits.)

**Sport scoping:** If the user named specific sports (e.g. "NBA and NHL this past week"),
only fetch those sports. Skip all others entirely.

**Off-season pruning:** After the parallel batch completes, if a sport returned 0 events
across every date in the range, omit it from the output entirely — no section header, no
"off-season" placeholder. NCAAF in March is the canonical example. This avoids running
7 empty fetches per off-season sport on every retroactive run.

**MMA exception:** The UFC scoreboard endpoint does not reliably surface completed past events
via date filter. For MMA, fall back to a web search:
`UFC results [week range, e.g. "March 13-19 2026"]`

**F1 exception:** F1 uses `schedule_url` (not `scores_url`). Fetch it without date filter to
see if any sessions occurred in the range; supplement with web search if needed.

**No odds displayed** — betting lines are stale once a game is played. Omit entirely.

### Output format
Organize by sport → date (ascending). For high-frequency sports (NBA, NHL), list all results
concisely on one line per game. Flag notable outcomes inline:

```
── NCAA Tournament — March 13–19 ───────────────────────────
Thu Mar 19 · First Four
  (16) Long Island 67 – Howard 60
  (11) Xavier 78 – Drake 72 · OT ⚡

Fri Mar 14 · Round of 64
  (1) Auburn 88 – (16) Alabama State 52  FINAL
  (5) Michigan 74 – (12) UC San Diego 62  FINAL
  ...

── NBA — March 13–19 ────────────────────────────────────────
Fri Mar 13
  Celtics 112, Heat 98  ·  Nuggets 105, Suns 99  ·  …
Sat Mar 14
  [results]

── NHL — March 13–19 ────────────────────────────────────────
[same pattern]

── UFC — March 13–19 ────────────────────────────────────────
[event name · date · results from web search]

── MLB (Spring Training) — March 13–19 ─────────────────────
[results or "spring training — results not indexed"]

── F1 — March 13–19 ─────────────────────────────────────────
[sessions / race result if applicable]

── College Baseball — March 13–19 ──────────────────────────
[ranked matchup results]
```

### Notable outcome flags (inline, no emoji required)
- Upset: when a lower seed beats a higher seed in tournament play
- OT / Shootout: game went to overtime
- Blowout: margin ≥ 20 pts (basketball) or ≥ 4 goals (hockey)
- Clinch: playoff berth or elimination

No files written. Results inline only.

---

## What this stage does NOT do
- Write to `digest.md` or `digest-index.md`
- Run preflight config checks (if a topic isn't in config, route to sub-mode D)
- Fetch Popular Now (digest-only section)
- Fetch podcasts (use FETCH-PODCASTS via daily digest or ask explicitly for a podcast)

---

## Output
Results displayed inline. No files written. Conversation context holds any
assigned IDs — the user can follow up with "go deeper on [ID]" at any time.
