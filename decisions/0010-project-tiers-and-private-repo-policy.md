# 0010 — Project tiers, private-repo policy, and never guessing a URL

**Status:** Accepted · 2026-08-06 —
**link-checker rule superseded by [0011](./0011-client-work-and-full-repo-coverage.md)**
**Amends:** [0002](./0002-curated-project-manifest.md) in part — the curation
principle stands; its "~10 projects" scope does not.

> The "any status below 400 is alive" rule below was too strict. A Next.js 500 can
> still render a complete page — `ink-sprout-v2` does exactly that — so 5xx is now a
> warning, not a failure. See [0011](./0011-client-work-and-full-repo-coverage.md).
> Everything else in this ADR still holds.

## Context

The first cut shipped 11 of 146 public repos. Curation was right
([0002](./0002-curated-project-manifest.md)) but the knife went too deep: projects
with verified working demos and real commit history were dropped, and the site
under-represented the work.

Three separate problems surfaced while widening it.

**Private repos hold client work.** With a `GITHUB_TOKEN` now in `.env`, the sync
script runs authenticated and *could* fetch private repositories. The cache was built
before the token existed, so no private data was ever fetched — but "nothing bad
happened yet" is not a control.

**Six demo URLs were already dead**, including the one on the top featured project.
They were seeded from GitHub's `homepage` field, which nobody maintains.

**Guessing replacement URLs is dangerous.** Probing for a replacement found
`inksprout.vercel.app` resolving — but serving a *different product* ("personalized
coloring books for kids", not the stationery store the repo describes).
`authmern.vercel.app` and `loopstudios.vercel.app` also resolved, as a stock CRA app
and a Frontend Mentor challenge. Vercel subdomains are global and first-come.

## Decision

### Two tiers
`tier: 'featured' | 'archive'` in the content schema, defaulting to `archive`.

- **featured** (9) — homepage card + full case-study page.
- **archive** (16) — one dense row in the index, linking straight to demo or code.
  No detail page is generated.

Defaulting to `archive` means a new entry can never silently claim a case-study page
it has no body for. `getStaticPaths` in `projects/[slug].astro` filters to featured,
so 16 near-empty pages are never built.

### Private and client work
**No private repository is ever fetched or published.** Two independent controls:

1. **Code guard** — `fetchRepoStats` in `src/lib/github.ts` checks `d.private` and
   refuses to cache, recording `PRIVATE — refusing to cache`. Unconditional, and it
   runs before anything is written. Verified against a real private repo.
2. **Least privilege** — `GITHUB_TOKEN` should carry **no scopes**. Public read still
   gets 5000 req/hr. The token found in `.env` had `project, repo` — full read *and
   write* on every private repository, which the sync script never needs.

Client work is shown, when permitted, via an **entry with no `repo:` field**: live URL
and description only, no code link, GitHub never queried. Template at
`src/content/projects/_client-work-template.md.example`.

**Permission to name a client is a contractual question the code cannot answer.** The
template says so; the human decides.

### Never guess a demo URL
If a `live:` URL is dead, either supply the correct one or drop the field. Guessing a
subdomain risks pointing the portfolio at a stranger's site — a worse failure than a
missing link, because it looks deliberate.

### Link checking
`scripts/check-links.ts` (`pnpm check:links`) verifies every `live:` URL. Not part of
`build` — builds stay hermetic ([0003](./0003-committed-github-cache.md)).

It uses `redirect: 'manual'` and treats **any status below 400 as alive**. Following
redirects reported three live Clerk-protected sites as dead: their sign-in chain
exceeds Node's 20-redirect cap and `fetch` throws, while `curl -L` (50 hops) reaches
200. The question is "is this deployment serving", not "does it render anonymously" —
a dead Vercel deployment hard-404s. **A checker that flags working links is worse than
no checker, because someone will act on it.**

## Consequences

- 25 projects: 9 case studies, 16 archive rows. 16 have a verified live demo.
- 14 pages built, not 30 — archive adds rows, not routes.
- The `/projects` stack filter spans both sections, so a tag that only appears in the
  archive still narrows the page.
- Archive rows use explicit grid placement in every cell. Leaving the title
  auto-placed let the tags span claim column 1 and pushed the project name into the
  middle of the row — CSS Grid resolves definite-position items before auto ones.
- InkSprout keeps its featured slot with a code link only until a working demo URL
  is supplied.

## Revisit if

The archive grows past ~25 rows, at which point it wants grouping or pagination. Or
if a client relationship makes even an unnamed listing inadvisable — in which case
drop the entry entirely; there is no partial-disclosure mode worth engineering.
