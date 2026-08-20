---
title: Multi-AI
repo: Nisschhal/multi-ai-backend
extraRepos:
  - label: Frontend
    repo: Nisschhal/multi-ai-frontend
summary: A multi-agent AI chat app on a microservices backend — a router LLM reads each message and dispatches it to a specialised agent for search, code, PDFs, slides or images, with Redis holding the conversation the agents read back.
stack: [React 19, TypeScript, Vite, Express 5, LangGraph, Groq, Gemini, Tavily, Cloudflare Workers AI, Cloudinary, MongoDB, Mongoose, Redis, Firebase Auth, Docker, Render, Vercel, Tailwind CSS, shadcn/ui]
live: https://multi-ai-frontend-six.vercel.app
featured: true
order: 1
tier: featured
year: 2026
status: live
highlights:
  - A router LLM classifies intent and dispatches to six specialised agents
  - Two-step search — Tavily fetches, the chat agent synthesises with history
  - Redis caches the last 20 messages per conversation for ~1ms context reads
  - A gateway is the only entry point; no service is ever exposed to the browser
  - Image generation falls through three providers so a dead key degrades, not breaks
  - The same code runs as four processes locally and one web service in production
---

## What it is

Multi-AI is a chat application where the model is not a single endpoint. Every
message first hits a **router agent** that classifies what you are actually
asking for — conversation, a web lookup, code, a PDF, a deck, an image — and
sends it to an agent built for that job. You type into one box; six specialists
sit behind it.

The orchestration is a **LangGraph** state graph, so the routing is a declared
set of edges rather than a chain of conditionals, and the provider is chosen per
agent: **Groq** where latency matters most (routing and conversation),
**Gemini** for the longer-form code, document and slide work.

## Architecture

The backend is four Express services — **gateway, auth, chat, agent** — each with
its own database and its own `package.json`, sharing code through
`backend/shared/` over TypeScript path aliases.

The **gateway is the single entry point**. It parses cookies, validates the
session against Redis, strips the `/api/*` prefix and injects an `x-user-id`
header before proxying downstream. The browser never addresses a service
directly, so a service can be moved or split without the frontend knowing. The
agent service talks to the chat service over internal HTTP rather than back out
through the gateway.

**Search is deliberately two-step.** The search agent does not answer. It calls
Tavily, pushes the raw results into the graph state as a message, and the edge
`searchNode → chatNode` hands them to the chat agent, which synthesises them
against the conversation history. Tavily returns structured snippets; turning
those into an answer that remembers what you asked three messages ago is a
different job, so it is a different node.

**Redis does two jobs.** It is the session store, and it caches the last 20
messages per conversation — written on every save with `RPUSH` + `LTRIM` and a
one-hour TTL, read back by the agent for context. A miss falls through to
MongoDB and repopulates. The agent needs history on *every* request, so this is
the difference between a database round-trip per message and a ~1ms read.

## Images, on someone else's budget

The image agent is the one place where a free tier can actually run out mid-request,
so it is built to degrade rather than fail. A small LLM first rewrites the
conversational ask into a real text-to-image prompt, then generation walks a chain:
**Cloudflare Workers AI** (FLUX.1-schnell, the largest free allowance), falling
through to **Hugging Face** if that is unconfigured or failing, and finally to
**Pollinations**, which is keyless and therefore always answers. A provider with no
credentials just reports failure and the chain moves on. Cloudflare results are
uploaded to **Cloudinary** so the URL outlives the provider's own retention.

Two quotas sit in front of it, both Redis counters: a per-user daily cap and a
global monthly cap keyed `YYYY-MM`. The global one is the one that matters —
image credits are a *shared* pool, so a per-user limit alone cannot stop a single
user draining the month. Quota is charged before the provider call and refunded
if generation fails.

## Deployment, and where it bends

The architecture is microservices; the production deployment currently is not.
`server.ts` mounts auth, chat and agent as **routers inside one process**, so
Render runs a single free web service with nothing to deploy per service. Docker
Compose stays in the local loop, where it runs Redis.

That is a cost decision, not an architectural one, and it is reversible: the
service boundaries, the separate databases and the gateway indirection are all
still there. Splitting back into four deployments is a change to hosting, not to
code.

Two constraints shaped the managed pieces. Redis is **Upstash** rather than
Render's own Key Value, because the free tier there has no persistence and every
deploy would sign out every user. Mongo is **Atlas M0** with the network open,
because Render's free tier has no static outbound IP to allowlist. Firebase's
service account is passed as a base64 environment variable so the key file never
reaches the repository.

## Notes

> **TODO:** Replace this block with what only you can say — what was hardest,
> what you would rebuild, and any numbers worth quoting (routing accuracy,
> p95 latency per agent, cache hit rate). The sections above were drafted from
> `Project.MD`, `DEPLOY.md` and the service layout, so check the emphasis matches
> how you would describe it yourself.
