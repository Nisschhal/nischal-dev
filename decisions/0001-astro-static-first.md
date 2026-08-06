# 0001 — Astro, static-first

**Status:** Accepted · 2026-08-06

## Context

The site must be served by Nginx from a Docker container in Phase 1, with no
backend. Phase 2 adds a database, a contact endpoint, and an admin dashboard. The
framework choice therefore has to satisfy two things at once: emit plain static
files today, and grow a server without a rewrite.

Candidates considered:

- **Next.js** — matches the existing stack (54 TypeScript repos, mostly Next). But
  `output: 'export'` disables a large part of the framework, and the static build
  still ships a full React runtime for a site that is 95% static text.
- **Vite + React SPA** — lightest tooling, but no server story at all. Phase 2 would
  need a separately built backend service, which is a bigger seam than necessary.
- **Astro** — static by default, ships zero JS unless a component opts in, and has a
  first-party Node adapter that turns the same codebase into an SSR app.

## Decision

Use **Astro 7 with `output: 'static'`** and Tailwind v4 (via `@tailwindcss/vite`,
CSS-first `@theme` config — not a `tailwind.config.js`).

Interactivity is limited to small islands (hero typing effect, project filter).
Everything else renders to static HTML.

## Consequences

- Nginx serves a plain `dist/` directory. No Node process in the Phase 1 runtime
  image, which keeps it small and removes a whole class of failure modes.
- Phase 2 is a two-line change: add `@astrojs/node` and flip `output` to `'server'`.
  Pages and components are untouched because data access is already isolated
  ([0008](./0008-data-access-seam.md)).
- Astro is a new framework for this codebase's author. The component model is close
  enough to JSX that the ramp is short, and the constraint of "no client JS unless
  you ask for it" is a feature for a portfolio.
- Astro bundles its own zod (v4) and re-exports it as `z` from `astro:content`.
  Content schemas import from there, not from the standalone `zod` package, to avoid
  two zod instances disagreeing at runtime.

## Revisit if

The site needs heavy client-side state or a React component library that is painful
to embed as islands. At that point a Next.js migration is a reasonable answer, and
the content collection files port over as-is.
