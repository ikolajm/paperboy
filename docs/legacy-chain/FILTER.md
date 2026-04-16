# Filter

## Purpose
Clean the story registry. Remove duplicates, stale content, and low-quality
results before alert scanning and writing.

## Filter Rules (apply in this order)

### 0. Pre-seed deduplication from existing digest (refresh runs only)

_These are the canonical normalization rules, referenced by BOOTSTRAP on refresh runs._

Before applying any other rule, check whether `seen_url_list` is
present in context (populated by BOOTSTRAP on refresh runs).

If it is: for each story in the registry, **normalize its URL** using
`scripts/normalize_url.py` or the equivalent rules:
```
python3 scripts/normalize_url.py "<url>"
```
The script applies the canonical rules:
- Strip tracking query params (`utm_*`, `fbclid`, `gclid`, `ref`, `source`, `_ga`, etc.)
- Remove fragment (`#…`)
- Remove trailing `/`
- Replace `http://` with `https://`
- Strip `www.` and `amp.` subdomain prefixes
- Strip `/amp` or `/amp/` suffix and `.amp.html` from the path

Then compare the normalized URL against `seen_url_list`. If it matches,
discard the story — it was already shown in the morning's digest. Do not
surface it again regardless of outlet or angle.

Apply this rule first, before all others, as it is the authoritative
filter for already-seen content.

If `seen_url_list` is absent (initial or full re-run), skip this rule
entirely and proceed directly to Rule 1.

### 1. Deduplicate by URL
Normalize each story's URL (same rules as Rule 0), then discard any story
whose normalized URL matches an already-kept story. Keep the first occurrence.

**Unresolved Google News URLs:** Stories with `url_resolved: false` (where
FETCH-NEWS could not resolve a Google News redirect to a real article URL)
cannot be reliably deduplicated by URL — the redirect URLs are opaque and
unique even when they point to the same article. Skip Rule 1 for these
entries and let Rule 2 (story-substance dedup) handle them instead.

### 2. Deduplicate by story
If two stories from different sources are clearly covering the same event
(same headline substance, same subject, same approximate time), keep the
one from the more credible or well-known outlet. Discard the other.

Use your judgement on "same story" — don't collapse genuinely different
angles on an event. A Reuters report and an ESPN analysis of the same
fight result are not duplicates.

### 3. Staleness check
Discard any story that appears to be older than 36 hours unless it is
the only result for a topic. If it is the only result, keep it and mark
it as `stale: true` in the registry — the write stage will note this.

### 4. Low-quality check
Discard a result if:
- The URL leads to a tag page, search results page, or homepage
- The headline is generic ("Latest News," "Today in Sports," etc.)
- The snippet contains no specific facts, names, or events

### 5. Passive topic trimming
For `passive` mode topics: if zero stories survived filtering for that topic,
mark the topic as `quiet: true`. Do not add placeholder stories.
WRITE renders "nothing found today" for any quiet passive topic.

## What NOT to Filter
- Stories that feel low-stakes or uninteresting to you — that is the
  user's call, not the filter's
- Stories from smaller outlets, provided they pass the quality check
- Duplicate coverage of the same event where angles genuinely differ

## Post-Filter: Compact the Registry

After all filter rules are applied, do two things before moving on:

**1. Release raw fetched content.**
The raw material from FETCH-NEWS — full RSS entry bodies, full search
result pages, any intermediate fetch data — is no longer needed.
You can let it go. The filtered registry is the only working state
required by subsequent stages.

**2. Verify snippet length.**
For each surviving story, confirm the `snippet` field is ≤2 sentences.
Trim any that are longer. (FETCH-NEWS enforces this at fetch time, but
RSS entries can be verbose — this is the safety check.)

These two steps keep the accumulated context manageable as stages 04–08
add entertainment, social, scores, and podcast entries.

## Output
A cleaned, compacted story registry. Surviving stories may carry `stale: true`.
Topics with no surviving stories carry `quiet: true` (set on the topic, not on
individual stories).
Proceed to the next stage in the chain.
