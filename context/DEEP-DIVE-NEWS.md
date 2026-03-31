# Deep Dive: News

## Purpose
Fetch Tier 2/3 content for a single story identified by the user.
This stage runs independently — it is never part of the daily chain.

## Entry Trigger
User says something like:
- "Go deeper on SPRT-01"
- "Deep dive on TECH-03"
- "More on yesterday's SPRT-02"
- "Tell me more about POP-02"

## Step 1 — Resolve the Story

### Parse the ID
Extract the story ID from the user's message.
If a date is implied ("yesterday's"), resolve it to YYYY-MM-DD.
Default to today's date if no date is specified.

### Look up in the index
Read `digests/YYYY-MM-DD/digest-index.md`.
Find the row matching the requested ID.

If the ID is not found:
→ Tell the user: "I couldn't find [ID] in today's digest index. Check
  the ID and date — story IDs are date-scoped."

If `Deep-Dive Eligible = false`:
→ Tell the user: "That entry isn't eligible for a deep dive — check the
  `Deep-Dive Eligible` column in the digest index for details."

### Check for existing deep dive
If `digests/YYYY-MM-DD/deep-dives/[ID].md` already exists:
→ Tell the user it already exists and ask if they want it refreshed.

---

## Step 2 — Tier 2 Fetch
Fetch the original article at the URL from the index.
Read the full article text.

Then run 2–3 follow-up searches to find:
- Other outlets covering the same story (for cross-referencing)
- Any statements, reactions, or developments since the original article
- Background context if the story references prior events

Suggested follow-up query patterns:
```
[headline keywords] [source outlet]
[headline keywords] reaction response
[key subject] background history
```

---

## Step 3 — Tier 3 Cross-Reference (if warranted)

Apply Tier 3 only if the story is:
- A developing situation (not a completed event)
- Covered very differently by different outlets
- Making claims that seem contested or incomplete

Tier 3: compare 2–3 sources side by side. Note where they agree,
where they diverge, and what each emphasises that others omit.
This is media analysis, not just summarisation.

If Tier 3 is not warranted, skip it and note that the story was
straightforward enough that cross-referencing didn't add value.

---

## Step 4 — Write the Deep Dive File

Write to: `digests/YYYY-MM-DD/deep-dives/[ID].md`

```markdown
# [Story Title]

**ID:** [ID]
**Outlet:** [outlet name, e.g. "ESPN MMA", "Deadline", "web_search"]
**URL:** [article link]
**Fetched from:** [source datasource URL, e.g. RSS feed or API endpoint]
**Topic:** [topic name]
**Fetched:** [timestamp]

---

## Summary
[3–5 sentence factual summary of the full article]

## Key Points
- [point]
- [point]
- [point]

## Full Story
[Cleaned article body — remove ads, navigation, related links.
 Preserve quotes, named sources, specific figures.]

## Other Coverage
[Only present if Tier 3 was run]
- **[Outlet B]:** [What they emphasised differently]
- **[Outlet C]:** [What they added or omitted]

## Context
[Any background the article assumes — prior events, who the people
 are, why this matters in the broader topic. Keep to 2–3 paragraphs.]

---
_[← Back to digest](../digest.md)_
```

---

## Step 5 — Confirm to User

Tell the user:
- The file has been written to `deep-dives/[ID].md`
- Whether Tier 3 cross-referencing was run and why/why not
- If anything notable was found in the follow-up searches that wasn't
  in the original Tier 1 snippet — surface that immediately in chat
  rather than making the user open the file to find it
