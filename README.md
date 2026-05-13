# Paperboy

A personal daily news digest with a React dashboard.

Paperboy aggregates news, sports scores, entertainment, and podcasts into a
single JSON file each day, then renders it in a tabbed dashboard with
sport-specific detail views, poster galleries, and layered filtering.

---

## How It Works

A TypeScript pipeline fetches RSS feeds, ESPN scores, and TMDB data in
parallel, applies filtering and dedup, and writes one JSON file per day.
The Next.js dashboard reads that file at request time. No server process
runs between invocations.

```bash
npm run digest            # Run today's pipeline
npm run dev               # Start the dashboard
```

---

## Setup

### 1. Node version

This project uses Node 24 (pinned in `.nvmrc`). With nvm:

```bash
nvm use
```

### 2. Install dependencies

```bash
npm install && npm --prefix frontend install
```

### 3. TMDB credentials (optional)

The pipeline runs without TMDB credentials — entertainment data is simply
skipped and a warning is logged. For full output:

```bash
cp config/credentials.example.json config/credentials.json
```

Then fill in your TMDB v3 API key (get one at
[themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)).
`config/credentials.json` is gitignored.

### 4. First run

```bash
npm run digest    # Build today's digest (~2-3s, or ~30s with TMDB enrichment)
npm run dev       # Start the dashboard at http://localhost:3000
```

All feed configuration lives in `config/config.json` — topics, scores
endpoints, podcast shows, entertainment settings, and opinion feeds. See
`config/CONFIG-REFERENCE.md` for the field reference.

---

## The Dashboard

Three tabs: **News**, **Media**, **Scores**.

**News** — Two-tier filtering. Pick a category (Headlines, Topics, Sports,
Opinions), then narrow with contextual sub-filters. Cross-topic deduplication
keeps the same story from appearing twice.

**Media** — Podcasts as list rows with action links. Movies, streaming, and
upcoming releases as horizontal poster galleries with detail overlays showing
genres, scores, and watch provider logos.

**Scores** — Recaps and Schedule sub-tabs with per-sport filters. Game cards
expand to show linescores, stat leaders, and series info. Full game detail
pages with box scores. Sport-specific rendering for MLB pitchers, F1 session
cards, UFC fight stats, and NBA/NHL scoring breakdowns. Conference standings.

---

## On-Demand Features

These are agent-driven (require Claude Code), not part of the automated pipeline.

- **News deep dive** — `"Go deeper on SPRT-01"` — fetches the full article, runs cross-references, writes a structured markdown file to `digests/YYYY-MM-DD/deep-dives/`
- **Podcast deep dive** — `"Transcript for POD-01"` — locates a transcript (or builds a listening guide from show notes), writes to `digests/YYYY-MM-DD/deep-dives/`

---

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Operational reference for working in this codebase |
| [config/CONFIG-REFERENCE.md](config/CONFIG-REFERENCE.md) | Field-by-field config guide |
| [docs/DEFERRED.md](docs/DEFERRED.md) | What was deferred from V1 and why |
