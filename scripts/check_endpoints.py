#!/usr/bin/env python3
"""Health check for ESPN and TMDB API endpoints.

Reads config.json, pings every configured API endpoint, and reports
status. Useful for catching breakage in unofficial ESPN APIs.

Usage:
    python3 scripts/check_endpoints.py config/config.json

Output: status table to stdout. Exit code 0 if all pass, 1 if any fail.
"""

import json
import sys
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed


def ping(name, url, timeout=10):
    """Ping a URL and return (name, url, status, detail)."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "NewsDigest/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            # For JSON APIs, verify we get parseable JSON
            body = resp.read()
            try:
                json.loads(body)
                return (name, url, "OK", f"HTTP {code}, valid JSON")
            except (json.JSONDecodeError, ValueError):
                # RSS/XML feeds are fine too
                if b"<rss" in body[:500] or b"<feed" in body[:500] or b"<?xml" in body[:500]:
                    return (name, url, "OK", f"HTTP {code}, valid XML")
                return (name, url, "WARN", f"HTTP {code}, not JSON or XML")
    except urllib.error.HTTPError as e:
        return (name, url, "FAIL", f"HTTP {e.code}: {e.reason}")
    except urllib.error.URLError as e:
        return (name, url, "FAIL", str(e.reason))
    except Exception as e:
        return (name, url, "FAIL", str(e))


def collect_endpoints(config):
    """Extract all API endpoints from config.json."""
    endpoints = []

    for topic_name, topic in config.get("topics", {}).items():
        for key in ("scores_url", "news_url", "standings_url", "schedule_url"):
            if topic.get(key):
                endpoints.append((f"{topic_name} {key}", topic[key]))

        # Handle plural keys (College Sports)
        for key in ("scores_urls", "standings_urls"):
            if topic.get(key):
                for sub_name, sub_url in topic[key].items():
                    endpoints.append((f"{topic_name} {key}.{sub_name}", sub_url))

    # TMDB
    ent = config.get("entertainment", {})
    tmdb = ent.get("tmdb", {})
    base = tmdb.get("base_url", "")
    for ep_name, ep_path in tmdb.get("endpoints", {}).items():
        if base and ep_path:
            endpoints.append((f"TMDB {ep_name}", f"{base}{ep_path}"))

    # RSS feeds (spot-check first feed per topic)
    for topic_name, topic in config.get("topics", {}).items():
        rss_list = topic.get("rss", [])
        if rss_list:
            endpoints.append((f"{topic_name} RSS[0]", rss_list[0]))

    return endpoints


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 check_endpoints.py <config.json>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1]) as f:
        config = json.load(f)

    endpoints = collect_endpoints(config)

    if not endpoints:
        print("No endpoints found in config.")
        sys.exit(0)

    print(f"Checking {len(endpoints)} endpoints...\n")

    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(ping, name, url): name
            for name, url in endpoints
        }
        for future in as_completed(futures):
            results.append(future.result())

    # Sort by status (FAIL first, then WARN, then OK)
    order = {"FAIL": 0, "WARN": 1, "OK": 2}
    results.sort(key=lambda r: (order.get(r[2], 3), r[0]))

    # Print table
    print(f"{'Status':<6} {'Endpoint':<45} {'Detail'}")
    print(f"{'─'*6} {'─'*45} {'─'*40}")
    for name, url, status, detail in results:
        marker = "✗" if status == "FAIL" else ("⚠" if status == "WARN" else "✓")
        print(f"{marker} {status:<4} {name:<45} {detail}")

    failures = sum(1 for r in results if r[2] == "FAIL")
    warnings = sum(1 for r in results if r[2] == "WARN")
    ok = sum(1 for r in results if r[2] == "OK")

    print(f"\n{ok} OK · {warnings} WARN · {failures} FAIL")

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
