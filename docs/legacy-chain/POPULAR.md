# Popular Now & In the Noise

## Purpose
Fetch trending content independently of the user's topic list.
This stage produces two distinct sections with different quality bars.

Read `config/config.json` for the `popular_now` and `in_the_noise` settings
before beginning.

---

## Section A: Popular Now

### What it is
Top stories that are genuinely newsworthy and widely covered today.
Not personalised — this is what anyone paying attention would know about.

### Fetch approach

**Primary — Google News section feeds (batch fetch):**
Build a JSON batch config for `top_stories`, `WORLD`, and `NATION` feeds
from `google_news_sections` in config.json, then fetch all three in one call:
```
echo '[
  {"label": "top_stories", "url": "...", "max": 5},
  {"label": "WORLD", "url": "...", "max": 5},
  {"label": "NATION", "url": "...", "max": 5}
]' | python3 scripts/fetch_rss.py --batch -
```
Pool all results from the JSON output, then apply the quality filter
below to select the best stories. This replaces sequential per-feed
calls with a single parallel batch.

**Fallback — web search:**
Only if the Google News feeds yield fewer than 5 viable stories after filtering,
supplement with:
```
top news stories today
breaking news today
most read news today
```

### Quality filter (strict)
Only include a story in Popular Now if:
- It is covered by at least one outlet from the trusted sources list
  in `config/config.json` under `popular_now`
- It has clear news value (event, development, decision, or discovery)
- Its normalized URL (apply FILTER.md Rule 0 normalization before comparing)
  is not already in the story registry (same article from a topic fetch should
  not appear twice — but a different outlet's coverage of the same topic is
  fine and signals independent corroboration)

### ID assignment
Prefix: `POP`
Example: `POP-01`, `POP-02`

### Cap
Respect the `max_stories` value from config. Default: 5.

---

## Section B: In the Noise

### What it is
What is trending online that is *not* necessarily newsworthy. Viral moments,
memes, celebrity moments, social media pile-ons. Low signal, acknowledged
without amplification.

### Fetch approach
Fetch `google_trends_rss` from `config/config.json` as the primary source.
Extract trending topic names and descriptions from the feed items.
Supplement with web search only if fewer than 4 items are obtained from the feed.

### Quality filter (none)
No outlet filter. No news value requirement.
The only bar: it should be something that a meaningful number of people
are aware of or talking about. You are not curating this — you are
reporting that it exists.

### Format
These entries are short but must include context. For each Google Trends
item, do a quick web search for the topic name to determine WHY it is
trending. Write a single sentence explaining the cultural moment.

Format per item:
- Headline (the trending topic name)
- One-sentence context (why it's trending right now)

Do not editorialize — state what happened, not whether it matters.
If a web search yields no clear reason, write "Trending — reason unclear."

### ID assignment
Prefix: `NOISE`
Example: `NOISE-01`, `NOISE-02`

### Cap
Respect the `max_stories` value from config. Default: 4.

### Hard rule
`never_deep_dive: true` — these stories are never candidates for a deep dive (DEEP-DIVE-NEWS).
Do not assign them to the deep-dive index. They exist to be acknowledged,
not investigated.

---

## Section C: Category Trending

### What it is
Per-domain trending content — what's hot *within* each topic category right now.
Separate from Popular Now (which is global). Source: Google News section feeds —
category-level trending from Google's editorial curation.

### Fetch approach

**Google News section feeds (batch fetch):**

Read `google_news_sections.feeds` from `config/config.json`. Build a JSON
batch config for all 8 section feeds and fetch them in a single call:
```
echo '[
  {"label": "TECHNOLOGY", "url": "...", "max": 3},
  {"label": "SPORTS", "url": "...", "max": 3},
  ...all 8 sections...
]' | python3 scripts/fetch_rss.py --batch -
```
This fetches all 8 feeds in parallel. From each label's results in the
JSON output, take items not already in the story registry (apply
FILTER.md Rule 0 URL normalization for dedup). Route each to its
matching category prefix using `google_news_sections.category_map` in config.
Continue the existing ID sequence for that category.

**Combine with Section A and D:** To minimize tool calls, you may include
the Popular Now feeds (top_stories, WORLD, NATION), Google Trends RSS,
and local news feeds in the same batch call — use distinct labels
(e.g. `"POP_top"`, `"POP_WORLD"`, `"LOCAL_stevensville"`, `"TRENDS"`)
to separate them in the JSON output.

### ID assignment
Use the category prefix from `google_news_sections.category_map` (for Google News
section items). Continue the shared ID sequence for that category.

Set `source_type: trending` on all entries so WRITE can label them distinctly.

### Cap
Maximum 3 items per Google News section feed. Do not pad — if only 1 item passes the filter, add only 1.

---

## Section D: Local News

### What it is
News from locations configured by the operator. Fetched from Google News
location-specific RSS feeds. Locations can be added or removed at any time
(travel, moving, etc.) by editing `local_news.locations` in config.json.

### Fetch approach
Read `local_news.locations` from config.json. For each location, fetch
its `rss` feed. Take the top N items per location (where N =
`local_news.max_stories_per_location`, default 3).

All location feeds can be fetched in parallel.

Apply light dedup against the story registry (FILTER.md Rule 0 URL normalization).

### ID assignment
Prefix: `POP` (local stories share the Popular Now sequence).

### Cap
Respect `max_stories_per_location` per location. If a location feed
returns empty or errors, skip silently. If `local_news.locations` is
empty or absent, skip this section entirely.

---

## Output
Story registry is now complete. It contains:
- Topic stories (active + passive, from FETCH-NEWS and FILTER)
- Popular Now stories (POP-*)
- Local news stories (POP-*, from location feeds)
- In the Noise entries (NOISE-*)
- Category trending stories (SPRT-*, TECH-*, etc. with `source_type: trending`)

Proceed to the next stage in the chain.
