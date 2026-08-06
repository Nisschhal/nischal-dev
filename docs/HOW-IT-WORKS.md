# How it works

The pipeline end to end, and the vocabulary this project invented for itself.

For setup instructions see [GETTING-STARTED.md](./GETTING-STARTED.md).

---

## The whole thing in one picture

A Markdown file on your disk becomes a page on the public internet like this:

```
  src/content/projects/ink-sprout.md          you write this
            │
            │  ① schema validation  (src/content.config.ts)
            │     bad frontmatter fails the BUILD, not the page
            ▼
       content collection
            │
            │  ② the data seam  (src/lib/projects.ts)
            │     merges in GitHub stats from src/data/github-cache.json
            ▼
        Project object
            │
            │  ③ pages + components read ONLY from the seam
            ▼
     src/pages/projects/[slug].astro
            │
            │  ④ pnpm build → static HTML, CSS, fonts
            ▼
          dist/
            │
            │  ⑤ Docker stage 1 builds it, stage 2 copies dist/ into Nginx
            ▼
   nginx container  :80  ──→  host :8080
            │
            │  ⑥ ngrok container tunnels to web:80
            ▼
   https://something.ngrok-free.dev
```

Two things are worth noticing.

**Nothing fetches at runtime.** GitHub data is pulled by `pnpm sync`, written to a
JSON file, and committed. The build reads that file from disk. A GitHub outage cannot
break a deploy. ([ADR 0003](../decisions/0003-committed-github-cache.md))

**No Node in production.** Stage 1 of the Docker build runs Node to produce `dist/`.
Stage 2 is Nginx plus those files and nothing else — no Node, no `node_modules`, no
source. ([ADR 0004](../decisions/0004-docker-multistage-nginx.md))

---

## Glossary

Terms this project uses constantly. None are standard Astro vocabulary.

### Seam

A single module that hides where data comes from, so the rest of the app never
knows. Here it is **`src/lib/projects.ts`**.

Every page and component gets projects by calling `getProjects()`,
`getFeaturedProjects()`, and friends. **Nothing else imports `astro:content` or reads
the cache file** for project data.

Why bother? Phase 2 replaces Markdown files with a Postgres database. Because only
one module knows the current source, that migration rewrites four function bodies and
touches no page. Without the seam, every page would need editing.

The functions are all `async` even though reading local files could be synchronous —
a database query cannot be, and changing sync→async later would break every call
site. ([ADR 0008](../decisions/0008-data-access-seam.md))

### Tier

How much space a project gets. Set with `tier:` in frontmatter.

| tier | Where it appears | Gets its own page? |
|---|---|---|
| `featured` | Card grid, top of `/projects` and the homepage | Yes, if it has a body |
| `client` | Its own "Client work" section | Yes, if it has a body |
| `archive` | A single dense row lower down | No |

Defaults to `archive`, so a new entry can never accidentally claim a case-study page
it has no content for.

A page is only generated when the Markdown body is non-empty. An entry with
frontmatter and nothing else renders as a row and links straight out — better than a
page with an empty article.

### ADR — Architecture Decision Record

A short document recording *why* a choice was made, kept in
[`decisions/`](../decisions/). There are 12.

They exist because "why is it like this?" is the expensive question six months later.
Each has **Status / Context / Decision / Consequences / Revisit if**. Superseding
beats editing — an outdated ADR is marked superseded rather than rewritten, so the
reasoning trail survives.

Start with [the index](../decisions/README.md).

### Phase 1 / Phase 2

The project is built in stages, and Phase 1 was designed so Phase 2 does not require
a rewrite.

- **Phase 1 (shipped):** static site, no server, no database. Contact is a `mailto:`
  link.
- **Phase 2 (planned):** Node server, Postgres, a real contact form, an admin
  dashboard.

The joints between them — "seams" — are already built and inert:

| Seam | Phase 1 | Phase 2 |
|---|---|---|
| `src/lib/projects.ts` | reads files | queries the database |
| `astro.config.mjs` | `output: 'static'` | `output: 'server'` + Node adapter |
| `docker/nginx.conf` | `/api/` block commented out | uncomment `proxy_pass` |
| `src/lib/schemas.ts` | contact schema defined, unused | validates the real endpoint |
| `docker-compose.phase2.yml` | commented stub | `api` + `db` activated |

([ADR 0007](../decisions/0007-phase-boundaries.md))

### Content collection

An Astro feature: a folder of Markdown files with a **schema** attached. The schema
lives in `src/content.config.ts` and is enforced at build time, so a typo in
frontmatter fails the build with a precise message instead of rendering a blank page.

### Island

An Astro term for a component that ships JavaScript to the browser. Everything else
renders to static HTML with none. This site has almost no JavaScript — the small
amount it does have (a project filter, a scroll reveal) is inlined into the HTML, so
there are **zero** extra script requests.

---

## Content: how a project becomes a page

Each file in `src/content/projects/` is one project. The filename is the URL slug.

```markdown
---
title: InkSprout                          # required
summary: A full e-commerce platform…      # required, 20–280 chars
stack: [Next.js, TypeScript]              # required, at least one
tier: featured                            # featured | client | archive
year: 2026                                # required
status: live                              # live | wip | archived
repo: Nisschhal/ink-sprout-v2             # optional — "owner/name"
live: https://example.com                 # optional
featured: true                            # optional — pin to the homepage
highlights:                               # optional bullets
  - Stripe checkout with server-side payment intents
---

## What it is

Everything below the frontmatter becomes the case study page.
```

Validation is defined in `src/content.config.ts`. Get a field wrong and the build
stops and tells you which file and which field.

### Client work

A project with **no `repo:` field** renders with a live link and no source link, and
GitHub is never queried for it. That is how commissioned work appears without
exposing a client's private repository.

This is not a convention — it is enforced. Declaring `repo:` on a `tier: client`
entry **fails the build**:

```
A `client` project must not declare `repo:` — client source is never linked.
```

The guarantee lives in the schema rather than in rendering code, because rendering is
something a future refactor could quietly change.
([ADR 0011](../decisions/0011-client-work-and-full-repo-coverage.md))

---

## Data: the two generated files

Both are produced by `pnpm sync` and **committed**.

**`src/data/github-cache.json`** — stars, language, and last-push date for every repo
referenced by a content file. Merged onto projects by the seam. A repo missing from
the cache renders without stats rather than throwing.

**`src/data/all-repos.json`** — every public repo on the account, powering the
collapsed index at the bottom of `/projects`.

Both are fetched from GitHub's **public-only** endpoint, and every entry is filtered
on `!private` a second time. A private repository cannot reach either file — and if
one is ever named in a content file, the sync refuses it:

```
PRIVATE — refusing to cache
```

---

## Styling

One `@theme` block in `src/styles/global.css` defines every colour and font.
Tailwind v4 generates utilities from it — there is no `tailwind.config.js`.

```css
--color-bg:      #0d1117;   /* canvas            */
--color-text:    #c9d1d9;   /* body copy         */
--color-accent:  #00ff9c;   /* SHORT STRINGS ONLY */
```

**The palette rule:** accent green is for prompts, links, focus rings, and single
highlighted words. Paragraphs use `--color-text`. Bright saturated green passes
contrast checks but is genuinely fatiguing to read at length.
([ADR 0006](../decisions/0006-terminal-design-system.md))

---

## Serving: Docker and Nginx

`docker/Dockerfile` has two stages:

1. **Build** — `node:24-alpine`, installs dependencies as a separate cached layer, runs
   `pnpm build`, produces `/app/dist`.
2. **Runtime** — `nginx:1.27-alpine`, copies `dist/` in. Nothing else.

`docker/nginx.conf` handles compression, cache headers, clean URLs, and security
headers. Two details there are easy to get wrong and are commented in place:

- **Hashed assets** under `/_astro/` are cached for a year as `immutable`; HTML is
  `no-cache`. Caching HTML hard would strand visitors on a stale page pointing at
  asset filenames that no longer exist.
- **`add_header` inheritance** — Nginx only inherits headers into a `location` block
  that defines none of its own. Any block setting `Cache-Control` must therefore also
  `include` the security-headers snippet, or those responses silently ship with no
  security headers. This shipped as a real bug once.

---

## Quality tooling

**`pnpm check:links`** requests every `live:` URL and reports what it finds. It
distinguishes *dead* from *unhealthy*:

| Result | Verdict |
|---|---|
| `2xx` / `3xx` | ok — a redirect usually means an auth gate |
| `5xx` | **warn** — the page may still render; reported, does not fail |
| `404` / unreachable | **dead** — fails the run |

The 5xx rule was learned the hard way: a Next.js server error can still stream a
complete page. Treating that as dead would have deleted a working demo link.

**`.claude/`** ships a read-only code-review agent (`agents/code-reviewer.md`) wired
to a Stop hook (`hooks/review-changes.sh`). After each editing session it reviews the
changed files against this project's ADRs and reports findings. It has `Read, Grep,
Glob` only — a reviewer that can edit is a reviewer that can break the build
unattended. ([ADR 0009](../decisions/0009-automated-code-review.md))

---

## Reading order

1. [`decisions/README.md`](../decisions/README.md) — the ADR index
2. [`decisions/0008`](../decisions/0008-data-access-seam.md) — the seam, the
   load-bearing decision
3. [`decisions/0007`](../decisions/0007-phase-boundaries.md) — what each phase owns
4. `src/lib/projects.ts` — the seam itself, ~200 lines
5. `src/content.config.ts` — the schema every content file must satisfy
