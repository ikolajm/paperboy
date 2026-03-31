#!/usr/bin/env python3
"""Normalize a URL for deduplication.

Applies the canonical normalization rules from FILTER.md Rule 0:
strip tracking params, fragments, trailing slashes, AMP paths,
and normalize scheme/host.

Usage:
    python3 scripts/normalize_url.py <url>
    echo "<url>" | python3 scripts/normalize_url.py

Output: normalized URL to stdout (one line).
"""

import sys
import re
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

# Query parameters to strip (tracking, attribution, session)
STRIP_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "fbclid", "gclid", "gclsrc", "ref", "source", "_ga", "_gid",
    "ncid", "ocid", "sr_share", "mc_cid", "mc_eid",
}


def normalize_url(url):
    """Normalize a URL for deduplication."""
    url = url.strip()
    if not url:
        return url

    # Ensure scheme
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)

    # Normalize scheme: http -> https
    scheme = "https"

    # Normalize host: lowercase, strip www., strip amp. subdomain
    host = parsed.hostname or ""
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]
    if host.startswith("amp."):
        host = host[4:]

    # Preserve port if non-standard
    port = parsed.port
    netloc = f"{host}:{port}" if port and port not in (80, 443) else host

    # Normalize path: strip AMP suffixes, trailing slashes
    path = parsed.path
    path = re.sub(r"/amp/?$", "", path)          # /amp or /amp/
    path = re.sub(r"\.amp\.html$", ".html", path) # .amp.html -> .html
    path = path.rstrip("/") or "/"

    # Strip tracking query params
    if parsed.query:
        params = parse_qs(parsed.query, keep_blank_values=True)
        filtered = {k: v for k, v in params.items() if k.lower() not in STRIP_PARAMS}
        query = urlencode(filtered, doseq=True) if filtered else ""
    else:
        query = ""

    # Strip fragment entirely
    fragment = ""

    return urlunparse((scheme, netloc, path, "", query, fragment))


def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = sys.stdin.readline()

    result = normalize_url(url)
    if result:
        print(result)


if __name__ == "__main__":
    main()
