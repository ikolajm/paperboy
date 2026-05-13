# Deep Dive: News

## Purpose

Fetch deeper content for a single story identified by the user, then write a structured markdown file the user can read instead of opening the original article. This stage runs on demand — it is never part of the daily digest pipeline.

## Entry trigger

User says something like:
- "Go deeper on SPRT-01"
- "Deep dive on TECH-03"
- "More on yesterday's POP-02"
- "Tell me more about ENT-04"

This stage handles all non-podcast IDs. Podcast IDs (POD-*) route to `DEEP-DIVE-PODCAST.md` instead.

---

## Step 1 — Resolve the story

### Parse the ID

Extract the story ID from the user's message (e.g. `SPRT-01`, `POP-02`, `ENT-04`). If the user implies a date ("yesterday's SPRT-02"), resolve it to `YYYY-MM-DD`. Default to today's date if no date is implied.

### Load the digest

Read `digests/YYYY-MM-DD/digest.json` in full. The top-level shape is:

```
{
  "meta": { date, day_of_week, story_count, run_mode, last_run },
  "sections": {
    "popular_today": PopularStory[],          // POP-*
    "local": { locations: [{ label, stories: LocalStory[] }] },
    "for_you": TopicSection[],                // active topics — SPRT, TECH, POL, SCI, HLTH
    "on_your_radar": TopicSection[],          // passive topics — same categories
    "scores": { team_sports, ufc, f1 },
    "entertainment": { movies, streaming, upcoming },  // ENT-*
    "podcasts": PodcastEntry[],               // POD-* (handled by DEEP-DIVE-PODCAST)
    "opinions": OpinionEntry[]                // OPN-*
  },
  "deep_dives": DeepDiveRef[]
}
```

### Find the story

Use the ID's prefix to narrow the search:

| Prefix | Where to look |
|--------|---------------|
| `POP` | `sections.popular_today[]` |
| `SPRT`, `TECH`, `POL`, `SCI`, `HLTH` | `sections.for_you[].stories[]` and `sections.on_your_radar[].stories[]` |
| `ENT` | `sections.entertainment.movies[]`, `.streaming[]`, `.upcoming[]` |
| `OPN` | `sections.opinions[]` |

Match the entry where `id === <user-supplied ID>`.

### Fail-soft cases

- **ID not found** → "I couldn't find [ID] in `digests/[date]/digest.json`. IDs are date-scoped — check the date and try again."
- **`deep_dive_eligible: false`** → "That story isn't flagged as deep-dive-eligible. The `deep_dive_eligible` field is set during pipeline filtering."
- **`digests/YYYY-MM-DD/deep-dives/[ID].md` already exists** → tell the user and ask whether they want a refresh.

---

## Step 2 — Tier 2 fetch

Fetch the original article from the story's `url` field. Read the full article text — strip nav, ads, related links.

Then run 2–3 follow-up searches:
- Other outlets covering the same story (for cross-referencing)
- Reactions or developments since the original article
- Background context if the story references prior events

Suggested follow-up query patterns:
```
[headline keywords] [source outlet]
[headline keywords] reaction response
[key subject] background history
```

If the story has `related_articles` populated (Google News cross-references), prefer those over fresh search — they're already known-relevant.

---

## Step 3 — Tier 3 cross-reference (conditional)

Run Tier 3 only when the story is:
- A developing situation (not a completed event)
- Covered very differently by different outlets
- Making claims that seem contested or incomplete

Tier 3: compare 2–3 sources side by side. Note where they agree, where they diverge, what each emphasises that the others omit. This is media analysis, not summarisation.

If Tier 3 isn't warranted, skip it and note in the output that cross-referencing didn't add value.

---

## Step 4 — Write the deep-dive file

Write to `digests/YYYY-MM-DD/deep-dives/[ID].md`:

```markdown
# [Story Title]

**ID:** [ID]
**Source:** [outlet name from `source` field]
**URL:** [article URL from `url` field]
**Topic / Section:** [topic for SPRT/TECH/etc., "Popular Today" for POP, "Entertainment" for ENT, "Opinions" for OPN]
**Fetched:** [ISO timestamp]

---

## Summary

[3–5 sentence factual summary of the full article]

## Key Points

- [point]
- [point]
- [point]

## Full Story

[Cleaned article body — quotes preserved, named sources preserved, specific figures preserved]

## Other Coverage

[Only present if Tier 3 was run]
- **[Outlet B]:** [What they emphasised differently]
- **[Outlet C]:** [What they added or omitted]

## Context

[Background the article assumes — prior events, who the people are, why this matters in the broader topic. 2–3 paragraphs max.]
```

---

## Step 5 — Confirm to user

After writing, tell the user:
- File path that was written
- Whether Tier 3 cross-referencing was run, and the reason if not
- If the follow-up search surfaced anything notable that wasn't in the original snippet, surface it inline in chat — don't make the user open the file to find the headline finding
