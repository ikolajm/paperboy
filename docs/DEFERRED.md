# Deferred Decisions

Features that were intentionally left out of V1, and the reasoning behind each.

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
right placement and density haven't been found yet.

**V1.5 direction:** surface bias + factual lean on the deep-dive page rather
than the dashboard cards. Deep dive is the right context for media-literacy
detail — a reader is already slowing down to evaluate a single story, so
adding outlet bias profiles inline (primary outlet plus any cited related
articles) adds value rather than visual noise. The bias dataset is already
maintained for this — see `frontend/src/lib/media-bias.ts` for the wired
but currently-unused lookup functions, and `npm run audit-media-bias` for
coverage maintenance.

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
