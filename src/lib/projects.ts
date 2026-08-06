import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import cache from '../data/github-cache.json';
import allRepos from '../data/all-repos.json';
import type { GithubCache, RepoIndexEntry } from './github.ts';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE DATA SEAM — decisions/0008-data-access-seam.md
 *
 *  This is the ONLY module that knows where project data comes from.
 *  Pages and components must not import `astro:content` or read the cache
 *  directly for project data.
 *
 *  Phase 1: content collections + committed GitHub cache.
 *  Phase 2: swap these four function bodies to query Postgres. Every caller
 *           keeps working, because they only ever see the `Project` type below.
 *
 *  All functions are async even though Phase 1 could answer synchronously — a
 *  database call can't, and sync→async later is a breaking change everywhere.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const gh = cache as GithubCache;

/** Storage-agnostic shape. Defined by what the UI needs, NOT by the content
 *  schema or a future DB table — both map onto this. */
export type Project = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  year: number;
  status: 'live' | 'wip' | 'archived';
  tier: 'featured' | 'client' | 'archive';
  featured: boolean;
  order: number;
  cover?: string;
  highlights: string[];
  note?: string;
  /** True when the Markdown body has content worth a dedicated page. */
  hasCaseStudy: boolean;

  repoUrl?: string;
  extraRepos: { label: string; url: string }[];
  liveUrl?: string;

  /** From the GitHub cache; undefined when the repo isn't in it. Never throws —
   *  a missing entry degrades to "no stats shown". */
  stats?: {
    stars: number;
    forks: number;
    language: string | null;
    pushedAt: string;
    archived: boolean;
  };
};

type Entry = CollectionEntry<'projects'>;

function mapEntry(entry: Entry): Project {
  const d = entry.data;
  const stats = d.repo ? gh.repos[d.repo] : undefined;

  return {
    slug: entry.id,
    title: d.title,
    summary: d.summary,
    stack: d.stack,
    year: d.year,
    status: d.status,
    tier: d.tier,
    featured: d.featured,
    order: d.order,
    cover: d.cover,
    highlights: d.highlights,
    note: d.note,
    hasCaseStudy: (entry.body ?? '').trim().length > 0,
    repoUrl: d.repo ? `https://github.com/${d.repo}` : undefined,
    extraRepos: d.extraRepos.map((r) => ({
      label: r.label,
      url: `https://github.com/${r.repo}`,
    })),
    liveUrl: d.live,
    stats: stats
      ? {
          stars: stats.stars,
          forks: stats.forks,
          language: stats.language,
          pushedAt: stats.pushedAt,
          archived: stats.archived,
        }
      : undefined,
  };
}

/** Featured first, then by `order`, then newest year, then title. Sorting lives
 *  here so no page reimplements it. */
function sortProjects(a: Project, b: Project): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.order !== b.order) return a.order - b.order;
  if (a.year !== b.year) return b.year - a.year;
  return a.title.localeCompare(b.title);
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });
  return entries.map(mapEntry).sort(sortProjects);
}

/** Everything with a full case-study page. Powers the /projects top section. */
export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.tier === 'featured');
}

/**
 * Client work — its own section, live link only.
 *
 * Belt and braces: the content schema already fails the build if a client entry
 * declares `repo:` (decisions/0011), and this strips any repo URL that somehow
 * reached the mapped object. Two independent controls, because the failure mode
 * is publishing a client's private repository.
 */
export async function getClientProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all
    .filter((p) => p.tier === 'client')
    .map((p) => ({ ...p, repoUrl: undefined, extraRepos: [] }))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

/**
 * Compact index entries — one row each, no detail page.
 * Ordered live-demo-first, then newest, so the clickable ones sit at the top.
 */
export async function getArchiveProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all
    .filter((p) => p.tier === 'archive')
    .sort((a, b) => {
      const aLive = a.liveUrl ? 0 : 1;
      const bLive = b.liveUrl ? 0 : 1;
      if (aLive !== bLive) return aLive - bLive;
      if (a.year !== b.year) return b.year - a.year;
      return a.title.localeCompare(b.title);
    });
}

/**
 * Everything that earns a case-study page: featured work plus client work.
 *
 * Client work is often the strongest material on a portfolio, so it gets the same
 * depth as featured — it just never shows source. Repo fields are stripped here as
 * well as in `getClientProjects`, because this is the other path that feeds a page.
 * See decisions/0011.
 */
export async function getCaseStudyProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all
    .filter((p) => p.tier === 'featured' || p.tier === 'client')
    // A page needs something to say. Four client entries have no body — I have no
    // inside knowledge of that work to write one honestly, and shipping four
    // pages with an empty article is worse than linking straight to the live
    // site. Add a body to the .md file and the page appears automatically.
    .filter((p) => p.hasCaseStudy)
    .map((p) =>
      p.tier === 'client' ? { ...p, repoUrl: undefined, extraRepos: [] } : p,
    );
}

/**
 * Homepage subset — the strongest few. Drawn from featured AND client tiers, so
 * client work can lead the homepage; it is usually the most persuasive thing there.
 */
export async function getHomepageProjects(limit = 4): Promise<Project[]> {
  const candidates = await getCaseStudyProjects();
  const flagged = candidates.filter((p) => p.featured);
  // Fall back to all case studies if no homepage flag is set, so the homepage is
  // never empty just because a flag was forgotten.
  return (flagged.length ? flagged : candidates).slice(0, limit);
}

export async function getProject(slug: string): Promise<Project | null> {
  const entry = await getEntry('projects', slug);
  return entry ? mapEntry(entry) : null;
}

/**
 * The Markdown body is the one deliberate leak of the storage layer: `render()`
 * is bound to the content entry, so the detail page needs the entry itself.
 * Phase 2 replaces this with server-rendered HTML from the DB, touching only
 * `src/pages/projects/[slug].astro`.
 */
export async function getProjectEntry(slug: string): Promise<Entry | undefined> {
  return getEntry('projects', slug);
}

/**
 * Stack tags for the /projects filter, ordered by frequency then alphabetically.
 *
 * Tags used by a single project are excluded by default: filtering to a tag that
 * matches one card isn't a filter, it's a link, and including them all produced a
 * 38-tag wall that dominated the page above the fold. `limit` caps the rest.
 */
export async function getAllStacks(minCount = 2, limit = 12): Promise<string[]> {
  const projects = await getProjects();
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const tag of p.stack) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

/** ISO timestamp of the last `pnpm sync`, for the footer. */
export function getSyncedAt(): string | null {
  return gh.syncedAt ?? null;
}

/**
 * Every public repository, for the full index appendix (decisions/0011).
 *
 * Generated by `pnpm sync` from GitHub's public-only endpoint. Private repos
 * cannot appear — but this filters again anyway, because the cost of being wrong
 * is publishing a client's repository name.
 */
export async function getAllRepos(): Promise<RepoIndexEntry[]> {
  return (allRepos as RepoIndexEntry[]).filter(
    (r) => !(r as { private?: boolean }).private,
  );
}
