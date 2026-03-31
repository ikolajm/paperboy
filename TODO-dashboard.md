# Dashboard Build — Procedural TODO

Step-by-step list to scaffold a Next.js dashboard that reads `digest.json`
from the digests folder and renders a local news dashboard.

---

## Phase 1: Project Setup

- [ ] **1.1** Initialize Next.js app in `dashboard/` with App Router, TypeScript, Tailwind CSS.
  ```
  npx create-next-app@latest dashboard --typescript --tailwind --app --src-dir
  ```
- [ ] **1.2** Add a `DIGEST_PATH` env variable in `.env.local` pointing to the digests folder:
  ```
  DIGEST_PATH=../digests
  ```
- [ ] **1.3** Create TypeScript types for the `digest.json` schema (`src/types/digest.ts`). Every section, story, score, podcast, noise item gets a type. Derive from the schema in `context/WRITE.md`.
- [ ] **1.4** Write a data-access utility (`src/lib/digest.ts`) that:
  - Reads `{DIGEST_PATH}/YYYY-MM-DD/digest.json` from the filesystem
  - Exposes `getLatestDigest()` — finds the most recent date folder
  - Exposes `getDigest(date: string)` — reads a specific day
  - Exposes `getDeepDive(date: string, id: string)` — reads a deep-dive markdown file
  - Handles missing files gracefully (returns null)

---

## Phase 2: API Routes

- [ ] **2.1** `GET /api/digest` — returns the latest `digest.json`. Optional `?date=YYYY-MM-DD` query param for historical days.
- [ ] **2.2** `GET /api/digest/dates` — returns an array of available digest dates (list subdirectories in digests/).
- [ ] **2.3** `GET /api/deep-dive/[id]` — reads `deep-dives/[ID].md`, parses frontmatter-style headers into JSON, returns `{ meta, content }`. Optional `?date=` param.
- [ ] **2.4** `GET /api/scores` — calls `fetch_scores.py --json` directly for live scores (bypasses digest, real-time data).

---

## Phase 3: Layout & Shell

- [ ] **3.1** Create the root layout (`src/app/layout.tsx`):
  - Dark/light mode toggle
  - Sidebar nav: Daily Digest, Scores, Deep Dives, Settings
  - Date picker in header (navigate between digest days)
  - Story count badge from `meta.story_count`
- [ ] **3.2** Create the main digest page (`src/app/page.tsx`):
  - Fetch digest data server-side via the data-access utility
  - Render section components in digest order (see Phase 4)
  - Show "No digest for today" fallback if no `digest.json` exists

---

## Phase 4: Section Components

Build each component to render its `digest.json` section. All components
receive typed props from the parent page.

- [ ] **4.1** `<DigestHeader />` — date, day of week, story count, run mode badge, last run time. Source: `meta`.
- [ ] **4.2** `<TopicSection />` — reusable for both For You and On Your Radar. Props: topic name, category, mode, stories array, calendar event, cross-refs, quiet flag. Renders:
  - Topic name as section header with category badge (SPRT, TECH, POL)
  - Story cards (4.3) in a list
  - Calendar event note if present
  - Cross-ref podcast note if present
  - "Nothing found today" for quiet passive topics
- [ ] **4.3** `<StoryCard />` — single story. Props: id, title, url, snippet, source, trending flag, deep_dive_eligible. Renders:
  - ID badge (e.g., SPRT-01)
  - Headline as link
  - Snippet text
  - Source label
  - Trending indicator if true
  - "Go deeper" button if deep_dive_eligible
- [ ] **4.4** `<ScoresTable />` — sports scores. Props: scores section from digest.json. Renders:
  - Sport name headers
  - Game rows: away vs home, score, notable column
  - Status handling: games_played, no_games, playoffs badge, out_of_season (omit)
- [ ] **4.5** `<UpcomingGames />` — today's slate. Props: upcoming section. Renders:
  - Sport name headers
  - Game rows: matchup, time, broadcast, odds/line, watch priority star
  - Omit if no upcoming games
- [ ] **4.6** `<EntertainmentSection />` — movies + streaming. Props: entertainment section. Renders:
  - "In Theatres" subsection with movie cards (title, score, snippet)
  - "Streaming Buzz" subsection with show cards
  - Omit entire section if both empty
- [ ] **4.7** `<PodcastSection />` — following + discovered. Props: podcasts array. Renders:
  - Show name, episode title, duration, date
  - Snippet
  - Episode URL link + YouTube link if available
  - "Get transcript" button for deep-dive-eligible episodes
- [ ] **4.8** `<PopularNow />` — trending credible stories. Props: popular_now array. Renders:
  - Same layout as StoryCard but in a compact list
- [ ] **4.9** `<LocalNews />` — location-grouped stories. Props: local section. Renders:
  - Location label headers (Stevensville, MI / Grand Rapids, MI)
  - Story list per location
  - Omit if no locations or all empty
- [ ] **4.10** `<NoiseSection />` — trending online. Props: noise array. Renders:
  - Keyword (bold) + one-sentence context
  - No links, no deep-dive buttons
- [ ] **4.11** `<DeepDiveList />` — existing deep dives. Props: deep_dives array. Renders:
  - List of completed deep-dive links (ID + title)
  - Links to `/deep-dive/[id]` page

---

## Phase 5: Deep Dive Page

- [ ] **5.1** Create `/deep-dive/[id]/page.tsx`:
  - Fetch deep-dive markdown via API route
  - Parse markdown to HTML (use `react-markdown` or `next-mdx-remote`)
  - Render: title, metadata header, summary, key points, full story, other coverage, context
  - Back link to digest

---

## Phase 6: Date Navigation & History

- [ ] **6.1** Date picker component that lists available digest dates (from `/api/digest/dates`).
- [ ] **6.2** Previous/next day arrows in the header.
- [ ] **6.3** URL structure: `/?date=2026-03-29` — default to latest if no date param.

---

## Phase 7: Polish & Interactivity

- [ ] **7.1** Collapsible sections — each major section can expand/collapse. Sports scores default collapsed if >8 games.
- [ ] **7.2** Category filter — toggle which categories (SPRT, TECH, POL, ENT) are visible.
- [ ] **7.3** Search/filter within the digest — find stories by keyword.
- [ ] **7.4** Auto-refresh — poll for `digest.json` changes every 5 minutes (or after a digest run).
- [ ] **7.5** Responsive layout — mobile-friendly cards and tables.
- [ ] **7.6** Watch priority highlighting — visually distinguish ⭐ games in upcoming slate.

---

## Phase 8: Live Scores Widget (Optional)

- [ ] **8.1** Sidebar or top-bar widget that calls `/api/scores` for real-time game data.
- [ ] **8.2** Auto-refresh every 60 seconds during game hours.
- [ ] **8.3** Show live game indicators (in-progress vs. final vs. upcoming).

---

## Dependency Summary

| Package | Purpose |
|---------|---------|
| `next` | Framework |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `react-markdown` | Render deep-dive .md files |
| `date-fns` | Date formatting & navigation |
| `lucide-react` | Icons (optional) |

---

## Data Flow

```
digest pipeline (Claude)
    │
    ▼
digests/YYYY-MM-DD/digest.json   ← written by WRITE stage
    │
    ▼
dashboard/src/lib/digest.ts      ← reads from filesystem
    │
    ▼
/api/digest                      ← Next.js API route
    │
    ▼
page.tsx → Section Components    ← renders the dashboard
```

---

## File Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← shell, nav, date picker
│   │   ├── page.tsx             ← main digest view
│   │   ├── deep-dive/
│   │   │   └── [id]/
│   │   │       └── page.tsx     ← deep dive reader
│   │   └── api/
│   │       ├── digest/
│   │       │   └── route.ts     ← GET digest.json
│   │       ├── deep-dive/
│   │       │   └── [id]/
│   │       │       └── route.ts ← GET deep-dive markdown
│   │       └── scores/
│   │           └── route.ts     ← GET live scores
│   ├── components/
│   │   ├── DigestHeader.tsx
│   │   ├── TopicSection.tsx
│   │   ├── StoryCard.tsx
│   │   ├── ScoresTable.tsx
│   │   ├── UpcomingGames.tsx
│   │   ├── EntertainmentSection.tsx
│   │   ├── PodcastSection.tsx
│   │   ├── PopularNow.tsx
│   │   ├── LocalNews.tsx
│   │   ├── NoiseSection.tsx
│   │   └── DeepDiveList.tsx
│   ├── lib/
│   │   └── digest.ts            ← filesystem data access
│   └── types/
│       └── digest.ts            ← TypeScript interfaces
├── .env.local
├── package.json
├── tailwind.config.ts
└── next.config.ts
```
