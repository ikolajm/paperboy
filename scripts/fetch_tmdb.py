#!/usr/bin/env python3
"""Fetch entertainment data from TMDB API endpoints in parallel.

Reads config.json for endpoint paths and credentials.json for API key.
Fetches all configured endpoints concurrently and outputs structured JSON.

Usage:
    python3 scripts/fetch_tmdb.py config/config.json config/credentials.json

Output: JSON to stdout with results keyed by endpoint name.
"""

import json
import re
import sys
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed


def fetch_json(url, api_key, timeout=15):
    """Fetch a URL with TMDB API key and return parsed JSON."""
    separator = "&" if "?" in url else "?"
    full_url = f"{url}{separator}api_key={api_key}"
    req = urllib.request.Request(full_url, headers={"User-Agent": "NewsDigest/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def truncate(text, max_len=200):
    """Truncate text to max_len characters."""
    if not text or len(text) <= max_len:
        return text or ""
    return text[:max_len - 3] + "..."


def matches_exclude(title, overview, patterns):
    """Check if a title or overview matches any exclude pattern."""
    combined = f"{title} {overview}".lower()
    return any(p.lower() in combined for p in patterns)


def parse_results(data, endpoint_name, exclude_patterns, max_results=4):
    """Parse TMDB API response into clean entries."""
    items = data.get("results", [])
    entries = []

    for item in items:
        title = item.get("title") or item.get("name", "")
        overview = item.get("overview", "")

        if matches_exclude(title, overview, exclude_patterns):
            continue

        entry = {
            "title": title,
            "overview": truncate(overview),
            "vote_average": item.get("vote_average"),
        }

        # Movies have release_date, TV has first_air_date
        if "release_date" in item:
            entry["release_date"] = item["release_date"]
        if "first_air_date" in item:
            entry["first_air_date"] = item["first_air_date"]

        entries.append(entry)
        if len(entries) >= max_results:
            break

    return entries


def fetch_endpoint(name, url, api_key, exclude_patterns, max_results):
    """Fetch and parse one TMDB endpoint. Returns (name, entries_or_error)."""
    try:
        data = fetch_json(url, api_key)
        entries = parse_results(data, name, exclude_patterns, max_results)
        return (name, entries)
    except urllib.error.HTTPError as e:
        return (name, {"status": "fetch_error", "error": f"HTTP {e.code}: {e.reason}"})
    except Exception as e:
        return (name, {"status": "fetch_error", "error": str(e)})


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 fetch_tmdb.py <config.json> <credentials.json>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1]) as f:
        config = json.load(f)
    with open(sys.argv[2]) as f:
        credentials = json.load(f)

    tmdb_config = config.get("entertainment", {}).get("tmdb", {})
    base_url = tmdb_config.get("base_url", "")
    endpoints = tmdb_config.get("endpoints", {})
    api_key = credentials.get("tmdb", {}).get("api_key", "")

    if not base_url or not api_key:
        print(json.dumps({"status": "error", "error": "Missing TMDB base_url or api_key"}))
        sys.exit(1)

    exclude_patterns = config.get("entertainment", {}).get("exclude_patterns", [])
    movies_max = config.get("entertainment", {}).get("movies", {}).get("max_results", 4)
    streaming_max = config.get("entertainment", {}).get("streaming", {}).get("max_results", 4)

    # Map endpoint names to max_results
    max_map = {
        "now_playing": movies_max,
        "upcoming": movies_max,
        "trending_movies": movies_max,
        "trending_tv": streaming_max,
        "on_the_air": streaming_max,
    }

    # Fetch all endpoints in parallel
    results = {}
    with ThreadPoolExecutor(max_workers=len(endpoints)) as executor:
        futures = {
            executor.submit(
                fetch_endpoint,
                name,
                f"{base_url}{path}",
                api_key,
                exclude_patterns,
                max_map.get(name, 4),
            ): name
            for name, path in endpoints.items()
        }
        for future in as_completed(futures):
            name, data = future.result()
            results[name] = data

    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
