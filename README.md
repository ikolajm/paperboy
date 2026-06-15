# Paperboy

A configurable personal news dashboard. Point it at the feeds, shows, and topics
*you* follow; it builds one digest a day and renders it in a clean tabbed
dashboard you can read in a couple of minutes.

Paperboy aggregates news, sports scores, entertainment, and podcasts into a
single JSON file each morning, then renders it with sport-specific detail views,
poster galleries, layered filtering, and on-demand AI deep dives.

It's built to be cloned and made your own — every feed, topic, show, and score
endpoint lives in one config file.

---

## How It Works

A TypeScript pipeline fetches RSS feeds, ESPN scores, and TMDB data in parallel,
applies filtering and cross-topic dedup, and writes one JSON file per day. The
Next.js dashboard reads that file at request time. No server process runs between
invocations — the pipeline is a script you run (by hand or on a cron), and the
dashboard is a thin reader over its output.

```bash
npm run digest    # build today's digest
npm run dev       # start the dashboard
```

---

## Quick Start

### 1. Node version

Paperboy uses Node 24 (pinned in `.nvmrc`):

```bash
nvm use
```

### 2. Install

```bash
npm install && npm --prefix frontend install
```

### 3. Credentials (all optional)

The pipeline runs with **no credentials at all** — sections that need a key are
simply skipped with a logged warning. Add the keys for the features you want:

```bash
cp config/credentials.example.json config/credentials.json   # gitignored
```

| Key | Unlocks | Without it |
|-----|---------|------------|
| `tmdb` | Entertainment section (movies, TV, streaming) + ENT deep dives | Entertainment is skipped |
| `gemini` | On-demand deep-dive synthesis (news / podcast / entertainment) | The "Deep dive" button errors when clicked; everything else works |
| `omdb` | Cross-platform critic scores (IMDb / Rotten Tomatoes / Metacritic) on ENT deep dives | ENT dives fall back to TMDB's own score |

`credentials.example.json` documents where to get each key. The Gemini key can
also be supplied via the `GEMINI_API_KEY` environment variable.

### 4. First run

```bash
npm run digest    # ~2–3s, or ~30s with TMDB enrichment
npm run dev       # dashboard at http://localhost:3000
```

---

## Make It Yours

Everything Paperboy fetches is declared in `config/config.json` — there's no code
to touch to change what shows up. The sections:

| Section | What it controls |
|---------|------------------|
| `popular_today` | The headline feeds (top stories, world, nation) |
| `local_news` | Location-specific Google News feeds |
| `topics` | Your tracked interests — RSS feeds for story collection |
| `podcasts` | Shows you follow, with feeds + release schedules |
| `opinions` | Opinion/editorial feeds |
| `scores` | Team-sport scoreboard endpoints + display toggles |
| `entertainment` | TMDB settings for movies + streaming |

Swap in your own feeds, drop the ones you don't read, add the teams and shows you
care about. See [`config/CONFIG-REFERENCE.md`](config/CONFIG-REFERENCE.md) for a
field-by-field guide with examples.

---

## The Dashboard

Three tabs: **News**, **Media**, **Scores**.

**News** — Two-tier filtering. Pick a category (Headlines, Topics, Sports,
Opinions), then narrow with contextual sub-filters. Cross-topic deduplication
keeps the same story from appearing twice.

**Media** — Podcasts as list rows with action links. Movies, streaming, and
upcoming releases as horizontal poster galleries with detail overlays showing
genres, scores, and watch-provider logos.

**Scores** — Recaps and Schedule sub-tabs with per-sport filters. Game cards
expand to show linescores, stat leaders, and series info, with full game-detail
pages and conference standings. Sport-specific rendering for MLB pitchers and
NBA/NHL scoring breakdowns.

---

## Deep Dives

Any news story, podcast, or entertainment title with a **Deep dive** button
generates a full-page, AI-synthesized read on demand:

- **News** — fetches the full article and its related coverage, then synthesizes
  a clean recap (summary, key points, full story, other coverage, context).
- **Podcast** — uses the published transcript when one exists; otherwise writes an
  honest "listening guide" from the show notes (no fabricated quotes).
- **Entertainment** — a spoiler-free "should I watch this?" built from TMDB +
  OMDb data: scores, where to watch, the pitch, who made it, and reception.

Generation runs one Gemini call (`gemini-2.5-flash`), is always explicit (a
button — never auto-fires on navigate), and writes a markdown file to
`digests/YYYY-MM-DD/deep-dives/` that the page reads back. Because it writes to
disk, deep dives are a **local-only** feature (see below).

---

## Known Limitations

- **Local-only deep dives.** Deep-dive generation writes markdown files to disk,
  so it works when you run Paperboy locally. A hosted serverless deploy (ephemeral
  filesystem) would need a different storage backend; the rest of the dashboard
  deploys fine as a static read over a committed digest.
- **Individual-athlete sports aren't included.** Scores cover team sports
  (NBA / NHL / MLB / NFL / college). UFC and F1 sit outside scope by design:
  ESPN's scoreboard doesn't package them cleanly — no historical date queries for
  past UFC events, and F1 would need a hand-maintained driver/circuit roster that
  goes stale. Adding a sport is a `scores` config entry plus a parser in
  `scripts/scores/`; the team-sport modules there are the pattern to copy.
- **Some articles can't be fetched.** Roughly a third of news sources sit behind
  hard paywalls or bot-walls (NYT, Reuters, etc.). Deep dives fail soft on those —
  they fall back to the digest snippet and tell the model not to invent the
  missing body, so a blocked source degrades the recap rather than breaking it.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [config/CONFIG-REFERENCE.md](config/CONFIG-REFERENCE.md) | Field-by-field config guide |
| [CLAUDE.md](CLAUDE.md) | Operational reference for working in this codebase |
| [docs/DEFERRED.md](docs/DEFERRED.md) | What was deferred from V1 and why |
