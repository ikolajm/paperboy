# Paperboy — CLAUDE.md

## What This Is
A script-driven daily news digest with a React dashboard (in development).
The digest pipeline runs as a single TypeScript command, fetching RSS feeds,
sports scores, and entertainment data in parallel, then writing structured JSON.

All configuration lives in `config/config.json` (v3).
`config/credentials.json` (gitignored) holds TMDB API credentials.
See `config/CONFIG-REFERENCE.md` for field-by-field documentation.

---

## Entry Points

### 1. Daily Digest
```
npx tsx scripts/run-digest.ts [--date YYYY-MM-DD]
```
Fetches all data sources in parallel (~2 seconds), applies filtering and dedup,
writes `digests/YYYY-MM-DD/digest.json`.

### 2. News Deep Dive (on demand, agent-driven)
> "Go deeper on SPRT-01"
> "Deep dive on TECH-03"

Reads `context/DEEP-DIVE-NEWS.md`. Writes to `digests/YYYY-MM-DD/deep-dives/[ID].md`.

### 3. Podcast Deep Dive (on demand, agent-driven)
> "Transcript for POD-01"
> "Go deeper on POD-02"

Reads `context/DEEP-DIVE-PODCAST.md`. Writes to `digests/YYYY-MM-DD/deep-dives/[ID].md`.

### 4. Flash Check (on demand, agent-driven)
> "Quick check my feeds"
> "Live NBA scores"
> "What's going on with [topic]"

Reads `context/FLASH-CHECK.md`. No files written — output is inline.

---

## Output Structure

```
digests/
└── YYYY-MM-DD/
    ├── digest.json             ← Primary output (dashboard consumes this)
    └── deep-dives/
        ├── SPRT-01.md          ← News deep dive, written on demand
        └── POD-02.md           ← Podcast deep dive, written on demand
```

---

## Project Structure

```
config/                 Config files (config.json, credentials.json, CONFIG-REFERENCE.md)
scripts/                TypeScript pipeline scripts
  run-digest.ts         Entry point — runs the full pipeline
  digest/               Pipeline modules (feeds, filter, assemble-*)
  scores/               Per-sport score modules (nba, nhl, mlb, nfl, college-*)
  fetch-rss.ts          RSS batch fetching
  fetch-tmdb.ts         TMDB entertainment fetching
  fetch-scores.ts       Scores orchestrator
  normalize-url.ts      URL normalization for dedup
shared/types/           TypeScript interfaces (digest.ts, config.ts)
frontend/               Next.js 16 + React 19 dashboard (in development)
context/                Agent-driven on-demand stages
docs/                   Feature docs, legacy chain archive
```

---

## ID Prefixes

Declared via `"category"` in `config/config.json`. Topics sharing a category
share one ID sequence per day.

| Prefix | Category |
|--------|----------|
| `SPRT` | Sports (Combat Sports, F1, NBA, NHL, MLB, NFL, College Basketball, College Football) |
| `TECH` | Technology (AI, Cybersecurity) |
| `POL` | Politics (US Politics) |
| `SCI` | Science |
| `HLTH` | Health |
| `ENT` | Entertainment (movies, streaming — from TMDB) |
| `POP` | Popular Today + Local News |
| `POD` | Podcasts |
| `OPN` | Opinions |

---

## Key Principles
- **Script-first pipeline.** The daily digest runs as `npx tsx scripts/run-digest.ts`.
  No agent involvement. Agent is reserved for on-demand deep dives and flash checks.
- **JSON-first output.** `digest.json` is the primary artifact. The dashboard consumes it.
- **One config file.** `config/config.json` holds topics, scores endpoints, podcast shows,
  popular feeds, local news, entertainment, and opinions. Edit it directly.
- **IDs are date-scoped.** SPRT-01 today ≠ SPRT-01 tomorrow.
- **Scores are separate from stories.** Scores come from ESPN scoreboard API with rich
  per-sport data (linescores, leaders, headlines). Stories come from RSS feeds.
- **Cross-topic dedup, cross-section independence.** The same story won't appear in both
  AI and Cybersecurity, but can appear in both Popular Today and a topic section.
- **ESPN RSS for sports, Google News subsections for non-sports.** Each feed type is
  editorially curated — no keyword search noise.
