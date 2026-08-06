# 0003 — Commit the GitHub cache; never fetch during a build

**Status:** Accepted · 2026-08-06

## Context

Curated entries are enriched with live GitHub stats ([0002](./0002-curated-project-manifest.md)).
The question is *when* that fetch happens.

Fetching inside `astro build` — which runs inside `docker build` — means every image
build depends on:

- GitHub being reachable from the build context
- The unauthenticated rate limit (**60 requests/hour per IP**), which a few rebuilds
  in a row will exhaust
- Docker's build network, which is not always available in CI or offline

A failed enrichment fetch would then fail the entire image build, taking down a
deploy over cosmetic metadata.

## Decision

The sync is a **separate, explicit step** whose output is **committed to the repo**.

```
pnpm sync   →   scripts/sync-github.ts   →   src/data/github-cache.json  (committed)
pnpm build  →   reads the JSON from disk. No network.
```

`astro build` never touches the network. `lib/projects.ts` degrades gracefully: a
repo missing from the cache renders without stats rather than throwing.

`GITHUB_TOKEN` is read from the environment when present, lifting the rate limit to
5000/hour. It is optional — the script works unauthenticated.

## Consequences

- `docker build` is hermetic and works offline. Deploys cannot fail because of
  GitHub.
- The cache file appears in diffs when refreshed. This is a feature: stat changes
  are reviewable rather than silent.
- Stats are as fresh as the last `pnpm sync`. For a portfolio with ~0 stars, staleness
  is close to meaningless — and Phase 2 automates it anyway.
- `fetchRepoStats(slugs)` is written as a **pure function** with a thin CLI wrapper
  around it, specifically so the Phase 2 cron job can import it unchanged.

## Revisit if

The site starts showing genuinely time-sensitive data. That's Phase 2's cron job
writing to the database, at which point this ADR is superseded rather than edited.
