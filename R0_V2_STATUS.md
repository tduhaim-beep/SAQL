# R0 v2 — Repository Reconciliation & Verification Status

## Current position
**PRE-R0 RECONCILIATION PATCH APPLIED / FINAL R0 NOT RUN / BUSINESS CODING HOLD**

This repository has been reconciled to current Project Sources at the file/scaffold level, including SAQL Brand Identity v1.1 and Stage 07/08/08A v2.1 references. This is not R0 PASS.

## Reconciled by this patch
- Current Brand Identity v1.1 SVG assets added under `public/brand/`.
- Old logo/token/public-site visual references moved to `docs/design/references/historical/`.
- Current v1.1 logo reference images added under `docs/design/references/current/`.
- CSS tokens changed to Ink/Blue/Canvas + approved supporting neutrals; Tajawal is the interface font baseline.
- Superseded tagline removed from the foundation page.
- `AGENTS.md`, Codex Start Here, brand baseline, current-baselines and control-pack README updated to current governance.
- Prisma lifecycle enum names aligned with the current Implementation Control Pack state sets for Verification, Opportunity, Application, Training Journey, Plan Version, Plan Instance, Task, Alignment, Academic Overlay and Exception.
- Academic Overlay lifecycle, participation mode and trust state are separated in the schema.
- Vitest include pattern fixed; placeholder harness specs replaced with executable static contract tests.
- Playwright now starts the app under test.
- CI now explicitly requires a reviewed migration baseline before deploy.
- Historical pre-Brand-v1.1 verification evidence preserved and no longer presented as current evidence.

## Deliberately unresolved / R0 blockers
- Current execution environment is Node 22, not approved Node 24.
- Registry access is unavailable here; dependencies and `package-lock.json` cannot be generated/verified.
- No reviewed `prisma/migrations/*/migration.sql` exists yet; the material Exceptions data-model gap is now closed, so migration generation may proceed in the target R0 environment.
- `RG-R0-DATA-001` is closed: the approved minimal `TrainingException` persistence baseline is implemented and documented; no closed type/severity taxonomy was invented.
- Tajawal binaries are not duplicated in this repository artifact; Final R0 must verify provisioning/loading from the canonical Brand Identity package in the target environment.
- Prisma validate/generate, PostgreSQL migration/seed, TypeScript, ESLint, Vitest, Next build, Playwright and full CI remain to be executed in the target environment.

## Current dependency-free verification
On 3 October 2026, after closing `RG-R0-DATA-001`, `npm run foundation:verify` passed 14/14 Node-native foundation tests plus repository/control-pack/state-schema/TrainingException/architecture/secret checks in Node 22. This is Pre-R0 evidence only and is not Final R0 PASS.

## Final R0 execution preparation — 3 October 2026
- `R0_FINAL_RUNBOOK.md` now defines the exact Node 24 + registry + PostgreSQL execution sequence and evidence requirements.
- `scripts/check-r0-target-env.mjs` provides an executable environment/gate preflight.
- `R0_FINAL_EXECUTION_BLOCKER_REPORT.md` records why this current container cannot generate valid lockfile/Prisma migration/DB evidence.
- CI now runs the target environment check and explicit `prisma validate` before generate/deploy gates.

## Gate position
Final R0 must return **R0 PASS** or **R0 REWORK** with actual execution evidence. Do not begin Business Slice 1 until R0 PASS.

## Prisma 7 compatibility patch — 4 October 2026
- `schema.prisma` now uses Prisma 7-compatible multiline enums and keeps the datasource URL out of the schema.
- `prisma.config.ts` is the CLI source for `DATABASE_URL`, migration path, and the synthetic seed command.
- Prisma Client generation now uses the Prisma 7 `prisma-client` generator with explicit output under `src/generated/prisma`.
- Runtime DB access for the seed uses `@prisma/adapter-pg` + `pg`; the seed fails loudly if `DATABASE_URL` is absent and prints a completion marker only after real writes finish.
- No migration was hand-authored by this patch. Final R0 must regenerate the lockfile, run Prisma validate/generate, create/review the baseline migration, apply it to disposable PostgreSQL, verify persisted seed rows, and rerun the full gate suite.
- Project Sources and business rules were not changed by this compatibility patch.
