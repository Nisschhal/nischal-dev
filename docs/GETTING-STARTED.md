# Getting started

A complete walkthrough from nothing installed to a running site. No prior Astro or
Docker experience assumed.

If you want to understand *why* the project is built this way rather than how to run
it, read [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) instead.

---

## 1. Prerequisites

| Tool | Version | Check with | Get it |
|---|---|---|---|
| **Node.js** | 22.12 or newer | `node --version` | [nodejs.org](https://nodejs.org) — take the LTS build |
| **pnpm** | 9 or newer | `pnpm --version` | see below |
| **Docker** | any recent | `docker --version` | [Docker Desktop](https://docs.docker.com/desktop/) |
| **Git** | any | `git --version` | preinstalled on macOS and most Linux |

**pnpm** is a package manager — the same job as `npm`, but faster and stricter about
dependency resolution. You do not need to install it separately; Node ships a shim
called Corepack that fetches the right version:

```bash
corepack enable
```

Docker is only needed for the container and tunnel (steps 5 and 6). You can do all
local development without it.

> **Docker must be *running*, not just installed.** On macOS and Windows that means
> launching Docker Desktop. `docker info` fails if the daemon is not up — that error
> is the single most common first-time stumble.

---

## 2. Get the code

```bash
git clone https://github.com/Nisschhal/nischal-dev.git
cd nischal-dev
pnpm install
```

`pnpm install` reads `package.json`, downloads dependencies into `node_modules/`, and
takes about 30 seconds on a first run.

---

## 3. Run the dev server

```bash
pnpm dev
```

Expected output:

```
astro  v7.x.x ready in 412 ms
┃ Local    http://localhost:4321/
┃ Network  use --host to expose
```

Open <http://localhost:4321>. Edit any file under `src/` and the browser updates
without a reload — that is hot module replacement, and it is why you develop here
rather than in Docker.

Stop the server with `Ctrl+C`.

---

## 4. Build the static site

```bash
pnpm build
```

This writes plain HTML, CSS, and font files to `dist/`. Expect roughly:

```
14 page(s) built in 780ms
Complete!
```

`dist/` is what actually gets served in production. There is no Node process
involved at that point — just files.

Preview the built output exactly as a server would send it:

```bash
pnpm preview
```

### If the build fails

A build failure is often the schema doing its job rather than a bug:

```
[InvalidContentEntryDataError] projects → my-project data does not match collection schema.
  summary: Too small: expected string to have >=20 characters
```

That means a file in `src/content/projects/` has a bad or missing field. The message
names the file and the field. Fix the frontmatter and rebuild — see
[HOW-IT-WORKS.md § Content](./HOW-IT-WORKS.md#content-how-a-project-becomes-a-page).

---

## 5. Run it in Docker

This is how the site actually ships: built by Node, served by Nginx.

```bash
cp .env.example .env
docker compose up --build web
```

- Site → <http://localhost:8080>
- Health check → <http://localhost:8080/healthz> (returns `ok`)

Note the `web` at the end: it starts **only** the web server. Without it, Compose
also starts the ngrok tunnel, which needs a token you may not have yet.

The first build takes a few minutes because it downloads base images. Later builds
reuse cached layers and take seconds.

Stop with `Ctrl+C`, then `docker compose down` to remove the containers.

---

## 6. Expose it publicly with ngrok *(optional)*

ngrok gives your local machine a public URL — useful for showing work in progress or
testing on a phone.

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken) and
   copy your authtoken.
2. Put it in `.env`:
   ```
   NGROK_AUTHTOKEN=your_token_here
   ```
3. Start everything:
   ```bash
   docker compose up --build
   ```
4. Open <http://localhost:4040> — the ngrok inspector — to read your public URL.

**Two free-tier behaviours that are not bugs:** the public URL changes every restart,
and first-time visitors see an ngrok warning page before reaching the site. Both go
away with a reserved domain on a paid plan.

---

## 7. Make your first change

Add a project. Create `src/content/projects/hello-world.md`:

```markdown
---
title: Hello World
summary: My first project entry, written to learn how this content system works.
stack: [TypeScript]
tier: archive
year: 2026
status: live
---
```

Run `pnpm dev` and visit <http://localhost:4321/projects>. It appears as a row in the
archive section.

Now change `tier: archive` to `tier: featured` and add a body under the frontmatter:

```markdown
---
title: Hello World
summary: My first project entry, written to learn how this content system works.
stack: [TypeScript]
tier: featured
year: 2026
status: live
---

## What it is

Anything written here becomes the case study page.
```

It becomes a card **and** gets its own page at `/projects/hello-world`. That is the
tier system — explained in
[HOW-IT-WORKS.md § Tier](./HOW-IT-WORKS.md#tier).

Delete the file when you are done experimenting.

---

## 8. Every command

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with hot reload, port 4321 |
| `pnpm build` | Static build → `dist/` |
| `pnpm preview` | Serve the built output locally |
| `pnpm sync` | Refresh GitHub stats **and** the all-repos index |
| `pnpm check:links` | Verify every live demo URL still resolves |
| `pnpm docker:up` | `docker compose up --build` |
| `pnpm docker:down` | Stop and remove containers |
| `pnpm docker:logs` | Tail container logs |

`pnpm sync` and `pnpm check:links` reach the network. `pnpm build` deliberately never
does — see [ADR 0003](../decisions/0003-committed-github-cache.md).

---

## Troubleshooting

**`command not found: pnpm`**
Run `corepack enable`. If that fails, `npm install -g pnpm`.

**`Cannot connect to the Docker daemon`**
Docker Desktop is not running. Launch it and wait for the whale icon to settle.

```bash
docker info    # succeeds only once the daemon is up
```

**`Bind for 0.0.0.0:8080 failed: port is already allocated`**
Something else holds port 8080. Either free it, or change the port:

```bash
WEB_PORT=9090 docker compose up --build web
```

**`error while interpolating services.ngrok.environment.NGROK_AUTHTOKEN`**
`.env` is missing or the token is blank. Either add the token, or start only the web
service: `docker compose up --build web`.

**Build fails with `InvalidContentEntryDataError`**
Working as intended — a content file has invalid frontmatter. The error names the
file and field.

**`A client project must not declare repo:`**
Also intentional. Entries with `tier: client` may not link source code. Remove the
`repo:` field, or change the tier if it is not client work.
See [ADR 0011](../decisions/0011-client-work-and-full-repo-coverage.md).

**`pnpm check:links` reports a WARN**
Not a failure. A `5xx` means the server errored but the page may still render. Only
`404` and unreachable hosts fail the run.

**`pnpm sync` says rate limited**
Unauthenticated GitHub allows 60 requests/hour. Add a token to `.env`:
```
GITHUB_TOKEN=your_token_here
```
It needs **no scopes** — public read is enough.

**Styles look wrong or fonts are missing after a Docker build**
Usually a stale image. Rebuild without cache:
```bash
docker compose build --no-cache web
```

---

## Where to go next

- [HOW-IT-WORKS.md](./HOW-IT-WORKS.md) — the pipeline end to end, plus a glossary
- [`decisions/`](../decisions/) — 12 records of why each choice was made; start with
  [the index](../decisions/README.md)
- [`tasks.md`](../tasks.md) — what is done and what is planned
