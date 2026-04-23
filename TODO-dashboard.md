# Dashboard TODO

Status as of 2026-04-22. Checked items are done. Unchecked items are next.

---

## Done

- [x] Next.js app in `frontend/` with App Router, TypeScript, Tailwind v4
- [x] Root convenience scripts (`npm run dev`, `npm run build` delegate to frontend)
- [x] `turbopack.root` set in `next.config.ts` (resolves dual-lockfile issue)
- [x] Digest path resolves from repo root via `__dirname` (no fragile `../digests`)
- [x] `@shared/*` tsconfig alias — all type imports use `@shared/types/digest`
- [x] Data-access layer (`src/lib/digest.ts`): getLatestDigest, getDigest, getDeepDive, getDigestDates
- [x] Shared types re-exported in `src/types/`
- [x] Design token system (`tokens.css`): 200+ CSS variables, dark/light themes
- [x] Theme provider with light/dark/system + localStorage persistence
- [x] 43 atom components with CVA variants
- [x] Layout shell: DigestShell, DigestSidebar, DigestTopBar
- [x] NewsFeed with "All" + additive category filter chips
- [x] ScoreboardPanel: Recaps/Schedule/Live tabs wired to real data
- [x] StoryCard, TopicSection, PopularTodaySection, PodcastSection, EntertainmentSection, OpinionsSection, LocalNewsSection
- [x] GameCard, ScheduledGameCard, UFCRecapCard, F1RecapCard
- [x] Date navigation: URL-based `/?date=`, prev/next arrows, sidebar selection
- [x] Deep dive route `/deep-dive/[date]/[id]` with markdown rendering
- [x] Deep dive links wired into StoryCard, PodcastCard, EntertainmentCard

---

## Phase 6: Data Enrichment (by source)

The pipeline extracts the minimum from each source. This phase adds the fields
that would make the dashboard feel complete. Each source is independent — they
can be tackled in any order.

### 6.1 — Google News RSS (Popular Today, Local, Opinions)

**Current state:** Title, redirect URL, empty snippet, source name.
**Files:** `scripts/fetch-rss.ts`, `scripts/digest/assemble-popular.ts`,
`scripts/digest/assemble-opinions.ts`

**Key discovery:** Google News `<description>` is NOT a snippet — it's an
`<ol>` of 3–5 related articles from different outlets, each with their own
headline, Google News redirect URL, and outlet name. No thumbnails or
article preview text exist in the RSS. The `<source url="">` attribute
provides the primary outlet's domain.

```
Google News RSS <item>
├── <title>        → headline (with " - Outlet" suffix)
├── <link>         → Google News redirect URL
├── <source url="https://theguardian.com">  → outlet domain
├── <pubDate>      → publish time
└── <description>  → HTML <ol> of related coverage:
    ├── <li><a href="redirect">Headline A</a> <font>Outlet A</font></li>
    ├── <li><a href="redirect">Headline B</a> <font>Outlet B</font></li>
    └── ... (3–5 items)
```

#### Pipeline changes (fetch-rss.ts)

- [ ] **6.1.1 — Parse related articles from `<description>` HTML**
  Extract each `<li>` into `{ headline, url, outlet }`. Add a new type
  `RelatedArticle` and store as `related_articles?: RelatedArticle[]`
  on `RssEntry`. Only applies when `google_news_redirect` is true —
  non-Google feeds still use `truncateToSentences` for real snippets.

- [ ] **6.1.2 — Capture `<source url="">` attribute as `source_url`**
  Google News includes the outlet's real domain in `<source url="...">`.
  Add `source_url?: string` to `RssEntry`. Enables outlet favicons on
  the dashboard and gives deep dives a starting point for the real article.

#### Type & assembly changes

- [ ] **6.1.3 — Add `RelatedArticle` type to `shared/types/digest.ts`**
  `{ headline: string; url: string; outlet: string }`.
  Add `related_articles?: RelatedArticle[]` to `PopularStory`,
  `LocalStory`, and `OpinionEntry`.

- [ ] **6.1.4 — Add `source_url` to `PopularStory`, `LocalStory`, `OpinionEntry`**
  Thread `source_url` from `RssEntry` through assembly scripts.

- [ ] **6.1.5 — Add `date` to `PopularStory` and `OpinionEntry`**
  `RssEntry` has the date but assembly scripts drop it. Add `date?: string`
  so the dashboard can show relative time ("2h ago").

#### Dashboard changes

- [ ] **6.1.6 — Show "Also covered by" row in StoryCard**
  When `related_articles` exists, render outlet names below the headline.
  Optional: outlet favicon via `google.com/s2/favicons?domain=...`.
  Article count doubles as an importance signal (5 outlets = major story).

- [ ] **6.1.7 — Show relative time on stories that have `date`**
  Add `formatTimeAgo` utility. Display next to source label.

#### Media identity & bias (deferred to Phase 9)

#### Deep dive payoff

- [ ] **6.1.10 — Use `related_articles` in deep dive pipeline**
  Update `DEEP-DIVE-NEWS.md` instructions: when related articles exist,
  skip the Tier 2 search step — fetch all related URLs directly in parallel.
  Tier 3 cross-referencing becomes automatic since we already have each
  outlet's headline + URL. This enables fully scripted deep dives without
  agent-driven web search.

### 6.2 — ESPN RSS Feeds (Sports topics in For You / On Your Radar)

**Current state:** Title, direct ESPN URL, real 1-2 sentence snippet,
author-as-source, date. Cleanest data we get — no redirect URLs, no HTML
description junk.
**Files:** `scripts/fetch-rss.ts`, `scripts/digest/assemble-topics.ts`

Note: Non-sports topics (Politics, AI, Cybersecurity, Science, Health) use
Google News topic feeds — identical structure to Popular Today. All 6.1
items (related articles, source_url, bias) apply to those feeds too.

- [ ] **6.2.1 — Separate author from source**
  ESPN RSS puts the author in `dc:creator` (e.g. "Jamal Collier"). We
  store it as `source`, but it's really the author — the outlet is always
  "ESPN". Add `author?: string` to `RssEntry` and `Story`. When
  `dc:creator` is present AND the feed URL is `espn.com`, set
  `source = "ESPN"` and `author = dc:creator`.

- [ ] **6.2.2 — ESPN feeds have no images**
  Confirmed: no `<media:content>` or `<enclosure>` in ESPN RSS. If we
  want article thumbnails for sports stories, we'd need to fetch the
  ESPN article page and scrape `<og:image>`. Consider as a low-priority
  enhancement — the direct URL at least lets us link out cleanly.

- [ ] **6.2.3 — Populate `calendar_event` in TopicSection**
  The field exists in the type but is always `null`. Add a `calendar`
  section to topic config (e.g. `"NBA": [{ "label": "NBA Draft",
  "date": "2026-06-25" }]`). Populate during assembly by checking
  upcoming events within N days.

- [ ] **6.2.4 — Populate `cross_refs` in TopicSection**
  Also always empty. During assembly, scan podcast entries for title
  keywords matching the topic name. If a match is found, add a cross-ref
  linking the podcast to the topic section.

### 6.3 — Podcasts

**Current state:** Show name, episode title, duration, 2-sentence snippet,
episode page URL. Richest raw source — RSS has full HTML descriptions,
artwork at both show and episode level, audio URLs, curated summaries.
**Files:** `scripts/fetch-rss.ts`, `scripts/digest/assemble-podcasts.ts`
**Source schema:** `shared/types/sources/podcast-rss.ts`

Config already has per-show `youtube_channel` and `transcript_page` for
some shows. YouTube links do NOT appear in RSS episode descriptions —
they'd need to be constructed from `youtube_channel` or omitted.

#### Pipeline changes (fetch-rss.ts + assemble-podcasts.ts)

- [ ] **6.3.1 — Extract episode artwork**
  RSS provides `<itunes:image href="...">` per episode (high-res) and
  `<media:thumbnail url="...">` (smaller, ~1280x720). Fallback to
  channel-level `<itunes:image>` (show art) if episode art is missing.
  Add `image_url?: string` to `RssEntry`. Store on `PodcastEntry`.

- [ ] **6.3.2 — Use `itunes:summary` instead of truncated description**
  We currently truncate the full HTML `<description>` to 2 sentences.
  But `<itunes:summary>` already provides a curated short summary
  (typically < 200 chars). Use it when available — better quality than
  mechanical truncation. Fallback to `<itunes:subtitle>` → truncated
  `<description>`.

- [ ] **6.3.3 — Thread `transcript_page` from config to PodcastEntry**
  Config has `transcript_page` per show (e.g. nytimes.com/column/the-daily).
  Pass through to `PodcastEntry` as `transcript_url?: string` so the
  dashboard can show a direct "Read transcript" link. This is the show's
  transcript page, not per-episode — but still useful.

- [ ] **6.3.4 — Thread `youtube_channel` from config to PodcastEntry**
  Config has `youtube_channel` per show. Pass through as
  `youtube_url?: string`. This links to the show's YouTube channel,
  not a specific episode. Per-episode YouTube URLs aren't available
  in RSS and would require YouTube API search to resolve.

- [ ] **6.3.5 — Extract audio URL from `<enclosure>`**
  RSS provides `<enclosure url="..." type="audio/mpeg">` — the direct
  MP3 link. Store as `audio_url?: string` on `PodcastEntry`. Enables
  an inline audio player on the dashboard in the future.

#### Type changes

- [ ] **6.3.6 — Extend `PodcastEntry` in `shared/types/digest.ts`**
  Add: `image_url?: string`, `transcript_url?: string`,
  `youtube_url?: string`, `audio_url?: string`.

#### Dashboard changes

- [ ] **6.3.7 — PodcastCard: show artwork, YouTube link, transcript link**
  Display episode/show artwork. Add YouTube and transcript action buttons
  when URLs are present. Better snippet from itunes:summary.

### 6.4 — Entertainment (TMDB)

**Current state:** Title, 200-char overview, vote_average, release/air date.
No images, no genres, no runtime.
**Files:** `scripts/fetch-tmdb.ts`, `scripts/digest/assemble-entertainment.ts`
**Source schema:** `shared/types/sources/tmdb.ts`

TMDB list endpoints already return `poster_path`, `backdrop_path`, and
`genre_ids[]` — we just don't extract them. Genre ID → name mapping is
in the source schema file. Poster URLs are trivial: prepend
`https://image.tmdb.org/t/p/w342`. Runtime requires a per-item detail
API call (not in list responses).

#### Pipeline changes (fetch-tmdb.ts + assemble-entertainment.ts)

- [ ] **6.4.1 — Extract poster image**
  `poster_path` is already in the list response. Prepend the TMDB image
  base URL (`https://image.tmdb.org/t/p/w342`) and store as `poster_url`
  on `MovieEntry` / `StreamingEntry`. No additional API call needed.

- [ ] **6.4.2 — Extract genres**
  `genre_ids[]` is already in the list response. Map through the static
  `TMDB_GENRES` lookup in `shared/types/sources/tmdb.ts`. Store as
  `genres?: string[]` on `MovieEntry` / `StreamingEntry`. No additional
  API call needed.

- [ ] **6.4.3 — Extract vote_count alongside vote_average**
  `vote_count` is already in the list response. A 7.0 with 10,000 votes
  means more than a 7.0 with 50 votes. Store as `vote_count?: number`.
  No additional API call needed.

- [ ] **6.4.4 — Extend overview truncation**
  Currently hard-capped at 200 chars in assembly. Raise to 350 or remove
  the cap entirely — the dashboard's `line-clamp-2` handles display
  truncation. Let the data carry the full overview.

- [ ] **6.4.5 — Extract runtime (low priority)**
  Not available in list endpoints. Would require one `/movie/{id}` or
  `/tv/{id}` detail call per item (~10 items = 10 API calls). Consider
  batching or caching. Store as `runtime?: string` ("2h 15m" / "8 eps").
  **Skip unless we find the extra calls worth it.**

#### Type changes

- [ ] **6.4.6 — Extend `MovieEntry` and `StreamingEntry` in digest.ts**
  Add: `poster_url?: string`, `genres?: string[]`, `vote_count?: number`.

#### Dashboard changes

- [ ] **6.4.7 — MediaCard: show poster, genre badges, vote count**
  Display poster image to the left of the text content. Render genres as
  small badges below the title. Show vote_count as a credibility indicator
  next to the score badge.

### 6.5 — Local News

**Current state:** Same Google News RSS pipeline — empty snippets, redirect
URLs, no images. Inherits all limitations from 6.1.
**Files:** `scripts/digest/assemble-local.ts`
**Source schema:** `shared/types/sources/google-news.ts` (same source)

Local feeds are Google News search feeds (`/rss/search?q=...`), which
give a SINGLE `<a>` in `<description>` (no related articles `<ol>`).
So `related_articles` extraction (6.1.1) won't help here — but
`source_url` (6.1.2) and `date` (6.1.5) will.

- [ ] **6.5.1 — Thread `source_url` and `date` to `LocalStory`**
  Once 6.1.2 and 6.1.5 land on `RssEntry`, ensure `assemble-local.ts`
  passes them through. Add `source_url?: string` and `date?: string`
  to `LocalStory` type.

- [ ] **6.5.2 — Add `deep_dive_eligible` to `LocalStory`**
  Currently missing from the type. Set to `true` when the story has a
  URL. Enables deep dive links on local stories.

---

## Phase 7: Story Presentation Refresh

Update dashboard components to use enriched data. In progress.

### 7.1 — StoryCard (in progress)

- [x] Favicon from `source_url` via Google Favicons API (20px)
- [x] Political lean badge (colored pill: blue → purple → red)
- [x] Factual reporting badge (success/warning/error)
- [x] Relative time display (`formatTimeAgo`)
- [x] Author byline (ESPN stories)
- [x] Top row: ID badge + favicon + outlet + time ago
- [x] Related articles: preview row + expandable child rows with bias badges
- [x] Deep dive: "Read deep dive" vs "Generate deep dive" states
- [x] Headline is the link, removed redundant external link icon
- [x] `cardSize` / `contentSize` props for density control
- [ ] Fine-tune alignment, spacing, and visual hierarchy (manual pass)

### 7.2 — Deep dive flow (needs design)

The "Generate deep dive" action varies by section type and needs a thought-
through user flow before implementation.

- [ ] **7.2.1 — Define deep dive flows per section**
  News stories: fetch article + related articles → synthesize → write .md
  Podcasts: locate transcript → process → write .md
  Entertainment: fetch reviews + details → synthesize → write .md
  Each has different latency and data requirements.

- [ ] **7.2.2 — Generation UX**
  "Generate deep dive" currently shows as muted text — not actionable.
  Decide: does clicking it trigger a server action? Show a loading state?
  Open a confirmation dialog with estimated time? Queue it for the agent?
  The answer may depend on whether deep dives are fully scripted (Phase 6.1.10)
  or still agent-driven.

- [ ] **7.2.3 — Generated vs available indicator**
  Once generated, the button should update without a full page refresh.
  Consider: optimistic UI, polling, or server-sent events.

### 7.3 — PodcastCard

- [ ] Show episode artwork (`image_url`) — left-aligned thumbnail
- [ ] YouTube channel link when `youtube_url` present
- [ ] Transcript page link when `transcript_url` present
- [ ] Deep dive available/generate states (done in component, needs flow)

### 7.4 — MediaCard (entertainment)

- [ ] Show poster image (`poster_url`) — left-aligned thumbnail
- [ ] Genre badges row
- [ ] Vote count alongside score badge
- [ ] Deep dive available/generate states (done in component, needs flow)

### 7.5 — Layout & information hierarchy

- [ ] **7.5.1 — Section-appropriate layouts**
  Not every section should be a vertical card list. Consider:
  Entertainment → horizontal cards with poster images (grid or row)
  Opinions → compact list (less metadata, denser)
  Podcasts → horizontal cards with artwork
  Popular Today → current vertical list works well with related articles

- [ ] **7.5.2 — Card density presets**
  The `cardSize`/`contentSize` pattern works for now. If we need more
  granular control later, consolidate into a single `density` prop:
  `compact` | `default` | `relaxed` — each maps to coordinated sizes
  for card padding, badge size, text size, and icon size.

- [ ] **7.5.3 — Visual rhythm and section separation**
  With richer cards, sections need clearer visual breaks. Consider:
  section header styling, dividers, alternating card backgrounds,
  or grouped containers per section.

---

## Housekeeping

- [ ] **media-bias.json duplication** — `config/media-bias.json` is the source
  of truth but `frontend/src/lib/media-bias.json` is a copy because Turbopack
  can't resolve imports outside its root (`frontend/`). Investigate: symlink,
  build-time copy script, or Turbopack `resolveAlias` config to point at the
  real file. Keep one source of truth.

---

## Phase 8: Remaining Polish & Features

- [ ] **8.1** Responsive layout — mobile sidebar drawer, stacked cards
- [ ] **8.2** Auto-refresh — poll for digest changes (useful after running a digest)
- [ ] **8.3** Search/filter within digest by keyword
- [ ] **8.4** Live scores tab — call ESPN endpoints directly for in-progress games

---

## Phase 9: Visual Identity & Media Metadata

Static reference data and iconography to break up text-heavy layouts.
Stored in `config/` as JSON lookups, consumed by the dashboard.

### 9.1 — News outlet identity

- [x] **9.1.1 — Outlet icon/favicon lookup**
  Done. Using Google Favicons API at runtime — no static map needed.
  `getFaviconUrl(sourceUrl)` in `frontend/src/lib/media-bias.ts`.
  Works for any domain including tiny local outlets. Zero maintenance.

- [x] **9.1.2 — Media political bias chart**
  Done. `config/media-bias.json` — ~40 outlets mapped.
  `frontend/src/lib/media-bias.ts` — lookup utilities, lean color spectrum.
  Coverage: ~72% of primary stories, ~78% of related articles.
  National outlets are fully covered; gaps are local/regional stations.

- [ ] **9.1.3 — Bias map maintenance script**
  Create `scripts/audit-media-bias.ts` that:
  1. Scans all digest.json files for `source_url` domains and
     `related_articles[].outlet` names
  2. Checks each against `config/media-bias.json`
  3. Reports unmapped outlets sorted by frequency (most seen first)
  4. Optionally outputs a stub JSON block to copy-paste into the config
  Run periodically (weekly or after adding new feeds) to grow coverage.
  Local TV stations (W/K call letter prefixes) can be flagged separately
  since they generally don't carry a national political lean.

- [ ] **9.1.4 — Surface bias + icons in "Also covered by" row**
  Render outlet favicon + name + subtle bias indicator per related article.
  Visual signal: coverage spectrum (all left-leaning? spans the spectrum?).
  Graceful fallback: outlets without a bias mapping show favicon + name
  only — no color dot. No guessing.

### 9.2 — Podcast identity

- [ ] **9.2.1 — Show artwork in config**
  Config already has per-show `rss`, `youtube_channel`, `transcript_page`.
  Add `icon?: string` per show — either a URL to the show's artwork
  (from `itunes:image` at channel level) or a local path. Fetched once
  and cached, not on every digest run.

- [ ] **9.2.2 — Podcast network/platform icons**
  Apple Podcasts, Spotify, YouTube icons for linking out to the episode
  on different platforms. Static SVGs in `public/icons/`.

### 9.3 — Entertainment identity

- [ ] **9.3.1 — TMDB poster images (covered by 6.4.1)**
  Already planned — `poster_url` from TMDB API. This is the primary
  visual for entertainment cards.

- [ ] **9.3.2 — Streaming platform icons**
  Netflix, Hulu, Disney+, Prime Video, etc. Static SVGs in `public/icons/`.
  Useful if we can determine which platform a show is on (TMDB has
  `watch/providers` endpoint, or infer from the `on_the_air` endpoint).

### 9.4 — Sports identity

- [ ] **9.4.1 — Team logos (already in data)**
  ESPN CDN URLs are already in `TeamInfo.logo`. No work needed — just
  ensure the dashboard renders them well (already done in GameCard).

- [ ] **9.4.2 — League/sport icons**
  NBA, NHL, MLB, NFL, UFC, F1 logos as static SVGs in `public/icons/`.
  Use as section headers in the scoreboard.

---

## Data Shape Reference

```
digest.json
├── meta: { date, day_of_week, story_count, run_mode, last_run }
└── sections
    ├── popular_today: { top_stories[], world[], nation[] }
    ├── for_you: TopicSection[]
    ├── on_your_radar: TopicSection[]
    ├── scores
    │   ├── team_sports: { recaps: SportRecaps[], schedule: SportSchedule[] }
    │   ├── ufc: { recaps: UfcRecaps, schedule: UfcSchedule }
    │   └── f1: { recaps: F1Recaps, schedule: F1Schedule }
    ├── entertainment: { movies[], streaming[] }
    ├── podcasts: PodcastEntry[]
    ├── opinions: OpinionEntry[]
    └── local: { locations: LocalLocation[] }
```

## Component Tree

```
DigestShell
├── DigestSidebar (date tree, theme toggle)
├── DigestTopBar (date display, story count, News/Scores tabs, prev/next arrows)
└── main
    ├── NewsFeed (when News tab active)
    │   ├── Filter chips (All + per-category, additive selection)
    │   ├── PopularTodaySection → StoryCard[]
    │   ├── TopicSection[] (for_you) → StoryCard[]
    │   ├── TopicSection[] (on_your_radar) → StoryCard[]
    │   ├── PodcastSection → PodcastCard[]
    │   ├── EntertainmentSection → MediaCard[]
    │   ├── OpinionsSection → StoryCard[]
    │   └── LocalNewsSection → StoryCard[]
    ├── ScoreboardPanel (when Scores tab active)
    │   ├── Recaps tab → GameCard[], UFCRecapCard, F1RecapCard
    │   ├── Schedule tab → ScheduledGameCard[]
    │   └── Live tab (future)
    └── DeepDive (/deep-dive/[date]/[id])
        ├── Sticky header with back link
        └── Markdown article (react-markdown + remark-gfm)
```
