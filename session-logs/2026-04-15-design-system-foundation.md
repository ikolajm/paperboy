# Session: Design System Foundation
**Date:** 2026-04-15
**Branch:** receive-design-system-gen
**Focus:** Token integration, atomic restructure, /design-system route

---

## Context
First pipeline test — taking jmi-hub generated output (tokens.css, component scaffolds, stories, HANDOFF.md) and wiring it into Paperboy's Next.js frontend.

## What Was Done

### Token Swap
- Copied `generated/tokens.css` → `frontend/src/tokens.css`
- Rewrote `globals.css` to just `@import "tailwindcss"` + `@import "./tokens.css"` + body styles
- The generated tokens.css already contains `:root`, `[data-theme="light"]`, `.interactive`, `.text-*` presets, and `@theme inline` — no duplication needed in globals.css

### Atomic Restructure
- Moved `components/ui/` → `components/atoms/`
- Created `components/molecules/` with `FormField.tsx` (Label + Input + HelperText)
- Updated all story imports

### Design System Route
- Sidebar restructured: Tokens (Colors, Typography) → Atoms (Actions/Inputs/Feedback) → Molecules
- Created `ColorPalette` component — palette primitive grids (7 families, 50-900) + semantic role cards
- Created `TypographyScale` component — all 9 `.text-*` presets with specs + font specimens

## Bugs Found & Fixed

### 1. Void Element Error (Input/Textarea)
**Symptom:** "input is a void element tag and must neither have children"
**Root Cause:** ComponentPlayground spread all props including `children` onto every component. Void HTML elements (`<input>`) can't receive children.
**Fix:** Playground now separates `children` from `restProps` and only passes children to components that use them.

### 2. State Bleed Between Stories
**Symptom:** Switching Button → Chip showed null background. Switching back and toggling variant fixed it.
**Root Cause:** `useState(story.defaultProps)` doesn't reset when the `story` prop changes — React reuses the instance. Button's `variant: 'default'` carried over to Chip, which expects `variant: 'unselected'`.
**Fix:** Added `useEffect` to reset props when story changes.

### 3. Select Story Missing Options
**Symptom:** Select rendered as empty dropdown in playground.
**Root Cause:** Generated story had no `<option>` children.
**Fix:** Created a `SelectDemo` wrapper that provides sample options.

## Observations

### Component Height Shift
Placeholder tokens had approximated values (ch-3: 28px, ch-5: 36px, ch-7: 44px). Real tokens from jmi-hub are ch-3: 32px, ch-5: 40px, ch-7: 48px. The real values are correct — components were designed alongside these tokens.

### Token Coverage
The generated `@theme inline` block is significantly more complete than the placeholder:
- Full spacing scale (0-24) with semantic spacing categories
- All border radius primitives (br-0 through br-999) + semantic aliases
- Icon sizes, border widths, component heights (ch-0 through ch-9)
- Transitions, focus ring, z-index scale (1000-1400)

### What's Not Yet Done
- DESIGN-HANDOFF documentation folder
- Visual polish / tweaks (pending observation list from Jacob)
- Additional molecules and organisms
- Actual Paperboy dashboard views

---

## Pipeline Feedback
See `pipeline-review/2026-04-15-foundation.md` for upstream notes.
