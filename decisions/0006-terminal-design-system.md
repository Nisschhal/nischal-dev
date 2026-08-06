# 0006 — Terminal design system

**Status:** Accepted · 2026-08-06

## Context

The chosen visual direction is a terminal / developer aesthetic: monospace type,
shell-prompt motifs, phosphor green on near-black.

The classic failure mode of this style is rendering *everything* in bright green on
black. `#00ff9c` on `#0d1117` passes contrast checks easily (~13:1) but saturated
green at full brightness across paragraphs causes visual fatigue and chromatic
aberration on LCDs — technically accessible, practically unreadable.

## Decision

Keep the aesthetic, discipline the palette.

```
bg       #0d1117   canvas
surface  #161b22   cards, code blocks
border   #30363d   hairlines, dividers
text     #c9d1d9   ← body copy lives here
dim      #8b949e   metadata, timestamps, secondary
accent   #00ff9c   ← prompts, links, focus rings, highlights ONLY
```

**The rule: `accent` is for short strings.** Prompt sigils, link text, active states,
focus rings, single highlighted words. Any run of prose longer than a few words uses
`text`. Enforced by convention plus a comment in `global.css`.

Type is JetBrains Mono throughout, self-hosted via
`@fontsource-variable/jetbrains-mono` — no Google Fonts request, which matters
because the Nginx CSP disallows external origins.

**Motifs:** `~/nischal $` prompt lines as section headings, box-drawing dividers,
`ls`-style project rows, a blinking `_` cursor.

**Motion:** the typing effect and cursor blink are wrapped in
`@media (prefers-reduced-motion: no-preference)`. With reduced motion requested, text
renders complete and the cursor sits solid. The animation is decorative and never
gates content — text is present in the DOM from the start, so it works with JS off
and is fully readable to screen readers.

## Consequences

- Long-form content (case studies, CV) stays comfortable to read while the site still
  reads unmistakably as a terminal.
- Focus rings use `accent`, which is highly visible against the dark canvas — good
  keyboard accessibility comes free.
- Self-hosted variable font: one `woff2`, subset to latin, `font-display: swap`.
- Monospace is wider than proportional type at the same size; measure is capped
  around 72ch so lines don't sprawl on wide screens.

## Revisit if

Reader feedback says the green is still too much, or a light mode is wanted. The
tokens are CSS custom properties in one `@theme` block, so a palette swap is a
single-file change.
