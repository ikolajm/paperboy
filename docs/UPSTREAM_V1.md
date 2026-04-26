# Upstream V1 — Feedback for jmi-hub

What we learned integrating the jmi-hub design system scaffold into Paperboy.
This file exists so the hub can scan it for reference when generating future
scaffolds.

---

## Integration Procedure

The scaffold lands in three steps:

1. Generate in jmi-hub (tokens.css, atoms/, stories/, playground/, providers/)
2. Copy output into the target project's `frontend/src/`
3. Import `tokens.css` in the project's `globals.css`:
   ```css
   @import "tailwindcss";
   @import "../tokens.css";
   ```

No intermediate `generated/` directory — tokens.css lives at `src/tokens.css`
directly. Simpler path, fewer indirections.

---

## Bug Fix Patterns

Three bugs were found in the generated scaffold output during Paperboy
development. These patterns should be incorporated into future generations.

### 1. Playground state bleed between stories

**Symptom:** Switching from one story to another kept the previous story's
prop values in the controls panel. A Button configured as `variant="destructive"`
would carry that state into the next component.

**Root cause:** `ComponentPlayground` used `useState(story.defaultProps)` which
only initializes once — React doesn't re-initialize state when props change.

**Fix:** Add `key={storyKey}` to the `<ComponentPlayground>` element in the
design system page. React fully remounts the component when the key changes,
resetting all state.

```tsx
<ComponentPlayground key={active} story={stories[active]} />
```

### 2. Void element crash in playground

**Symptom:** Playground crashed when rendering void elements like `<Input>`,
`<Separator>`, `<Slider>` — React error about passing children to elements
that don't accept them.

**Root cause:** The generated playground rendered all components uniformly
with `{children}`, but void HTML elements can't receive children.

**Fix:** `resolveIconProps()` utility that separates children from rest props.
When `iconOnly` is active, replaces children with a placeholder icon element.
Hides text/icon controls when they're incompatible with the current prop state.

```tsx
// Hide text/icon controls when iconOnly is active
const hideWhenIconOnly = ['children', 'showLeadingIcon', 'showTrailingIcon'];
if (props.iconOnly && hideWhenIconOnly.includes(control.prop)) return null;
```

### 3. Select story rendered empty

**Symptom:** Select component in the playground showed an empty dropdown with
no options to choose from.

**Root cause:** The generated story definition didn't include sample
`<SelectItem>` children. Select, Combobox, DropdownMenu, and similar
components are useless in a playground without sample items.

**Fix:** Stories for selection-type components must ship with sample items
baked into the story definition — either in `defaultProps` or rendered
directly by the story component wrapper.

---

## Improved Patterns

### Icon prop convention

Stories use boolean controls (`showLeadingIcon`, `showTrailingIcon`) that map
to ReactNode props (`leadingIcon`, `trailingIcon`) at render time. This avoids
needing a ReactNode picker in the playground UI.

```tsx
function resolveIconProps(props: Record<string, any>): Record<string, any> {
  const resolved = { ...props };
  if (resolved.iconOnly) {
    resolved.children = createElement(Star, { size: 16 });
  }
  for (const key of Object.keys(resolved)) {
    if (key.startsWith('show') && key.endsWith('Icon') && resolved[key] === true) {
      const realProp = key.slice(4, 5).toLowerCase() + key.slice(5);
      resolved[realProp] = createElement(Star, { size: 16 });
      delete resolved[key];
    } else if (key.startsWith('show') && key.endsWith('Icon')) {
      delete resolved[key];
    }
  }
  return resolved;
}
```

---

## Architecture Decisions

### Functional category grouping (not atomic levels)

The original scaffold organized the design system page by atomic level
(Atoms → Molecules). In practice, we reorganized into functional categories:

- Actions (Button, FAB, Badge, Chip, Toggle, ToggleGroup)
- Inputs (Input, Select, Textarea, DatePicker, Checkbox, Radio, Switch, Combobox, Slider, FileUpload, InputOTP, Label, HelperText, FormField, Calendar)
- Layout (Card, Dialog, Table, Sheet, Separator, AlertDialog)
- Feedback (Toast, Alert, Tooltip, Popover, DropdownMenu, Skeleton, ProgressBar, BadgeDot, EmptyState, ContextMenu, HoverCard, Spinner)
- Data Display (Avatar, ListItem, Accordion, Kbd, Collapsible)
- Navigation (TopBar, Sidebar, Tabs, BottomNav, Breadcrumbs, Pagination, NavigationMenu, CommandPalette)
- Composite (Stepper, Carousel, TreeView)

This grouping was more useful for browsing — when building a form you look
under Inputs, not "which atomic level is a datepicker?" Future generations
should use these categories in `storyCategories` and in the design system
page sidebar.

### Molecules directory

The scaffold created a `components/molecules/` directory. It was never
populated — Paperboy's composed components are domain-specific (digest/shell,
digest/news, digest/scores) rather than generic composites. Keep molecules
as an empty scaffold directory for projects that need it, but don't expect
it to be used universally.

### Token path

`generated/tokens.css` → `tokens.css` at `src/` root. One fewer directory.
Upstream should output to flat path by default.

### Components added downstream

Only one atom was added outside the scaffold: `Logo.tsx` (project-specific
SVG mark). The 55-atom scaffold covered everything else needed for a full
dashboard build.
