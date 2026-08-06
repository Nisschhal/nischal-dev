---
# CLIENT WORK — no `repo:` field. The build fails if one is added (decisions/0011).
#
# NOTE: the underlying repository (Nisschhal/wellness-nepal) is still PUBLIC on
# GitHub. Removing the link here hides it from this site, not from the internet.
# Flip the repo to private to actually protect the client's code. Tracked as P1-52.
title: Wellness Nepal Gym Equipments
summary: A B2B commercial gym equipment manufacturer's catalogue and quote platform, with SHAKTI AI — a bilingual assistant that helps buyers spec a full gym fit-out.
stack: [Next.js, TypeScript, LangGraph, LangChain, Vercel AI SDK, Google Gemini, Groq, Framer Motion, Tailwind CSS]
live: https://www.wnwellnessequipment.com
tier: client
featured: true
order: 2
year: 2026
status: live
note: client work
highlights:
  - SHAKTI AI — bilingual product assistant orchestrated with LangGraph
  - Multi-provider LLM routing across Gemini, Groq, and OpenAI
  - Equipment catalogue spanning cardio, strength, free weights, and multi-station
  - Quote request flow serving all 77 districts of Nepal
---

## What it is

Wellness Nepal manufactures commercial gym equipment — industrial-grade racks, cardio,
and free weights sold B2B to gyms across Nepal, from Mechi to Mahakali. The site is the
catalogue and the quoting front door: buyers browse the range, then request a fit-out
quote rather than checking out.

The copy is deliberately bilingual, leaning on Nepali framing (**अटल** / ATAL,
**भरपर्दो** / BHARPARDO) alongside English, because the buyers are domestic commercial
operators rather than an international audience.

## SHAKTI AI

The interesting engineering is the assistant. Specifying a commercial gym is a
consultative sale — how many stations, what floor area, what budget — and that
conversation used to happen over the phone. SHAKTI AI moves the first pass of it onto
the site.

Rather than binding to a single vendor, it sits behind the **Vercel AI SDK**'s provider
abstraction with `@ai-sdk/google`, `@ai-sdk/groq`, and `@ai-sdk/openai` all wired in.
That makes the model a per-request configuration choice — Groq where latency matters,
Gemini where context length does.

Conversation state runs through **LangGraph**, which models the dialogue as an explicit
graph of nodes rather than an ad-hoc chain of prompts. A multi-step qualification flow
becomes inspectable and testable instead of emergent — which matters when the output is
a quote a salesperson has to stand behind.

Responses stream token-by-token and render through `react-markdown` with `remark-gfm`,
so specification tables in model output display properly instead of as raw pipes.

## Notes

> **TODO:** Worth documenting — how SHAKTI AI grounds its recommendations in the real
> catalogue, whether there's a handoff to a human once a quote gets serious, and roughly
> what the assistant costs per conversation.
