# SAQL R0 v2 — Prisma 7 Compatibility Patch

**Date:** 4 October 2026  
**Scope:** technical compatibility only; no Business Requirement, State Machine, Permission, Scoring rule, Brand rule, or Project Source changed.

## Why this patch exists
The latest R0 run reached the Prisma gate and reported that Prisma 7 rejected the previous single-line enum syntax and the legacy `datasource.url` placement. The synthetic seed also returned success without proving that rows were persisted.

## Changes applied
1. Expanded all one-line Prisma enums into standard multiline enum blocks without changing any enum value.
2. Moved `DATABASE_URL` from `schema.prisma` to a root `prisma.config.ts`.
3. Added Prisma 7 migration/seed configuration in `prisma.config.ts`.
4. Switched client generation from deprecated `prisma-client-js` to Prisma 7 `prisma-client` with explicit output `src/generated/prisma`.
5. Added PostgreSQL runtime adapter dependencies: `@prisma/adapter-pg` and `pg`.
6. Replaced `prisma/seed.mjs` with `prisma/seed.ts`, using `PrismaPg` and the generated Prisma 7 client.
7. Seed now fails if `DATABASE_URL` is missing and emits `Synthetic R0 seed completed` only after DB writes finish.
8. Added `dotenv` and `tsx` for Prisma 7 config/seed execution.
9. Updated repository preflight to require `prisma.config.ts` and `prisma/seed.ts`.
10. Added generated Prisma output to `.gitignore`.
11. Updated the Final R0 runbook with the Prisma 7 compatibility baseline.

## Verification possible in this Chat environment
`npm run foundation:verify` passed **14/14** after the patch, including state-machine/schema alignment and the approved `TrainingException` persistence baseline.

## Verification deliberately not claimed here
This environment does not provide the target Node 24 + installed Prisma 7 toolchain + disposable PostgreSQL needed to truthfully claim:
- `prisma validate` / `prisma generate`;
- migration creation/review/deploy;
- persisted seed rows;
- full TypeScript/Vitest/Next/Playwright/hosted CI execution.

These must be run in Codex as Final R0 evidence. **No migration was hand-authored.**

## Required next Codex sequence
1. Replace the prior repository artifact with this ZIP.
2. Clean install under Node 24 and generate a fresh reviewed `package-lock.json`.
3. Set disposable PostgreSQL `DATABASE_URL`.
4. Run `npm run db:validate` and `npm run db:generate`.
5. Run `npx prisma migrate dev --name r0_v2_baseline --create-only`.
6. Review generated SQL, then `npm run db:assert-migration` and `npm run db:deploy`.
7. Run `npm run db:seed` and verify actual rows exist.
8. Rerun the complete Final R0 suite and return **R0 PASS** or **R0 REWORK**.
