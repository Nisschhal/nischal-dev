# 0004 — Multi-stage Docker image, Nginx runtime

**Status:** Accepted · 2026-08-06

## Context

The site must run in a container with Nginx serving it. A naive image would install
Node, copy the source, and run a dev server — shipping the toolchain, source, and
`node_modules` into the runtime image and leaving a dev server exposed.

## Decision

Two-stage build:

**Stage 1 — `node:24-alpine`**
Enable pnpm via corepack, `pnpm install --frozen-lockfile` as its own layer (so
dependency installs cache across source edits), copy source, `pnpm build` → `/app/dist`.

**Stage 2 — `nginx:1.27-alpine`**
Copy `dist/` to `/usr/share/nginx/html` and the config to `/etc/nginx/conf.d/`.
Nothing else. No Node, no source, no `node_modules`.

A `HEALTHCHECK` polls `/healthz`, which lets `docker-compose` gate the ngrok service
on `service_healthy` instead of racing the web server.

## Consequences

- Runtime image is Nginx plus static files — small surface, small size.
- Dependency layer is cached; source-only edits rebuild in seconds.
- Nginx handles compression, cache headers, and security headers, which is what it's
  good at, instead of a Node process doing it badly.
- The container does not terminate TLS. Ngrok does that in Phase 1
  ([0005](./0005-ngrok-in-compose.md)); a real reverse proxy will in Phase 3.
- `.dockerignore` must exclude `node_modules`, `.git`, `dist`, and `.astro` or the
  build context balloons and stale local builds leak into the image.

## Revisit if

Phase 2 lands. The Node adapter needs a Node process in the runtime, so the image
becomes a Node stage *plus* an Nginx stage in front as a reverse proxy — the
existing stage 1 is reused, not rewritten.
