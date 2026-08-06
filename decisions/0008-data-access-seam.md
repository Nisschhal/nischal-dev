# 0008 — A single data-access seam

**Status:** Accepted · 2026-08-06

## Context

This is the load-bearing decision of the phase plan ([0007](./0007-phase-boundaries.md)).

In Phase 1, project data lives in Astro content collections plus a cached JSON file.
In Phase 2 it moves to Postgres. If pages call `getCollection('projects')` directly —
the idiomatic Astro way — then every page, every component, and every sort and filter
is coupled to the storage mechanism, and Phase 2 touches all of them.

## Decision

**Exactly one module knows where data comes from: `src/lib/projects.ts`.**

```ts
export type Project = { /* storage-agnostic shape */ }

export async function getProjects(): Promise<Project[]>
export async function getFeaturedProjects(): Promise<Project[]>
export async function getProject(slug): Promise<Project | null>
export async function getAllStacks(): Promise<string[]>
```

Rules:

1. No page or component imports `astro:content`, or reads `github-cache.json`, for
   project data. They import from `lib/projects.ts`.
2. The returned `Project` type is defined by what the **UI** needs, not by what the
   content schema or a future database table happens to look like. Both sides map
   onto it.
3. All four functions are `async` even though Phase 1 could answer synchronously.
   A database call cannot, and changing a sync function to async later is a breaking
   change at every call site.

Rendering the Markdown body is the one deliberate exception: `render()` is bound to
the content entry, so `getProject()` returns the entry alongside the mapped
`Project` for the detail page to render. Phase 2 replaces that with server-rendered
HTML from the database, and only `projects/[slug].astro` is affected.

## Consequences

- Phase 2 rewrites four function bodies. Pages and components don't change.
- Sorting, filtering, and the featured subset live in one place instead of being
  reimplemented per page.
- Slight indirection cost in Phase 1 — a page can't just call `getCollection()`.
  Deliberate, and the reason is this file.
- The `async` requirement means top-level `await` in `.astro` frontmatter, which
  Astro supports natively.

## Revisit if

Never, while the phase plan holds. If Phase 2 is cancelled and the site stays static
forever, this indirection could be inlined — but the cost of keeping it is close to
zero.
