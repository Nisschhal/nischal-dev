---
title: DevFlow
repo: Nisschhal/devflow
summary: A Stack Overflow-style Q&A community for developers — ask and answer questions in rich Markdown, browse by tag, save threads to collections, and fall back to an AI-drafted answer when nobody has replied.
stack: [Next.js, TypeScript, MongoDB, Mongoose, Auth.js, Vercel AI SDK, Tailwind CSS, shadcn/ui, Zod]
live: https://devflow-five-alpha.vercel.app
featured: true
order: 2
tier: featured
year: 2026
status: live
highlights:
  - Full question lifecycle — ask, edit, answer, and browse by tag
  - AI-drafted answers through the Vercel AI SDK when a thread has no replies
  - Credentials and OAuth sign-in on Auth.js, with accounts stored in MongoDB
  - Markdown editor with syntax-highlighted code blocks
---

## What it is

DevFlow is a question-and-answer community for developers, in the shape everyone
already knows from Stack Overflow. You post a question with formatted code,
people answer, answers get organised by tag, and anything worth keeping goes into
a personal collection. There is also a jobs section and public profile pages.

The part that isn't Stack Overflow: when a question is sitting unanswered, you can
ask the app to draft an answer instead of waiting.

## Architecture

The data layer is **MongoDB through Mongoose**, with the schema defined in code
rather than inferred. Authentication is **Auth.js**, supporting both a credentials
flow (bcrypt-hashed passwords) and OAuth providers, with account records living in
the same database as the content.

AI answers run through the **Vercel AI SDK** against an OpenAI model, behind a
dedicated `api/ai/answers` route so the model call never happens in the browser
and the key stays server-side.

Answer authoring uses an **MDX editor** with `bright` for syntax highlighting, so
code in answers renders the way it does in an editor. Request logging is
structured via **pino**.

## Notes

> **TODO:** Replace this block with what only you can say — what was hardest here,
> what you'd rebuild, and any numbers worth quoting (thread counts, AI answer
> acceptance rate, Lighthouse scores). The summary above was drafted from the
> repository's routes and dependencies, so check it reads the way you'd describe
> the project yourself.
