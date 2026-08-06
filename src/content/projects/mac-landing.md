---
title: Mac Landing
repo: Nisschhal/mac-landing-gsap-3js
summary: An Apple-style product landing page pairing a Three.js model with a GSAP timeline, so the model rotates and reveals as the page scrolls.
stack: [JavaScript, Three.js, GSAP, Tailwind CSS]
live: https://mac-landing-gsap-3js.vercel.app
order: 10
tier: featured
year: 2025
status: live
highlights:
  - Three.js model driven by scroll position
  - GSAP timeline synchronised to camera movement
  - Staged text reveals choreographed against the 3D sequence
---

## What it is

A recreation of the Apple product-page pattern: a 3D model that rotates, zooms, and
reveals detail as you scroll, with copy timed to each beat.

## Technique

A **Three.js** scene renders the model while a **GSAP** timeline drives the camera
and object transforms. Scroll position maps to timeline progress, so scrolling
scrubs the animation in both directions rather than triggering one-shot effects.

## Notes

> **TODO:** Note the model's file size and how you handle the loading state — that's
> the real engineering constraint on 3D landing pages, and it's what distinguishes
> this from a tutorial follow-along.
