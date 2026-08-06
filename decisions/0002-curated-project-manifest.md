# 0002 — Curated project manifest, not an API listing

**Status:** Accepted · 2026-08-06 —
**amended in part by [0010](./0010-project-tiers-and-private-repo-policy.md)**

> The core decision below still holds: curated content files are the source of truth
> and the GitHub API only enriches them. What 0010 changes is *scope*. This ADR's
> implied "~10 projects" was too narrow and dropped work with verified live demos;
> the manifest now carries 25 entries across a featured/archive split. The exclusion
> list below is unchanged and still binding.

## Context

The obvious design for a developer portfolio is to call the GitHub API and render
whatever comes back. Measuring the actual account first
(`api.github.com/users/Nisschhal`) showed why that fails here:

| Metric | Value |
|---|---|
| Public repos | 146 |
| With a description | 32 (22%) |
| With topics | **0** |
| With a live demo URL | 25 |
| Stars | ~0 across the board |

The repo list is also dominated by learning exercises — `ts-practice`,
`next-form`, `learning-testing`, `drag-n-drop-ts`, `reusable` — and contains a few
upstream projects cloned and pushed under the account (`zustand`, `docs`
→ LangChain, `devops-directive-github-actions`).

An API-driven grid would therefore render ~110 untitled practice repos with no
descriptions, ranked by nothing, alongside three cloned libraries the author didn't
write. That is actively worse than no projects section.

## Decision

**Curated content files are the source of truth.** One Markdown file per showcased
project in `src/content/projects/`, hand-picked, with a hand-written `summary` and a
case-study body.

The GitHub API is demoted to an *enrichment* source: it supplies only live stats
(stars, primary language, last push) merged onto entries that already exist. It can
never add or remove a project.

Excluded by policy, recorded here so the question isn't reopened:
- Upstream clones: `zustand`, `docs`, `devops-directive-*`
- Practice/learning repos: `*-practice`, `learning-*`, `ts-practice`, `next-form`,
  `drag-n-drop-ts`, `reusable`, `dataStructure`
- Superseded versions where a v2 exists (`ink-sprout` → `ink-sprout-v2`)

## Consequences

- Adding a project is a deliberate act: write a file. This is the correct amount of
  friction for a portfolio.
- Descriptions are written for a reader, not scraped from an empty API field.
- Split repos (`class-scheduler-front` + `class-scheduler-back`,
  `ai-chat-app-frontent` + `ai-chat-app-backend`) can be presented as one
  full-stack project, which the API structurally cannot do.
- The schema carries `repo` as **optional**, so a project with no public repo — or
  client work — can still be showcased.
- Ongoing cost: stats go stale unless `pnpm sync` is run. Accepted, and automated in
  Phase 2 ([0003](./0003-committed-github-cache.md)).

## Revisit if

The account is cleaned up such that descriptions and topics are reliably populated
and practice repos are archived. Even then, curation is likely still better — the
enrichment seam means only `lib/projects.ts` would change.
