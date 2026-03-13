# LiquorScope — AI Agent Instructions

## What This Is
Texas Liquor License Intelligence platform built on verified TABC public data.
Follows the Zabalist (zabalist.com) model: free browse → Pro $29/mo → data list sales.

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS, pnpm
- Neon (serverless PostgreSQL) via Drizzle ORM + @neondatabase/serverless
- Neon Auth (auth is handled by Neon — do NOT set up separate auth)
- Stripe for billing (Pro subscription + one-time data list purchases)
- Resend + React Email for transactional email
- Zod + drizzle-zod for validation
- Upstash Redis for rate limiting
- Papaparse for CSV export
- Deployed on Railway

## Key Conventions
- All pages use server components by default. Use 'use client' only when necessary.
- URL-based pagination and filtering (not client-side state) for SEO.
- Every public page must have generateMetadata() for SEO.
- Every entity detail page must include JSON-LD structured data.
- Contact info is blurred for free users, revealed for Pro subscribers.
- Data pipeline scripts live in /scripts and run via GitHub Actions cron.
- DB schema defined in src/db/schema.ts using Drizzle table builders.

## Environment Variables Required
DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTHLY,
RESEND_API_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_APP_URL,
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

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
