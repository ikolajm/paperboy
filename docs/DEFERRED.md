# Deferred Decisions

Features that were intentionally left out of V1, and the reasoning behind each.

---

## Live Sports Polling

The daily digest makes ~80-145 API calls once per day against ESPN's unofficial,
unauthenticated scoreboard API. That's a reasonable use of a public endpoint.

Live polling would mean 6+ calls per minute, sustained for hours, across
multiple sports. That crosses into building a product on top of unpermissioned
infrastructure. It's ethically questionable, risks IP blocks, and sets a
bad precedent for how the project relates to its data sources.

If revisited, the options are:
- A manual "check now" button (single fetch, user-initiated)
- An official data source
- Accepting the tab stays empty

---

## Media Bias Badges

The data pipeline is fully built: ~43 outlets mapped with political lean and
factual reporting ratings, lookup utilities, color spectrum for lean
visualization. Bias badges were implemented in the card UI and then
commented out.

**Why deferred:** In practice, the badges were visually noisy. Every card
gained two extra colored pills (lean + factual) that competed with the
headline and source attribution for attention. The information density
made the card layout feel repetitive and cluttered rather than informative.

This is a design problem — the data and rendering code are ready, but the
right placement and density haven't been found yet. Possible directions:
section-level bias summaries, hover-only detail, or a dedicated bias view
rather than per-card badges.

---

## Deep Dive Buttons

The full deep dive infrastructure is built: API route, page route, markdown
rendering, slide-over sheet component. You can navigate to
`/deep-dive/[date]/[id]` directly and it works.

**Why deferred:** The interaction model isn't settled. Questions that remain:
- Should it open as a drawer (stays in context) or a full page?
- How does generation work — confirmation step, loading state, refresh?
- News deep dives with related articles could be fully scripted, but podcast
  and entertainment deep dives need different fetching strategies.

The buttons were commented out rather than shipped with an incomplete flow.

---

## Betting Odds

ESPN's scoreboard response already includes odds data for scheduled games
(spread, over/under, moneyline). The config has an `odds` flag per sport,
currently set to `false` everywhere.

**Why deferred:** Low priority for V1. The data extraction is straightforward
but the UI needs design work — line movement, provider attribution, and
display density all need thought before it's worth building.

See `docs/FEATURE-live-scores-and-odds.md` for the full design doc.
