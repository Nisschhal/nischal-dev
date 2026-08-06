// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The public origin. Ngrok URLs change on every restart on the free tier, so this
// is env-driven rather than hardcoded — set PUBLIC_SITE_URL when you have a stable
// domain. Only affects sitemap/canonical/OG absolute URLs.
const site = process.env.PUBLIC_SITE_URL ?? 'https://nischal.dev';

export default defineConfig({
  site,

  // PHASE 2 SEAM (see decisions/0007-phase-boundaries.md):
  //   import node from '@astrojs/node';
  //   output: 'server',
  //   adapter: node({ mode: 'standalone' }),
  // Nothing else in the codebase needs to change — data access is isolated behind
  // src/lib/projects.ts (decisions/0008-data-access-seam.md).
  output: 'static',

  trailingSlash: 'ignore',
  build: { format: 'directory' },

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
