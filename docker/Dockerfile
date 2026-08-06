# syntax=docker/dockerfile:1
#
# Multi-stage build — see decisions/0004-docker-multistage-nginx.md
#
#   Stage 1 (build)   Node + pnpm + source  →  dist/
#   Stage 2 (runtime) Nginx + dist/ only. No Node, no source, no node_modules.
#
# Build context is the repo root:  docker build -f docker/Dockerfile .

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable

# Manifests first so the dependency layer caches independently of source edits.
# Touching a component then rebuilds in seconds instead of reinstalling.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# NOTE: no network access is needed here. GitHub stats come from the committed
# cache at src/data/github-cache.json — refreshed by `pnpm sync`, never during a
# build. See decisions/0003-committed-github-cache.md.
RUN pnpm build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf

# The snippet goes in /etc/nginx/snippets/, NOT conf.d/ — the base image's
# nginx.conf autoloads /etc/nginx/conf.d/*.conf into the http context, which
# would load these add_headers globally as well as via their explicit includes.
COPY docker/nginx.conf            /etc/nginx/conf.d/site.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Gates the ngrok service in docker-compose on `service_healthy`, so the tunnel
# never opens onto a server that isn't answering yet.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
