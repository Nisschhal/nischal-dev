/**
 * Site-wide personal data.
 *
 * This object feeds the hero, the about page, the CV page and every meta tag.
 * Change a string here and it changes everywhere — there is no second copy.
 */

export const profile = {
  name: 'Nischal Puri',
  handle: 'Nisschhal',
  email: 'nischalpuri.dev@gmail.com',

  /** Shown under the hero, as `title · location`. One line. */
  title: 'AI-first full-stack developer, architecture to deploy',
  location: 'Butwal, Nepal',

  /**
   * HERO ONLY. The reader is a hiring manager or client giving the page a few
   * seconds, so this is a hook, not a summary: one concrete claim they can't
   * get from a hundred other portfolios. Keep it to two sentences — the hero
   * has CTAs to reach and every extra line pushes them down the page.
   * The full story is `bio`, on /about.
   */
  hook: "I'm usually the only engineer on the project — the product, the API, the deploys, and whatever breaks at 2am. I've worked that way for clients in Nepal and a startup in the US.",

  /**
   * /about ONLY — `hook` never renders here, so the first line has to stand on
   * its own with no back-reference to it.
   *
   * Six paragraphs. /cv holds the dates and employers, so this is the story
   * between them: nobody to learn from → becoming the teacher → the idea about
   * AI → first team → the fear he outgrew → owning it alone.
   *
   * Each paragraph must hand off to the next. Paragraph two opens "the other
   * side of it" precisely because paragraph one ends on having no one to teach
   * him — that turn is the reason the two sit together.
   *
   * Every struggle beat is his, not invented, and they are what make this a
   * story rather than a résumé — do not smooth them out. The teaching
   * realisation, the first-team experience and the deadline fear all came from
   * him directly. Anything of this kind has to come from him — never write one.
   *
   * A beat only earns its place if it is self-explanatory HERE, and if it
   * follows from the paragraph before. Two earlier drafts failed on this: a 403
   * on a git push (fine in the blog post that builds to it, pure jargon in three
   * sentences) and a paragraph about avoiding Docker (true, but it followed
   * nothing and led nowhere).
   *
   * CHRONOLOGY: AI arrived in his FINAL YEAR of the degree, not before it. It
   * did not cause him to enrol, and the copy must not imply that.
   *
   * `*asterisks*` mark emphasis and render as bold (see about.astro). Keep it to
   * 2–4 short phrases across the whole bio — the bold bits should read as a mini
   * story on their own, and over-marking kills that. Asterisks are the only
   * markup allowed in these strings.
   *
   * ORDER IS LOAD-BEARING: only the first two paragraphs render plain on /about
   * (LEAD_PARAGRAPHS in about.astro). Everything after is ghosted until the
   * reader scrolls, so those first two carry the whole job of earning the
   * scroll. Don't move the Rotaract scene further down.
   */
  bio: [
    'I learned to build software in Butwal, Nepal, with nobody to ask. No senior engineer down the hall, no one further up to escalate to — just documentation, other people’s repositories, and the fact that *nobody else was going to fix it*.',
    'Before any of the job titles, I spent five years with Rotaract and ended up its vice president. The part I remember isn’t the fundraising. It is the first class I ever taught: public school teachers who had never used a computer, and me still a student myself. I expected the room to feel strange. It felt ordinary — they wanted to learn exactly the way I did. That is where I stopped believing in big people and small people. The only difference is *how much you happen to know yet*. It is why I can sit with a client, or someone far more senior than me, and explain a system in plain words instead of hiding behind jargon.',
    'I studied Computing at Softwarica College under Coventry University, and in my final year AI arrived and said the same thing back to me: there is no junior or senior any more. AI can write the code. What is left is knowing how to put a whole system together, and you only learn that by owning one end to end. So that is what I went after.',
    'Neutroline was the first time I had to do it alongside other people, and my tools turned out to be the easy part. There was no senior there either, so I pushed harder than anyone to close the gap — and spent time with the team outside work, because how you treat people matters more than the work itself. They made me tech lead in three months, and I ended up hiring and mentoring eight-plus designers and developers on a product built around AI agents. Supreme IT followed, as frontend architect.',
    'The hardest nights came from that same job — never from the code, but from a deadline I had given my word on and the fear that I did not know enough to meet it. Miss the date you promised and trust goes with it. Every time, the gap turned out to be knowledge, not ability. So I push to learn everything I can about the field, and AI has made that faster than it has ever been — judgement that used to take years of experience to build is reachable now, if you go looking for it. When I get stuck these days, I treat it as something I have not learned yet.',
    'So now I take the whole thing. I contract directly with clients, usually as *the only engineer* — the product, the API, the infrastructure it deploys onto. Right now that is a real estate platform in Nepal, with an AI assistant that answers from live listings instead of a stale index. I built the company’s IT infrastructure as well, because there wasn’t one.',
  ],
  /** Short line used in <meta description> and OG tags. Keep under ~155 chars. */
  tagline:
    'AI-first full-stack developer in Nepal. I build production web platforms and the AI features inside them, from architecture to deployment.',

  /** Set to false to hide the "available for work" badge. */
  availableForWork: true,

  /**
   * The designed portfolio — a separate Next.js site. This site is its
   * engineering counterpart, so the two link to each other rather than
   * competing. Referenced in the header, the hero and the footer.
   */
  portfolioUrl: 'https://nischaldev.vercel.app',

  socials: [
    { label: 'GitHub', url: 'https://github.com/Nisschhal', handle: '@Nisschhal' },
    { label: 'Portfolio', url: 'https://nischaldev.vercel.app', handle: 'nischaldev.vercel.app' },
    // LinkedIn intentionally omitted — add it back once there's a real profile
    // URL to point at. A dead /in/ link is worse than no link.
    { label: 'Email', url: 'mailto:nischalpuri.dev@gmail.com', handle: 'nischalpuri.dev@gmail.com' },
  ],

  /** Grouped skills, strongest first within each group. Derived from dependencies
   *  actually present in the repos — prune anything you'd rather not be asked
   *  about in an interview. */
  skills: [
    {
      group: 'Languages',
      items: ['TypeScript', 'JavaScript', 'SQL', 'Python', 'HTML', 'CSS'],
    },
    {
      group: 'Frontend',
      items: [
        'Next.js',
        'React 19',
        'Astro',
        'Tailwind CSS',
        'shadcn/ui',
        'Radix UI',
        'Redux Toolkit',
        'Framer Motion',
        'GSAP',
      ],
    },
    {
      group: 'Backend',
      items: ['Node.js', 'Express', 'REST', 'Hono', 'Socket.IO'],
    },
    {
      group: 'Data',
      items: ['PostgreSQL', 'Drizzle ORM', 'Prisma', 'Neon', 'MongoDB', 'Sanity CMS'],
    },
    {
      group: 'AI',
      items: ['Vercel AI SDK', 'OpenAI', 'Google Gemini', 'LangChain', 'LangGraph', 'Groq'],
    },
    {
      group: 'Tooling',
      items: ['Docker', 'Nginx', 'Vercel', 'Git', 'Vite', 'pnpm', 'Stripe', 'Clerk'],
    },
  ],

  /** CV timeline, newest first. Dates use "YYYY-MM" or "present". */
  experience: [
    {
      role: 'AI-First Full Stack Developer',
      org: 'Independent — client contracts',
      from: '2026-01',
      to: 'present',
      location: 'Remote',
      points: [
        'Sole engineer on MeroBhumi, a real estate platform serving live listings across Nepal — product, API and infrastructure owned end to end, including the environments, deployments and CI/CD the company now runs on.',
        'Built its in-product AI assistant on tool calling against the live database, so answers reflect current listings rather than a stale index; it also surfaces dashboard data on request and is open to signed-out visitors.',
        'Split the backend into a standalone Node service with a self-built OAuth layer and role-aware middleware that resolves the caller on every request, so the API scales on its own and nobody reaches a route outside their permissions.',
        'Shipped a server-rendered storefront for a gym equipment wholesaler covering all 77 districts of Nepal, built around quote requests rather than a cart because equipment deals close in conversation.',
      ],
    },
    {
      role: 'Frontend Architect',
      org: 'Supreme IT Solutions',
      from: '2025-10',
      to: '2025-12',
      location: 'Nepal',
      points: [
        'Built NetoGroup AI from the ground up — one platform carrying education, exam prep and travel without feeling like three products stitched together — including the admin dashboards managers use to filter and organise large volumes of business data without waiting on a page load.',
        'Built the online store for BT Planet, a major electronics retailer, with Next.js pulling the catalogue from a headless CMS — optimised to load instantly even across thousands of products.',
      ],
    },
    {
      role: 'Full Stack Developer & Team Lead',
      org: 'Neutroline',
      from: '2024-01',
      to: '2025-09',
      location: 'Remote — US startup',
      points: [
        'Promoted to tech lead three months in, taking ownership of technical decisions across the product.',
        'Directed the build of an intelligent appointment manager that uses AI agents to automate client scheduling.',
        'Hired and mentored a cross-functional team of eight-plus designers and developers.',
        'Moved complex business logic into background task workflows so it runs off the request path and the interface stays responsive.',
      ],
    },
    {
      role: 'Technical Assistant & Strategy',
      org: 'Excellence Institution Center',
      from: '2022-01',
      to: '2023-12',
      location: 'Nepal',
      points: [
        'Modernised the IT systems of a traditional education business and moved its operations online.',
        'Built the digital roadmap that let it reach students beyond its physical classrooms.',
      ],
    },
    {
      role: 'Vice President',
      org: 'Rotaract',
      from: '2018-01',
      to: '2023-12',
      location: 'Nepal',
      points: [
        'Led national-level fundraising and technical training projects, including digital-skills training for public school teachers.',
      ],
    },
  ],

  education: [
    {
      qualification: 'BSc (Hons) Computing',
      org: 'Softwarica College / Coventry University',
      from: '2020',
      to: '2023',
      points: [],
    },
    {
      qualification: 'A-Level (Science)',
      org: 'Chelsea International Academy',
      from: '2016',
      to: '2018',
      points: [],
    },
  ],

  /** Served from /public. Until you add the file, the CV page shows a disabled
   *  button instead of a broken download link. See P1-22. */
  resumePath: '/resume.pdf',
  /** Filename the browser saves as — `download` on a bare path would otherwise
   *  drop an anonymous "resume.pdf" into the reader's downloads folder. */
  resumeFilename: 'Nischal Puri Resume.pdf',
  resumeAvailable: true,
} as const;

export type Profile = typeof profile;
