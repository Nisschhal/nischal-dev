---
title: Gharedi
repo: Nisschhal/real-state-gharedi
summary: A real-estate listings platform with interactive map search, drag-and-drop listing management, and content managed through Sanity CMS.
stack: [Next.js, TypeScript, Sanity CMS, Clerk, MapLibre GL, Leaflet, Tailwind CSS]
live: https://real-state-gharedi.vercel.app
order: 6
tier: featured
year: 2026
status: live
highlights:
  - Map-based property search with MapLibre GL
  - Structured listing content modelled in Sanity
  - Onboarding-aware route protection via Clerk middleware
  - Drag-and-drop listing ordering
---

## What it is

A property listings site where search happens on a map rather than through a form.
Listings are authored in **Sanity**, so property data is structured content with a
proper editing interface instead of rows behind an admin CRUD screen.

## Map search

Rendering is **MapLibre GL** — an open-source fork of Mapbox GL that avoids Mapbox's
usage-based pricing — with Leaflet available alongside it. Listings are plotted as
markers and the result list stays synchronised with the viewport, so panning the map
filters the list.

Route protection runs through **Clerk middleware** with a three-way split: public,
authenticated, and onboarding-incomplete. Users who have signed up but not finished
onboarding are routed to complete it rather than dropped into a half-configured app.

## Notes

> **TODO:** Add how you cluster markers at low zoom, and whether search is
> client-side over a loaded set or a server-side geo query.
