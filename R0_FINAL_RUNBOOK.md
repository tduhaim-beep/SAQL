# SAQL R0 v2 — Final Verification Runbook

## Purpose
Run **Final R0 Verification only**. Do not start Business Slice 1 in this task.

The repository has completed the dependency-free Pre-R0 reconciliation, including SAQL Brand Identity v1.1 and closure of `RG-R0-DATA-001`. Final R0 requires actual execution evidence in the approved target environment.

## Required target environment
- Node.js 24 LTS.
- npm registry access.
- PostgreSQL disposable database.
- `DATABASE_URL` pointing to that disposable PostgreSQL database.
- Synthetic data only.

## Phase A — environment and reproducibility
1. `node -v` — must be Node 24.x.
2. `npm -v` — record version.
3. `npm run r0:env-check`.
4. Generate the first reproducible lockfile in the approved Node 24 environment:
   - `npm install --package-lock-only`
   - review resolved dependency versions and package-manager output.
   - commit/review `package-lock.json` before using `npm ci` as R0 evidence.
5. `npm ci`.

## Prisma 7 compatibility baseline
- Prisma CLI/client remain pinned to major version 7 by `package.json`.
- Connection configuration is in `prisma.config.ts`; `schema.prisma` contains only the PostgreSQL provider.
- Prisma Client uses the `prisma-client` generator and `@prisma/adapter-pg`.
- Synthetic seed is `prisma/seed.ts` and must produce a visible completion line plus persisted rows.

## Phase B — Prisma validation and baseline migration
The baseline migration must be produced by the installed Prisma toolchain. Do **not** hand-author a migration merely to close the gate.

1. `npm run db:validate`.
2. `npm run db:generate`.
3. Generate the initial v2 migration without applying it:
   - `npx prisma migrate dev --name r0_v2_baseline --create-only`
4. Review the generated `prisma/migrations/*/migration.sql`:
   - it must correspond to the reviewed v2 schema;
   - no historical v1 tables/states should be reintroduced;
   - no destructive operation is acceptable without an explicit reviewed data-impact decision;
   - `TrainingException` and current lifecycle enums must be present;
   - no invented closed Exception type/severity taxonomy may appear.
5. `npm run db:assert-migration`.
6. Apply to disposable PostgreSQL: `npm run db:deploy`.
7. Seed synthetic data: `npm run db:seed`.

## Phase C — engineering gates
Run and preserve raw command output:
1. `npm run foundation:verify`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. `npm run ci`
7. `npx playwright install --with-deps chromium`
8. `npm run test:e2e`

## Phase D — Brand/RTL evidence
Verify after the repository is running under the target toolchain:
- Arabic root `lang="ar" dir="rtl"`.
- current SAQL Brand Identity v1.1 assets only.
- Tajawal 400/500/700 provisioning/loading succeeds in the target environment.
- no old Navy/Gold/Ivory/Gray/Noto UI baseline is active.
- critical Desktop/Mobile Arabic flows pass Playwright/visual review.
- semantic status colors remain separate from brand palette.

Historical `08B v0.1` evidence must not be reused to claim current Brand/RTL PASS.

## Phase E — required evidence record
Expand `R0_V2_VERIFICATION_EVIDENCE.txt` with:
- runtime/package-manager/database versions;
- exact commands and exit codes;
- resolved dependency/lockfile summary;
- migration directory/name and review result;
- seed result;
- test counts/failures;
- build/CI/Playwright results;
- Brand Identity v1.1 / RTL evidence;
- changed files and commit/release identifier;
- security findings;
- Requirement Gaps, if any.

## Decision
Return exactly one engineering gate outcome:
- **R0 PASS** — only when every required gate has actual evidence; or
- **R0 REWORK** — list failed/blocked gates and the smallest required corrections.

Business Coding remains **HOLD** until R0 PASS.
