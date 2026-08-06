---
title: Schedulr
repo: Nisschhal/class-scheduler-front
extraRepos:
  - label: Backend
    repo: Nisschhal/class-scheduler-back
summary: A full-stack calendar application for managing one-off events and complex recurring class series, with day, week, and list views.
stack: [React 19, Vite 7, TypeScript, FullCalendar, Node.js, Tailwind CSS, Radix UI, Axios]
live: https://class-scheduler-front.vercel.app
featured: true
order: 3
tier: featured
year: 2026
status: live
highlights:
  - Recurring series with per-occurrence exceptions
  - DayGrid, TimeGrid, and List views via FullCalendar v6
  - Separate frontend and backend services with a typed API contract
  - Standardised response handling through Axios interceptors
---

## What it is

Schedulr manages class timetables — both one-off events and recurring series with
the awkward real-world cases: a weekly class that skips a holiday, or moves rooms
for one week only.

It is split across two repositories, a **React 19 + Vite 7** frontend and a
**Node.js** backend, presented here as one project because that is what it is.

## Why recurrence is the hard part

Naive recurring events store a rule and expand it on read. That breaks the moment a
single occurrence needs to differ. Schedulr keeps the rule as the source of truth
and layers per-occurrence exceptions on top, so "every Tuesday except the 14th, and
the 21st is in a different room" is representable without duplicating the series.

**FullCalendar v6** supplies the DayGrid, TimeGrid, and List views. **Axios
interceptors** normalise every backend response into one shape, so components
handle a single error contract rather than each call inventing its own.

## Notes

> **TODO:** Add how you handle timezones and DST — that's the question an
> interviewer will ask about any calendar project.
