# Tasks

Tracker for the portfolio site. Task IDs are stable — never renumber them. When a
task is done, check it and leave it in place so the history stays readable.

**Status key:** `[ ]` todo · `[x]` done · `[~]` in progress · `[!]` blocked

Related: [decisions/](./decisions/) records *why* each choice was made.

---

## Phase 0 — Trackers

| ID | | Task |
|---|---|---|
| P0-01 | [x] | Create `tasks.md` |
| P0-02 | [x] | Create `decisions/` with ADR index |
| P0-03 | [x] | Write ADRs 0001–0008 covering the initial architecture |

---

## Phase 1 — Static site (Docker + Nginx + Ngrok)

### Setup
| ID | | Task |
|---|---|---|
| P1-01 | [x] | `git init` and scaffold Astro (minimal, TypeScript strict) |
| P1-02 | [x] | Add Tailwind v4 via `@tailwindcss/vite`, sitemap, JetBrains Mono, zod |
| P1-03 | [x] | Configure `astro.config.mjs` (`output: 'static'`, `site`, integrations) |
| P1-04 | [x] | `.gitignore` / `.dockerignore` / `.env.example` |

### Content + data
| ID | | Task |
|---|---|---|
| P1-05 | [x] | `src/content.config.ts` — projects collection + zod schema |
| P1-06 | [x] | Seed curated project files (10) with real repo metadata |
| P1-07 | [ ] | **You:** replace placeholder summaries/case studies with your own words |
| P1-08 | [x] | `src/data/profile.ts` — name, bio, socials, skills, CV timeline |
| P1-09 | [ ] | **You:** fill in real bio, location, and CV timeline (placeholders shipped) |
| P1-10 | [x] | `scripts/sync-github.ts` — `fetchRepoStats()` + CLI wrapper |
| P1-11 | [x] | `src/lib/projects.ts` — the single data-access seam |
| P1-12 | [x] | `src/lib/schemas.ts` — contact schema (shared with Phase 2) |

### UI
| ID | | Task |
|---|---|---|
| P1-13 | [x] | Design tokens in `src/styles/global.css` (`@theme`) |
| P1-14 | [x] | `BaseLayout.astro` — head, meta/OG, skip link, header, footer |
| P1-15 | [x] | Terminal components — prompt headings, dividers, project rows, cards |
| P1-16 | [x] | Hero with typing animation + blinking cursor (reduced-motion aware) |
| P1-17 | [x] | `/` home |
| P1-18 | [x] | `/projects` grid with client-side stack filter (capped to tags shared by 2+ projects — all 38 was a wall) |
| P1-19 | [x] | `/projects/[slug]` case study pages |
| P1-20 | [x] | `/about` |
| P1-21 | [x] | `/cv` + downloadable PDF |
| P1-22 | [ ] | **You:** add `public/resume.pdf` (placeholder link until then) |
| P1-23 | [x] | `/404` themed "command not found" |
| P1-24 | [ ] | Add project screenshots to `public/covers/` |

### Infra
| ID | | Task |
|---|---|---|
| P1-25 | [x] | `docker/Dockerfile` — multi-stage node build → nginx runtime |
| P1-26 | [x] | `docker/nginx.conf` — gzip, cache policy, security headers, clean URLs |
| P1-27 | [x] | `/healthz` endpoint + container `HEALTHCHECK` |
| P1-28 | [x] | Commented `/api/` proxy block (Phase 2 seam) |
| P1-29 | [x] | `docker-compose.yml` — `web` + `ngrok` services |
| P1-30 | [x] | `docker-compose.phase2.yml` — `api` + `db` overlay stub |
| P1-31 | [x] | `README.md` — run instructions, ngrok notes, phase map |
| P1-32 | [ ] | **You:** add `NGROK_AUTHTOKEN` to `.env` before first tunnel run |

### Verification
| ID | | Task |
|---|---|---|
| P1-33 | [x] | `pnpm build` clean — 16 pages |
| P1-34 | [x] | Schema rejects bad frontmatter (verified: `summary: too short` → `InvalidContentEntryDataError`, build fails) |
| P1-35 | [x] | Container: 200 / healthz / immutable assets / clean URLs / themed 404 / dotfiles 403 |
| P1-36 | [x] | Ngrok tunnel serves HTML + CSS + project pages over the public URL |
| P1-37 | [ ] | Ngrok URL opened on a real phone off-WiFi (curl-verified only) |
| P1-38 | [x] | No horizontal overflow at 390 / 768 / 1280 (CDP-measured, 0px) |
| P1-39 | [x] | Reduced-motion path renders all content, cursor static |
| P1-40 | [ ] | Lighthouse ≥95 on all four categories — **not yet run** |

Measured so far: 0 KB external JS (Astro inlines it), 8.2 KB gzipped CSS,
4.3 KB gzipped home page, 76.5 MB image.

### Tooling
| ID | | Task |
|---|---|---|
| P1-41 | [x] | Automated code review — `.claude/agents/code-reviewer.md` + Stop hook ([ADR 0009](./decisions/0009-automated-code-review.md)) |
| P1-42 | [ ] | **You:** open `/hooks` once (or restart) so the new hook is picked up |
| P1-43 | [x] | `pnpm check:links` — dead demo-link checker ([ADR 0010](./decisions/0010-project-tiers-and-private-repo-policy.md)) |

### Project showcase — [ADR 0010](./decisions/0010-project-tiers-and-private-repo-policy.md)
| ID | | Task |
|---|---|---|
| P1-44 | [x] | Featured/archive tiers — 25 projects (9 case studies, 16 archive rows) |
| P1-45 | [x] | Private-repo guard in `src/lib/github.ts`, tested against a real private repo |
| P1-46 | [x] | Removed dead `live:` URL from InkSprout; all 16 remaining links verified reachable |
| P1-47 | [ ] | **You:** regenerate `GITHUB_TOKEN` with **no scopes** — current one has `repo` (full read+write on all private repos) and replace it in `.env` |
| P1-48 | [x] | InkSprout demo URL corrected from your Vercel dashboard (`ink-sprout-v2-nischal`) |
| P1-49 | [x] | Corrected URLs for `next-auth`, `loopstudios`; added `ai-chatbot` |
| P1-50 | [x] | Client work template shipped at `_client-work-template.md.example` |

### Client work + full coverage — [ADR 0011](./decisions/0011-client-work-and-full-repo-coverage.md)
| ID | | Task |
|---|---|---|
| P1-51 | [x] | `client` tier — own section, no source link, enforced by a build-failing schema rule |
| P1-52 | [ ] | **You:** make `wellness-nepal` **private on GitHub**. The site link is gone either way, but the repo is still public at `github.com/Nisschhal/wellness-nepal` — only this hides the client's code |
| P1-53 | [x] | 5 client entries: MeroBhumi, MeroBhumi Dashboard, RBS Salon, GenZ Spotless, Wellness Nepal |
| P1-54 | [x] | Auto-generated index of all 146 public repos, collapsed by default |
| P1-55 | [x] | Link checker recalibrated — 5xx warns, only 404/unreachable fail |
| P1-56 | [x] | Real domains wired: `merobhumi.com`, `wnwellnessequipment.com`, `genzspotless.com.au` |
| P1-59 | [x] | Client summaries rewritten from the live sites — the earlier ones were inferred from `package.json` and Wellness described the wrong product entirely |
| P1-60 | [x] | MeroBhumi Dashboard moved out of the client section to the archive (merobhumi.com covers landing + dashboard) |
| P1-61 | [ ] | **You:** swap RBS to its real domain at launch and flip `status: wip` → `live` |
| P1-57 | [ ] | **You:** InkSprout returns 500 with `noindex` — worth fixing so the demo is healthy and indexable |
| P1-58 | [ ] | **You (optional):** write case-study bodies for the 4 client entries; a page appears automatically once a body exists |

---

## Phase 2 — Backend + database

Not started. Seams are already in place — see
[0007-phase-boundaries.md](./decisions/0007-phase-boundaries.md).

| ID | | Task |
|---|---|---|
| P2-01 | [ ] | Add `@astrojs/node`, flip `output` to `'server'` |
| P2-02 | [ ] | Uncomment the `/api/` `proxy_pass` block in `nginx.conf` |
| P2-03 | [ ] | Activate `api` + `db` services from the Phase 2 overlay |
| P2-04 | [ ] | Postgres + Drizzle schema and migrations |
| P2-05 | [ ] | `POST /api/contact` — zod validation, rate limit, persist |
| P2-06 | [ ] | Email notification on new message |
| P2-07 | [ ] | Replace the mailto stub with the real form |
| P2-08 | [ ] | Promote `fetchRepoStats()` to a cron job writing to the DB |
| P2-09 | [ ] | Swap `lib/projects.ts` internals to read from the DB |
| P2-10 | [ ] | Session auth + admin dashboard (projects CRUD, message inbox) |

---

## Phase 3 — Backlog

| ID | | Task |
|---|---|---|
| P3-01 | [ ] | Blog / MDX with tags + RSS |
| P3-02 | [ ] | View counts and analytics |
| P3-03 | [ ] | CI/CD pipeline |
| P3-04 | [ ] | Real domain + TLS, retiring ngrok |
