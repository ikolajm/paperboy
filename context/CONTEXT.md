# Context Index

## Daily Digest

The daily digest is now a script-driven pipeline:

```
npx tsx scripts/run-digest.ts [--date YYYY-MM-DD]
```

Fetches all data sources in parallel (RSS, ESPN scores, TMDB), applies filtering and dedup, and writes `digests/YYYY-MM-DD/digest.json`. Runs in ~2 seconds.

See `scripts/` for implementation and `config/CONFIG-REFERENCE.md` for configuration.

## On-Demand Stages (Agent-Driven)

These features are invoked conversationally and remain agent-driven:

| File | Trigger |
|------|---------|
| `DEEP-DIVE-NEWS.md` | "Go deeper on [NEWS-ID]" |
| `DEEP-DIVE-PODCAST.md` | "Transcript for [POD-ID]" |
| `FLASH-CHECK.md` | "Quick check my feeds", "Live [sport] scores" |

## Legacy Chain

The original agent-driven daily digest chain files are archived in `docs/legacy-chain/` for reference:
BOOTSTRAP, FETCH-NEWS, FILTER, POPULAR, FETCH-ENTERTAINMENT, FETCH-PODCASTS, WRITE.
