---
title: Zentry
repo: Nisschhal/zentry-game
summary: An award-style gaming landing page with video-masked transitions, scroll-pinned sections, and GSAP-driven 3D card tilts.
stack: [React, Vite, GSAP, Tailwind CSS]
live: https://zentry-game-three.vercel.app
order: 9
tier: featured
year: 2025
status: live
highlights:
  - Video-masked section transitions with clip-path morphing
  - Scroll-pinned narrative sections via GSAP ScrollTrigger
  - Perspective card tilts tracking cursor position
---

## What it is

A landing page in the Awwwards idiom — heavy motion, video backgrounds, and
scroll-driven storytelling. Built to practise animation choreography rather than to
ship a product.

## Technique

The centrepiece is **video masking**: a `clip-path` animates between shapes while
video plays underneath, so sections appear to peel into one another. **GSAP
ScrollTrigger** pins sections while their internal timelines scrub against scroll
progress.

## Notes

> **TODO:** Check this on a mid-range phone. Autoplaying video plus continuous GSAP
> timelines is exactly the combination that drops frames, and this page is a
> showcase — a janky showcase argues against you.
