/**
 * Refresh src/data/github-cache.json from the GitHub API.
 *
 *   pnpm sync                 # unauthenticated, 60 req/hr
 *   GITHUB_TOKEN=ghp_… pnpm sync
 *
 * This is a THIN CLI WRAPPER. All the real work is `fetchRepoStats` in
 * src/lib/github.ts, kept pure so Phase 2's cron job reuses it as-is.
 *
 * Deliberately NOT part of `astro build` — see
 * decisions/0003-committed-github-cache.md. Builds must not depend on the network.
 * The output is committed; refreshing it is an explicit, reviewable act.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchAllPublicRepos, fetchRepoStats, toCache } from '../src/lib/github.ts';

const CONTENT_DIR = 'src/content/projects';
const CACHE_FILE = 'src/data/github-cache.json';
const INDEX_FILE = 'src/data/all-repos.json';
const GITHUB_USER = 'Nisschhal';

/** Pull every `repo:` and `extraRepos:` slug out of the content frontmatter.
 *  Intentionally a light regex scan rather than a YAML parse — this runs outside
 *  the Astro pipeline and shouldn't need the content layer booted just to read
 *  a handful of strings. */
async function collectSlugs(): Promise<string[]> {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
  const slugs = new Set<string>();

  for (const file of files) {
    const raw = await readFile(join(CONTENT_DIR, file), 'utf8');
    const frontmatter = raw.split(/^---$/m)[1] ?? '';
    for (const m of frontmatter.matchAll(/^\s*(?:-\s*)?repo:\s*["']?([\w.-]+\/[\w.-]+)["']?\s*$/gm)) {
      slugs.add(m[1]);
    }
  }
  return [...slugs].sort();
}

async function main() {
  const slugs = await collectSlugs();
  if (slugs.length === 0) {
    console.error(`No repo: entries found in ${CONTENT_DIR}. Nothing to sync.`);
    process.exit(1);
  }

  console.log(`Syncing ${slugs.length} repos…`);
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.log('  (no GITHUB_TOKEN — using the 60 req/hr anonymous limit)');

  const { stats, failures } = await fetchRepoStats(slugs, token);

  for (const f of failures) console.warn(`  ! ${f.repo}: ${f.reason}`);

  // A total failure usually means rate limiting or no network. Leave the existing
  // cache untouched rather than clobbering good data with an empty file.
  if (stats.length === 0) {
    console.error('\nEvery request failed — leaving the existing cache in place.');
    process.exit(1);
  }

  await writeFile(CACHE_FILE, JSON.stringify(toCache(stats), null, 2) + '\n', 'utf8');

  console.log(`\n  ✓ ${stats.length}/${slugs.length} repos → ${CACHE_FILE}`);
  for (const s of stats.sort((a, b) => b.stars - a.stars)) {
    console.log(
      `    ${s.repo.padEnd(38)} ★ ${String(s.stars).padStart(3)}  ${s.language ?? '—'}`,
    );
  }
  if (failures.length) {
    console.log(`\n  ${failures.length} failed — cache keeps their previous values.`);
  }

  // ── Full public-repo index (decisions/0011) ────────────────────────────────
  // Public endpoint only, plus an explicit private filter. A failure here must
  // not discard the stats cache written above, so it is caught separately.
  try {
    console.log('\nBuilding full public-repo index…');
    const all = await fetchAllPublicRepos(GITHUB_USER, token);

    const leaked = all.filter((r) => (r as { private?: boolean }).private);
    if (leaked.length > 0) {
      throw new Error(`refusing to write: ${leaked.length} non-public entr(ies) present`);
    }

    await writeFile(INDEX_FILE, JSON.stringify(all, null, 2) + '\n', 'utf8');
    console.log(`  ✓ ${all.length} public repos → ${INDEX_FILE}`);
  } catch (err) {
    console.warn(
      `  ! index not refreshed (${err instanceof Error ? err.message : err}) — ` +
        'previous file kept.',
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
