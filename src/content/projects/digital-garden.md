---
title: Digital Garden
repo: Nisschhal/digital-garden
summary: A scroll-driven site exploring smooth-scroll and animation techniques, built with GSAP timelines and Lenis for inertial scrolling.
stack: [Next.js, TypeScript, GSAP, Lenis, Motion, Tailwind CSS]
live: https://digital-garden-flame-nu.vercel.app
order: 8
tier: archive
year: 2026
status: wip
highlights:
  - Inertial smooth scrolling with Lenis
  - Scroll-linked GSAP timelines
  - Light and dark themes via next-themes
---

## What it is

A motion and interaction study. The subject is the scroll itself: **Lenis** replaces
native scrolling with an inertial model, and **GSAP** timelines are linked to scroll
position so animation progress tracks the scrollbar rather than running on a timer.

## Notes

> **TODO:** This is currently marked `status: wip`. Either finish it and flip to
> `live`, or drop `featured` and let it sit further down the list. An unfinished
> project on a portfolio is fine when labelled — it's the unlabelled ones that cost
> you.
>
> Also worth checking: hijacking scroll hurts accessibility. Confirm keyboard
> scrolling and `prefers-reduced-motion` still behave.
