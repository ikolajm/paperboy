# News Digest

A prompt-chain–driven daily digest covering news, social chatter, and
podcasts. No application code. Claude reads the markdown chain, fetches
live content via web search, and writes your digest as markdown files.

---

## Setup

1. Open this folder in Claude Code
2. Edit `config/config.json` — add your interests, shows, and fetch guidance
3. Say **"Run the daily digest"**

See `config/CONFIG-REFERENCE.md` for a field-by-field guide to the config.

---

## Quick Commands

**Daily digest**
```
"Run the daily digest"
```

**News deep dive**
```
"Go deeper on SPRT-01"
"More on TECH-03"
"Deep dive on yesterday's SPRT-02"
```

**Podcast deep dive / transcript**
```
"Transcript for POD-02"
"Go deeper on POD-01"
```

**Flash check (real-time, no files written)**
```
"Quick check my feeds"
"Live NBA scores"
"What's going on with [topic]"
```

---

## Folder Structure

```
news-aggregator/
├── CLAUDE.md                       ← Operational detail — read this
├── README.md                       ← You are here
├── config/
│   ├── config.json                 ← The only file you edit
│   ├── CONFIG-REFERENCE.md         ← Field-by-field config guide
│   ├── credentials.json            ← Gitignored — Bluesky + TMDB auth
│   └── DECISIONS.md                ← Log of config decisions
├── context/
│   ├── CONTEXT.md                  ← Chain index
│   ├── BOOTSTRAP.md
│   ├── FETCH-NEWS.md
│   ├── FILTER.md
│   ├── POPULAR.md
│   ├── FETCH-ENTERTAINMENT.md
│   ├── FETCH-SOCIAL.md
│   ├── FETCH-PODCASTS.md
│   ├── WRITE.md
│   ├── DEEP-DIVE-NEWS.md           ← On demand
│   ├── DEEP-DIVE-PODCAST.md        ← On demand
│   └── FLASH-CHECK.md              ← On demand
└── digests/                        ← Git-ignored output
    └── YYYY-MM-DD/
        ├── digest.md
        ├── digest-index.md
        └── deep-dives/
```

For operational detail — entry points, ID prefixes, key principles — see `CLAUDE.md`.
