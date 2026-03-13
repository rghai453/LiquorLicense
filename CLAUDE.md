# LiquorScope — AI Agent Instructions

## What This Is
Texas Liquor License Intelligence platform built on verified TABC public data.
Free public pages for Google long-tail traffic, monetized via display ads (AdSense/Mediavine) and one-time CSV data list purchases via Stripe. No accounts, no subscriptions.

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS, pnpm
- Neon (serverless PostgreSQL) via Drizzle ORM + @neondatabase/serverless
- Stripe for one-time CSV data list purchases
- AdSense for display ad revenue (Mediavine at 50K+ sessions)
- Zod + drizzle-zod for validation
- Papaparse for CSV export
- Deployed on Railway

## Revenue Model
- **Display ads**: AdSense on all content pages (max 3 units/page, no ads above fold)
- **Data lists**: One-time Stripe purchases for CSV downloads (no auth required)

## Key Conventions
- All pages use server components by default. Use 'use client' only when necessary.
- URL-based pagination and filtering (not client-side state) for SEO.
- Every public page must have generateMetadata() for SEO.
- Every entity detail page must include JSON-LD structured data.
- All content is free and public — no auth, no gating.
- Data pipeline scripts live in /scripts and run via GitHub Actions cron.
- DB schema defined in src/db/schema.ts using Drizzle table builders.

## Environment Variables Required
DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_APP_URL,
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID (optional)

## Common Tasks
- Run data sync: `pnpm tsx scripts/ingest/fetch-licenses.ts`
- Run revenue sync: `pnpm tsx scripts/ingest/fetch-revenue.ts`
- Generate migrations: `pnpm drizzle-kit generate`
- Push schema changes: `pnpm drizzle-kit push`
- Dev server: `pnpm dev`
- Build: `pnpm build`

## Data Sources
- TABC Mixed Beverage Gross Receipts: https://data.texas.gov/resource/naix-2893.json
- ~25K unique license holders with monthly revenue data
- Revenue data includes: liquor, beer, wine, cover charge receipts
