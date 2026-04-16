# Entertainment & Sports Last Night

## Purpose
Fetch entertainment trending content (movies, streaming) and last night's
sports scores. This stage runs after POPULAR and produces two new digest
sections that sit outside the main news pipeline.

Read `config/config.json` for all source URLs, which sports have `scores: true`,
and any `followed_teams` lists.

---

## Section A: Entertainment Sweep

### What it is
Movies in theatres, new releases with meaningful buzz, and streaming
shows gaining real traction online. Not creator content, not Twitch,
not YouTube drama — film, TV, and streaming only.

### Fetch approach

Structured endpoints always before HTML pages. See `_fetch_priority` in
config.json. Chart pages (IMDB, Box Office Mojo) are JS-rendered and
will often return empty — they are last resort only.

**Movies — fetch in this order:**

0. **TMDB API (single script call):**
   Run `python3 scripts/fetch_tmdb.py config/config.json config/credentials.json`
   which fetches all 5 TMDB endpoints in parallel and returns structured JSON:
   ```json
   {
     "now_playing": [{"title": "...", "release_date": "...", "overview": "...", "vote_average": 8.1}],
     "upcoming": [...],
     "trending_movies": [...],
     "trending_tv": [...],
     "on_the_air": [...]
   }
   ```
   The script handles API key auth, exclude pattern filtering, and result
   truncation automatically. Parse the output to populate ENT entries:
   - Prefer `now_playing` and `trending_movies` for movie entries
   - Prefer `trending_tv` and `on_the_air` for streaming entries
   - Use `vote_average` ≥ 6.0 as a quality/buzz signal

   If `credentials.tmdb.api_key` is absent: the script exits with an error.
   Skip Step 0 silently and fall through to web search.

If Step 0 yields fewer than 2 viable movies, supplement with a web search
for recent movie news. Do not attempt JS-rendered chart pages, which
reliably return empty content on a plain fetch.

Deduplicate by title — keep whichever entry has the richer data.

**Streaming — fetch in this order:**

0. **TMDB API (covered above in Movies Step 0):** `trending_tv` and
   `on_the_air` results feed into streaming entries. No separate fetch needed.

If Step 0 yields fewer than 2 viable streaming entries, supplement with a
web search for recent streaming news.

### Quality filter
Include an entertainment entry if:
- It refers to a specific film or show (not a genre, platform, or
  actor's general career)
- It has clear signal — either chart placement, critic/audience score,
  or meaningful engagement
- It does not match any pattern in `entertainment.exclude_patterns`
  (twitch, kick, streaming creator, vtuber, etc.)

### ID assignment
Prefix: `ENT`
Sequential. Example: `ENT-01` (movie), `ENT-02` (streaming show)

### Story registry entry
Add each qualifying entertainment item as a standard story entry:
```
id:          ENT-01
title:       [Film or show title]
url:         [IMDB page, RT page, or TMDB page URL]
outlet:      [IMDB / Box Office Mojo / TMDB / Deadline / etc.]
source:      [datasource URL fetched — e.g. TMDB API endpoint or chart page URL]
source_type: editorial | api
snippet:     [see below]
topic:       entertainment
type:        entertainment
```

**`source_type`** distinguishes how DEEP-DIVE-NEWS should handle a deep dive:
- `editorial` — the URL points to a real article (IMDB page, RT page, Deadline piece, etc.)
- `api` — TMDB-sourced entries: treat as `editorial` (the TMDB page is a real content
  page with trailers, cast, reviews, and streaming availability)

**`snippet` format:**
- `[chart rank if known] · [RT or audience score if known] · [one-line description or headline]`

Note: ENT entries use `topic: entertainment` for classification, not `topic_match`.
They always render in the Entertainment section — `topic_match` is not used here.

Deep-dive eligible: **true** (entertainment stories can be deep-dived
for reviews, cast details, and streaming availability).

### Cap
4 movies, 4 streaming shows. Do not pad — if only 2 movies have
meaningful signal today, show 2.

---

## Section B: Sports Last Night

### What it is
Final scores from last night for each sport configured with `scores: true`
in config.json. Always shown when games occurred. Compact and factual —
not a news story, not deep-dive eligible.

This is **not** added to the story registry. Scores are structured data
rendered directly by WRITE. Store them in a separate **`scores_log`**.

### Sports news stories vs. scores
These are different things:
- **Scores** (this section): structured results fetched here, stored in
  `scores_log`, never in story registry. Shown in "Sports Last Night."
- **Sports news** (trades, signings, injuries): fetched in FETCH-NEWS as
  normal passive-mode stories. Go through the filter pipeline.
  Shown in "On Your Radar."

### Fetch approach
For each sport that has `scores: true` in config.json, work through the
following fallback chain. Move to the next step only if the current one
fails (returns an error, empty data, or clearly unparseable content).

**Step 0 — Utility script (preferred)**

Run `python3 scripts/fetch_scores.py config/config.json YYYY-MM-DD --json` (today's date).
This fetches ALL sports' scoreboards in parallel and returns structured JSON
with `scores_log` and `upcoming_games_log` arrays. It handles yesterday's
completed games, today's upcoming games with odds, and `watch_priority` flagging.
The JSON output passes directly into `digest.json` at the WRITE stage.

If the script succeeds: use its output directly. Skip to Step 2 fallback only
for any sport that shows `fetch_error` in the output.

If the script is unavailable or fails entirely: fall through to Step 1.

**Step 1 — ESPN JSON API (manual fallback)**

Look up the sport's scores endpoint(s) from config.json. Two formats exist:

- **`scores_url`** (string) — single sport (e.g. NBA, NHL, MLB, MMA).
  Fetch in two parallel calls:
  1. `scores_url?dates=YYYYMMDD` for yesterday's date → completed games
  2. `scores_url` (no date filter) → today's scheduled/upcoming games

- **`scores_urls`** (object) — merged multi-sport topic (e.g. College Sports).
  Keys are sport identifiers, values are ESPN scoreboard URLs.
  Fetch each URL in the same two-call pattern, in parallel across all keys.
  Label each sport's results with the key name in the `scores_log`.

ESPN's scoreboard endpoint returns structured JSON without JS rendering.

Note: `scores_url`/`scores_urls` use unofficial internal ESPN APIs. They
are the best free structured option available but are not formally
supported — if one returns an error or malformed response, treat it as
a fetch failure and move to Step 2. Do not record `no_games` on an API
error alone.

If an ESPN API returns empty, a 404, or malformed data, log an advisory before falling back:
> _Advisory: ESPN scores API for [Sport] returned no data — falling back to [next source]. If this recurs, the endpoint URL may have changed. Update `scores_url`/`scores_urls` in config.json._

Apply the same advisory pattern to all source failures in the fallback chain: name the failing URL or source, state the fallback being used.

**From yesterday's response** — for each completed game, collect:
- Home team and away team names
- Final score (home score, away score)
- Game status (regular season, playoffs, etc.)
- One notable moment if clearly present:
  - Overtime or multiple OT
  - A lopsided result (30+ point margin in NBA, 5+ goal margin in NHL)
  - A record broken (noted in the API response)
  - A player's standout stat line (40+ points, hat trick, etc.)

**From today's response** — for each scheduled game (`status.type.state == "pre"`),
collect odds and broadcast data for the `upcoming_games_log`:
- Home team and away team names
- Start time: `competitions[].date` (ISO 8601 → convert to local 12h time)
- Broadcast: `competitions[].broadcasts[].names[]` (e.g. "ESPN", "TNT", "ABC")
- Odds from `competitions[].odds[0]`:
  - Spread: `odds[0].details` (e.g. "LAL -7.5")
  - Over/Under: `odds[0].overUnder` (e.g. 224.5)
  - Home moneyline: `odds[0].moneyline.home` or `odds[0].homeTeamOdds.moneyLine`
  - Away moneyline: `odds[0].moneyline.away` or `odds[0].awayTeamOdds.moneyLine`

If `odds[]` is empty or absent for a game: record odds fields as null.
Note: odds are only present on scheduled (pre-game) events, not completed ones.

**Watch priority heuristic** — flag `watch_priority: true` if any apply:
- Spread ≤ 5 pts (NBA/NCAAB), ≤ 1.5 (NHL/MLB), ≤ 7 pts (NCAAF/MMA)
- National broadcast: ESPN, TNT, ABC, NBC, CBS, FS1, TBS (not regional RSN)
- Underdog moneyline ≤ +150 (implies ≤60/40 split — competitive game)

**Step 2 — Web search (fallback)**

Search: `[sport name] scores [yesterday's date, e.g. "March 18 2026"]`

Extract final scores from results. This is less structured — record what
is clearly legible. If no scores are found after this step, then record:
```
{ sport: "NBA", date: "YYYY-MM-DD", status: "no_games" }
```

Only use `no_games` when both steps returned no game data. Use
`out_of_season` only when the sport is clearly not in its active season.

### scores_log format
```
scores_log = [
  {
    sport: "NBA",
    date: "YYYY-MM-DD",
    status: "games_played",
    games: [
      {
        home_team: "Boston Celtics",
        away_team: "Miami Heat",
        home_score: 108,
        away_score: 112,
        notable: "OT — Heat won in overtime on Butler 3-pointer"
      },
      {
        home_team: "Chicago Bulls",
        away_team: "Detroit Pistons",
        home_score: 104,
        away_score: 98,
        notable: null
      }
    ]
  },
  {
    sport: "NHL",
    date: "YYYY-MM-DD",
    status: "no_games"
  },
  {
    sport: "MLB",
    date: "YYYY-MM-DD",
    status: "out_of_season"
  }
]
```

### upcoming_games_log format
Populated from today's scoreboard response (no date filter). Only include
sports with at least one scheduled game.

```
upcoming_games_log = [
  {
    sport: "NBA",
    date: "YYYY-MM-DD",
    games: [
      {
        home_team: "Golden State Warriors",
        away_team: "Phoenix Suns",
        start_time: "10:00 PM",
        broadcast: ["TNT"],
        odds: {
          spread: "GSW -2.5",
          over_under: 228.0,
          home_ml: -140,
          away_ml: +118
        },
        watch_priority: true
      },
      {
        home_team: "Sacramento Kings",
        away_team: "Charlotte Hornets",
        start_time: "7:00 PM",
        broadcast: ["FanDuel SN SE"],
        odds: {
          spread: "CHA -17.5",
          over_under: 229.5,
          home_ml: -1650,
          away_ml: +950
        },
        watch_priority: false
      }
    ]
  }
]
```

If the scoreboard returns no scheduled games for a sport: omit that sport
from `upcoming_games_log` entirely. If all sports are off-day or out of
season: `upcoming_games_log` is empty (`[]`).

`out_of_season` vs `no_games`: if the scoreboard page clearly has no
content or states no games (e.g. off-day during active season), use
`no_games`. If the season hasn't started or has ended, use `out_of_season`.

Valid status values: `games_played`, `no_games`, `out_of_season`, `playoffs`.
Use `playoffs` when the ESPN API indicates postseason/playoff bracket
(e.g. `seasonType` field in the response indicates postseason). Render
same as `games_played` but WRITE will prefix the sport header with `— Playoffs`.

### Followed teams
If `followed_teams` is set for a sport in config.json and is non-empty:
- Mark games involving a followed team with `followed: true` in the entry.
- WRITE will display followed-team games first within that sport's card.
- Games not involving followed teams still appear, below followed games.

If `followed_teams` is empty or absent: all games are shown equally,
in order of occurrence.

---

## Output
Story registry now contains ENT-* entertainment entries.
`scores_log` is populated for all configured sports.

Proceed to the next stage in the chain.
