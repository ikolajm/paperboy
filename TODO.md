# Daily Digest - TODO

## URL Resolution & Dedup

- [x] **Google News redirect URLs are not resolvable.** _Resolved: FETCH-NEWS.md now includes an inline URL resolution step — when an RSS item has a `news.google.com` redirect, it uses the `<source>` (outlet) and `<title>` (headline) already in the RSS XML to do a targeted web search and replace the redirect with the real article URL. FILTER.md updated to fall back to headline-based dedup for any unresolved URLs._
- [x] **Cross-feed dedup is manual.** _Resolved: AI topic consolidation (4 topics → 1 "AI" topic) eliminates the primary source of cross-feed duplicates. Stories from all AI RSS feeds now compete in a single pool. Google News URL resolution further improves cross-topic dedup._
- [x] **No automated URL normalization tooling.** _Resolved: `scripts/normalize_url.py` created as a CLI tool. Strips tracking params (utm_*, fbclid, gclid, etc.), fragments, trailing slashes, AMP paths, and normalizes scheme/host. FILTER.md updated to reference the script._

## Podcast Pipeline

- [x] **Podcast volume was excessive (17 episodes in one run).** _Resolved: FETCH-PODCASTS.md rewritten with three changes — `release_schedule` field on each show in config.json (skip RSS fetch on non-release days), 1-episode cap per show (down from 1-2), and lightweight cross-reference scan replacing heavyweight inline entries. Diversity cap removed (unnecessary with 1-episode limit). Expected output: 5-8 episodes per run._
- [x] **Duration missing from most RSS feeds.** _Resolved: `fetch_rss.py` now parses `<itunes:duration>` when present in RSS feeds. Handles all common formats (seconds, H:M:S, M:S). Duration appears in markdown output and entry dict._
- [x] **Episode URLs missing for several shows.** _Resolved: FETCH-PODCASTS.md updated with search fallback — when RSS `<link>` points to the show homepage or is missing, the agent searches for the specific episode page. Writes `—` rather than linking to the show homepage._
- [x] **YouTube URL resolution is shallow.** _Resolved: FETCH-PODCASTS.md updated with explicit guard — YouTube URL must be a specific video (`youtube.com/watch?v=...`), never a channel homepage. Agent must write `—` if only the channel page is found. Search instructions strengthened with `site:youtube.com` query._
- [ ] **Podcast transcript availability is low.** Only Lex Fridman and The Daily have `transcript_page` configured. Consider adding more transcript sources (e.g. Podscribe, ListenNotes, or Apple Podcasts transcript API when available).

## Category Trending & Feed Quality

- [x] **Google News section feeds miscategorize stories.** _Accepted: rare edge cases where Google's categorization has context not immediately obvious from the headline. Not a systemic issue — no action needed._
- [x] **Category trending items inflate ID sequences.** _Resolved: added `Trending` column (true/false) to digest-index.md schema. Stories from Google News section feeds (source_type: trending) are flagged `true`. Dashboard can filter/style by this flag. IDs remain in the shared sequence for simplicity._
- [x] **NOISE items lack URLs and context.** _Resolved: POPULAR.md now requires a web search per trending topic to generate a one-sentence explanation. WRITE.md rendering updated from bare `[Headline] · [Source]` to `[Headline] — [one-sentence context]`._

## Scores & Sports

- [x] **NHL odds show moneyline only, no spread.** _Resolved: code review confirmed the heuristic already uses puckline (±1.5 threshold) + moneyline (abs ≤ 150) + national broadcast — correct for NHL. No change needed._
- [ ] **College baseball scores volume is excessive.** The scores script returned 23 college baseball games. Consider only showing scores when: (a) ranked teams are involved, (b) conference tournament / CWS games, or (c) a `followed_teams` filter is active.
- [x] **MMA event listing lacks details.** _Resolved: `fetch_scores.py` now uses `event.name` (card title, e.g. "UFC 300: Pereira vs. Hill") for MMA events instead of home/away competitor names. Rendering updated to show the card name as a single row._

## Deep Dive Pipeline

- [x] **Deep dives must only fire on demand — never inferred or automatic.** _Documented in TODO. The daily digest chain (stages 00–07) must never trigger a deep dive. CLAUDE.md and stage files are clear that deep dives are user-initiated only ("Go deeper on [ID]", "Transcript for [POD-ID]")._
- [x] **Google News-sourced stories can't be deep-dived via URL.** _Resolved upstream: FETCH-NEWS now resolves Google News redirect URLs to real article URLs at fetch time. Deep dives receive real URLs. For any remaining unresolved URLs (`url_resolved: false`), DEEP-DIVE-NEWS can fall back to searching by headline + outlet._
- [x] **Podcast deep dives degrade to reconstruction without transcripts.** _Accepted: DEEP-DIVE-PODCAST.md already labels the transcript source (native/youtube_captions/show_notes/none) and instructs the agent to be clear when output is reconstructed. Current approach is sufficient._

## Digest Rendering

- [x] **Story count is high and growing.** _Partially resolved: Topic consolidation (14 → 8 topics) + podcast optimization (17 → ~7 episodes) reduces from ~98 to ~70 stories. Further reduction available by removing Category Trending (deferred — marked as "let's wait")._
- [x] **Category trending items need clearer visual separation.** _Resolved: `Trending` metadata flag added to digest-index.md (Tier 1). Dashboard UI will use this flag for visual distinction. Markdown digest already uses 🔥 + _(trending)_ label._
- [ ] **"On the Slate" table gets very long with 13 NHL games.** Dashboard UI will handle collapsible sections. No backend change needed for now.

## Config & Architecture

- [x] **No off-season detection.** _Resolved: College sports consolidated into a single "College Sports" topic. In-season sport naturally dominates the combined RSS feed — no manual season tracking needed. March Madness stories rise to the top in March; football dominates in fall._
- [ ] **`fetch_rss.py` output format undocumented.** The script works but its output format isn't documented. Add a `--help` flag or a docstring.
- [x] **No health check for ESPN API endpoints.** _Resolved: `scripts/check_endpoints.py` created. Pings all ESPN, TMDB, and RSS endpoints from config.json in parallel, reports status table. Run: `python3 scripts/check_endpoints.py config/config.json`. Note: TMDB endpoints will show 401 without API key auth (expected)._
