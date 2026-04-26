# Write

## Purpose
Render the final output files from the completed story registry.
This is the only stage that writes to disk.

## Determine Write Mode

Check `run_mode` set in BOOTSTRAP.

**If `run_mode` is `initial` or `full_rerun`:** proceed with the full
write logic below exactly as specified.

**If `run_mode` is `refresh`:** first check whether the story
registry contains any stories after FILTER. Count them.

- **Nothing new:** if the registry is empty (all fetched stories were
  filtered by Rule 0 as already-seen), do not write anything. Tell
  the user:
  ```
  Refresh complete — nothing new since this morning.
  Your digest is current. Check back later.
  ```
  Stop. Do not modify any files.

- **New stories found:** render a refresh section (format below) and
  prepend it to the existing `digest.md`. Append new rows to the
  existing `digest-index.md` table. Update the `# Last run:` header
  line. Skip the full write logic below — only the refresh section
  and index append are needed.

### Refresh section format (prepended to digest.md)

```markdown
## Refreshed — [HH:MM] · [N] new stories

[If new active topic stories:]
### [Topic Name]
**[ID]** — [Headline]
> [Snippet] · [Outlet]

[If new passive topic stories:]
### [Passive Topic Name] _(On Your Radar)_
**[ID]** — [Headline]
> [Snippet] · [Outlet]

[If new podcast episodes:]
**[POD-ID]** — **[Show]:** [Episode title] · [Duration]
> [First sentence of show notes]

[If substantively new social entries:]
💬 **[SKY-ID]** — [brief text excerpt]

---
_[N] new stories added at [HH:MM]. Original digest below._
```

Time format for `[HH:MM]`: local system time, 12-hour clock with AM/PM
(e.g. `9:42 AM`, `2:15 PM`).

Prepend this block to the top of `digest.md`. The existing file
content (original `# Daily Digest` header and body) follows
unchanged below the separator.

Also:
- Append the new story rows to the `digest-index.md` table (do not
  replace the table or existing rows).
- Update the `# Last run:` line to the current timestamp with mode
  `(refresh)`.

Confirm to user:
```
Refresh complete — digests/YYYY-MM-DD/digest.md updated.
[N] new stories · [N] new IDs added to index.
```

---

## Files to Write
1. `digests/YYYY-MM-DD/digest.md` — what the user reads
2. `digests/YYYY-MM-DD/digest-index.md` — chain lookup table for deep dives

---

## digest.md Format

```markdown
# Daily Digest — [Month D, YYYY]
_[Day of week] · [N] stories_

---

## For You

### [Topic Name]
**[ID]** — [Headline as markdown link if URL available, e.g. [Headline](url)]
> [Snippet] · [Outlet]

If no URL is available, render the headline as plain text — never render `[text]()` with an empty href.

[If a calendar event is upcoming for this topic:]
📅 Next: [Event Label] — [N] days away ([YYYY-MM-DD])

[If a podcast cross-reference matched this topic (from FETCH-PODCASTS cross_refs):]
🎙️ _Related: **[Show]** covered this in "[Episode title]" ([Mon D])_

[If any trending_rss stories exist for this topic (source_type: trending_rss):]
🔥 **[ID]** — [Headline as markdown link if URL available] _(trending)_
> [Snippet] · [Outlet]

[Repeat for each active topic. 3–5 news stories per topic, then trending items after.]

---

## On Your Radar
_Topics you're watching — 2–3 stories each_

### [Passive Topic Name]
**[ID]** — [Headline as markdown link if URL available, e.g. [Headline](url)]
> [Snippet] · [Outlet]

[If a calendar event is upcoming for this topic:]
📅 Next: [Event Label] — [N] days away ([YYYY-MM-DD])

[If a podcast cross-reference matched this topic:]
🎙️ _Related: **[Show]** covered this in "[Episode title]" ([Mon D])_

[If any trending_rss stories exist for this topic (source_type: trending_rss):]
🔥 **[ID]** — [Headline] _(trending)_
> [Snippet] · [Outlet]

[If no results found for this passive topic:]
[Topic Name] — nothing found today

---

## 🏆 Sports Last Night
_[Day of week], [Month D]_

[Render from scores_log. For each sport with status "games_played":]

### [Sport Name]

| Game | Score | Notable |
|------|-------|---------|
| [Away Team] vs [Home Team] | [ABR] [score] — [ABR] [score] | [notable or X] |

[If followed_teams configured, show followed-team games first in the table.]
[If status is "no_games":] _No games played._
[If status is "out_of_season": omit this sport's card entirely.]
[If all sports are out_of_season or no_games: omit the entire section.]

### 📅 On the Slate — Tonight
_[Day of week], [Month D]_

[Render from upcoming_games_log. For each sport with scheduled games:]

**[Sport Name]**

| Game | Time | Network | Line | Watch |
|------|------|---------|------|-------|
| [Away] at [Home] | [Time] | [Network(s)] | [Spread] · O/U [line] | [⭐ if watch_priority] |

[Line column format:]
- Normal: `LAL -7.5 · O/U 224.5`
- Near-even: `Pick 'em · O/U 218.0` (when spread is 0 or ≤ 1 pt)
- If odds null: show `—` in the Line column
- Watch column: ⭐ if watch_priority is true, empty otherwise.
  watch_priority is a heuristic based on close spread, national
  broadcast, or competitive moneyline — not an ESPN designation.

[If followed_teams configured, show followed-team games first in the table.]
[Omit sports with no games today.]
[If upcoming_games_log is empty: omit the entire "On the Slate" block.]

---

## 🎬 Entertainment
_Movies, streaming, and what the internet is watching_

### In Theatres
**[ENT-ID]** — [Movie Title][· #N at box office if known]
> [RT score or audience score if available] · [1-sentence take]

[Repeat up to movies cap. If no movies with signal today: omit this subsection.]

### Streaming Buzz
**[ENT-ID]** — [Show or Movie Title] on [Platform]
> [What people are saying] · [Source]

[Repeat up to streaming cap. If nothing notable: omit this subsection.]

[If both subsections are empty: omit the entire Entertainment section.]

---

## 🎙️ Podcasts

### Following
**[POD-ID]** — **[Show Name]:** [Episode Title] · [Duration] · [Publish date]
> [2–3 sentence description]
> [Episode URL] [· YouTube ↗ if available]

[Repeat per followed show with a new episode.]
[If no new episodes from a show this week, omit that show entirely.]

### Discovered
_Episodes from shows you don't follow — surfaced by signal_

**[POD-ID]** — **[Show Name]:** [Episode Title] · [Duration] _(discovered via [signals])_
> [2–3 sentence description]
> [YouTube ↗ if available]

[If no discovered episodes: omit this subsection.]

---

## 🔥 Popular Now
_Trending from credible sources_

**[POP-ID]** — [Headline as markdown link if URL available, e.g. [Headline](url)]
> [Snippet] · [Outlet]

---

## 📍 Local
_[Location label(s) from local_news.locations]_

[For each location with stories, group under location label:]

### [Location Label]
**[POP-ID]** — [Headline as markdown link if URL available]
> [Snippet] · [Outlet]

[Repeat up to max_stories_per_location per location.]
[If only one location configured, skip the location sub-header.]
[If local_news.locations is empty or all feeds return nothing: omit entire section.]

---

## 🌊 In the Noise
_Trending online — not necessarily important_

- **[NOISE-ID]** [Headline] — [one-sentence context]

---
_Ask "go deeper on [ID]" for any story, or "transcript for [POD-ID]" for any podcast._
_Yesterday's digest: [relative link if it exists]_
```

---

## Writing Rules

**Calendar notes:** for each topic in `next_event_dates` with a resolved
date, compute `days_away = next_event_dates[topic].date − today` at write
time and render the note inline under that topic's section:
```
📅 Next: [Event Label] — [N] days away ([YYYY-MM-DD])
```
Using today's date from BOOTSTRAP ensures the countdown is always current,
even if the digest is read hours after being generated. Skip if
`next_event_dates[topic]` is `null`.

**Podcast cross-references:**
Cross-references from FETCH-PODCASTS (stored in `cross_refs` working context)
are rendered as lightweight one-line notes under the matched topic section:
```
🎙️ _Related: **[Show]** covered this in "[Episode title]" ([Mon D])_
```
These are NOT full podcast entries — no POD-ID, no description, no URLs.
They signal that a recent episode touched this topic. The user can request
a deep dive if interested.

Cross-references are distinct from current-episode POD-* entries. A POD-*
entry is a full story in the Podcasts section. A cross-reference is a
rendering hint under a news topic. If a current episode AND a cross-reference
both match the same topic, only render the cross-reference (the current
episode already appears in the Podcasts section — no need for both).

**Content routing:**
- FETCH-NEWS entries are always routed via their direct `topic` field.
- ENT-* entries use the `topic` field (value: `entertainment`), not `topic_match` — always render in the Entertainment section.
- POD-* entries always render in the Podcasts section. They do NOT render inline under topic sections.
- Cross-references render inline under topic sections. They do NOT appear in the Podcasts section.

**Podcasts section:** only render shows that had a current episode
fetched this run (release-day shows with a fresh episode). If no shows
have new episodes today, write:
`_No new episodes from your followed shows today._`

**Sports Last Night:** rendered from `scores_log`, not from the story
registry. Show all games for each sport with `status: games_played`.
Omit any sport with `status: out_of_season` entirely. Write "No games
played" for `status: no_games`. If all sports are quiet or out of season,
omit the entire section.

For `status: playoffs`: render the same as `games_played` but prefix the
sport header with `— Playoffs` (e.g. `### NBA — Playoffs`).

**On the Slate:** rendered from `upcoming_games_log`, not from the story
registry. Show all scheduled games with odds for each sport that has
upcoming games today. Games flagged `watch_priority: true` get a ⭐ marker.
Omit the block entirely if `upcoming_games_log` is empty.

**Non-followed game ordering:** within a sport, show followed-team games
first (marked `followed: true`), then all other games ordered by their
entry order in config.json, then by game start time within a sport (earliest
first). If start times are unavailable, preserve ESPN API order. This
applies to both scores_log and upcoming_games_log.

**Entertainment:** omit entire section if both subsections (In Theatres,
Streaming Buzz) have no qualifying entries. Do not write empty subsections.

**In the Noise:** if nothing found, write: `_Nothing trending unusually today._`

**Trending items (`source_type: trending_rss`):** render after the quality news stories for their topic, before social signals. Use the 🔥 prefix and `_(trending)_` label. These are surfaced by category-specific trending feeds (POPULAR Part C), not editorial judgment — label them accordingly.

**Outlet display:** the `[Outlet]` shown in snippet lines (`> [Snippet] · [Outlet]`) must always be a human-readable outlet name (e.g. "ESPN", "UFC.com", "The Hill") derived from the story's `outlet` field. The `source` field is provenance metadata and is never displayed. Never show `· web_search` — always resolve to the outlet name. See FETCH-NEWS.md for the attribution rule on web search results.

**Stale entries:** append `_(older)_` after source attribution.

---

## digest-index.md Format

The index is grouped by category prefix. Only render a category section if it has at least one entry that day. Within each section, rows are ordered by sequence number (01, 02, 03…).

Wrap each URL cell as a markdown link: `[↗](url)`. If the URL is unavailable, write `—`.

```markdown
# Digest Index — YYYY-MM-DD
# Chain use only. Not for direct reading.
# Last run: YYYY-MM-DDTHH:MMZ (initial)

## SPRT — Sports
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| SPRT-01 | [title] | [↗](url) | news | MMA | MMA Junkie | true | false | — | — |

## TECH — Technology
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| TECH-01 | [title] | [↗](url) | news | AI Research | MIT Technology Review | true | false | — | — |

## POL — Politics
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| POL-01 | [title] | [↗](url) | news | US Politics | The Hill | true | false | — | — |

## ENT — Entertainment
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| ENT-01 | [movie title] | [↗](url) | entertainment | — | IMDB | true | false | — | — |

## POD — Podcasts
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| POD-01 | [episode title] | [↗](url) | podcast | — | Lex Fridman | true | false | [↗](youtube url) or — | [↗](transcript url) or — |

## POP — Popular Now
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| POP-01 | [title] | [↗](url) | news | — | BBC News | true | false | — | — |

## NOISE — In the Noise
| ID | Title | URL | Type | Topic | Source/Show | Deep-Dive Eligible | Trending | YouTube | Transcript |
|----|-------|-----|------|-------|-------------|--------------------|----------|---------|------------|
| NOISE-01 | [title] | [↗](url) or — | noise | — | — | false | false | — | — |

```

The `Trending` column is `true` for stories sourced from Google News section
feeds (Category Trending in POPULAR.md, i.e. entries with `source_type: trending`).
All other stories write `false`. This flag lets downstream consumers (e.g. a
dashboard) distinguish editorially selected topic stories from trending filler.

The `YouTube` and `Transcript` columns are only meaningful for `podcast` entries.
All non-podcast rows write `—` in both columns.

Deep-Dive Eligible rules:
- `news` entries → true
- `entertainment` entries (ENT-*) → true
- `podcast` entries → true (triggers DEEP-DIVE-PODCAST)
- `noise` → false
- Sports scores → never indexed (not stories; rendered from scores_log)

---

## Directory Creation
Create `digests/YYYY-MM-DD/` if it does not exist.
Create `digests/YYYY-MM-DD/deep-dives/` as an empty folder.

---

## digest.json Format

After writing `digest.md` and `digest-index.md`, also write
`digests/YYYY-MM-DD/digest.json` — a structured JSON file that mirrors
the digest content for dashboard consumption.

Serialize the complete story registry, scores, entertainment, podcasts,
and noise data into this schema:

```json
{
  "meta": {
    "date": "YYYY-MM-DD",
    "day_of_week": "Sunday",
    "story_count": 48,
    "run_mode": "initial",
    "last_run": "YYYY-MM-DDTHH:MMZ"
  },
  "sections": {
    "for_you": [
      {
        "topic": "MMA",
        "category": "SPRT",
        "mode": "active",
        "stories": [
          {
            "id": "SPRT-01",
            "title": "Headline text",
            "url": "https://...",
            "snippet": "1-2 sentence summary",
            "source": "ESPN",
            "date": "publish date string",
            "trending": false,
            "deep_dive_eligible": true
          }
        ],
        "calendar_event": {"label": "Event name", "date": "YYYY-MM-DD", "days_away": 14},
        "cross_refs": [{"show": "Show Name", "episode_title": "...", "published": "YYYY-MM-DD"}]
      }
    ],
    "on_your_radar": [
      {
        "topic": "NHL",
        "category": "SPRT",
        "mode": "passive",
        "stories": [],
        "quiet": true
      }
    ],
    "scores": {
      "date": "YYYY-MM-DD",
      "sports": [
        {
          "name": "NBA",
          "status": "games_played",
          "games": [
            {
              "home_team": "Team Name",
              "away_team": "Team Name",
              "home_score": 95,
              "away_score": 127,
              "notable": "Blowout (32-point margin)"
            }
          ]
        }
      ]
    },
    "upcoming": {
      "date": "YYYY-MM-DD",
      "sports": [
        {
          "name": "NBA",
          "games": [
            {
              "home_team": "Team Name",
              "away_team": "Team Name",
              "start_time": "8:00 PM ET",
              "broadcast": ["ESPN"],
              "odds": {"spread": "DEN -7.5", "over_under": "224.5"},
              "watch_priority": true
            }
          ]
        }
      ]
    },
    "entertainment": {
      "movies": [
        {
          "id": "ENT-01",
          "title": "Movie Title",
          "snippet": "One sentence overview",
          "release_date": "YYYY-MM-DD",
          "vote_average": 8.2,
          "deep_dive_eligible": true
        }
      ],
      "streaming": [
        {
          "id": "ENT-04",
          "title": "Show Title",
          "snippet": "One sentence overview",
          "vote_average": 7.9,
          "deep_dive_eligible": true
        }
      ]
    },
    "podcasts": [
      {
        "id": "POD-01",
        "show": "Show Name",
        "title": "Episode Title",
        "duration": "29m",
        "date": "YYYY-MM-DD",
        "snippet": "2-3 sentence description",
        "episode_url": "https://...",
        "youtube_url": null,
        "deep_dive_eligible": true
      }
    ],
    "popular_now": [
      {
        "id": "POP-01",
        "title": "Headline",
        "url": "https://...",
        "snippet": "Summary",
        "source": "CBS News",
        "deep_dive_eligible": true
      }
    ],
    "local": {
      "locations": [
        {
          "label": "Stevensville, MI",
          "stories": [
            {
              "id": "POP-06",
              "title": "Headline",
              "url": "https://...",
              "snippet": "Summary",
              "source": "Outlet"
            }
          ]
        }
      ]
    },
    "noise": [
      {
        "id": "NOISE-01",
        "keyword": "Trending topic name",
        "context": "One sentence explaining why it's trending"
      }
    ]
  },
  "deep_dives": []
}
```

### JSON field rules

- `calendar_event`: set to `null` if no event date resolved for the topic.
- `cross_refs`: empty array if no cross-references matched.
- `quiet`: `true` if a passive topic had no stories after filtering.
- `scores` and `upcoming`: omit sports with `status: "out_of_season"`.
  Set entire section to `null` if no scores or upcoming games exist.
- `deep_dives`: list any `.md` files that already exist in `deep-dives/`.
  Each entry: `{"id": "TECH-04", "file": "deep-dives/TECH-04.md", "title": "..."}`.
- All `snippet` fields: ≤2 sentences, same content as the markdown digest.

### Refresh mode

On refresh runs: read the existing `digest.json`, merge new stories into
the appropriate `sections` arrays (append to the correct topic/section),
update `meta.last_run` and `meta.story_count`. Do not replace existing
entries — only add new ones.

---

## Completion
Confirm to user: "Digest ready — digests/YYYY-MM-DD/digest.md"
Print one-line summary: stories, podcasts, passive topics with no results.
