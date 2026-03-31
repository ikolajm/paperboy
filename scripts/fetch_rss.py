#!/usr/bin/env python3
"""Fetch and parse RSS feeds, returning clean markdown or JSON.

Resolves Google News redirect URLs to actual article URLs, truncates
descriptions to 2 sentences, and handles blocked domains gracefully.

Usage:
    # Single feed (markdown output):
    python3 scripts/fetch_rss.py <rss_url> [max_items]

    # Batch mode (JSON input/output, parallel fetching):
    python3 scripts/fetch_rss.py --batch feeds.json
    echo '[{"label":"MMA","url":"...","max":5}]' | python3 scripts/fetch_rss.py --batch -

    max_items defaults to 5.
"""

import json
import re
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape


def fetch_feed(url, timeout=15):
    """Fetch RSS feed XML and return parsed ElementTree root."""
    req = urllib.request.Request(url, headers={
        "User-Agent": "NewsDigest/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml",
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return ET.fromstring(resp.read())


def is_google_news_url(url):
    """Check if URL is a Google News redirect that can't be resolved."""
    return "news.google.com/rss/articles/" in url


def truncate_to_sentences(text, max_sentences=2):
    """Truncate text to max_sentences sentences."""
    if not text:
        return ""

    text = unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()

    sentences = re.split(r"(?<=[.!?])\s+", text)
    result = " ".join(sentences[:max_sentences])

    if len(result) > 300:
        result = result[:297] + "..."

    return result


def extract_source_name(item):
    """Extract source/outlet name from RSS item."""
    # Try <source> element (Google News uses this)
    source_el = item.find("source")
    if source_el is not None and source_el.text:
        return source_el.text.strip()

    # Try dc:creator
    for ns in ["http://purl.org/dc/elements/1.1/", "{http://purl.org/dc/elements/1.1/}"]:
        creator = item.find(f"{{{ns.strip('{}')}}}creator")
        if creator is not None and creator.text:
            return creator.text.strip()

    return ""


def parse_feed(root, max_items=5):
    """Parse RSS feed and return list of entry dicts."""
    channel = root.find("channel")
    if channel is None:
        channel = root

    items = channel.findall("item")
    if not items:
        # Try Atom format
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        items = root.findall("atom:entry", ns)

    entries = []
    for item in items[:max_items]:
        title = ""
        link = ""
        pub_date = ""
        description = ""
        source_name = ""

        # RSS format
        title_el = item.find("title")
        if title_el is not None and title_el.text:
            title = unescape(title_el.text.strip())

        link_el = item.find("link")
        if link_el is not None:
            link = (link_el.text or "").strip()

        date_el = item.find("pubDate")
        if date_el is not None and date_el.text:
            pub_date = date_el.text.strip()

        desc_el = item.find("description")
        if desc_el is not None and desc_el.text:
            description = desc_el.text

        source_name = extract_source_name(item)

        # Parse <itunes:duration> if present (podcast feeds)
        duration = None
        itunes_ns = "http://www.itunes.com/dtds/podcast-1.0.dtd"
        dur_el = item.find(f"{{{itunes_ns}}}duration")
        if dur_el is not None and dur_el.text:
            raw = dur_el.text.strip()
            # Formats: "5400" (seconds), "1:30:00" (H:M:S), "45:00" (M:S)
            if ":" in raw:
                parts = raw.split(":")
                if len(parts) == 3:
                    h, m, s = int(parts[0]), int(parts[1]), int(parts[2])
                    duration = f"{h}h {m}m" if h > 0 else f"{m}m"
                elif len(parts) == 2:
                    m, s = int(parts[0]), int(parts[1])
                    duration = f"{m}m"
            else:
                try:
                    total = int(raw)
                    h, rem = divmod(total, 3600)
                    m = rem // 60
                    duration = f"{h}h {m}m" if h > 0 else f"{m}m"
                except ValueError:
                    pass

        # Atom fallback
        if not title:
            t = item.find("{http://www.w3.org/2005/Atom}title")
            if t is not None and t.text:
                title = unescape(t.text.strip())
        if not link:
            l = item.find("{http://www.w3.org/2005/Atom}link")
            if l is not None:
                link = l.get("href", "")

        # Flag Google News redirect URLs (can't be resolved via stdlib)
        google_news = is_google_news_url(link) if link else False

        # Truncate description
        snippet = truncate_to_sentences(description)

        entry = {
            "title": title,
            "url": link,
            "source": source_name,
            "date": pub_date,
            "snippet": snippet,
        }
        if duration:
            entry["duration"] = duration
        if google_news:
            entry["google_news_redirect"] = True
        entries.append(entry)

    return entries


def format_markdown(entries):
    """Format entries as markdown."""
    if not entries:
        return "No items found in feed."

    lines = []
    for i, e in enumerate(entries, 1):
        title = e["title"] or "(no title)"
        url = e["url"] or ""
        source = e["source"]
        date = e["date"]
        snippet = e["snippet"]

        source_tag = f" · {source}" if source else ""
        date_tag = f" · {date}" if date else ""
        duration_tag = f" · {e['duration']}" if e.get("duration") else ""
        redirect_tag = " [google-news-redirect]" if e.get("google_news_redirect") else ""

        if url:
            lines.append(f"{i}. [{title}]({url}){source_tag}{date_tag}{duration_tag}{redirect_tag}")
        else:
            lines.append(f"{i}. {title}{source_tag}{date_tag}{duration_tag}")

        if snippet:
            lines.append(f"   > {snippet}")
        lines.append("")

    return "\n".join(lines)


def fetch_one(feed_config):
    """Fetch and parse a single feed. Returns (label, entries_or_error)."""
    label = feed_config["label"]
    url = feed_config["url"]
    max_items = feed_config.get("max", 5)

    try:
        root = fetch_feed(url)
        entries = parse_feed(root, max_items=max_items)
        return (label, entries)
    except urllib.error.HTTPError as e:
        return (label, {"status": "fetch_error", "url": url, "error": f"HTTP {e.code}: {e.reason}"})
    except urllib.error.URLError as e:
        return (label, {"status": "fetch_error", "url": url, "error": str(e.reason)})
    except Exception as e:
        return (label, {"status": "fetch_error", "url": url, "error": str(e)})


def fetch_batch(feeds_config):
    """Fetch multiple feeds in parallel. Returns dict keyed by label."""
    results = {}
    workers = min(len(feeds_config), 8)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(fetch_one, feed): feed["label"]
            for feed in feeds_config
        }
        for future in as_completed(futures):
            label, data = future.result()
            results[label] = data

    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 fetch_rss.py <rss_url> [max_items]", file=sys.stderr)
        print("       python3 fetch_rss.py --batch <feeds.json | ->", file=sys.stderr)
        sys.exit(1)

    # Batch mode
    if sys.argv[1] == "--batch":
        source = sys.argv[2] if len(sys.argv) >= 3 else "-"
        if source == "-":
            feeds_config = json.loads(sys.stdin.read())
        else:
            with open(source) as f:
                feeds_config = json.load(f)

        results = fetch_batch(feeds_config)
        print(json.dumps(results, indent=2, ensure_ascii=False))
        sys.exit(0)

    # Single URL mode (original behavior)
    rss_url = sys.argv[1]
    max_items = int(sys.argv[2]) if len(sys.argv) >= 3 else 5

    try:
        root = fetch_feed(rss_url)
    except urllib.error.HTTPError as e:
        print(json.dumps({
            "status": "fetch_error",
            "url": rss_url,
            "error": f"HTTP {e.code}: {e.reason}",
        }))
        sys.exit(0)
    except urllib.error.URLError as e:
        print(json.dumps({
            "status": "fetch_error",
            "url": rss_url,
            "error": str(e.reason),
        }))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            "status": "fetch_error",
            "url": rss_url,
            "error": str(e),
        }))
        sys.exit(0)

    entries = parse_feed(root, max_items=max_items)
    print(format_markdown(entries))


if __name__ == "__main__":
    main()
