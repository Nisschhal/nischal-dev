# 0007 — Phase boundaries and the seams between them

**Status:** Accepted · 2026-08-06

## Context

The site was explicitly requested as phase-wise development: static now, backend and
database later. Phased builds fail in a predictable way — Phase 1 hardcodes
assumptions that Phase 2 has to tear out, and "add a backend" becomes "rewrite it".

The defence is to decide *now* where the boundaries are, and build the joints before
they're needed.

## Decision

### Phase 1 — static (this phase)
Astro `output: 'static'`, Nginx serving `dist/`, ngrok tunnel. Content from local
files. Contact is a `mailto:` link. No server, no database, no auth.

### Phase 2 — backend + database
Astro Node adapter behind Nginx as reverse proxy. Postgres + Drizzle. `POST /api/contact`
with validation, rate limiting, and persistence. GitHub sync on a cron. Session auth
and an admin dashboard.

### Phase 3 — backlog
Blog/MDX with RSS, view counts, analytics, CI/CD, real domain and TLS.

### The seams — built in Phase 1, dormant until Phase 2

| Seam | Phase 1 state | Phase 2 action |
|---|---|---|
| `src/lib/projects.ts` | reads content collection + cache JSON | swap function bodies to query the DB; **no caller changes** ([0008](./0008-data-access-seam.md)) |
| `astro.config.mjs` | `output: 'static'` | add `@astrojs/node`, set `output: 'server'` |
| `docker/nginx.conf` | `location /api/` present but commented | uncomment the `proxy_pass` block |
| `scripts/sync-github.ts` | pure `fetchRepoStats()` + CLI wrapper | cron imports the same function, writes to DB |
| `src/lib/schemas.ts` | `contactMessageSchema` defined, used for types | the real endpoint validates against it |
| `docker-compose.phase2.yml` | `api` + `db` services commented | uncomment and `-f` overlay it |
| `docker/Dockerfile` | stage 1 builds, stage 2 serves | stage 1 reused; a Node runtime stage joins it |

**Rule:** a Phase 1 change that would make one of these seams harder to open needs a
new ADR arguing why.

## Consequences

- Phase 2 opens as a series of small, reviewable diffs rather than one large one.
- Some Phase 1 code is more indirect than a purely static site needs — notably the
  data seam and the standalone contact schema. This is the price of the phase plan
  and is paid deliberately.
- The seams are documented in `tasks.md` as `P2-*` tasks, so the roadmap is visible
  from the repo without reading the ADRs.

## Revisit if

Phase 2 requirements change materially — for example a headless CMS instead of a
database. The seam at `lib/projects.ts` accommodates either, which is precisely why
it's drawn there.
