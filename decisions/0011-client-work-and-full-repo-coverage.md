# 0011 — Client work, full repo coverage, and what "dead link" means

**Status:** Accepted · 2026-08-06
**Amends:** [0010](./0010-project-tiers-and-private-repo-policy.md) — the link-checker
status rule is replaced by the table below.

## Context

The demo URLs on this site came from GitHub's `homepage` field. Comparing them against
the actual Vercel dashboard showed that field is largely stale: most working
deployments live at different subdomains, and six substantial projects were missing
entirely because their repositories are private.

Three things had to be settled.

**Client work needed a home.** Six private repos are commissioned work. It is the
strongest material on the site — paid, shipped, real users — and it cannot show source.

**"Every repository covered" conflicted with curation** ([0002](./0002-curated-project-manifest.md)).
146 repos, most of them experiments, but nothing should look hidden.

**The link checker was wrong.** Its rule — any status ≥ 400 is dead — flagged
`ink-sprout-v2` as a broken link. A real headless browser proved otherwise: the page
returns HTTP 500 *and renders the complete store*, header, filters, products, prices.
Acting on that report would have deleted a demo link to a working site.

## Decision

### A `client` tier with a structural guarantee

`tier: 'featured' | 'client' | 'archive'`. Client work gets its **own section**, not a
row in the archive, with a header stating plainly that source is not published.

The invariant — a client entry carries no repository reference — is enforced by a
`superRefine` in `src/content.config.ts` that **fails the build**, not by rendering
logic. Rendering is a convention someone can refactor away by accident. Two further
belts: `getClientProjects` and `getCaseStudyProjects` both strip `repoUrl` and
`extraRepos` on the way out.

> **A public repo is not private code.** `wellness-nepal` is client work whose repo is
> public on GitHub. Removing the link here hides it from this site and nowhere else.
> Only changing the repo's visibility protects the client. The site cannot do that, so
> it is a tracked human action (P1-52), not something the code can claim to solve.

### Case-study pages require a body

`getCaseStudyProjects` filters on `hasCaseStudy`, computed from the Markdown body.
Four client entries have no body — there is no honest way to write one without inside
knowledge of that engagement — so they render as rows and link straight to the live
site. Adding a body to the file makes the page appear automatically.

### Full repo coverage, generated

`fetchAllPublicRepos` writes `src/data/all-repos.json` during `pnpm sync`. Rendered as
a `<details>` element **collapsed by default** at the foot of `/projects`.

Two independent privacy guarantees, matching the existing
[0010](./0010-project-tiers-and-private-repo-policy.md) guard:

1. It calls `/users/{user}/repos`, which returns public repositories only, even with a
   token. The authenticated `/user/repos` endpoint — which *does* include private
   repos — is deliberately never used.
2. Every entry is filtered on `!private` regardless, in both the fetch and the seam.

Collapsed-by-default is the whole point: complete transparency without `ts-practice`
carrying the same visual weight as client work.

This also answers the standing question of hand-written vs dynamic. **Both.** Curated
entries stay hand-written `.md` files — that is what allows a project to declare no
repo at all, which is the client mechanism. The appendix is generated, so coverage
costs nothing. Neither fetches at runtime; the build stays hermetic
([0003](./0003-committed-github-cache.md)).

### What counts as a dead link

| result | verdict | why |
|---|---|---|
| 2xx | ok | serving |
| 3xx | ok | alive, redirecting — usually an auth gate |
| **5xx** | **warn** | server error, but the page may still render. Reported, does not fail |
| 404 / 410 | dead | the deployment is gone |
| timeout / unreachable | dead | nothing is answering |

Only hard-dead links exit non-zero.

**A checker that flags working links is worse than no checker, because someone acts on
it.** This principle bit twice here — first with `redirect: 'follow'` reporting three
live Clerk-protected sites as dead (their sign-in chain exceeds Node's 20-redirect cap
while `curl -L` at 50 hops reaches 200), then with 5xx-means-dead. Both were caught
only by checking against a real browser rather than trusting the status code.

### Never guess a demo URL

Restated from [0010](./0010-project-tiers-and-private-repo-policy.md) because this
round proved it. Probing for a replacement InkSprout URL found `inksprout.vercel.app`
live — serving an entirely different product. Vercel subdomains are global and
first-come. A wrong guess links a portfolio to a stranger's site, which looks
deliberate and is worse than a missing link.

## Consequences

- 30 projects: 9 case studies, 5 client entries, 16 archive rows, plus an index of all
  146 public repos. 24 demo links, all verified.
- 14 pages built. Bodyless entries never generate a route.
- InkSprout is linked despite its 500, and the checker warns about it every run until
  the server error is fixed — the 500 also carries `noindex`, so search engines skip it.
- Client entries are cheap to add: copy the template, fill four fields, no `repo:`.

## Revisit if

A client asks not to be named at all. Drop the entry — there is no partial-disclosure
mode worth engineering, and an unnamed "confidential client" row persuades nobody.
