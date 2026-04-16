# Bootstrap

## Purpose
Orient the chain. Establish today's date, detect the run mode, and load
all necessary config before any fetching begins.

## On Entry
When a user says "run the daily digest" or similar, this is the first
context file to read. Do not skip it — it sets variables used by every
subsequent stage.

## Steps

### 1. Establish today's date
Note today's date in YYYY-MM-DD format. All output paths and story IDs
will be scoped to this date.

### 2. Detect run mode
- **Daily run** — user asked for the digest, no story ID mentioned
  → proceed through FETCH-NEWS → FILTER → POPULAR → FETCH-ENTERTAINMENT → FETCH-PODCASTS → WRITE
- **Deep dive** — user referenced a story ID (e.g. "go deeper on SPRT-01")
  → skip to the appropriate on-demand stage:
  IDs beginning with `POD` → DEEP-DIVE-PODCAST.
  All other deep-dive-eligible IDs (SPRT, TECH, ENT, POP, etc.) → DEEP-DIVE-NEWS.
- **Validate feeds** — user says "validate bluesky feeds" or similar
  → run `getFeedGenerators` in batch for all Bluesky feed URIs declared in
     `config/config.json` (under `social.bluesky.general_feeds`). Report reachability for each URI — active or failed.
     Surface any recommendations to add or drop feeds. No files are written;
     the user acts on the report manually. Do not proceed to FETCH-NEWS. Stop after validation.
- **Flash check** — user wants a quick, real-time check (not a full digest)
  e.g. "quick check my feeds", "live NBA scores", "quick look at F1",
       "what's going on with [topic]"
  → skip to FLASH-CHECK. Do not run the digest chain. No files written.

### 3. Load config
Load `config/config.json` in full. This is the single configuration file —
it contains all topics, points_of_interest guidance, RSS feeds, podcast shows,
social settings, and source URLs. Hold it in context for the entire chain run.
Note:
- All topics and their modes (`active` / `passive`)
- All `points_of_interest` guidance per topic
- Sports topics and their `scores: true` / `followed_teams` settings
- `popular_now`, `in_the_noise`, `trending_sections`, `social`, and `podcasts.settings` sections

### 4. Load credentials (optional)
Read `config/credentials.json` if it exists.

Load `tmdb.api_key` and `tmdb.read_access_token` if present — these are
used by FETCH-ENTERTAINMENT for TMDB API calls.

If the file does not exist, TMDB-sourced entertainment data will fall
back to web search.

### 5. Preflight check
Before any stage begins, run these checks:

**Config integrity:**
For each topic in `config/config.json` under `topics`:
- Verify `category` field is present and non-empty.
- Verify `mode` is either `active` or `passive`.
- If either is missing: **stop**. Do not proceed to FETCH-NEWS. Surface:
  ```
  Preflight failed: topic "[topic name]" is missing its category or mode.
  Fix config/config.json before running the digest.
  ```

**Non-blocking config warnings (collect all, do not stop the run):**
After the hard-stop check above, scan for advisory issues:
- If any topic has `scores: true` and neither `scores_url` (string) nor `scores_urls` (object) is present →
  note: _Advisory: "[topic name]" has scores enabled but no scores endpoint configured — scores will fall back to web search._

Collect all advisory notes into working context. WRITE will append them as a
footer note at the bottom of the digest. They do not block or delay the run.

### 6. Check for existing digest and determine run mode

Look for `digests/YYYY-MM-DD/digest.md`.

**Path A — No digest exists.**
Set `run_mode = initial`. The context variables `seen_url_list` and
`id_sequence_floor` are empty. Proceed to Step 7.

**Path B — A digest exists.**
Read the `# Last run:` line from `digests/YYYY-MM-DD/digest-index.md`
(third header line) to find when the last run occurred. Then present
the user with three options:

```
A digest already exists for today (last run: [timestamp]).

What would you like to do?

  1. Read existing (default) — no fetches, just show today's digest
  2. Refresh — fetch only what's new since this morning
  3. Full re-run — discard today's digest and rebuild from scratch

Reply with 1, 2, 3, or "read" / "refresh" / "re-run".
```

If the user says nothing, presses enter, or gives an ambiguous
affirmation, default to option 1.

**Path B1 — Read existing (option 1).**
Read `digests/YYYY-MM-DD/digest.md` and display it to the user.
Stop. Do not continue the chain.

**Path B2 — Refresh (option 2).**
Set `run_mode = refresh`. Then seed two context variables:

1. Read `digests/YYYY-MM-DD/digest-index.md` in full.
2. Extract every URL from the URL column into **`seen_url_list`** —
   a flat list of strings. Every URL that was surfaced this morning
   goes here. **Normalize each URL before storing** using the rules
   defined in FILTER.md Rule 0 (apply in the same order). The
   normalized URL is what goes into `seen_url_list`.

   Example:
   ```
   seen_url_list = [
     "https://www.espn.com/mma/story/_/id/39271045",
     "https://www.bbc.com/sport/formula1/articles/c1234567890",
     ...
   ]
   ```
3. For each category prefix that appears in the index (SPRT, TECH, SEC,
   and fixed prefixes POP, NOISE, SKY, YT, POD), find the highest
   sequence number and store as **`id_sequence_floor`**. Example:
   ```
   id_sequence_floor = { SPRT: 5, TECH: 4, POD: 2, SKY: 3, POP: 5, ... }
   ```
   Any category not present in the index starts at 0 (first new story
   gets sequence 01).

Both variables live in working context for the duration of this chain
run. No files are written. Proceed to Step 7, then continue the full
chain. FETCH-NEWS will use `id_sequence_floor` to continue ID sequences.
FILTER will use `seen_url_list` to filter already-seen stories.
WRITE will detect `run_mode = refresh` and write output accordingly.

**Path B3 — Full re-run (option 3).**
Issue this warning before proceeding:

```
Warning: A full re-run will overwrite digest.md and digest-index.md
entirely. Any deep-dive files already written today will still exist
on disk, but their IDs may no longer match the new index. Continue? (yes / no)
```

If confirmed: set `run_mode = full_rerun`. Do not populate
`seen_url_list` or `id_sequence_floor`. Proceed to Step 7 and run
the full chain as a fresh initial run, overwriting the existing files
in WRITE.

If not confirmed: abort. Tell the user the existing digest is
unchanged.

### 7. Initialise the story registry
Create a mental working list called the **story registry**. This is the
running collection of fetched stories that all subsequent stages read and
write to. It starts empty.

Each story in the registry has:
```
id:        e.g. SPRT-01
title:     headline text
url:       article URL (what the reader clicks to open the full story)
outlet:    human-readable outlet or platform name
           e.g. "ESPN", "The Athletic", "Deadline", "web_search"
source:    datasource URL actually fetched to obtain this entry
           e.g. "https://site.api.espn.com/apis/site/v2/sports/..." (API),
                "https://feeds.feedburner.com/TheAthletic" (RSS),
                "web_search" if no direct URL applies
snippet:   1–2 sentence summary from the search result
topic:     which topic entry it came from
mode:      active or passive
published: approximate time if available
```

Note on naming: `outlet` is the readable name; `source` is the provenance URL.
`type` (content category: news | entertainment | podcast | social-*) and
`source_type` (editorial | api — deep-dive hint) are set by individual
stages that need them, not part of the base schema.

## Output
Proceed to the next stage in the chain.
