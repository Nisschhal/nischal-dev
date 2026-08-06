---
title: Multi-Vendor Store
repo: Nisschhal/ai-multi-vendor-store
summary: A marketplace where independent vendors manage their own storefronts, with background job processing for order events and a vendor analytics dashboard.
stack: [Next.js, TypeScript, Prisma, Postgres, Clerk, Inngest, Redux Toolkit, ImageKit, Recharts]
live: https://ai-multi-vendor-store.vercel.app
order: 5
tier: featured
year: 2026
status: live
highlights:
  - Per-vendor storefronts with scoped permissions via Clerk
  - Durable background jobs with Inngest for order and payout events
  - Vendor analytics dashboards built on Recharts
  - Image delivery and transformation through ImageKit
---

## What it is

A multi-tenant marketplace. Vendors sign up, list products, and manage their own
orders; buyers shop across all vendors in one cart.

## Multi-tenancy and background work

The authorisation model is the crux: every query must be scoped to a vendor, and a
missed scope leaks another seller's data. **Clerk** handles identity while the
Prisma layer enforces vendor scoping on access paths.

Order processing runs through **Inngest** rather than inline in the request. Payouts,
notifications, and inventory decrements are durable, retryable steps — an email
provider timing out doesn't fail a customer's checkout.

State is coordinated with **Redux Toolkit**, and vendor-facing analytics render with
**Recharts**.

## Notes

> **TODO:** Document how vendor scoping is enforced — middleware, Prisma extension,
> or per-query. It's the most interesting thing in this codebase.
