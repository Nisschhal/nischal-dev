/**
 * Assert that no client project links to source anywhere in the built site.
 *
 *   pnpm build && pnpm check:client-privacy
 *
 * WHY THIS EXISTS: `src/content.config.ts` already fails the build if a
 * `tier: client` entry declares `repo:` or `extraRepos:`, and the seam strips
 * both on the way out (decisions/0011). That covers the data. This covers the
 * other half — the rendering — by reading the HTML that actually ships.
 *
 * The two guards fail differently, which is the point of having both:
 *   schema   → someone adds `repo:` to a client .md file
 *   this     → someone changes a template or a seam function so a repo link
 *              renders for a client entry even though the data forbade it
 *
 * Reads `dist/` only; it makes no network calls and needs no credentials.
 *
 * Exit 0 = no client source link renders. Exit 1 = at least one does.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const CONTENT_DIR = 'src/content/projects';
const DIST_DIR = 'dist';

/**
 * A repo link is `github.com/<owner>/<name>`. The single-segment profile link
 * (`github.com/Nisschhal`) is site chrome — it is in the header and footer of
 * every page, including client pages, and is not a disclosure.
 */
const REPO_LINK = /https?:\/\/(?:www\.)?github\.com\/[^\/"'\s]+\/[^"'\s<>]+/g;

/** Any github.com reference at all — used where even the profile link has no business being. */
const ANY_GITHUB = /https?:\/\/(?:www\.)?github\.com\/[^"'\s<>]*/g;

type Violation = { file: string; where: string; links: string[] };

/** Slugs of every `tier: client` entry. The filename is the slug (glob loader). */
async function clientSlugs(): Promise<string[]> {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
  const slugs: string[] = [];

  for (const file of files) {
    const raw = await readFile(join(CONTENT_DIR, file), 'utf8');
    const frontmatter = raw.split(/^---$/m)[1] ?? '';
    if (/^\s*tier:\s*["']?client["']?\s*$/m.test(frontmatter)) {
      slugs.push(file.replace(/\.md$/, ''));
    }
  }
  return slugs.sort();
}

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out.sort();
}

/**
 * Extract every `<tag …>…</tag>` block whose contents match `needle`.
 *
 * Deliberately naive: these are flat, generated fragments (a `<ul>` of rows, an
 * `<article>` card) with no nesting of the same tag inside them, so a plain
 * scan is enough and a parser dependency is not worth carrying.
 */
function blocksContaining(html: string, tag: string, needle: string): string[] {
  const open = new RegExp(`<${tag}[\\s>]`, 'g');
  const close = `</${tag}>`;
  const out: string[] = [];

  for (const m of html.matchAll(open)) {
    const end = html.indexOf(close, m.index);
    if (end === -1) continue;
    const block = html.slice(m.index, end + close.length);
    if (block.includes(needle)) out.push(block);
  }
  return out;
}

function found(html: string, re: RegExp): string[] {
  return [...new Set(html.match(re) ?? [])];
}

async function main() {
  const slugs = await clientSlugs();
  if (slugs.length === 0) {
    console.log('No `tier: client` entries — nothing to assert.');
    return;
  }

  const pages = await htmlFiles(DIST_DIR);
  if (pages.length === 0) {
    console.error(`No HTML found in ${DIST_DIR}/ — run \`pnpm build\` first.`);
    process.exit(1);
  }

  const violations: Violation[] = [];
  let checks = 0;

  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    const rel = relative(DIST_DIR, page);

    // 1. The client-work section on /projects/. Nothing in it should point at
    //    GitHub at all — not even the profile link.
    for (const block of blocksContaining(html, 'ul', 'data-client-list')) {
      checks++;
      const links = found(block, ANY_GITHUB);
      if (links.length) violations.push({ file: rel, where: 'client-work section', links });
    }

    // 2. Cards elsewhere (the homepage picks from client tier too) that link to
    //    a client project's detail page.
    for (const slug of slugs) {
      for (const block of blocksContaining(html, 'article', `/projects/${slug}`)) {
        checks++;
        const links = found(block, ANY_GITHUB);
        if (links.length) violations.push({ file: rel, where: `card for ${slug}`, links });
      }
    }

    // 3. A client case-study page. The chrome's profile link is expected here,
    //    so only repo-shaped links count.
    const slug = rel.replace(/(^|\/)index\.html$/, '').replace(/^projects\//, '');
    if (slugs.includes(slug)) {
      checks++;
      const links = found(html, REPO_LINK);
      if (links.length) violations.push({ file: rel, where: 'case-study page', links });
    }
  }

  if (violations.length === 0) {
    console.log(
      `  ✓ ${checks} client surface(s) checked across ${pages.length} pages, ` +
        `0 source links (${slugs.join(', ')})`,
    );
    return;
  }

  console.error(`\n  ✗ client source link(s) rendered in ${violations.length} place(s):\n`);
  for (const v of violations) {
    console.error(`    ${v.file}  —  ${v.where}`);
    for (const l of v.links) console.error(`      ${l}`);
  }
  console.error(
    '\n  Client source is never linked (decisions/0011). The data layer strips\n' +
      '  `repoUrl` and `extraRepos` for client entries in `getClientProjects` and\n' +
      '  `getCaseStudyProjects` — if a link is rendering, one of those paths was\n' +
      '  bypassed, or a template is reading project data directly.\n',
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
