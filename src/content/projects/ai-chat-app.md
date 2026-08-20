---
title: AI Chat App
repo: Nisschhal/ai-chat-app-frontent
extraRepos:
  - label: Backend
    repo: Nisschhal/ai-chat-app-backend
summary: A real-time chat application with streaming AI responses, rendering markdown, code, math, and Mermaid diagrams inline as tokens arrive.
stack: [React, Vite, TypeScript, Vercel AI SDK, Socket.IO, Streamdown, Tailwind CSS, shadcn/ui]
featured: false
order: 4
tier: archive
year: 2026
status: live
highlights:
  - Token streaming over Socket.IO with incremental markdown rendering
  - Inline code, LaTeX math, CJK, and Mermaid diagram support via Streamdown
  - Split frontend/backend services with shared response types
  - Form handling and validation with React Hook Form
---

## What it is

A chat interface for LLM conversations, built to handle the rendering problem that
most chat UIs get wrong: streaming markdown.

## Streaming markdown is harder than it looks

When tokens arrive one at a time, the markdown is *incomplete* at every intermediate
frame. A naive renderer sees an unclosed code fence or a half-written table and
produces flickering, broken output.

This app uses **Streamdown** with its code, math, CJK, and Mermaid plugins, which
parses defensively against partial input. A code block renders as a code block from
the first backtick, and a Mermaid diagram only draws once its definition completes.

Transport is **Socket.IO** rather than plain SSE, which gives reconnection handling
and bidirectional messaging for typing indicators.

## Notes

> **TODO:** Add a screenshot or short clip of the streaming render — it demonstrates
> the point far better than the description does. Also worth noting: how you handle
> a dropped connection mid-stream.
