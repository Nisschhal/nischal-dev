/**
 * Verify every `live:` URL in the content files still resolves.
 *
 *   pnpm check:links
 *
 * WHY THIS EXISTS: GitHub's `homepage` field is not maintained — several demo
 * URLs seeded from it were already 404 when this site was built, including the
 * one on the top featured project. A portfolio linking to dead demos is worse
 * than one that links to none, and nothing else in the pipeline would catch it.
 *
 * Deliberately NOT part of `astro build` — builds stay hermetic and offline-safe
 * (decisions/0003-committed-github-cache.md). Run it before you publish.
 *
 * Exit 0 = all reachable. Exit 1 = at least one is dead.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_DIR = 'src/content/projects';

// Some hosts return 403 to non-browser agents; a bare fetch would report false
// deaths. Present as a normal browser.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

type Entry = { file: string; url: string };

async function collectUrls(): Promise<Entry[]> {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
  const out: Entry[] = [];

  for (const file of files) {
    const raw = await readFile(join(CONTENT_DIR, file), 'utf8');
    const frontmatter = raw.split(/^---$/m)[1] ?? '';
    const m = frontmatter.match(/^\s*live:\s*["']?(\S+?)["']?\s*$/m);
    if (m) out.push({ file, url: m[1] });
  }
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

/**
 * We are answering "would a visitor see the project?", NOT "is the HTTP status
 * clean". Those differ, and the difference has bitten twice on this repo:
 *
 *   2xx      serving
 *   3xx      alive, redirecting — typically an auth gate (Clerk, etc.)
 *   5xx      WARN, not dead. A Next.js server error still streams the rendered
 *            page: ink-sprout-v2 returns 500 while displaying the full store,
 *            products and prices included. Calling that dead would have had a
 *            working demo link deleted.
 *   404/410  DEAD — the deployment is gone. This is what's worth failing on.
 *   timeout  DEAD — nothing is answering.
 *
 * `redirect: 'manual'` is deliberate. Following redirects made three live,
 * Clerk-protected sites report as dead: their sign-in chain exceeds Node's
 * 20-redirect cap and fetch throws, while `curl -L` (50 hops) reaches 200.
 *
 * A checker that flags working links gets ignored, or worse, gets acted on.
 * Only hard-dead links fail the run. See decisions/0011.
 */
type Verdict = 'ok' | 'warn' | 'dead';

async function check(url: string): Promise<{ verdict: Verdict; detail: string }> {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(20_000),
    });
    const s = res.status;
    if (s >= 500) return { verdict: 'warn', detail: `${s} server error` };
    if (s >= 400) return { verdict: 'dead', detail: String(s) };
    return { verdict: 'ok', detail: s >= 300 ? `${s}→` : String(s) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause = (err as { cause?: { code?: string } })?.cause?.code ?? '';
    if (msg.includes('timeout') || cause === 'UND_ERR_CONNECT_TIMEOUT') {
      return { verdict: 'dead', detail: 'timeout' };
    }
    return { verdict: 'dead', detail: 'unreachable' };
  }
}

async function main() {
  const entries = await collectUrls();
  if (entries.length === 0) {
    console.log('No `live:` URLs found — nothing to check.');
    return;
  }

  console.log(`Checking ${entries.length} demo URLs…\n`);
  const dead: (Entry & { detail: string })[] = [];
  const warn: (Entry & { detail: string })[] = [];

  // Sequential: two dozen URLs is not worth a concurrency limiter, and serial
  // requests are politer to the hosts.
  for (const e of entries) {
    const { verdict, detail } = await check(e.url);
    const mark =
      verdict === 'ok' ? '  ok  ' : verdict === 'warn' ? ' WARN ' : ' DEAD ';
    const suffix = verdict === 'ok' ? '' : `  (${detail})`;
    console.log(
      `  ${mark} ${e.file.replace('.md', '').padEnd(26)} ${e.url}${suffix}`,
    );
    if (verdict === 'dead') dead.push({ ...e, detail });
    if (verdict === 'warn') warn.push({ ...e, detail });
  }

  if (warn.length > 0) {
    console.log(`\n  ⚠ ${warn.length} link(s) returning a server error:\n`);
    for (const w of warn) console.log(`    ${w.file}  →  ${w.url}  (${w.detail})`);
    console.log(
      '\n  These are NOT treated as dead — a Next.js 500 still renders the page,\n' +
        '  so visitors may see a working site. Worth fixing though: a 5xx response\n' +
        '  usually carries `noindex`, so search engines skip the page.\n',
    );
  }

  if (dead.length === 0) {
    console.log(
      `  ✓ ${entries.length - warn.length}/${entries.length} reachable` +
        (warn.length ? `, ${warn.length} with warnings` : '') +
        ', 0 dead',
    );
    return;
  }

  console.error(`\n  ✗ ${dead.length} dead link(s):\n`);
  for (const d of dead) {
    console.error(`    ${d.file}  →  ${d.url}  (${d.detail})`);
  }
  console.error(
    '\n  Fix by supplying the correct URL, or remove the `live:` field so the\n' +
      '  project renders without a demo button. Do NOT guess a replacement —\n' +
      '  Vercel subdomains are global and first-come, so a wrong guess links to\n' +
      "  someone else's site (decisions/0010).\n",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
