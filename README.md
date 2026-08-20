# Portfolio

**Live:** <https://nischal-dev-eight.vercel.app>

Personal portfolio site. Static Astro build, deployed on Vercel. The same output
also runs locally as an Nginx container, optionally exposed through an Ngrok
tunnel — see [Run the container](#run-the-container).

### Two sites, on purpose

There is a second, separate portfolio at
<https://nischaldev.vercel.app> — a designed, animated Next.js site. It is **not**
this repository and is not built from this code.

The split is deliberate and the copy leans on it: **this** site is the workshop
(every repository, written up, with the architecture decisions kept), and that one
is the showroom. They link to each other from the header, the hero and the footer.
`profile.portfolioUrl` is the single place that URL is defined.

Built in phases — Phase 1 (this) is static with no backend, and the seams for
Phase 2's database and API are already in place. See
[`decisions/0007-phase-boundaries.md`](decisions/0007-phase-boundaries.md).

- [`tasks.md`](tasks.md) — what's done, what's next
- [`decisions/`](decisions/) — why each choice was made

---

## What it is

A terminal-styled portfolio that ships as pure static HTML — no client-side
framework, no runtime JavaScript for content, no backend. Every page is rendered
at build time and served as files.

The interesting part isn't the pages, it's the constraints enforced around them.
Project data flows through a single module so the storage layer can be swapped
without touching a component. Client work is prevented from leaking a repository
URL by the build itself rather than by a template convention. The GitHub stats
shown on cards are a committed file, so a deploy can't fail because an API is
rate-limited.

## Stack

| Concern | Choices |
|---|---|
| **Framework** | Astro 7 (`output: 'static'`), TypeScript |
| **Styling** | Tailwind CSS 4 via `@tailwindcss/vite`, one `@theme` token block, JetBrains Mono |
| **Content** | Astro content collections, glob loader, Zod schema validation |
| **Data** | Committed JSON cache generated from the GitHub REST API |
| **Build / tooling** | pnpm 11, Node 22.13, Vite, `@astrojs/sitemap` |
| **Scripts** | Node native TypeScript (`--experimental-strip-types`) — no build step, no ts-node |
| **Container** | Multi-stage Docker: `node:24-alpine` builds, `nginx:1.27-alpine` serves. No Node in the runtime image |
| **Serving** | Nginx with gzip, immutable caching for content-hashed assets, and a CSP plus four hardening headers |
| **Tunnel** | Ngrok in Compose, targeting the internal network rather than the published port |
| **Hosting** | Vercel, building straight from the repository — no adapter, since the output is already static |
| **CI** | GitHub Actions — build, client-privacy assertion, and a report-only link check on every PR |

## Engineering decisions worth reading

Each of these is written up in [`decisions/`](decisions/) with the reasoning and
the alternatives that were rejected.

- **A single data seam** ([`0008`](decisions/0008-data-access-seam.md)) — `src/lib/projects.ts`
  is the only module that knows where project data lives. Pages never import
  `astro:content`. Phase 2 swaps four function bodies for Postgres queries and
  every caller keeps working. All functions are already `async` because a database
  call can't be synchronous and sync→async is a breaking change everywhere.
- **Confidentiality enforced at build time** ([`0011`](decisions/0011-client-work-and-full-repo-coverage.md)) —
  a `tier: client` entry that declares `repo:` fails the build. Rendering already
  omits the link, but rendering is a convention someone can refactor away by
  accident. A second, independent check reads the built HTML in CI and asserts no
  client page links to source. The cost of getting this wrong is publishing a
  client's private repository, so it is enforced twice.
- **Builds never touch the network** ([`0003`](decisions/0003-committed-github-cache.md)) —
  GitHub stats are refreshed by an explicit `pnpm sync` and committed. A rate limit
  or an outage cannot fail a deploy.
- **Curated projects, not an API listing** ([`0002`](decisions/0002-curated-project-manifest.md)) —
  of 148 public repos, only 32 have a description and none have topics. An automatic
  listing would be worse than useless, so entries are hand-written.
- **Phase boundaries drawn up front** ([`0007`](decisions/0007-phase-boundaries.md)) —
  the static build is Phase 1, and the exact three-line change that turns it into a
  server render is documented in `astro.config.mjs` rather than discovered later.

## Built with Claude Code

This site was built end to end with **Claude Code**, and a second goal ran
alongside the first: learning the agent harness itself — hooks, subagents, skills,
and MCP servers — by using each one for a real job in a real repository rather
than in a tutorial.

The point is that the agent configuration is **version-controlled and constrained**,
not ad-hoc prompting. Everything below lives in the repo and is reviewable:

- **Context, not vibes.** `AGENTS.md` (with `CLAUDE.md` symlinked to it) carries the
  project instructions, and [`decisions/`](decisions/) records eleven ADRs. Changes
  get reviewed against this repository's own recorded decisions rather than generic
  style rules.
- **A `Stop` hook that reviews every turn** ([`0009`](decisions/0009-automated-code-review.md)) —
  `.claude/hooks/review-changes.sh` fires after each turn and spawns a project-local
  `code-reviewer` subagent. The reasoning behind it is the useful part: instructions
  in `CLAUDE.md` are *advisory* and get followed only when the model happens to,
  while a hook is executed unconditionally by the harness. It runs at end-of-turn
  rather than per-edit, because reviewing after every `Edit` inspects half-finished
  work and reports things like "unused import" when the usage simply isn't written
  yet.
- **Subagents with deliberately narrow tools.** The reviewer is granted
  `Read, Grep, Glob` and nothing else — a reviewer that can edit is a reviewer that
  can break the build unattended. A second agent, `issue-solver`, takes a GitHub
  issue to an open pull request on its own branch and never pushes to `main`.
- **Skills, pinned by hash.** The `github-issues` skill is vendored under
  `.agents/skills/` and locked in `skills-lock.json` by content hash, so a skill
  pulled from an upstream repository can't change underneath the project silently.
- **MCP servers** provide the GitHub integration the skill and the issue-solver
  agent operate through.
- **Non-blocking by design.** The review hook is `async` with `asyncRewake`, so a
  turn never waits on it and findings surface back into context instead of being
  buried in a log nobody opens. A false positive costs one message, not a stalled
  session.

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

## Deploy

Vercel builds directly from the repository. Because `output` is already `'static'`
and every route is prerendered, there is no adapter and no `vercel.json` — Vercel
detects Astro, runs `pnpm build`, and serves `dist/`. The Docker and Nginx setup is
ignored entirely; it exists for local and self-hosted runs.

The build needs **no secrets**. `pnpm sync` is the only thing that reads
`GITHUB_TOKEN`, and it never runs during a build.

One environment variable is worth setting:

| Variable | Why |
|---|---|
| `PUBLIC_SITE_URL` | Absolute URLs for `sitemap-index.xml`, `<link rel="canonical">`, and OG tags. Without it these fall back to `https://nischal.dev`, which points at a domain that isn't live yet — the site renders fine, but search engines and link previews are sent somewhere wrong. |

Set the project's Node version to 22.x to satisfy the `engines` floor.

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

Projects are **curated**, not pulled from the GitHub API — of 148 public repos only
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
tier: featured                      # featured | client | archive (default archive)
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

`tier` decides where the entry appears: `featured` gets a card and a case-study
page, `client` gets its own section with a live link and **never** a source link,
`archive` gets a single row in the index. A non-empty Markdown body is what earns
the case-study page — an entry without one falls back to a row.

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
│   ├── profile.ts           ← ALL SITE COPY. hook, bio, skills, socials, CV
│   ├── all-repos.json       full repo index (148 entries)
│   └── github-cache.json    committed output of `pnpm sync`
├── lib/
│   ├── projects.ts          ← THE DATA SEAM
│   ├── emphasis.ts          *asterisk* → <strong> for prose in profile.ts
│   ├── github.ts            pure fetchRepoStats() — reused by Phase 2's cron
│   └── schemas.ts           contact schema — used by Phase 2's endpoint
├── components/              terminal UI pieces
│   └── ScrollReveal.astro   CSS-only scroll reveal — read its header before editing
├── layouts/BaseLayout.astro
└── pages/                   /, /projects, /projects/[slug], /about, /cv, /404
```

Design tokens live in one `@theme` block in `src/styles/global.css`. The palette
rule — accent green is for short strings only, body copy stays legible grey — is in
[`decisions/0006`](decisions/0006-terminal-design-system.md).

---

## Copy

**All site copy lives in `src/data/profile.ts`.** One object feeds the hero, the
about page, the CV page and every meta tag. There is no second copy of any string,
and components never hard-code prose. Two fields are easy to confuse:

| Field | Renders | Job |
|---|---|---|
| `hook` | hero only (`/`) | Two sentences. A hiring manager gives the page seconds — this is one concrete claim, not a summary. |
| `bio` | `/about` only | Six paragraphs. The story: no one to learn from → becoming the teacher → the idea about AI → first team → the fear he outgrew → owning it alone. |

`hook` never renders on `/about`, so `bio[0]` must stand alone with no reference
back to it.

**Two rules that are load-bearing, not stylistic:**

1. **Paragraph order.** Only the first `LEAD_PARAGRAPHS` (in `about.astro`) render
   plain — the rest are ghosted until the reader scrolls. Those first paragraphs
   carry the whole job of earning the scroll, so the hook and the strongest human
   material must stay at the top.
2. **Every struggle beat is the owner's own.** They came from him directly or from
   his blog posts. They are what make the page a story instead of a résumé. Do not
   smooth them out, and **never invent a new one** — this is a page a hiring manager
   may ask him about in an interview.

**Emphasis:** wrap a short phrase in `*asterisks*` and `lib/emphasis.ts` renders it
as `<strong class="em">`. Keep it to 2–4 short phrases across the whole bio — the
bold fragments should read as the arc in miniature. Asterisks are the only markup
allowed in those strings; the helper escapes HTML before substituting.

### `ScrollReveal.astro` — code that looks wrong but isn't

The `/about` prose reveals word by word as you scroll, in **pure CSS** — no
JavaScript, because the site ships no runtime JS for content and the Nginx CSP
blocks external origins, so a motion library is not an option.

Four things in that component look like mistakes and will break the effect if
"fixed". All four were diagnosed against the built output, not guessed:

- **`display: inline`, never `inline-block`.** Under the default
  `box-decoration-break: slice`, a fragmented inline box is painted as one unbroken
  run and then sliced across lines — which is why `background-size: 0% → 100%`
  sweeps in *reading order*. On a block element the same gradient advances every
  line in parallel.
- **`animation-timeline: var(--tl)`, with `--tl` set inline.** Lightning CSS folds
  an adjacent `animation-timeline` into the `animation` shorthand, emitting
  `animation: linear both scroll-reveal --para`. The timeline was removed from that
  shorthand in the spec, so Chrome discards the whole declaration and nothing
  animates. The `var()` indirection prevents the merge.
- **`view-timeline-name` is declared inline on the `<p>`, not in the `<style>`.**
  From the stylesheet it ships in the CSS text but never reaches the element
  (`viewTimelineName` computes to `none`), leaving every animation pointed at a
  timeline that does not exist.
- **`animation-range: cover 45vh cover calc(100% - 55vh)` is written literally.**
  Going through a `--read-line` custom property is invalid at computed-value time
  and silently falls back to `normal`, which restores the full cover range and
  reveals text long before the reader reaches it. The `vh` units pin the reveal to a
  reading line on screen; percentages of `cover` do not.

Degradation is deliberate: without `animation-timeline` support, or under
`prefers-reduced-motion: reduce`, the `@supports` block never applies and the text
renders at full `--color-text`. Every word is plain text in the DOM either way,
which is what makes this safe to use on the bio rather than only on decoration.

---

## Before this goes public

Tracked in [`tasks.md`](tasks.md):

- `P1-07` Replace the placeholder case-study sections in `src/content/projects/`
- ~~`P1-09` Fill in real bio, location, and CV timeline~~ — **done.** `profile.ts`
  holds real copy; no `TODO:` markers remain in it
- `P1-22` Add `public/resume.pdf` and set `resumeAvailable: true`
  (`resumeAvailable` is `false`, so `/cv` shows a disabled button rather than a
  broken link)
- Add a real LinkedIn URL to `profile.socials` — the entry is intentionally absent
  rather than pointing at a dead `/in/`
- `P1-24` Add screenshots to `public/covers/` and set `cover:` on projects
- `P1-32` Add `NGROK_AUTHTOKEN` to `.env`
