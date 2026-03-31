#!/usr/bin/env python3
"""Fetch sports scores and upcoming games from ESPN scoreboard API.

Reads config.json for all topics with scores: true, fetches yesterday's
results and today's upcoming games in parallel, and outputs compact
markdown tables.

Usage:
    python3 scripts/fetch_scores.py config/config.json [YYYY-MM-DD]

If date is omitted, uses today's date. Yesterday's scores are fetched
relative to the given date.

Output: markdown to stdout with two sections:
    ## scores_log
    ## upcoming_games_log

On per-sport errors, outputs a fetch_error entry for that sport and
continues with the rest. The agent can fall back to manual fetch for
any sport that errors.
"""

import json
import sys
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta


# Spread thresholds for watch_priority by sport keyword
SPREAD_THRESHOLDS = {
    "basketball": 5,
    "hockey": 1.5,
    "baseball": 1.5,
    "mma": 7,
    "football": 7,
    "racing": None,
}

NATIONAL_BROADCASTS = {"ESPN", "TNT", "ABC", "NBC", "CBS", "FS1", "TBS", "FOX"}


def fetch_json(url, timeout=15):
    """Fetch a URL and return parsed JSON, or raise on failure."""
    req = urllib.request.Request(url, headers={"User-Agent": "NewsDigest/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def sport_key_from_url(scores_url):
    """Extract sport keyword from ESPN URL for threshold lookup."""
    for key in SPREAD_THRESHOLDS:
        if key in scores_url:
            return key
    return "basketball"


def parse_notable(game):
    """Extract a notable moment from a completed game if present."""
    comps = game.get("competitions", [{}])
    if not comps:
        return None
    comp = comps[0]

    # Check for overtime
    status = comp.get("status", {}).get("type", {})
    detail = comp.get("status", {}).get("type", {}).get("detail", "")
    if not detail:
        detail = game.get("status", {}).get("type", {}).get("detail", "")

    if "OT" in detail:
        return detail

    # Check score margin
    competitors = comp.get("competitors", [])
    if len(competitors) == 2:
        try:
            s1 = int(competitors[0].get("score", "0"))
            s2 = int(competitors[1].get("score", "0"))
            margin = abs(s1 - s2)
            if margin >= 30:
                return f"Blowout ({margin}-point margin)"
        except (ValueError, TypeError):
            pass

    # Check for standout performer in headlines
    headlines = game.get("headlines", [])
    if headlines:
        desc = headlines[0].get("description", "")
        if desc and len(desc) < 120:
            return desc

    return None


def parse_team_name(competitor):
    """Get display name from competitor object."""
    team = competitor.get("team", {})
    return team.get("displayName", team.get("shortDisplayName", team.get("name", "Unknown")))


def parse_completed_games(data, sport_name):
    """Parse completed games from ESPN scoreboard response."""
    events = data.get("events", [])
    games = []
    for event in events:
        comps = event.get("competitions", [{}])
        if not comps:
            continue
        comp = comps[0]

        status_type = comp.get("status", {}).get("type", {})
        if not status_type:
            status_type = event.get("status", {}).get("type", {})

        state = status_type.get("state", "")
        if state != "post":
            continue

        competitors = comp.get("competitors", [])
        if len(competitors) < 2:
            continue

        home = away = None
        for c in competitors:
            if c.get("homeAway") == "home":
                home = c
            else:
                away = c

        if not home or not away:
            home, away = competitors[0], competitors[1]

        try:
            home_score = int(home.get("score", "0"))
            away_score = int(away.get("score", "0"))
        except (ValueError, TypeError):
            home_score = home.get("score", "?")
            away_score = away.get("score", "?")

        games.append({
            "home_team": parse_team_name(home),
            "away_team": parse_team_name(away),
            "home_score": home_score,
            "away_score": away_score,
            "notable": parse_notable(event),
        })

    return games


def parse_upcoming_games(data, sport_name, sport_key, target_date=None):
    """Parse upcoming/scheduled games with odds from ESPN scoreboard."""
    events = data.get("events", [])
    games = []
    for event in events:
        comps = event.get("competitions", [{}])
        if not comps:
            continue
        comp = comps[0]

        status_type = comp.get("status", {}).get("type", {})
        if not status_type:
            status_type = event.get("status", {}).get("type", {})

        state = status_type.get("state", "")
        if state != "pre":
            continue

        competitors = comp.get("competitors", [])

        # MMA events use event-level name (e.g. "UFC 300: Pereira vs. Hill")
        # instead of home/away competitors
        is_mma = sport_key == "mma"
        if is_mma:
            event_name = event.get("name", event.get("shortName", "TBD"))
        else:
            if len(competitors) < 2:
                continue

        home = away = None
        if not is_mma:
            for c in competitors:
                if c.get("homeAway") == "home":
                    home = c
                else:
                    away = c
            if not home or not away:
                home, away = competitors[0], competitors[1]

        # Start time
        date_str = comp.get("date", event.get("date", ""))
        start_time = ""
        game_dt = None
        if date_str:
            try:
                game_dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                from datetime import timezone
                et = game_dt.astimezone(tz=timezone(timedelta(hours=-4)))
                start_time = et.strftime("%-I:%M %p ET")
            except Exception:
                start_time = date_str

        # Skip games more than 7 days away (next-season schedule placeholders)
        if game_dt and target_date:
            from datetime import timezone as tz
            game_naive = game_dt.replace(tzinfo=None)
            if (game_naive - target_date).days > 7:
                continue

        # Broadcast
        broadcasts = []
        for b in comp.get("broadcasts", []):
            for name in b.get("names", []):
                broadcasts.append(name)

        # Odds
        odds_list = comp.get("odds", [])
        odds = None
        if odds_list:
            o = odds_list[0]
            spread = o.get("details", "")
            over_under = o.get("overUnder")
            home_ml = (o.get("homeTeamOdds", {}).get("moneyLine")
                       or o.get("moneyline", {}).get("home"))
            away_ml = (o.get("awayTeamOdds", {}).get("moneyLine")
                       or o.get("moneyline", {}).get("away"))
            odds = {
                "spread": spread,
                "over_under": over_under,
                "home_ml": home_ml,
                "away_ml": away_ml,
            }

        # Watch priority
        watch = False
        threshold = SPREAD_THRESHOLDS.get(sport_key)
        if odds and threshold and odds["spread"]:
            try:
                spread_val = abs(float(odds["spread"].split()[-1]))
                if spread_val <= threshold:
                    watch = True
            except (ValueError, IndexError):
                pass
        if any(b in NATIONAL_BROADCASTS for b in broadcasts):
            watch = True
        if odds and odds["away_ml"] is not None:
            try:
                if abs(int(odds["away_ml"])) <= 150:
                    watch = True
            except (ValueError, TypeError):
                pass

        game_entry = {
            "start_time": start_time,
            "broadcast": broadcasts,
            "odds": odds,
            "watch_priority": watch,
        }
        if is_mma:
            game_entry["event_name"] = event_name
            game_entry["is_mma"] = True
        else:
            game_entry["home_team"] = parse_team_name(home)
            game_entry["away_team"] = parse_team_name(away)
        games.append(game_entry)

    return games


def detect_season_status(data):
    """Detect if sport is in season, playoffs, or out of season."""
    events = data.get("events", [])
    if not events:
        return "no_games"

    for event in events:
        season_type = event.get("season", {}).get("type", 0)
        if season_type == 3:
            return "playoffs"

    return "games_played"


def fetch_sport(topic_name, scores_url, target_date):
    """Fetch scores and upcoming for one sport. Returns (sport, scores, upcoming, error)."""
    yesterday = (target_date - timedelta(days=1)).strftime("%Y%m%d")
    yesterday_display = (target_date - timedelta(days=1)).strftime("%Y-%m-%d")
    today_display = target_date.strftime("%Y-%m-%d")
    sport_key = sport_key_from_url(scores_url)

    result = {
        "sport": topic_name,
        "scores": None,
        "upcoming": None,
        "error": None,
    }

    # Fetch yesterday's scores
    try:
        yesterday_url = f"{scores_url}?dates={yesterday}"
        data = fetch_json(yesterday_url)
        games = parse_completed_games(data, topic_name)
        status = detect_season_status(data) if games else "no_games"
        if not games:
            events = data.get("events", [])
            if not events:
                status = "no_games"
        result["scores"] = {
            "sport": topic_name,
            "date": yesterday_display,
            "status": status if games else "no_games",
            "games": games,
        }
    except Exception as e:
        result["scores"] = {
            "sport": topic_name,
            "date": yesterday_display,
            "status": "fetch_error",
            "error": str(e),
        }

    # Fetch today's upcoming
    try:
        data = fetch_json(scores_url)
        games = parse_upcoming_games(data, topic_name, sport_key, target_date)
        result["upcoming"] = {
            "sport": topic_name,
            "date": today_display,
            "games": games,
        }
    except Exception as e:
        result["upcoming"] = {
            "sport": topic_name,
            "date": today_display,
            "games": [],
            "error": str(e),
        }

    return result


def abbreviate(team_name):
    """Create a short abbreviation from a team name for score display."""
    # Common mappings; fall back to first 3 chars of last word
    words = team_name.split()
    if len(words) >= 2:
        return words[-1][:3].upper()
    return team_name[:3].upper()


def format_scores_log(all_scores):
    """Format scores_log as markdown tables."""
    lines = ["## scores_log", ""]

    for entry in all_scores:
        sport = entry["sport"]
        date = entry["date"]
        status = entry["status"]

        if status == "fetch_error":
            lines.append(f"### {sport} — {date}")
            lines.append(f"**fetch_error:** {entry.get('error', 'unknown')}")
            lines.append("")
            continue

        if status == "no_games":
            lines.append(f"### {sport} — {date} — no games")
            lines.append("")
            continue

        if status == "out_of_season":
            lines.append(f"### {sport} — {date} — out of season")
            lines.append("")
            continue

        playoff_tag = " — Playoffs" if status == "playoffs" else ""
        lines.append(f"### {sport} — {date}{playoff_tag}")
        lines.append("")

        games = entry.get("games", [])
        if not games:
            lines.append("No completed games.")
            lines.append("")
            continue

        lines.append("| Game | Score | Notable |")
        lines.append("|------|-------|---------|")
        for g in games:
            away = g["away_team"]
            home = g["home_team"]
            game_str = f"{away} vs {home}"
            score_str = f"{abbreviate(away)} {g['away_score']} — {abbreviate(home)} {g['home_score']}"
            notable = g.get("notable") or "X"
            lines.append(f"| {game_str} | {score_str} | {notable} |")

        lines.append("")

    return "\n".join(lines)


def format_upcoming_log(all_upcoming):
    """Format upcoming_games_log as markdown tables."""
    lines = ["## upcoming_games_log", ""]

    for entry in all_upcoming:
        sport = entry["sport"]
        games = entry.get("games", [])

        if entry.get("error"):
            lines.append(f"### {sport}")
            lines.append(f"**fetch_error:** {entry['error']}")
            lines.append("")
            continue

        if not games:
            continue

        lines.append(f"### {sport} — {entry['date']}")
        lines.append("")
        lines.append("| Game | Time | Network | Line | Watch |")
        lines.append("|------|------|---------|------|-------|")

        for g in games:
            watch = "⭐" if g.get("watch_priority") else ""
            broadcast = ", ".join(g.get("broadcast", [])) or "—"
            odds = g.get("odds")
            odds_str = "—"
            if odds and odds.get("spread"):
                parts = [odds["spread"]]
                if odds.get("over_under"):
                    parts.append(f"O/U {odds['over_under']}")
                odds_str = " · ".join(parts)

            if g.get("is_mma"):
                game_str = g.get("event_name", "TBD")
            else:
                game_str = f"{g['away_team']} at {g['home_team']}"
            lines.append(f"| {game_str} | {g['start_time']} | {broadcast} | {odds_str} | {watch} |")

        lines.append("")

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 fetch_scores.py <config.json> [YYYY-MM-DD] [--json]", file=sys.stderr)
        sys.exit(1)

    config_path = sys.argv[1]
    with open(config_path) as f:
        config = json.load(f)

    # Parse optional args (date and --json flag can be in any order)
    output_json = "--json" in sys.argv
    date_arg = None
    for arg in sys.argv[2:]:
        if arg != "--json":
            date_arg = arg

    if date_arg:
        target_date = datetime.strptime(date_arg, "%Y-%m-%d")
    else:
        target_date = datetime.now()

    # Collect all sports with scores: true
    sports = []
    for topic_name, topic in config.get("topics", {}).items():
        if topic.get("scores") and topic.get("scores_url"):
            sports.append((topic_name, topic["scores_url"]))

    if not sports:
        print("No sports with scores: true and scores_url found in config.")
        sys.exit(0)

    # Fetch all in parallel
    results = []
    with ThreadPoolExecutor(max_workers=len(sports)) as executor:
        futures = {
            executor.submit(fetch_sport, name, url, target_date): name
            for name, url in sports
        }
        for future in as_completed(futures):
            results.append(future.result())

    # Sort by config order
    sport_order = [name for name, _ in sports]
    results.sort(key=lambda r: sport_order.index(r["sport"]) if r["sport"] in sport_order else 99)

    all_scores = [r["scores"] for r in results if r["scores"]]
    all_upcoming = [r["upcoming"] for r in results if r["upcoming"]]

    if output_json:
        print(json.dumps({
            "scores_log": all_scores,
            "upcoming_games_log": all_upcoming,
        }, indent=2, ensure_ascii=False))
    else:
        print(format_scores_log(all_scores))
        print()
        print(format_upcoming_log(all_upcoming))


if __name__ == "__main__":
    main()
