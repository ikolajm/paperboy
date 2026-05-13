# Context Index

On-demand agent stages. Each stage is triggered by a user request in chat — none of these run as part of the automated daily digest pipeline (`npm run digest`).

## Active stages

| File | Trigger |
|------|---------|
| `DEEP-DIVE-NEWS.md` | "Go deeper on [ID]" / "Tell me more about [ID]" — for any non-podcast ID (SPRT, TECH, POL, SCI, HLTH, ENT, POP, OPN) |
| `DEEP-DIVE-PODCAST.md` | "Transcript for POD-XX" / "Go deeper on POD-XX" |

Both stages read `digests/YYYY-MM-DD/digest.json` to locate the item by `id`, fetch additional content (article body + cross-references for news; transcript for podcasts), and write a markdown deep-dive file to `digests/YYYY-MM-DD/deep-dives/[ID].md`.

## Archived stages

The pre-pivot agent chain (BOOTSTRAP, FETCH-*, FILTER, POPULAR, WRITE, FLASH-CHECK) was replaced by the script-driven pipeline. See `docs/legacy-chain/` for the historical specs.
