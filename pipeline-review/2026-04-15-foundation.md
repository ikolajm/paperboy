# Pipeline Review — Foundation Sprint
**Date:** 2026-04-15
**Project:** Paperboy
**Branch:** receive-design-system-gen

---

## ComponentPlayground Template Issues

### 1. Void Element Handling
**Problem:** Playground spreads all props (including `children`) onto every component. Void HTML elements (`<input>`, `<textarea>` when used as self-closing) crash with "void element tag must neither have children."
**Recommendation:** Generated playground should separate `children` from rest props and conditionally render.

### 2. Story Switching — State Reset
**Problem:** `useState(story.defaultProps)` doesn't reset when the `story` prop changes. Navigating between stories carries stale props (e.g., Button's `variant: 'default'` bleeds into Chip which expects `'unselected'`).
**Recommendation:** Add `useEffect(() => setProps(story.defaultProps), [story])` to the generated playground template.

### 3. Select Story Needs Sample Options
**Problem:** Select story renders an empty dropdown — no `<option>` children provided.
**Recommendation:** Generate a demo wrapper for Select stories that includes 3-4 sample options.

---

## Token Visualization Gap

The handoff ships tokens.css, components, stories, and a playground — but no visual reference for the token system itself (color palettes, typography scale). We had to build `ColorPalette` and `TypographyScale` components manually.

**Recommendation:** Consider generating token visualization pages as part of the handoff output. These are derivable directly from the token config.

---

## Component Height Mismatch (Non-Issue)

Placeholder tokens in globals.css had approximated component heights (ch-3: 28px, ch-5: 36px, ch-7: 44px) that differed from the real generated values (ch-3: 32px, ch-5: 40px, ch-7: 48px). The real values are correct. This is just a note that placeholder stubs should either match or be clearly marked as non-representative.
