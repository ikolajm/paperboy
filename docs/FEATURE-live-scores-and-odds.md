# Feature: Live Scores & Odds

Status: **Deferred** — implement after v1 digest pipeline is stable and dashboard is rendering daily data.

---

## Live Score Tracking

### Concept
Real-time score updates during active events. The dashboard polls ESPN endpoints on an interval while games are in progress, providing an ESPN gamecast-like experience within Paperboy.

### How It Works
The ESPN scoreboard API returns different data based on game state:
- `pre` — scheduled (odds, broadcast, venue)
- `in` — live (updating scores, linescores, game situation)
- `post` — completed (final scores, leaders, headlines, recap)

The dashboard detects `in`-state games on today's scoreboard and begins polling.

### Two levels of detail

**Level 1: Scoreboard polling (low effort)**
- Poll the existing scoreboard endpoint every 30-60 seconds per sport
- Returns updating scores, period/quarter, game clock
- Same data structure as daily digest, just refreshed
- No new endpoints needed

**Level 2: Per-game detail (higher effort)**
- ESPN summary endpoint: `/apis/site/v2/sports/{sport}/{league}/summary?event={eventId}`
- Returns play-by-play, full box score, real-time situation (possession, down/distance, shot clock)
- Triggered when user clicks into a specific game
- Heavier API call, per-game instead of per-sport

### Config extension
```json
"NBA": {
  "url": "...",
  "recaps": true,
  "schedule": true,
  "live": {
    "enabled": true,
    "poll_interval": 30,
    "detail_endpoint": "/apis/site/v2/sports/basketball/nba/summary"
  }
}
```

### What "live" means per sport

| Sport | Key live data | Source |
|-------|-------------|--------|
| NBA | Score, quarter, time, possession, player stats | Scoreboard + summary |
| NHL | Score, period, time, shots on goal, power play status | Scoreboard + summary |
| MLB | Score, inning, count, runners on base, pitcher/batter | Scoreboard + summary |
| NFL | Score, quarter, time, down/distance, possession | Scoreboard + summary |
| MMA | Round, time, method (if finished) | Scoreboard (limited detail) |
| F1 | Lap, position order, gaps, pit stops | Separate API — needs research |

### Implementation approach
1. Add `/api/live/[sport]` route in frontend — proxies to ESPN scoreboard
2. Frontend polls when `in`-state games detected
3. Per-game detail view added later via summary endpoint
4. No persistent server process — polling happens from the browser while dashboard is open

---

## Sports Betting / Odds

### Concept
Surface betting lines (spread, over/under, moneyline) for upcoming games. Data is already embedded in the ESPN scoreboard response for `pre`-state games.

### Available data (from ESPN `competitions[].odds[]`)
- `details` — spread line (e.g., "PHI -1.5")
- `overUnder` — total points line (e.g., 223.5)
- `homeTeamOdds.moneyLine` / `awayTeamOdds.moneyLine` — moneyline odds
- `provider` — odds provider name (e.g., "DraftKings")
- Opening vs closing lines may be available in nested objects

### Known ESPN endpoints for odds
- Scoreboard endpoint (already configured) — has odds embedded for scheduled games
- Odds-specific endpoint may exist per the unofficial API docs — needs research
- Historical odds/line movement — unknown availability

### Config extension
```json
"NBA": {
  "url": "...",
  "recaps": true,
  "schedule": true,
  "odds": true
}
```

The `odds: true` toggle is already in config v3 but currently unused. When implementing, the scores script reads this flag to decide whether to extract and include odds data in the output.

### UI considerations
- Lines move — show timestamp or "as of" marker
- Opening vs current line comparison
- Provider attribution (DraftKings, ESPN BET, etc.)
- Spread, O/U, and moneyline should be separately toggleable in display

---

## Dependencies
- Both features depend on v1 dashboard rendering scores data
- Live polling depends on frontend API routes being built
- Odds can be added to the scores script independently of live polling
- F1 live tracking may need a non-ESPN data source — research needed

## Reference
- [Unofficial ESPN API docs](https://github.com/pseudo-r/Public-ESPN-API)
