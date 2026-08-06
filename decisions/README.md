# Decision Log

Architecture Decision Records for the portfolio site. One decision per file, so a
future session (human or agent) can load only what it needs instead of re-reading
the whole codebase.

**Read this index first.** Open an individual ADR only when you need the reasoning
behind that specific choice.

## Index

| # | Decision | Status | One-line summary |
|---|---|---|---|
| [0001](./0001-astro-static-first.md) | Astro, static-first | Accepted | Static output now, Node adapter in Phase 2 — no rewrite |
| [0002](./0002-curated-project-manifest.md) | Curated projects, not API-driven | Accepted | 146 repos but only 32 descriptions and 0 topics — the API can't carry the site |
| [0003](./0003-committed-github-cache.md) | Commit the GitHub cache | Accepted | Builds stay hermetic; no network dependency in `docker build` |
| [0004](./0004-docker-multistage-nginx.md) | Multi-stage Docker | Accepted | Build with Node, ship only static files on Nginx |
| [0005](./0005-ngrok-in-compose.md) | Ngrok as a container | Accepted | No host install; one `docker compose up` |
| [0006](./0006-terminal-design-system.md) | Terminal aesthetic | Accepted | Green reserved for accents; body copy stays legible grey |
| [0007](./0007-phase-boundaries.md) | Phase boundaries | Accepted | What each phase owns, and the exact seams between them |
| [0008](./0008-data-access-seam.md) | Single data-access seam | Accepted | `lib/projects.ts` is the only module that knows where data comes from |
| [0009](./0009-automated-code-review.md) | Automated code review | Accepted | Stop hook spawns a read-only project-local agent that enforces these ADRs |
| [0010](./0010-project-tiers-and-private-repo-policy.md) | Tiers + private-repo policy | Accepted | Featured/archive split; private repos never fetched; never guess a demo URL |
| [0011](./0011-client-work-and-full-repo-coverage.md) | Client work + full coverage | Accepted | `client` tier enforced by the schema; all-146 index; 5xx ≠ dead link |

## Conventions

- Filename: `NNNN-kebab-case-title.md`, numbers never reused.
- Sections: **Status · Context · Decision · Consequences · Revisit if**.
- Status is one of `Proposed`, `Accepted`, `Superseded by NNNN`, `Deprecated`.
- Superseding beats editing. Leave the old ADR in place and mark it superseded, so
  the reasoning trail survives.
- Any mid-build choice that contradicts an existing ADR needs a new ADR.
