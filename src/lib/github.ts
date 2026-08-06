/**
 * GitHub enrichment types and fetching.
 *
 * `fetchRepoStats` is a PURE FUNCTION with no filesystem or CLI coupling,
 * specifically so Phase 2's cron job can import it unchanged and write to the
 * database instead of to JSON. See decisions/0003-committed-github-cache.md.
 *
 * Nothing in `src/` imports this at build time — the site reads the committed
 * cache file instead. Only `scripts/sync-github.ts` (and later, the cron) calls it.
 */

export type RepoStats = {
  repo: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  pushedAt: string;
  archived: boolean;
};

export type GithubCache = {
  /** ISO timestamp of the last successful sync. */
  syncedAt: string;
  /** Keyed by "owner/name". */
  repos: Record<string, RepoStats>;
};

export type FetchResult = {
  stats: RepoStats[];
  failures: { repo: string; reason: string }[];
};

const API = 'https://api.github.com';

/**
 * Fetch stats for the given "owner/name" slugs.
 *
 * Failures are collected rather than thrown: one dead repo must not take down a
 * whole sync. The caller decides whether a partial result is acceptable.
 *
 * @param token Optional PAT. Unauthenticated is 60 req/hr per IP; a token lifts it
 *              to 5000/hr. Only public read access is needed.
 */
export async function fetchRepoStats(
  slugs: string[],
  token?: string,
): Promise<FetchResult> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nischal-portfolio-sync',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const stats: RepoStats[] = [];
  const failures: { repo: string; reason: string }[] = [];

  // Sequential on purpose. A dozen repos is not worth the complexity of a
  // concurrency limiter, and serial requests are gentler on the rate limit.
  for (const slug of slugs) {
    try {
      const res = await fetch(`${API}/repos/${slug}`, { headers });

      if (!res.ok) {
        const remaining = res.headers.get('x-ratelimit-remaining');
        const hint =
          res.status === 403 && remaining === '0'
            ? 'rate limited — set GITHUB_TOKEN'
            : `HTTP ${res.status}`;
        failures.push({ repo: slug, reason: hint });
        continue;
      }

      const d = (await res.json()) as Record<string, any>;

      // ── PRIVATE REPO GUARD — see decisions/0010 ──────────────────────────
      // Unconditional, and deliberately placed before anything is written.
      // A GITHUB_TOKEN with `repo` scope can read private repositories, which
      // for this account means client work. If a private slug ever lands in a
      // content file — by typo, copy-paste, or a repo being flipped private
      // later — this makes it a logged no-op instead of publishing a client's
      // project name and metadata to a public site.
      if (d.private) {
        failures.push({ repo: slug, reason: 'PRIVATE — refusing to cache' });
        continue;
      }

      stats.push({
        repo: slug,
        stars: d.stargazers_count ?? 0,
        forks: d.forks_count ?? 0,
        language: d.language ?? null,
        topics: Array.isArray(d.topics) ? d.topics : [],
        homepage: d.homepage || null,
        pushedAt: d.pushed_at ?? new Date().toISOString(),
        archived: Boolean(d.archived),
      });
    } catch (err) {
      failures.push({
        repo: slug,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { stats, failures };
}

export type RepoIndexEntry = {
  name: string;
  url: string;
  language: string | null;
  year: number;
  fork: boolean;
  archived: boolean;
};

/**
 * Every PUBLIC repository on the account, for the full index appendix.
 *
 * PRIVACY — see decisions/0011. Two independent guarantees that no private repo
 * can reach this list:
 *
 *   1. It uses `/users/{user}/repos`, which returns only public repositories even
 *      when authenticated. The authenticated `/user/repos` endpoint — which DOES
 *      include private repos — is deliberately not used here.
 *   2. Every entry is filtered on `!r.private` regardless.
 *
 * A token is optional and only raises the rate limit.
 */
export async function fetchAllPublicRepos(
  user: string,
  token?: string,
): Promise<RepoIndexEntry[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nischal-portfolio-sync',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const out: RepoIndexEntry[] = [];

  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `${API}/users/${user}/repos?per_page=100&page=${page}&sort=pushed`,
      { headers },
    );
    if (!res.ok) throw new Error(`GitHub returned HTTP ${res.status}`);

    const batch = (await res.json()) as Record<string, any>[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const r of batch) {
      if (r.private) continue; // guarantee #2
      out.push({
        name: r.name,
        url: r.html_url,
        language: r.language ?? null,
        year: Number(String(r.pushed_at ?? '').slice(0, 4)) || 0,
        fork: Boolean(r.fork),
        archived: Boolean(r.archived),
      });
    }
    if (batch.length < 100) break;
  }

  return out.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
}

/** Shape a FetchResult into the on-disk cache format. */
export function toCache(stats: RepoStats[]): GithubCache {
  const repos: Record<string, RepoStats> = {};
  for (const s of stats) repos[s.repo] = s;
  return { syncedAt: new Date().toISOString(), repos };
}
