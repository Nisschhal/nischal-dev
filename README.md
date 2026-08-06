# Portfolio

Personal portfolio site. Static Astro build, served by Nginx in Docker, exposed
through an Ngrok tunnel.

Built in phases — Phase 1 (this) is static with no backend, and the seams for
Phase 2's database and API are already in place. See
[`decisions/0007-phase-boundaries.md`](decisions/0007-phase-boundaries.md).

- [`tasks.md`](tasks.md) — what's done, what's next
- [`decisions/`](decisions/) — why each choice was made

---

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:4321
```

### Run the container

```bash
cp .env.example .env      # then add your NGROK_AUTHTOKEN
docker compose up --build
```

- Site → <http://localhost:8080>
- Ngrok inspector (shows the public URL) → <http://localhost:4040>

To run Nginx without the tunnel:

```bash
docker compose up --build web
```

---

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with HMR |
| `pnpm build` | Static build → `dist/` |
| `pnpm preview` | Serve the built output locally |
| `pnpm sync` | Refresh GitHub stats → `src/data/github-cache.json` |
| `pnpm docker:up` | `docker compose up --build` |
| `pnpm docker:down` | Stop and remove containers |
| `pnpm docker:logs` | Tail container logs |

---

## Adding a project

Projects are **curated**, not pulled from the GitHub API — of 146 public repos only
32 have descriptions and none have topics, so an API listing would be worse than
useless. Reasoning in
[`decisions/0002`](decisions/0002-curated-project-manifest.md).

Create `src/content/projects/my-project.md`:

```markdown
---
title: My Project
repo: Nisschhal/my-project          # optional
summary: One or two sentences, in your own words.
stack: [Next.js, TypeScript, Postgres]
live: https://example.com           # optional
featured: true                      # optional — shows on the homepage
order: 1                            # lower sorts first
year: 2026
status: live                        # live | wip | archived
highlights:                         # optional bullets
  - Something notable
---

## What it is

Markdown body becomes the case study.
```

The filename is the URL slug. The schema is enforced at build time — a missing or
malformed field fails the build rather than rendering blank.

Then refresh the stats:

```bash
pnpm sync                      # 60 req/hr anonymous
GITHUB_TOKEN=ghp_… pnpm sync   # 5000 req/hr
```

`pnpm sync` is deliberately **not** part of `pnpm build`. Builds never touch the
network, so a GitHub outage or rate limit can't fail a deploy — the cache file is
committed. See [`decisions/0003`](decisions/0003-committed-github-cache.md).

---

## Ngrok notes

**Free-tier behaviour that is not a bug:**

- The public URL **changes on every restart**. Read the current one from the
  inspector at <http://localhost:4040>.
- First-time visitors see an **ngrok interstitial warning page** before reaching the
  site.

Both go away with a reserved domain on a paid plan:

1. Set `NGROK_DOMAIN=your-name.ngrok.app` in `.env`
2. Add `--url=${NGROK_DOMAIN}` to the `ngrok` command in `docker-compose.yml`

The tunnel targets `web:80` on the internal compose network, not the published host
port — so changing `WEB_PORT` doesn't affect it.

---

## Architecture

```
docker-compose.yml
├── web    nginx:1.27-alpine  :80 → host :8080
└── ngrok  ngrok/ngrok        tunnel → web:80, inspector :4040

docker/Dockerfile
├── stage 1  node:24-alpine   pnpm install → pnpm build → /app/dist
└── stage 2  nginx:1.27-alpine  serves dist/. No Node in the runtime image.
```

**The important structural rule:** `src/lib/projects.ts` is the only module that
knows where project data comes from. Pages and components never import
`astro:content` or read the cache directly. Phase 2 swaps that file's four function
bodies to query Postgres and every caller keeps working —
[`decisions/0008`](decisions/0008-data-access-seam.md).

```
src/
├── content/projects/*.md    curated entries (source of truth)
├── data/
│   ├── profile.ts           bio, skills, socials, CV
│   └── github-cache.json    committed output of `pnpm sync`
├── lib/
│   ├── projects.ts          ← THE DATA SEAM
│   ├── github.ts            pure fetchRepoStats() — reused by Phase 2's cron
│   └── schemas.ts           contact schema — used by Phase 2's endpoint
├── components/              terminal UI pieces
├── layouts/BaseLayout.astro
└── pages/                   /, /projects, /projects/[slug], /about, /cv, /404
```

Design tokens live in one `@theme` block in `src/styles/global.css`. The palette
rule — accent green is for short strings only, body copy stays legible grey — is in
[`decisions/0006`](decisions/0006-terminal-design-system.md).

---

## Before this goes public

Tracked in [`tasks.md`](tasks.md):

- `P1-07` Replace the placeholder case-study sections in `src/content/projects/`
- `P1-09` Fill in real bio, location, and CV timeline in `src/data/profile.ts`
  (currently marked `TODO:`)
- `P1-22` Add `public/resume.pdf` and set `resumeAvailable: true`
- `P1-24` Add screenshots to `public/covers/` and set `cover:` on projects
- `P1-32` Add `NGROK_AUTHTOKEN` to `.env`
