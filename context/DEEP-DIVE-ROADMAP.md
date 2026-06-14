# Deep Dive Roadmap

Productionizing the on-demand deep dive: turning the hand-run agent stages
(`DEEP-DIVE-NEWS.md`, `DEEP-DIVE-PODCAST.md`) into a button-triggered feature
the dashboard generates on demand.

The frontend half already exists — page route, markdown rendering, output
location, digest schema. The gap this roadmap closes is **generation**: how a
click produces the `.md` file the page already knows how to render.

---

## Decisions locked (2026-06-14)

| Fork | Decision | Why |
|------|----------|-----|
| **Trigger** | On-demand via the API route | The frontend is already a live server (API routes + request-time reads). Adding a generation route is on-model — it doesn't touch the *pipeline's* script-first nature. |
| **Deployment** | Local-only | Generation writes `digests/[date]/deep-dives/[ID].md` to disk and the page reads it. A hosted serverless deploy would break file-write (ephemeral FS) and force a different storage model — not a concern here. |
| **Synthesis scope (V1)** | Recap/synthesis over available content — **no fact-check** | Keeps V1 a bounded, single-call synthesis. Fact-check is a separate, heavier request (see Phase 3). |
| **Substrate** | Direct Anthropic API call — **no agent harness** | V1 is `fetch known URLs → one synthesis call → write file`. Deterministic fetch + bounded synthesis needs no tool-using agent loop. |
| **Interaction** | Full page (route `/deep-dive/[date]/[id]`) | Not the slide-over drawer. The built sheet component is unused for this — repurpose or remove (see open items). |

---

## Architecture

The shape is the same for every deep dive type:

```
resolve (digest.json) → gather content → synthesize (1 model call) → write .md → render page
```

What changes per type is **gather**:

- **News / article IDs** (POP, SPRT, TECH, POL, SCI, HLTH, OPN): fetch the main
  article URL + each `related_articles` URL → clean text. Deterministic fetch of
  *known* URLs — not open-ended web search.
- **Podcast (POD)**: the transcript priority chain from `DEEP-DIVE-PODCAST.md`
  (native transcript → YouTube captions → show notes → snippet fallback). Messier
  acquisition, same synthesize-and-write tail.
- **Entertainment (ENT)**: flagged in `DEFERRED.md` as needing different fetching.
  Open question — see Phase 1 / open items.

The existing `context/DEEP-DIVE-*.md` specs are **manual agent prompts**. This work
translates them into a **server-side generation path**: the deterministic fetch
steps become code, and the spec's structure/output sections become the synthesis
prompt. The output markdown contract in those specs is the target shape and does
not change.

---

## Generation flow (full-page, on-demand)

1. **Card → "Deep dive" button** navigates to `/deep-dive/[date]/[id]`.
2. **Page checks** for `digests/[date]/deep-dives/[ID].md`.
   - **Exists** → render it.
   - **Missing** → render an empty state with a **"Generate" button** (explicit
     confirm — generation costs an API call + latency; don't auto-fire on navigate).
3. **Generate** → `POST /api/deep-dive/[date]/[id]` → fetch → synthesize → write
   file → page renders. Needs a loading state and an error state.
4. **Refresh** → a "Regenerate" action on an existing dive, overwrites the file.

Idempotency / in-flight handling (two clicks, concurrent generates) is a build
detail to settle in Phase 1.

---

## Phases

### Phase 1 — News base deep dive
The core. Everything downstream reuses this path.
- ✅ **Fetch utility built + verified 2026-06-14** — `frontend/src/lib/deep-dive/fetch-article.ts`.
  `resolveUrl` (Google News batchexecute + direct pass-through) + `fetchArticle`
  (resolve → fetch w/ browser UA → Readability extract → fail-soft, `MIN_WORDS=250`).
  Deps added: `@mozilla/readability` + `jsdom`. Verified against the 2026-05-18
  digest: Google News resolution ~100%, **body extraction 13/19 ≈ 68%**. Failures
  are clean fail-softs with reasons: `http-error` (NYT/Hill/Axios 4xx paywalls),
  `too-short` (all ESPN — JS bot-challenge; the one consistent direct-publisher gap).
  Readability is *more* accurate than crude tag-strip (correctly returns 0-body for
  paywalled WaPo where regex counted boilerplate).
- ✅ **Synthesis built 2026-06-14** — `synthesize.ts` (provider-agnostic boundary +
  Gemini adapter, `gemini-2.5-flash`) + `news-prompt.ts` (the `DEEP-DIVE-NEWS.md`
  output contract as a prompt). **Provider switched Anthropic → Gemini** (deliberate,
  on-strategy: Glass-Box is multi-model + Flash free-tier/big-context fits synthesis).
  Boundary kept vendor-agnostic so Glass-Box can run providers side by side.
- ✅ **Generation route built 2026-06-14** — `generate.ts` (resolve story by ID from
  digest across popular/for_you/on_your_radar/opinions → gather main + capped related
  → synthesize → write `.md`, with resolved publisher URLs threaded into output) +
  `POST /api/deep-dive/[date]/[id]` (Node runtime; `DeepDiveError` → status codes).
- ✅ **Frontend built 2026-06-14** — `DeepDiveView` client component: empty →
  generate (explicit, never auto-fires) → loading → render, plus error/retry and
  regenerate. Page is now generate-on-demand instead of `notFound()`.
- ⏳ **Untested live** — needs the Gemini key in `config/credentials.json`
  (`gemini.api_key`) or `GEMINI_API_KEY` env. Everything compiles + builds clean;
  gather→prompt verified offline against a real story. Wire the digest card's
  "Deep dive" button to `/deep-dive/[date]/[id]` if not already linked.
- **ENT handling** — still open. The V1 news path covers POP / topics (SPRT/TECH/POL/
  SCI/HLTH) / OPN. ENT (entertainment) has a distinct shape (movies/streaming) and is
  not resolved by `resolveStory` — decide its gather strategy in a follow-up.

### Phase 2 — Podcast base deep dive
- Transcript acquisition chain (native → YouTube → show notes → snippet).
- Podcast synthesis prompt (recap + key exchanges; transcript shape from spec).
- Same route + frontend pattern as Phase 1.

### Phase 3 — Fact-check (the Glass-Box bridge)
A **separate** request, not folded into the base dive.
- Cross-reference claims against other sources; mark **grounded vs. inferred**.
- This is precisely Glass-Box Synthesis's provenance primitive, applied to news —
  Paperboy is where it first gets built and proven.
- **Gated on the grounding napkin test** (see hub `backlog/glass-box-synthesis/`)
  before any build.

---

## URL-fetch spike findings (2026-06-14)

De-risk pass before building the fetch utility. Ran live fetches against real URLs
from `digests/2026-05-18/digest.json` (a month-old digest — staleness wasn't a
factor). Pure `fetch` + regex; **no dependencies needed for any of it.**

**URL composition of a real digest** (60 story URLs + 64 related-article URLs):
- `related_articles` URLs: **100% `news.google.com`** redirect URLs.
- Story URLs: **~58% `news.google.com`**, the rest direct publisher (ESPN, Guardian, The Hill).
- So Google News resolution is on the critical path — without it, you lose every
  related article and most stories.

**Google News resolution — WORKS, reliably (10/10).** The `CBMi…` URLs do *not*
redirect server-side (a plain GET returns the Google News JS SPA shell, ~580 KB,
zero article text). They resolve via `batchexecute`:
1. `GET` the article page → scrape `data-n-a-sg` (signature) + `data-n-a-ts` (timestamp).
2. `POST news.google.com/_/DotsSplashUi/data/batchexecute` with an `Fbv4je` /
   `garturlreq` payload built from `{ base64-id-from-url, ts, sg }`.
3. Parse `garturlres` from the response → the real publisher URL.

All 10 sampled Google News URLs resolved, including the month-old ones.

**Fetch-after-resolve success ≈ 70%.** Of resolved/direct publisher URLs:

| Tier | Behavior | Examples |
|------|----------|----------|
| ✅ Clean fetch | `200`, full body (≈500–3000 words extractable) | Guardian, NBC, CNN, PBS, WaPo, CNBC, Fox |
| ❌ Hard wall | `401`/`403`/`202` + JS bot-challenge — no body | NYT (403), Reuters (401), **ESPN (202)**, The Hill (403) |

The blocked tier needs JavaScript execution (ESPN literally returns "verify that
you're not a robot"). A headless browser would recover some of it but is **out of
scope for V1** — not worth the weight for ~30% of sources.

**Verdict:** Phase 1 is buildable as specified. The fetch utility must fail soft on
the ~30% blocked tier; because each deep dive aggregates a main story + N related
articles, losing some sources rarely strips a story bare.

---

## Open items — confirm before build

- **~~`related_articles` payload shape~~ — RESOLVED 2026-06-14.** `RelatedArticle`
  is `{ headline, url, outlet }` — no body, not even a snippet (`shared/types/editorial.ts:7`).
  The main `Story` carries only a short `snippet`, not the article body. **So Phase 1
  requires the fetch step — it's the core of the phase, not optional.** You cannot
  synthesize a real recap from `digest.json` alone.
- **~~Fetch utility~~ — STRATEGY RESOLVED 2026-06-14** (spike above). Shape is
  **resolve → fetch → extract**, fail-soft at every stage:
  - **Resolve:** `news.google.com` URLs → `batchexecute` (above). Direct publisher
    URLs pass through. `Story.url === null` → skip, fall back to snippet.
  - **Fetch:** browser UA + `accept`/`accept-language` headers, follow redirects,
    ~15 s timeout.
  - **Extract:** HTML → clean article text. Library choice still open
    (`@mozilla/readability` + `jsdom` is the purpose-built default; `cheerio` is
    lighter but not article-aware). Confirm at build time. Threshold ≈ 250 words —
    below that, treat as a failed fetch (bot-wall/paywall/empty body).
  - **Fail-soft contract:** on resolve-fail, non-`200`, or below-threshold text →
    fall back to the digest `snippet` + `headline` and set `body_unavailable: true`
    on that source so the synthesis prompt leans on the sources that landed and is
    told not to fabricate the missing body. Do **not** add a headless browser for V1.
- **Model choice** — resolve via the `claude-api` skill at build time (synthesis
  over provided text leans toward the Sonnet tier for cost; confirm current model
  IDs + pricing, don't assume).
- **Generation UX** — confirm-before-generate (recommended default above) vs.
  auto-generate on navigate. One soft detail.
- **Built slide-over sheet** — repurpose elsewhere or remove, now that the
  interaction is full-page.
- **ENT deep dives** — article-fetch path or a distinct gather strategy.
- **Cost / rate posture** — local-only and on-demand, so volume is low; confirm no
  guardrail is needed beyond the explicit generate button.
