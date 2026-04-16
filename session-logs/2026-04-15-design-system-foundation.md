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

### Component Fixes (from OBSERVATIONS.md)
- **Hydration mismatch on story swap:** Resolved by using `key={activeView}` on `ComponentPlayground` to force full unmount/remount — eliminated the useEffect approach entirely
- **Last control border:** All control types now conditionally drop bottom border on last item via `isLast` prop
- **Icon toggles:** `showLeadingIcon`/`showTrailingIcon` booleans now resolve to lucide `CircleSlash2` icons at the correct token-based size per component variant
- **FormField:** Left-aligned with `items-start`, helper text toggleable via `showHelperText`, display name spaced as "Form Field"
- **Select chevron:** Replaced native browser chevron with custom SVG using `appearance-none` + background-image, sized per variant using icon/spacing tokens
- **Select width:** Removed `w-full` to match intrinsic sizing pattern of other atoms
- **Icon sizing in components:** Button, Toast, Alert icon wrappers now use `size-icon-0`/`size-icon-1`/`size-icon-2` token classes scaling with sm/md/lg

### Dependencies Added
- `lucide-react` — icon library, standardized as the project default

## Bugs Found & Fixed

### 1. Void Element Error (Input/Textarea)
**Symptom:** "input is a void element tag and must neither have children"
**Root Cause:** ComponentPlayground spread all props including `children` onto every component.
**Fix:** Playground separates `children` from `restProps` and only passes children to components that use them.

### 2. State Bleed Between Stories
**Symptom:** Switching Button → Chip showed null background.
**Root Cause:** `useState(story.defaultProps)` doesn't reset on prop change — React reuses the instance.
**Fix:** Used `key={activeView}` on the playground to force full remount. Cleaner than useEffect and eliminates the one-frame stale render.

### 3. Select Story Missing Options
**Symptom:** Select rendered as empty dropdown.
**Fix:** Created a `SelectDemo` wrapper that provides sample `<option>` elements.

## Known Limitations

### Native Select Dropdown Position
The native `<select>` options menu opens at a position determined by the browser/OS — CSS cannot control this. A proper fix requires building a custom `Dropdown`/`Combobox` molecule using a positioned popover. Deferred to a future sprint.

## Observations

### Component Height Shift
Placeholder tokens had approximated values (ch-3: 28px, ch-5: 36px, ch-7: 44px). Real tokens from jmi-hub are ch-3: 32px, ch-5: 40px, ch-7: 48px. The real values are correct.

### Token Coverage
The generated `@theme inline` block is significantly more complete than the placeholder — full spacing scale, all radius primitives, icon sizes, transitions, focus ring, z-index scale.

### Text Style Catalog (from OBSERVATIONS.md)
Opportunity to lean harder on the `.text-*` preset classes within components/screens. A wider catalog (e.g., body-sm/md/lg, label-sm/md/lg) could reduce individual overrides and let changes cascade from the variable. Candidate for upstream pipeline discussion.

---

## Pipeline Feedback
See `pipeline-review/2026-04-15-foundation.md` for upstream notes.
