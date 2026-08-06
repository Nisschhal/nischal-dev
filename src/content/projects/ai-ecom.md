---
title: AI Commerce
repo: Nisschhal/ai-e-com
summary: An e-commerce storefront with an AI shopping assistant, built on Sanity as a headless CMS with Clerk-managed authentication.
stack: [Next.js, TypeScript, Sanity CMS, Clerk, Vercel AI SDK, Google Gemini, Radix UI, Tailwind CSS]
live: https://ai-e-com.vercel.app
order: 7
tier: featured
year: 2026
status: live
highlights:
  - Conversational product discovery powered by Gemini
  - Product catalogue modelled as structured content in Sanity
  - Route-level authorisation through Clerk middleware
  - Accessible component layer on Radix primitives
---

## What it is

A storefront where product discovery is conversational — you describe what you want
rather than navigating a category tree.

## Content and models

The catalogue lives in **Sanity**, queried with GROQ. Treating products as
structured content rather than database rows means the same catalogue can back the
storefront and the AI assistant's retrieval without a second pipeline.

The assistant runs on **Google Gemini** through the Vercel AI SDK, with responses
streamed into the UI.

The component layer is built on **Radix primitives** — roughly two dozen of them —
so keyboard navigation and focus management in dialogs, menus, and comboboxes are
correct by construction rather than retrofitted.

## Notes

> **TODO:** Describe how the assistant grounds its answers in the real catalogue.
> Whether it's function calling or retrieval, that's the substance of the project.
