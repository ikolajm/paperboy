# config/config.json — Field Reference

Complete documentation for every key in `config/config.json`.
Read this when adding topics, adjusting settings, or understanding what
each field does. Claude also reads this to resolve ambiguities at runtime.

---

## Top-Level Sections

| Key | Purpose |
|-----|---------|
| `topics` | Your news topics — what to follow and how |
| `podcasts` | Shows you follow + discovery and deep-dive settings |
| `popular_now` | Popular Now section settings and RSS sources |
| `in_the_noise` | In the Noise section settings |
| `entertainment` | Movies + streaming source lists |
| `social` | Bluesky settings |
| `google_news_sections` | Google News RSS feeds by section (top stories, category feeds, category mapping) |
| `google_trends_rss` | Google Trends RSS feed URL for In the Noise sourcing |

---

## `topics`

Each key is the topic name exactly as it will appear in the digest.

### Per-topic fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | **yes** | ID prefix code. See Category Bank below. |
| `mode` | string | **yes** | `"active"` or `"passive"` |
| `points_of_interest` | string[] | recommended | Plain-language fetch guidance. For passive topics, Claude prioritises stories matching these patterns. For active topics, used as calendar-lookup hints when temporal language is present ("within X days", "next race"). Does not gate story inclusion — all clearly relevant stories are added. |
| `search_terms` | string[] | recommended | Keywords used for RSS/web search and Bluesky `searchPosts` fallback. More specific = better results. |
| `rss` | string[] | optional | RSS/Atom feed URLs. Fetched before web search. |
| `news_url` | string | sports only | ESPN real-time news JSON endpoint. Returns `headlines[]` array. Fetched before RSS in FETCH-NEWS. |
| `scores` | boolean | sports only | `true` = fetch last night's scores from `scores_url`. |
| `followed_teams` | string[] | sports only | Team names. Alerts fire specifically for these teams; all games still shown. Leave empty for league-wide coverage only. |
| `scores_url` | string | sports only | ESPN JSON API endpoint for last night's scores. See ESPN API note below. |
| `odds_url` | string | sports only | Reference pointer to the ESPN scoreboard endpoint that also embeds betting lines. **Odds are already in the `scores_url` response** — no separate API call is needed. Extract `competitions[].odds[]` (spread, moneyline, O/U, provider) for games with status `scheduled`. Do not display odds for live or final games. |
| `standings_url` | string | sports only | ESPN standings endpoint for the league. Pattern: `https://site.api.espn.com/apis/v2/sports/[sport]/[league]/standings`. Not used in daily digest runs — available for on-demand flash checks. |
| `schedule_url` | string | optional | ESPN JSON API endpoint for upcoming event schedule. Triggers calendar lookup in FETCH-NEWS when `points_of_interest` contains temporal language ("within X days", "upcoming", "next race"). See ESPN schedule URL patterns below. |

### `mode` values

| Value | Behaviour |
|-------|-----------|
| `"active"` | Always fetches. Aims for 3–5 fresh stories. Shown in **For You**. |
| `"passive"` | Fetches 2–3 relevant stories. Shown in **On Your Radar**. Uses `points_of_interest` to prioritise what to look for, but surfaces all clearly relevant results. |

### Category Bank

Declare the category for any topic using one of these codes. Multiple topics
share one code — they draw from a shared ID sequence (SPRT-01, SPRT-02, ...).

| Code | Category | Example topics |
|------|----------|----------------|
| `SPRT` | Sports (any sport) | MMA, F1, NBA, NHL, MLB, NFL, Tennis |
| `TECH` | Technology & Security | AI Research, Anthropic/Claude, Dev Tooling, Cybersecurity |
| `ENT` | Entertainment | _(reserved — used internally by Stage 05)_ |
| `POP` | Popular Now | _(reserved — used internally by Stage 04)_ |
| `NOISE` | In the Noise | _(reserved — used internally by Stage 04)_ |

**Reserved codes** (do not use as `category` values — the system assigns them):
`ENT`, `POP`, `NOISE`, `SKY`, `POD`

> **Note:** Cybersecurity and security topics use the `TECH` prefix. SEC was merged into TECH
> as security is a technology subfield — the distinction added prefix overhead without payoff.

**To add a new category:** just use a new 2–5 character uppercase code in the
`category` field. It becomes available immediately. Add it to this table too.

### Adding a new topic — minimal example

```json
"My New Topic": {
  "category": "TECH",
  "mode": "active",
  "points_of_interest": [
    "major announcement from a key player",
    "regulatory action or ban"
  ],
  "search_terms": ["my topic keywords", "related term"],
  "rss": []
}
```

### ESPN JSON API — scores_url format

Odds are **embedded** in the scoreboard response for scheduled games.
`competitions[].odds[]` contains spread, moneyline, O/U, and provider name.
No separate API call needed — `odds_url` simply documents this same endpoint.

| Sport | URL |
|-------|-----|
| NBA | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard` |
| NHL | `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard` |
| MLB | `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard` |
| NFL | `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` |
| NCAAF | `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard` |
| NCAAB | `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard` |
| NCAA Baseball | `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard` |
| MLS | `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard` |

Append `?dates=YYYYMMDD` for a specific date. Returns structured JSON — no JS rendering.

### ESPN JSON API — standings_url format

| Sport | URL |
|-------|-----|
| NBA | `https://site.api.espn.com/apis/v2/sports/basketball/nba/standings` |
| NHL | `https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings` |
| MLB | `https://site.api.espn.com/apis/v2/sports/baseball/mlb/standings` |
| NCAAF | `https://site.api.espn.com/apis/v2/sports/football/college-football/standings` |
| NCAAB | `https://site.api.espn.com/apis/v2/sports/basketball/mens-college-basketball/standings` |
| NCAA Baseball | `https://site.api.espn.com/apis/v2/sports/baseball/college-baseball/standings` |

Not used in daily digest runs. Available for on-demand flash checks if standings context is requested.

### ESPN JSON API — schedule_url format

For topics with temporal `points_of_interest` entries (e.g. "race weekend within 5 days").
With no date filter, the ESPN scoreboard endpoint returns the current or next scheduled
event — making it suitable as a `schedule_url` for calendar lookup.

| Sport | URL |
|-------|-----|
| F1 | `https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard` |
| NASCAR | `https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard` |
| NFL | _(same as scores_url — preseason/offseason shows next game)_ |
| NBA | _(same as scores_url — offseason shows no games)_ |

For sports without an ESPN schedule endpoint (e.g. UFC), Stage 01 falls back to
web search. No `schedule_url` needed — omit the field.

**Fallback chain if `schedule_url` is absent or returns no upcoming event:**
1. Web search: `[topic] next [race/event] date [month] [year]`

---

## `podcasts`

### `podcasts.settings`

#### `podcasts.settings.discovery`

| Field | Type | Description |
|-------|------|-------------|
| `bluesky_mentions` | boolean | Surface episodes explicitly recommended in SKY-* posts. Topic relevance is always required — Bluesky buzz alone does not qualify. |

#### `podcasts.settings.deep_dive`

| Field | Type | Description |
|-------|------|-------------|
| `transcript_sources` | string[] | Order to try when fetching a transcript. Values: `"native"` (show's own transcript page, from `transcript_page` in config), `"youtube_captions"` (auto-captions from YouTube upload), `"show_notes"` (RSS description — not a real transcript, labeled as such in output). Processing stops at first successful source. Reorder to change priority. |
| `include_timestamps` | boolean | Extract and display jump-to timestamps |
| `speaker_labels` | boolean | Label speakers as [Host] / [Guest] / [Name] |

### `podcasts.shows`

Each key is the exact show name.

| Field | Type | Description |
|-------|------|-------------|
| `rss` | string | RSS/Atom feed URL. Fetched directly — no search needed. |
| `youtube_channel` | string \| null | YouTube channel URL. Used for transcript fallback (Stage 10) and episode link lookup (Stage 07). |
| `transcript_page` | string \| null | Show's own transcript page. Stored as `transcript_hint` on registry entries. Fetched directly in Stage 10. |

**To add a new show:** add an entry to `podcasts.shows` with the RSS feed URL.
If you don't know the RSS URL, just add the show name without details — Claude
will find the feed on the first run and you can fill it in after.

```json
"My New Show": {
  "rss": "https://feeds.example.com/myshow",
  "youtube_channel": null,
  "transcript_page": null
}
```

---

## `popular_now`

| Field | Type | Description |
|-------|------|-------------|
| `max_stories` | integer | Cap on Popular Now stories in the digest |
| `trusted_sources_only` | boolean | Only include stories from recognised outlets |
| `rss_feeds` | string[] | RSS feeds to pool before falling back to web search |

---

## `in_the_noise`

| Field | Type | Description |
|-------|------|-------------|
| `max_stories` | integer | Cap on In the Noise entries |
| `label` | string | Section subtitle shown in the digest |
| `never_deep_dive` | boolean | Always `true` — NOISE entries are never deep-dived |

---

## `entertainment`

### `entertainment.movies`

| Field | Type | Description |
|-------|------|-------------|
| `max_results` | integer | Cap on movie entries per run |

### `entertainment.streaming`

| Field | Type | Description |
|-------|------|-------------|
| `max_results` | integer | Cap on streaming entries per run |

### `entertainment.exclude_patterns`

String array. Any entertainment entry whose title or source
matches a pattern here is discarded. Useful for filtering creator content,
gaming clips, etc.

---

## `social`

### `social.bluesky`

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable/disable Bluesky fetching entirely |
| `max_posts` | integer | Cap on SKY-* entries in The Conversation section |
| `general_feeds` | object[] | Feeds for ambient trending posts. Each: `{ "name": "...", "uri": "at://..." }`. |
| `timeline.enabled` | boolean | Fetch personal timeline (requires auth in credentials.json) |
| `timeline.max_posts` | integer | Cap on timeline posts to consider |
| `lists` | string[] | AT URIs of Bluesky lists to fetch (requires auth). e.g. `"at://did:plc:.../app.bsky.graph.list/..."` |

**Authentication note:** `general_feeds` and `searchPosts` work without auth.
`timeline` and `lists` require `config/credentials.json` to be populated.

---

## Bluesky Feed URIs — finding them

Feed generator AT URIs take the form:
`at://did:plc:[creator-did]/app.bsky.feed.generator/[feed-slug]`

To find a feed's URI:
1. Visit the feed on bsky.app
2. The URL path contains the feed identifier
3. Use `app.bsky.feed.getFeedGenerator?feed=[uri]` to validate it

List AT URIs take the form:
`at://did:plc:[creator-did]/app.bsky.graph.list/[list-id]`

Run "validate bluesky feeds" to check reachability of all URIs currently in config.json.
If a URI is consistently unreachable, remove it from config.json.
