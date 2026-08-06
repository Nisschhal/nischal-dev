/**
 * Site-wide personal data.
 *
 * ⚠️  Fields marked TODO are PLACEHOLDERS — they were not invented from your repos
 *     and need your real details before this goes public. Tracked as P1-09 in
 *     tasks.md. Everything else is derived from verifiable sources (your GitHub
 *     account, your repo list).
 */

export const profile = {
  // ── Verified ──────────────────────────────────────────────────────────────
  name: 'Nischal Puri',
  handle: 'Nisschhal',
  email: 'nischalpuri.dev@gmail.com',

  // ── TODO: replace ─────────────────────────────────────────────────────────
  /** Shown under the hero. Aim for one line. */
  title: 'Full-stack developer',
  /** TODO: your city/country, or delete the field and it disappears from the UI. */
  location: 'Nepal',
  /** TODO: 2–4 sentences in your own voice. This is the single highest-value
   *  piece of copy on the site — it's the first thing a recruiter reads. */
  bio: [
    'I build full-stack web applications, mostly with TypeScript, Next.js, and Postgres.',
    'Recent work has centred on e-commerce platforms and AI-assisted product features — streaming chat interfaces, LLM-backed search, and the unglamorous plumbing that makes them reliable.',
    'TODO: replace this paragraph with what you actually want to be hired to do.',
  ],
  /** Short line used in <meta description> and OG tags. */
  tagline: 'Full-stack developer building web applications with TypeScript, Next.js, and Postgres.',

  /** TODO: set to false to hide the "available for work" badge. */
  availableForWork: true,

  socials: [
    { label: 'GitHub', url: 'https://github.com/Nisschhal', handle: '@Nisschhal' },
    // TODO: add your real LinkedIn URL, or remove this entry.
    { label: 'LinkedIn', url: 'https://linkedin.com/in/', handle: 'TODO' },
    { label: 'Email', url: 'mailto:nischalpuri.dev@gmail.com', handle: 'nischalpuri.dev@gmail.com' },
  ],

  /** Grouped skills. Derived from dependencies actually present in your repos —
   *  prune anything you'd rather not be asked about in an interview. */
  skills: [
    {
      group: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML', 'CSS'],
    },
    {
      group: 'Frontend',
      items: ['React 19', 'Next.js', 'Astro', 'Tailwind CSS', 'shadcn/ui', 'Radix UI', 'GSAP', 'Framer Motion'],
    },
    {
      group: 'Backend',
      items: ['Node.js', 'Express', 'Hono', 'REST', 'Socket.IO', 'Redux Toolkit'],
    },
    {
      group: 'Data',
      items: ['PostgreSQL', 'Drizzle ORM', 'Prisma', 'Neon', 'MongoDB', 'Sanity CMS'],
    },
    {
      group: 'AI',
      items: ['Vercel AI SDK', 'LangChain', 'LangGraph', 'OpenAI', 'Google Gemini', 'Groq'],
    },
    {
      group: 'Tooling',
      items: ['Docker', 'Nginx', 'Git', 'Vite', 'pnpm', 'Vercel', 'Stripe', 'Clerk'],
    },
  ],

  /**
   * CV timeline. TODO: this is scaffolding — replace every entry with your real
   * history. Dates use "YYYY-MM" or "present".
   */
  experience: [
    {
      role: 'TODO: Your role',
      org: 'TODO: Company',
      from: '2024-01',
      to: 'present',
      location: 'TODO',
      points: [
        'TODO: what you shipped, and the outcome it produced.',
        'TODO: lead with impact, not a tech list — the stack is already in the skills section.',
      ],
    },
    {
      role: 'TODO: Earlier role',
      org: 'TODO: Company',
      from: '2023-01',
      to: '2023-12',
      location: 'TODO',
      points: ['TODO'],
    },
  ],

  education: [
    {
      qualification: 'TODO: Degree',
      org: 'TODO: Institution',
      from: '2019',
      to: '2023',
      points: [],
    },
  ],

  /** Served from /public. Until you add the file, the CV page shows a disabled
   *  button instead of a broken download link. See P1-22. */
  resumePath: '/resume.pdf',
  resumeAvailable: false,
} as const;

export type Profile = typeof profile;
