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

```bash
npm install && npm --prefix frontend install
```

The pipeline needs a TMDB API key in `config/credentials.json` (gitignored).
See `config/CONFIG-REFERENCE.md` for details.

All feed configuration lives in `config/config.json` — topics, scores
endpoints, podcast shows, entertainment settings, and opinion feeds.

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

- **Deep dive** — `"Go deeper on SPRT-01"` — writes analysis to `digests/YYYY-MM-DD/deep-dives/`
- **Flash check** — `"Quick check my feeds"` — inline output, no files written

---

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Operational reference for working in this codebase |
| [config/CONFIG-REFERENCE.md](config/CONFIG-REFERENCE.md) | Field-by-field config guide |
| [docs/DEFERRED.md](docs/DEFERRED.md) | What was deferred from V1 and why |
