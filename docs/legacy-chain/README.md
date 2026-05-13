# Legacy Chain — Archive

This folder preserves the pre-pivot agent-driven digest chain that Paperboy used before becoming a script-driven pipeline. Each file documents one stage of the old daily run.

These files are no longer wired into anything. The current digest runs as a single TypeScript command (`npm run digest`) that fetches, filters, deduplicates, and writes `digest.json` in a 2–3 second invocation — replacing the entire multi-stage chain documented here.

## What's in here

| File | What this stage did |
|------|---------------------|
| `BOOTSTRAP.md` | Date / mode detection / config load before any fetching |
| `FETCH-NEWS.md` | Tier 1 web search for all news topics |
| `FILTER.md` | Dedup, staleness, quality floor across fetched stories |
| `POPULAR.md` | Popular Now + In the Noise sections (RSS-first) |
| `FETCH-ENTERTAINMENT.md` | Entertainment sweep + Sports Last Night scores |
| `FETCH-PODCASTS.md` | RSS episode fetch for followed shows |
| `WRITE.md` | Rendered `digest.md` + `digest-index.md` outputs |
| `FLASH-CHECK.md` | On-demand "quick check my feeds" / live scores route |

## Why it's preserved

Two reasons:
1. **Historical reference** for the architectural pivot — useful when writing about Paperboy as a case study, since the agent-chain → script-pipeline shift is part of the story.
2. **Pattern reuse** — some content here (filtering heuristics, output formatting) may be worth revisiting if specific stages are revived in different form.

## Likely fate

This archive can be removed at the v1.5 or v2 milestone once the project narrative no longer benefits from preserving the pre-pivot design.
