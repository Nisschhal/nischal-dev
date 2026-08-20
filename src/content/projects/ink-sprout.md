---
title: InkSprout
repo: Nisschhal/ink-sprout-v2
summary: A full e-commerce platform for stationery — product catalogue with variant filtering, Stripe checkout, and an admin dashboard for inventory and orders.
stack: [Next.js, TypeScript, Drizzle ORM, Neon Postgres, Auth.js, Stripe, Tailwind CSS, Radix UI]
# Returns HTTP 500 but renders the full store — verified in a real browser.
# The 500 carries `noindex`, so fixing the underlying server error is worthwhile.
live: https://ink-sprout-v2-nischal.vercel.app
featured: true
order: 6
tier: featured
year: 2026
status: live
highlights:
  - Stripe Elements checkout with server-side payment intents
  - Product variants filterable by type, colour, and brand
  - Admin dashboard with TanStack Table and a TipTap rich-text editor
  - Session auth via Auth.js on the Drizzle adapter
---

## What it is

InkSprout is an e-commerce store for pens, highlighters, and stationery. It covers
the full commerce path: browsing and filtering a catalogue, building a cart,
checking out through Stripe, and managing products and orders from an admin side.

It is the second iteration — v1 was rebuilt to move onto Drizzle and current
package versions rather than patched in place.

## Architecture

The data layer is **Drizzle ORM against Neon Postgres**, with schema-first
migrations. Authentication is **Auth.js** through the Drizzle adapter, so sessions
and user records live in the same database as the catalogue rather than in a
third-party service.

Payments use **Stripe Payment Intents**, created server-side so the amount is never
trusted from the client — the browser only ever receives a client secret.

The admin surface uses **TanStack Table** for sortable, paginated inventory views
and **TipTap** for product description editing.

## Notes

> **TODO:** Add the parts only you can write — what was hardest here, what you'd do
> differently, and any numbers worth quoting (catalogue size, checkout conversion,
> Lighthouse scores). This section is what separates a portfolio from a repo list.
