import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Curated project entries. See decisions/0002-curated-project-manifest.md for why
 * these are hand-written files rather than a GitHub API listing.
 *
 * `summary` is deliberately required and hand-written: 114 of the 146 repos on the
 * account have a null description, so there is nothing to fall back on.
 *
 * Note: `z` is imported from `astro:content`, not the standalone `zod` package —
 * Astro bundles its own zod and mixing instances causes silent validation drift.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),

    /** "owner/name". Optional — a project may have no public repo. */
    repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/).optional(),

    /** Extra repos shown as secondary links (e.g. a split frontend/backend pair). */
    extraRepos: z
      .array(z.object({ label: z.string(), repo: z.string() }))
      .default([]),

    /** One or two sentences, in your own words. Shown on cards and in meta tags. */
    summary: z.string().min(20).max(280),

    stack: z.array(z.string()).min(1),
    live: z.string().url().optional(),

    /**
     * How much surface the project gets — see decisions/0010 and 0011.
     *   featured → card on the homepage + a full case-study page
     *   client   → its own section; live link only, source NEVER shown
     *   archive  → a single row in the index, linking straight out
     * Archive is the default so a new entry can never accidentally claim a
     * case-study page it has no body for.
     */
    tier: z.enum(['featured', 'client', 'archive']).default('archive'),

    /** Kept for backwards compatibility with `tier`; drives homepage picks. */
    featured: z.boolean().default(false),
    /** Lower sorts first within the featured/non-featured groups. */
    order: z.number().int().default(999),

    /** Optional label shown on an archive row, e.g. "previous portfolio". */
    note: z.string().max(40).optional(),

    year: z.number().int().min(2015).max(2100),
    status: z.enum(['live', 'wip', 'archived']).default('live'),

    /** Path under /public, e.g. "/covers/ink-sprout.png". */
    cover: z.string().optional(),
    /** Short bullets rendered on the detail page header. */
    highlights: z.array(z.string()).default([]),

    draft: z.boolean().default(false),
  })
    /**
     * STRUCTURAL GUARANTEE — see decisions/0011.
     *
     * A `client` entry must carry no repository reference at all. Rendering
     * logic already omits the source link, but rendering is a convention someone
     * can refactor away by accident; this fails the BUILD instead.
     *
     * Client work is under confidentiality. The cost of getting this wrong is
     * publishing a client's private repo URL, so it is enforced where it cannot
     * be forgotten rather than trusted to a component template.
     */
    .superRefine((data, ctx) => {
      if (data.tier !== 'client') return;

      if (data.repo) {
        ctx.addIssue({
          code: 'custom',
          path: ['repo'],
          message:
            'A `client` project must not declare `repo:` — client source is never linked. ' +
            'Remove the field, or change `tier` if this is not client work. See decisions/0011.',
        });
      }
      if (data.extraRepos.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['extraRepos'],
          message:
            'A `client` project must not declare `extraRepos:` — client source is never linked. ' +
            'See decisions/0011.',
        });
      }
    }),
});

export const collections = { projects };
