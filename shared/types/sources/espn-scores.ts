/**
 * ESPN Scoreboard API — raw source notes
 *
 * NOT used at runtime. Documents what's available beyond what we extract.
 *
 * Used by: Scores section (team sports, UFC, F1).
 * The scores pipeline already extracts most useful fields — see
 * scripts/scores/ for per-sport parsing modules.
 *
 * This file only documents fields NOT currently extracted that could
 * be useful for dashboard enhancements.
 *
 * Last audited: 2026-04-22
 */

// ---------------------------------------------------------------------------
// Fields available but NOT currently extracted
// ---------------------------------------------------------------------------

// Team sports (NBA, NHL, MLB, NFL, College)
//
// - Team color codes      → primary/secondary hex for theming game cards
// - Player headshot URLs  → small images for leaders display
// - Full box score        → complete stat lines per player
// - Play-by-play          → detailed game log
// - Betting odds          → spread, over/under, moneyline (on some events)
// - Weather conditions    → outdoor sports (MLB, NFL)
// - Attendance figures    → crowd size
// - Series record         → playoff context ("Series tied 1-1")
//   (partially in `notes` but not structured)

// UFC/MMA
//
// - Fighter headshot URLs → available in competitor data
// - Tale of the tape      → height, weight, reach per fighter
// - Detailed fight stats  → significant strikes, takedowns, control time
// - Judge scorecards      → round-by-round scores for decisions
// - Undercard details     → preliminary/early preliminary card separation

// F1
//
// - Lap times             → per-driver lap data for completed sessions
// - Tire strategy         → compound choices per stint
// - Gap to leader         → time delta for standings
// - Fastest lap           → flagged in race results
// - Grid vs finish        → positions gained/lost
// - Constructor standings → team championship points
