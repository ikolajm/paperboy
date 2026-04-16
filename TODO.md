# Paperboy — TODO

---

## Backend Migration (Active)

### Phase 0: Foundation — DONE
- [x] Root `package.json` with `tsx`, `fast-xml-parser`, `@types/node`
- [x] `tsconfig.scripts.json` for Node-targeted script compilation
- [x] `shared/types/digest.ts` — canonical Digest interfaces
- [x] `shared/types/config.ts` — typed PaperboyConfig interface (v3)
- [ ] Frontend tsconfig path alias for `@shared/*` (deferred until frontend work begins)

### Phase 1: Port Python Scripts to TypeScript
- [x] `scripts/normalize-url.ts` — URL normalization (Node `URL` class)
- [x] `scripts/fetch-rss.ts` — RSS batch fetch (`fast-xml-parser`, `Promise.all`)
- [x] `scripts/fetch-tmdb.ts` — TMDB API fetch (native `fetch`, `Promise.all`)
- [x] `scripts/fetch-scores.ts` — per-sport modules (NBA, NHL, MLB, NFL, College Basketball, College Football)
- [ ] `scripts/check-endpoints.ts` — health check (deferred — diagnostic tool, not blocking v1)
- [x] Validated fetch-rss against ESPN, Google News subsections, podcasts, opinions
- [x] Validated fetch-tmdb against all 5 TMDB endpoints with dedup
- [x] Removed ported Python scripts (normalize_url.py, fetch_rss.py, fetch_tmdb.py)

### Config Simplification — DONE (v3)
- [x] Separated scores from topics (own section with per-sport toggles)
- [x] Dropped `points_of_interest`, `search_terms`, `standings_url`, `news_url`
- [x] Dropped Category Trending, In the Noise, Google Trends
- [x] Dropped `exclude_patterns` (TMDB-only, no filtering needed)
- [x] Google News subsection feeds for non-sports topics (AI, Cybersecurity, Science, Health)
- [x] ESPN RSS for all sports topics
- [x] `popular_today` replaces `popular_now` (3 subsections: top_stories, world, nation)
- [x] Added opinions section (NYT, Guardian)
- [x] Added new topics: Cybersecurity, Science, Health, NFL
- [x] Renamed MMA → Combat Sports, split College Sports into Basketball/Football
- [x] Config reference doc updated to match

### Phase 2: Digest Orchestrator — DONE
- [x] `scripts/run-digest.ts` — entry point (config load, file write)
- [x] `scripts/digest/pipeline.ts` — orchestrates fetch → filter → assemble
- [x] `scripts/digest/feeds.ts` — builds RSS batch config from config.json
- [x] `scripts/digest/filter.ts` — URL dedup (with shared DedupPool), staleness, quality floor
- [x] `scripts/digest/ids.ts` — sequential ID assignment per category
- [x] `scripts/digest/assemble-popular.ts` — popular_today + local sections
- [x] `scripts/digest/assemble-topics.ts` — for_you + on_your_radar with cross-topic dedup
- [x] `scripts/digest/assemble-podcasts.ts` — schedule filtering + freshness windows
- [x] `scripts/digest/assemble-opinions.ts` — opinion entry building
- [x] `scripts/digest/assemble-entertainment.ts` — TMDB → movies + streaming
- [x] Validated: 78 stories, 1.4s, correct cross-section dedup behavior

---

## Outstanding Issues

- [ ] **College baseball scores volume** — ESPN returns 20+ games. Filter to: ranked teams, conference tournament/CWS, or `followed_teams` only.
- [ ] **Podcast transcript availability** — only Lex Fridman and The Daily have `transcript_page`.
- [ ] **Score table length** — NHL/MLB can have many games. Dashboard will need collapsible sections.
- [ ] **Script documentation** — add `--help` flag and usage docs to each TS script.

---

## Context File Retirement (After Phase 2 validated)

- [ ] Move daily-chain files to `docs/legacy-chain/`
- [ ] Keep on-demand stages active: DEEP-DIVE-NEWS, DEEP-DIVE-PODCAST, FLASH-CHECK
- [ ] Update CONTEXT.md and CLAUDE.md to reflect new architecture

---

## Dashboard (Deferred — waiting on stable JSON + screen design)

### Data Layer
- [ ] Rewrite `frontend/src/lib/content.ts` to read `digest.json`
- [ ] API route: `GET /api/digest` (latest or by date)
- [ ] API route: `GET /api/digest/dates` (available dates)
- [ ] API route: `GET /api/deep-dive/[id]` (deep-dive markdown → JSON)
- [ ] Frontend types re-exported from `@shared/types/digest`

### Layout & Shell
- [ ] Root layout: dark/light toggle, sidebar nav, date picker, story count badge
- [ ] Main digest page: server-side data fetch, section rendering, fallback state

### Section Components
- [ ] `DigestHeader` — date, story count, run mode, last run
- [ ] `TopicSection` — reusable for For You + On Your Radar
- [ ] `StoryCard` — headline, snippet, source, trending flag, deep-dive button
- [ ] `ScoresTable` — sport headers, game rows, status badges
- [ ] `UpcomingGames` — matchup, time, broadcast, odds, watch priority
- [ ] `EntertainmentSection` — In Theatres + Streaming Buzz
- [ ] `PodcastSection` — show, episode, duration, links
- [ ] `PopularToday` — three subsections (top stories, world, nation)
- [ ] `LocalNews` — location-grouped stories
- [ ] `OpinionSection` — editorial/opinion entries
- [ ] `DeepDiveList` — links to completed deep dives

### Deep Dive Page
- [ ] `/deep-dive/[id]/page.tsx` with markdown rendering
- [ ] Back link to digest

### Navigation & History
- [ ] Date picker from available dates
- [ ] Previous/next day arrows
- [ ] URL structure: `/?date=YYYY-MM-DD`

### Polish
- [ ] Collapsible sections (scores default collapsed if >8 games)
- [ ] Category filter toggles
- [ ] Search/filter within digest
- [ ] Auto-refresh on digest.json changes
- [ ] Responsive layout
- [ ] Watch priority visual highlighting

### Live Scores (Optional)
- [ ] Sidebar widget calling scores API directly
- [ ] Auto-refresh during game hours
- [ ] Live/final/upcoming indicators

---

## On-Demand Features (Remain Agent-Driven)

- Deep dives: "Go deeper on [ID]" → DEEP-DIVE-NEWS
- Podcast transcripts: "Transcript for [POD-ID]" → DEEP-DIVE-PODCAST
- Flash checks: "Quick check my feeds" / "Live scores" → FLASH-CHECK
