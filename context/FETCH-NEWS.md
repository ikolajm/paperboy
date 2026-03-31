# Fetch News

## Purpose
Perform Tier 1 web searches for every topic in `config/config.json`.
Populate the story registry with raw results.

## Tier 1 Definition
Headlines and snippets only. Do NOT fetch full article text during this
stage. That is Tier 2 and belongs exclusively in DEEP-DIVE-NEWS.

A Tier 1 result contains:
- Headline / title
- Source outlet and URL
- 1–2 sentence snippet from the search result
- Approximate publish time if surfaced

## Consulting the Source Registry

Before running web searches for any topic, check `config/config.json`
for an entry under `topics.[topic name]`.

- If the topic has a **`news_url`** (ESPN JSON API): fetch it first as Step 0.
  Parse `headlines[]` array: use `headline` as title, `description` as snippet
  (truncate to 2 sentences), `published` as publish time, and
  `links.web.href` as the story URL. Set `outlet: "ESPN"` and
  `source: "{news_url}"`. This is structured JSON — fast, no JS rendering.
  If the endpoint returns empty or errors, fall through to RSS (Step 1).

- If **`rss`** feeds are listed: fetch from those next (Step 1).
  **Batch all topic RSS feeds into a single call** — build a JSON array
  of `{"label": "[topic]_[index]", "url": "[rss_url]", "max": [N]}`
  entries for every topic's RSS feeds (active: max 5, passive: max 3),
  then run:
  ```
  echo '[...]' | python3 scripts/fetch_rss.py --batch -
  ```
  This fetches all feeds in parallel and returns structured JSON keyed
  by label. Parse the JSON to populate the story registry.
  If a feed errors, its label will contain a `status: "fetch_error"` object
  instead of an array — log an advisory and continue:
  > _Advisory: RSS feed [URL] returned no data — falling back to web search._

  **Google News URL resolution:** Items from Google News RSS feeds have
  redirect URLs (`news.google.com/rss/articles/...`) instead of real
  article URLs. The RSS XML provides the real outlet identity via the
  `<source>` element (outlet name and domain) and the `<title>` element
  (headline). Use these to resolve the real article URL:

  1. Check if the item's URL starts with `news.google.com` — if not, it's
     already a direct URL (e.g. ESPN RSS). Skip resolution.
  2. Take the `<source>` name (outlet) and `<title>` (headline) from the
     RSS item — both are already parsed.
  3. Do a targeted web search: `"[first ~8 words of headline]" [outlet name]`
  4. From the search results, pick the URL whose domain matches the outlet.
  5. Replace the Google redirect URL with the resolved real URL on the
     registry entry.
  6. If resolution fails (no matching result found), keep the redirect URL
     and set `url_resolved: false` on the entry. FILTER will handle these
     via headline-based dedup (Rule 2) instead of URL dedup (Rule 1).

  This adds one web search per Google News-sourced story but yields real,
  clickable article URLs in the digest and enables reliable dedup and
  deep dives.
- If Step 0 + Step 1 together yield 3 or more fresh results: you may skip
  the web search for that topic entirely.
- If they yield fewer than 3 fresh results, or no structured sources are
  listed: fall back to web search. Set `source: "web_search"` on stories
  obtained this way.

**Outlet attribution for web search results:** when a story is obtained via
web search, extract the outlet name from the search result's domain or site
name and store it in the `outlet` field (e.g. "ESPN", "UFC.com", "CBS Sports").
Set `source: "web_search"` as the provenance field. **Never set `outlet` to
the string "web_search"** — that is a source provenance value, not a display name.

When multiple sources return the same story, prefer the structured source
(ESPN JSON > RSS > web search) over the less structured one.

---

## Fetch Behaviour by Mode

### active topics
Search actively. Aim for 3–5 fresh stories per topic.
Use a recency-biased query — prefer results from the last 24 hours.

Suggested query pattern:
```
[topic name] news today
[topic name] latest
```

For topics with strong ongoing narratives (e.g. UFC, F1), also try:
```
[topic name] this week
[topic name] [current month] [year]
```

### passive topics
Search and apply the same relevance filter as active topics. Add any story
that is clearly about this topic. Cap at **3 stories** per passive topic
(vs 5 for active).

Use the topic's `points_of_interest` array as fetch guidance — when multiple
results look equally relevant, prefer ones that match these patterns. But do
not gate on them: any clearly relevant story qualifies.

If nothing relevant is found for a passive topic after searching: note it as
"no results today" and move on. Do not add placeholder entries to the registry.

## Story ID Assignment
Assign IDs as you add stories to the registry.
Format: `[CATEGORY]-[SEQUENCE]`

Category prefix rules:
- Read the `category` field declared on each topic in `config/config.json`.
  This is the canonical prefix — never derive it from the topic name.
- Multiple topics share a prefix when they belong to the same category
  (e.g. MMA and F1 both declare `"category": "SPRT"`). They draw from one
  shared sequence: SPRT-01, SPRT-02, SPRT-03 across all sports topics.
- If a topic is missing its `category` field, the preflight check in
  BOOTSTRAP will have already stopped the chain — this situation should
  not be reached.
- Fixed prefixes for non-topic content (not set in config.json):
  - Popular Now: `POP`
  - In the Noise: `NOISE`

Sequence resets to 01 for each category each day.

**On refresh runs:** Before assigning any IDs, check whether
`id_sequence_floor` is present in context (set by BOOTSTRAP on refresh).
If it is, start each category counter at `id_sequence_floor[CATEGORY] + 1`.
If SPRT has a floor of 5, the first new sports story this run is SPRT-06.
If a category has no entry in `id_sequence_floor`, start at 01 as usual.
This ensures IDs from a refresh run never collide with the initial run.

Example: the second TECH story today (initial run) = `TECH-02`
Example: first new TECH story on a refresh (floor was 4) = `TECH-05`

Note: `topic_match` is not used by this stage. All FETCH-NEWS entries are
topic-indexed via the `topic` field. Podcast cross-references (set by
FETCH-PODCASTS) are stored separately in working context, not on story
registry entries.

## Quality Check Per Result
Before adding a story to the registry, confirm:
- The URL is a real article, not a category/tag/search page
- The story appears to be from the last ~36 hours (FILTER will enforce this as a hard filter)
- The headline is specific, not a generic topic title

Discard results that fail any of these checks without adding them.

**Snippet length:** trim the `snippet` field to ≤2 sentences before
adding any story to the registry. RSS entries often carry full
descriptions or show notes — extract the first 1–2 sentences only.
Do not store raw feed body text.

## Calendar Lookup

After fetching news for each topic, scan its `points_of_interest` array for
temporal language: phrases like "within X days", "upcoming", "next race",
"season start", "race weekend".

If any temporal entry is found, do a quick calendar lookup to resolve
the next scheduled event date for that topic. This data is used by WRITE
to render a calendar note under the topic section.

**Fetch order:**

If a topic has temporal `points_of_interest` but no `schedule_url` configured,
silently skip Step 1 and proceed directly to Step 2 (web search).
No warning — the fallback handles it.

1. **`schedule_url`** — if the topic has a `schedule_url` in config.json
   (e.g. `https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard`):
   fetch it. The ESPN endpoint with no date filter returns the current or
   next upcoming event as structured JSON. Parse out: event name, event
   date (YYYY-MM-DD).

2. **Web search** — fallback:
   `[topic name] next [race/event/season] date [current month] [year]`

Store the result in working context as `next_event_dates[topic_name]`:
```
next_event_dates["F1"] = {
  date:   "2026-03-24",
  label:  "Australian Grand Prix",
  outlet: "ESPN",
  source: "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard"
}
```

If no event date can be resolved after all three attempts, store `null`:
```
next_event_dates["F1"] = null
```

WRITE will skip calendar note rendering for any topic with a `null`
entry. Do not block or abort — move on to the next topic.

---

## Do Not
- Fetch full article text (that is DEEP-DIVE-NEWS)
- Fetch Popular Now or In the Noise (that is POPULAR)
- Write any files (that is WRITE)

## Output
Story registry populated with Tier 1 results for all topics.
`next_event_dates` populated for all topics with temporal `points_of_interest` entries.
Proceed to the next stage in the chain.
