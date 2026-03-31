# Context Index

The prompt chain that powers the daily digest.
Read stages in order during a daily run.

## Daily Run Chain

| File | What it does |
|------|-------------|
| `BOOTSTRAP.md` | Date, mode detection, config load, registry init |
| `FETCH-NEWS.md` | Tier 1 web search for all news topics |
| `FILTER.md` | Dedup, staleness, quality floor |
| `POPULAR.md` | Popular Now + In the Noise (RSS-first) |
| `FETCH-ENTERTAINMENT.md` | Entertainment sweep + Sports Last Night scores |
| `FETCH-PODCASTS.md` | RSS episode fetch for followed shows |
| `WRITE.md` | Render digest.md + digest-index.md |

## On-Demand Stages

| File | Trigger |
|------|---------|
| `DEEP-DIVE-NEWS.md` | "Go deeper on [NEWS-ID]" |
| `DEEP-DIVE-PODCAST.md` | "Transcript for [POD-ID]" |
| `FLASH-CHECK.md` | "Quick check my feeds", "Live [sport] scores", "Quick look at [topic]" |

_For architectural decisions and rationale, see `context/DECISIONS.md`._

