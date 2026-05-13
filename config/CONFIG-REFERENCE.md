# config/config.json — Field Reference (v3)

Complete documentation for every key in `config/config.json`.

---

## Top-Level Sections

Ordered as they appear in config (and as the digest pipeline processes them):

| Key | Purpose |
|-----|---------|
| `version` | Config schema version. Current: `3` |
| `display_timezone` | Optional IANA timezone for the digest's `day_of_week` field (e.g. `"America/New_York"`). Defaults to `"America/New_York"` if absent. Sport startTime formatting is currently hardcoded to ET. |
| `popular_today` | Top stories, world, and nation — the big picture first |
| `local_news` | Location-specific Google News feeds |
| `topics` | Your tracked interests — RSS feeds for story collection |
| `scores` | Sports scoreboard endpoints + display toggles |
| `podcasts` | Shows you follow with RSS feeds and release schedules |
| `opinions` | Opinion/editorial RSS feeds (NYT, Guardian, etc.) |
| `entertainment` | TMDB configuration for movies + streaming |

---

## `popular_today`

Editorial feeds rendered under the Headlines tier. Fetched first — these are the headlines everyone is seeing. Add or remove subsections by editing the `feeds` array; earlier entries win on cross-feed dedup.

| Field | Type | Description |
|-------|------|-------------|
| `feeds[].label` | string | Display label for the subsection (e.g. "Top Stories", "World", "Nation"). Used in diagnostic output; the dashboard renders the merged + deduped list, not per-feed groups. |
| `feeds[].rss` | string | RSS feed URL (typically Google News editorial). |
| `feeds[].max` | integer | Maximum stories to include from this feed. |

### Adding a new subsection

```json
"feeds": [
  ...existing entries,
  {
    "label": "Business",
    "rss": "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
    "max": 3
  }
]
```

---

## `local_news`

| Field | Type | Description |
|-------|------|-------------|
| `max_stories_per_location` | integer | Cap per location |
| `locations[].label` | string | Display name (e.g., "Stevensville, MI") |
| `locations[].rss` | string | Google News location RSS URL |

To find a location feed URL: navigate to Google News, go to the local section for your city, and extract the RSS URL from the page.

---

## `topics`

Each key is the topic name as it appears in the digest. Topics are purely about **news feeds** — scores and schedules are configured separately in the `scores` section.

### Per-topic fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | **yes** | ID prefix code (see Category Bank). Topics sharing a category share one ID sequence. |
| `mode` | string | **yes** | `"active"` or `"passive"` |
| `rss` | string[] | **yes** | RSS feed URLs. Google News for non-sports; ESPN RSS for sports. |

### `mode` values

| Value | Behavior |
|-------|----------|
| `"active"` | Aims for 3–5 stories. Shown in **For You**. |
| `"passive"` | Capped at 3 stories. Shown in **On Your Radar**. |

### Category Bank

| Code | Category | Used by |
|------|----------|---------|
| `SPRT` | Sports | Combat Sports, F1, NBA, NHL, MLB, NFL, College Basketball, College Football |
| `TECH` | Technology | AI, Cybersecurity |
| `POL` | Politics | US Politics |
| `SCI` | Science | Science |
| `HLTH` | Health | Health |
| `ENT` | Entertainment | _(reserved — assigned by entertainment pipeline)_ |
| `POP` | Popular Today | _(reserved — assigned by popular_today pipeline)_ |
| `POD` | Podcasts | _(reserved — assigned by podcast pipeline)_ |
| `OPN` | Opinions | _(reserved — assigned by opinions pipeline)_ |

### Current topics

| Topic | Category | Mode | Feed source |
|-------|----------|------|-------------|
| US Politics | POL | active | Google News search (US Politics) |
| AI | TECH | active | Google News AI subsection |
| Cybersecurity | TECH | passive | Google News Cybersecurity subsection |
| Science | SCI | passive | Google News Science subsection |
| Health | HLTH | passive | Google News Health subsection |
| Combat Sports | SPRT | passive | ESPN MMA RSS |
| F1 | SPRT | passive | ESPN F1 RSS |
| NBA | SPRT | passive | ESPN NBA RSS |
| NHL | SPRT | passive | ESPN NHL RSS |
| MLB | SPRT | passive | ESPN MLB RSS |
| NFL | SPRT | passive | ESPN NFL RSS |
| College Basketball | SPRT | passive | ESPN College Basketball RSS |
| College Football | SPRT | passive | ESPN College Football RSS |

### Adding a new topic

```json
"My New Topic": {
  "category": "TECH",
  "mode": "active",
  "rss": [
    "https://news.google.com/rss/topics/[SUBSECTION_ID]?hl=en-US&gl=US&ceid=US:en"
  ]
}
```

### RSS feed sources

**Google News subsection feeds** — editorially curated by Google. Best for non-sports topics (AI, Cybersecurity, Science, Health). Navigate to the subsection on news.google.com, grab the encoded topic ID from the URL, insert `/rss/` into the path.

**Google News search feeds** — for topics without a curated subsection. Format: `https://news.google.com/rss/search?q=[QUERY]&hl=en-US&gl=US&ceid=US:en`

**ESPN RSS feeds** — the primary source for sports news. Structured, direct article URLs, consistent formatting.

| Sport | ESPN RSS |
|-------|----------|
| MMA | `https://www.espn.com/espn/rss/mma/news` |
| F1 | `https://www.espn.com/espn/rss/f1/news` |
| NBA | `https://www.espn.com/espn/rss/nba/news` |
| NHL | `https://www.espn.com/espn/rss/nhl/news` |
| MLB | `https://www.espn.com/espn/rss/mlb/news` |
| NFL | `https://www.espn.com/espn/rss/nfl/news` |
| College Basketball | `https://www.espn.com/espn/rss/ncb/news` |
| College Football | `https://www.espn.com/espn/rss/ncf/news` |

---

## `scores`

Each key is a sport name. Scores are fetched from ESPN scoreboard APIs and split into two user pathways: **recaps** (yesterday's results) and **schedule + odds** (today's upcoming games).

### Per-sport fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | **yes** | ESPN scoreboard API endpoint |
| `recaps` | boolean | **yes** | Show yesterday's final scores |
| `schedule` | boolean | **yes** | Show today's upcoming games |
| `odds` | boolean | **yes** | Show betting odds (spread, O/U, moneyline). Only applies when `schedule` is `true`. |

### Current sports

| Sport | Recaps | Schedule | Odds |
|-------|--------|----------|------|
| NBA | yes | yes | yes |
| NHL | yes | yes | yes |
| MLB | yes | yes | yes |
| NFL | yes | yes | yes |
| UFC | yes | yes | no |
| F1 | yes | yes | no |
| College Basketball | yes | no | no |
| College Football | yes | no | no |

### ESPN scoreboard URL patterns

Append `?dates=YYYYMMDD` for a specific date. No date param = today's scoreboard. Odds are embedded in the response for scheduled games (`competitions[].odds[]`).

| Sport | URL |
|-------|-----|
| NBA | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard` |
| NHL | `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard` |
| MLB | `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard` |
| NFL | `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` |
| UFC | `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard` |
| F1 | `https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard` |
| College Basketball | `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard` |
| College Football | `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard` |

### Adding a new sport

```json
"Tennis": {
  "url": "https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard",
  "recaps": true,
  "schedule": true,
  "odds": false
}
```

---

## `podcasts`

### `podcasts.shows`

Each key is the show name as it appears in the digest.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rss` | string | **yes** | RSS feed URL |
| `release_schedule` | string | optional | When the show releases. Script skips fetch on non-release days. Omit to check every day. |
| `youtube_channel` | string | optional | _Agent-only: used for video link resolution in deep dives._ |
| `transcript_page` | string | optional | _Agent-only: used for transcript fetching in deep dives._ |

### `release_schedule` values

| Value | Fetch on |
|-------|----------|
| `"daily"` | Every day |
| `"weekdays"` | Monday–Friday |
| `"weekly_monday"` | Monday only |
| `"mon_wed_fri"` | Monday, Wednesday, Friday |
| `"mon_thu"` | Monday, Thursday |
| _(omitted)_ | Every day |

### Adding a new show

```json
"My Show": {
  "rss": "https://feeds.example.com/myshow",
  "release_schedule": "weekdays"
}
```

---

## `opinions`

Opinion and editorial RSS feeds. Sporadic schedules — all feeds are fetched on every run with no schedule filtering.

| Field | Type | Description |
|-------|------|-------------|
| `feeds` | string[] | RSS feed URLs for opinion/editorial content |
| `max_stories` | integer | Cap on opinion entries per run |

### Current feeds

| Outlet | RSS |
|--------|-----|
| The Guardian Comment | `https://www.theguardian.com/uk/commentisfree/rss` |
| The Hill Opinion | `https://thehill.com/opinion/feed/` |
| Washington Post Opinions | `https://feeds.washingtonpost.com/rss/opinions` |

---

## `entertainment`

### `entertainment.tmdb`

| Field | Type | Description |
|-------|------|-------------|
| `base_url` | string | TMDB API base URL |
| `endpoints` | object | TMDB API paths keyed by data type (see endpoints table below) |
| `movie_endpoints` | string[] | Which `endpoints` keys feed the **Movies** gallery (e.g. `["trending_movies", "popular_movies", "now_playing"]`) |
| `streaming_endpoints` | string[] | Which `endpoints` keys feed the **Streaming** gallery (e.g. `["trending_tv", "popular_tv", "discover_streaming"]`) |
| `upcoming_endpoints` | string[] | Which `endpoints` keys feed the **Coming Soon** gallery (e.g. `["upcoming", "on_the_air"]`) |
| `max_movies` | integer | Cap on movie entries |
| `max_streaming` | integer | Cap on streaming/TV entries |
| `max_upcoming` | integer | Cap on upcoming entries |
| `upcoming_cutoff_days` | integer | Maximum days in the future for an upcoming entry to be included |
| `enrich_watch_providers` | boolean | When `true`, fetch watch-provider logos for each entry (extra API calls per item) |

TMDB API requires credentials stored in `config/credentials.json` (gitignored). See `config/credentials.example.json` for the template:

```json
{
  "tmdb": {
    "api_key": "your_v3_key_here"
  }
}
```

Only the v3 `api_key` is used. (TMDB also issues a v4 read access token, but the pipeline doesn't consume it.)

### TMDB endpoints

| Key | Returns |
|-----|---------|
| `now_playing` | Movies currently in theatres |
| `upcoming` | Movies releasing soon |
| `trending_movies` | Trending movies (daily window) |
| `popular_movies` | Popular movies (rolling popularity score) |
| `trending_tv` | Trending TV shows (daily window) |
| `popular_tv` | Popular TV shows (rolling popularity score) |
| `on_the_air` | TV shows currently airing new episodes |
| `discover_streaming` | TV discovery filtered by configured watch providers (Netflix, Hulu, Max, Disney+, Apple TV+, Paramount+) |
