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

## Betting Odds

ESPN's scoreboard response already includes odds data for scheduled games
(spread, over/under, moneyline). The config has an `odds` flag per sport,
currently set to `false` everywhere.

**Why deferred:** Low priority for V1. The data extraction is straightforward
but the UI needs design work — line movement, provider attribution, and
display density all need thought before it's worth building.

**Watch-worthy heuristic (when built):** odds also enable a "this game is worth
watching" flag. A hand-tuned rule from the earlier design — a game is competitive
if **any** apply:
- Spread ≤ 5 pts (NBA / college basketball), ≤ 1.5 (NHL / MLB), ≤ 7 pts (college football)
- National broadcast (ESPN, TNT, ABC, NBC, CBS, FS1, TBS — not a regional RSN)
- Underdog moneyline ≤ +150 (implies a ≤ 60/40 win split)

---

## Podcast Audio Transcription

Podcast deep dives currently use a hybrid: a real transcript when a show
publishes one, otherwise an honest "listening guide" from show notes (no
fabricated quotes). The missing tier is transcribing the audio itself for the
shows that don't publish a transcript — `audio_url` (a direct MP3, present on
every episode) → Gemini native audio ingestion (transcribe + synthesize). Same
provider, no new vendor; it would sit *above* the guide fallback as the preferred
source.

**Why deferred:** cost and latency — a ~30 MB download plus minutes of generation
per dive make it its own unit, not part of the base flow.

**Why the current model is hybrid (the constraint that shaped it):** on-page
transcripts are rare (NPR *Up First* extracts ~159 words, BBC ~211 — show notes,
not transcripts), and `youtube_url` in the digest is a *channel* URL (`@BBCNews`),
not an episode one — so YouTube captions are structurally unavailable. Audio is
the only reliable path to a real transcript for most shows.

---

## Deep-Dive Fact-Check

A separate, heavier deep-dive mode that cross-references a story's claims against
other sources and marks each as **grounded** (supported by a fetched source) vs.
**inferred** (the model's own connective tissue). This is the provenance
primitive behind a larger research tool (the hub's Glass-Box Synthesis project,
`backlog/glass-box-synthesis/`) — Paperboy is where it would first be built and
proven on real news.

**Why deferred:** it's a distinct request, not part of the base synthesis, and
it's gated on first proving the grounding mechanism is honest (the grounding
"napkin test" in the Glass-Box backlog) before any build.
